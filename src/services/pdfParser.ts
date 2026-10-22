import * as pdfjsLib from 'pdfjs-dist';
import type { Transaction, ParsedPDFResult } from '../types/finance';
import { classifyTransaction } from './aiEngine';
import { extractMerchantName } from './merchantExtractor';

// Configuração do Worker do PDF.js
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
} catch (e) {
  console.warn('Fallback para worker CDN do pdfjs:', e);
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.0'}/build/pdf.worker.min.mjs`;
}

const MONTH_MAP: Record<string, string> = {
  JAN: '01',
  FEV: '02',
  MAR: '03',
  ABR: '04',
  MAI: '05',
  JUN: '06',
  JUL: '07',
  AGO: '08',
  SET: '09',
  OUT: '10',
  NOV: '11',
  DEZ: '12'
};

const DAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export function getDayOfWeekFromDate(isoDate: string): string {
  try {
    const [year, month, day] = isoDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return DAY_NAMES[dateObj.getDay()] || 'Não identificado';
  } catch {
    return 'Não identificado';
  }
}

// Extrair texto bruto de um arquivo PDF (File / ArrayBuffer)
export async function extractTextFromPDF(file: File): Promise<{ text: string; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items
      .map((item: any) => item.str || '')
      .filter((s: string) => s.trim().length > 0);
    fullText += pageStrings.join('\n') + '\n---PAGE_BREAK---\n';
  }

  return { text: fullText, pageCount };
}

// Detector de banco baseado em termos do texto
export function detectBank(text: string): string {
  const upper = text.toUpperCase();
  if (upper.includes('NUBANK') || upper.includes('NU PAGAMENTOS')) return 'Nubank';
  if (upper.includes('ITAÚ') || upper.includes('ITAU')) return 'Banco Itaú';
  if (upper.includes('BRADESCO')) return 'Banco Bradesco';
  if (upper.includes('SANTANDER')) return 'Banco Santander';
  if (upper.includes('BANCO DO BRASIL') || upper.includes('BB S.A.')) return 'Banco do Brasil';
  if (upper.includes('BANCO INTER') || upper.includes('INTER S.A.')) return 'Banco Inter';
  if (upper.includes('C6 BANK')) return 'C6 Bank';
  if (upper.includes('CAIXA ECONOMICA') || upper.includes('CAIXA ECONÔMICA')) return 'Caixa Econômica Federal';
  return 'Extrato / Fatura Bancária';
}

// Converte string monetária brasileira para número decimal
export function parseBRLCurrency(valStr: string): number {
  let clean = valStr.replace(/\s+/g, '').replace('R$', '').trim();
  // Se contiver ponto como milhar e vírgula como decimal: 1.250,90 -> 1250.90
  if (clean.includes(',') && clean.includes('.')) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.');
  }
  // Trata sinal negativo ou indicador D (débito)
  clean = clean.replace(/[^\d.-]/g, '');
  const parsed = Math.abs(parseFloat(clean));
  return isNaN(parsed) ? 0 : parsed;
}

// Normaliza data para ISO YYYY-MM-DD e DD/MM/AAAA
export function normalizeDate(dateStr: string, defaultYear = new Date().getFullYear()): { iso: string; display: string } {
  const clean = dateStr.trim();

  // Caso 1: DD/MM/YYYY ou DD/MM/YY
  const slashMatch = clean.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    let year = slashMatch[3] ? slashMatch[3] : String(defaultYear);
    if (year.length === 2) year = `20${year}`;
    return {
      iso: `${year}-${month}-${day}`,
      display: `${day}/${month}/${year}`
    };
  }

  // Caso 2: DD MMM (ex: "15 SET", "04 AGO", "18 SET 2026")
  const mmmMatch = clean.toUpperCase().match(/^(\d{1,2})\s+([A-Z]{3})(?:\s+(\d{4}))?$/);
  if (mmmMatch) {
    const day = mmmMatch[1].padStart(2, '0');
    const monthKey = mmmMatch[2];
    const month = MONTH_MAP[monthKey] || '01';
    const year = mmmMatch[3] ? mmmMatch[3] : String(defaultYear);
    return {
      iso: `${year}-${month}-${day}`,
      display: `${day}/${month}/${year}`
    };
  }

  // Fallback para data de hoje
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = String(now.getFullYear());
  return {
    iso: `${y}-${m}-${d}`,
    display: `${d}/${m}/${y}`
  };
}

// Analisador principal de linhas e padrões de extrato
export function parseStatementLines(rawText: string, fileName = 'extrato.pdf'): ParsedPDFResult {
  const detectedBank = detectBank(rawText);
  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && l !== '---PAGE_BREAK---');

  const transactions: Transaction[] = [];
  const currentYear = new Date().getFullYear();

  // Padrão A: Linha completa tradicional com Data, Descrição e Valor (ex: "15/09/2026 IFOOD *RESTAURANTE R$ 78,50")
  const singleLineWithDateRegex = /^(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3}(?:\s+\d{4})?)\s+(.+?)\s+([+-]?\s*R?\$?\s*\d{1,3}(?:\.\d{3})*,\d{2}\s*[DC-]?)$/i;

  // Padrão B: Linha de fatura de cartão moderna (ex: "• 9344  Planalto - Parcela 2/4  R$ 190,35" ou "Burger King  R$ 70,30")
  const cardInvoiceLineRegex = /^[•\*\-·]?\s*(?:(?:\d{4})\s+)?(.+?)\s+([+-]?\s*R?\$?\s*\d{1,3}(?:\.\d{3})*,\d{2}\s*[DC-]?)$/i;

  // Padrão C: Linha de estorno (ex: "Estorno de "Viacao Piracicabana"  -R$ 360,52")
  const refundLineRegex = /^(?:Estorno\s+de\s+["'“](.+?)["'”]|Estorno\s+(.+?))\s+([+-]?\s*R?\$?\s*\d{1,3}(?:\.\d{3})*,\d{2}\s*[DC-]?)$/i;

  // Regex para identificar se uma linha é apenas uma data de cabeçalho de lote (ex: "18 SET", "15/09")
  const isDateOnlyRegex = /^(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+[A-Za-z]{3}(?:\s+\d{4})?)$/i;

  // Regex para identificar se uma linha é apenas um valor monetário
  const isCurrencyOnlyRegex = /^([+-]?\s*R?\$?\s*\d{1,3}(?:\.\d{3})*,\d{2}\s*[DC-]?)$/i;

  // Filtros de palavras para ignorar linhas de cabeçalho, totalizadores e rodapé
  const ignorePatterns = [
    'SALDO ANTERIOR', 'SALDO FINAL', 'SALDO DO DIA', 'SALDO TOTAL',
    'TOTAL DA FATURA', 'PAGAMENTO MINIMO', 'PAGAMENTO RECEBIDO',
    'EXTRATO MENSAL', 'EXTRATO DE CONTA', 'RESUMO DA FATURA',
    'DATA DE VENCIMENTO', 'LIMITE TOTAL', 'LIMITE DISPONIVEL',
    'FATURA FECHADA', 'FATURA ATUAL', 'VALOR DA FATURA', 'VENCIMENTO',
    'PAGAMENTO DA FATURA', 'RESUMO DAS FATURAS',
    'PÁGINA', 'PAGINA', 'BANCO', 'AGÊNCIA', 'CONTA CORRENTE',
    'CPF:', 'CNPJ:', 'TITULAR:'
  ];

  let lastActiveDate: string | null = null;
  let pendingDate: string | null = null;
  let pendingDesc: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();

    // Pular linhas de rodapé ou cabeçalho conhecidos
    if (ignorePatterns.some(pat => upperLine.includes(pat))) {
      continue;
    }

    // Se a linha for apenas uma data (cabeçalho de lote de compras, ex: "18 SET"), memoriza
    if (isDateOnlyRegex.test(line)) {
      lastActiveDate = line;
      pendingDate = line;
      continue;
    }

    // Tentativa 1: Linha única com Data explícita no início
    const matchSingleWithDate = line.match(singleLineWithDateRegex);
    if (matchSingleWithDate) {
      const dateRaw = matchSingleWithDate[1];
      const descRaw = matchSingleWithDate[2].trim();
      const valRaw = matchSingleWithDate[3];

      if (
        descRaw.toUpperCase().includes('PAGAMENTO DE FATURA') ||
        descRaw.toUpperCase().includes('PAGAMENTO RECEBIDO') ||
        descRaw.toUpperCase().includes('SALDO')
      ) {
        continue;
      }

      const amount = parseBRLCurrency(valRaw);
      if (amount > 0) {
        lastActiveDate = dateRaw;
        const { iso, display } = normalizeDate(dateRaw, currentYear);
        const classification = classifyTransaction(descRaw, line);
        const merchantName = extractMerchantName(descRaw);

        transactions.push({
          id: `tx_${Date.now()}_${transactions.length}_${Math.random().toString(36).substring(2, 7)}`,
          date: iso,
          dateDisplay: display,
          dayOfWeek: getDayOfWeekFromDate(iso),
          merchantName,
          description: descRaw,
          originalText: line,
          amount,
          type: 'expense',
          category: classification.category,
          aiConfidence: classification.confidence,
          aiSource: classification.source,
          aiReason: classification.reason,
          statementName: fileName
        });
      }
      pendingDate = null;
      pendingDesc = null;
      continue;
    }

    // Tentativa 2: Linha de Estorno (ex: "Estorno de "Viacao Piracicabana" -R$ 360,52")
    const matchRefund = line.match(refundLineRegex);
    if (matchRefund) {
      const descRaw = (matchRefund[1] || matchRefund[2] || '').trim();
      const valRaw = matchRefund[3];
      const amount = parseBRLCurrency(valRaw);

      if (amount > 0) {
        const dateRaw = lastActiveDate || new Date().toISOString().slice(0, 10);
        const { iso, display } = normalizeDate(dateRaw, currentYear);
        const classification = classifyTransaction(descRaw, line);
        const merchantName = extractMerchantName(line);

        transactions.push({
          id: `tx_${Date.now()}_${transactions.length}_${Math.random().toString(36).substring(2, 7)}`,
          date: iso,
          dateDisplay: display,
          dayOfWeek: getDayOfWeekFromDate(iso),
          merchantName,
          description: line,
          originalText: line,
          amount,
          type: 'expense',
          category: classification.category,
          aiConfidence: 98,
          aiSource: 'knowledge_base',
          aiReason: `Estorno identificado em ${classification.category}`,
          statementName: fileName
        });
      }
      continue;
    }

    // Tentativa 3: Linha de fatura de cartão moderna (Nubank, C6, Inter, Itaú, Santander)
    // Ex: "• 9344  Planalto - Parcela 2/4  R$ 190,35" ou "Burger King  R$ 70,30"
    const matchCardLine = line.match(cardInvoiceLineRegex);
    if (matchCardLine) {
      const descRaw = matchCardLine[1].trim();
      const valRaw = matchCardLine[2];

      // Ignora se for cabeçalho ou totalizador
      if (
        descRaw.toUpperCase().includes('PAGAMENTO') ||
        descRaw.toUpperCase().includes('FATURA') ||
        descRaw.toUpperCase().includes('TOTAL') ||
        descRaw.toUpperCase().includes('SALDO')
      ) {
        continue;
      }

      const amount = parseBRLCurrency(valRaw);
      if (amount > 0) {
        const dateRaw = lastActiveDate || new Date().toISOString().slice(0, 10);
        const { iso, display } = normalizeDate(dateRaw, currentYear);
        const classification = classifyTransaction(descRaw, line);
        const merchantName = extractMerchantName(descRaw);

        transactions.push({
          id: `tx_${Date.now()}_${transactions.length}_${Math.random().toString(36).substring(2, 7)}`,
          date: iso,
          dateDisplay: display,
          dayOfWeek: getDayOfWeekFromDate(iso),
          merchantName,
          description: descRaw,
          originalText: line,
          amount,
          type: 'expense',
          category: classification.category,
          aiConfidence: classification.confidence,
          aiSource: classification.source,
          aiReason: classification.reason,
          statementName: fileName
        });
      }
      pendingDate = null;
      pendingDesc = null;
      continue;
    }

    // Tentativa 4: Formato multi-linha (Data na linha 1, Descrição na linha 2, Valor na linha 3)
    if (pendingDate && !pendingDesc && !isCurrencyOnlyRegex.test(line)) {
      pendingDesc = line;
      continue;
    }

    if (pendingDate && pendingDesc && isCurrencyOnlyRegex.test(line)) {
      const amount = parseBRLCurrency(line);
      const descUpper = pendingDesc.toUpperCase();

      if (
        amount > 0 &&
        !descUpper.includes('PAGAMENTO DE FATURA') &&
        !descUpper.includes('PAGAMENTO RECEBIDO') &&
        !descUpper.includes('SALDO')
      ) {
        const { iso, display } = normalizeDate(pendingDate, currentYear);
        const classification = classifyTransaction(pendingDesc, `${pendingDate} ${pendingDesc} ${line}`);
        const merchantName = extractMerchantName(pendingDesc);

        transactions.push({
          id: `tx_${Date.now()}_${transactions.length}_${Math.random().toString(36).substring(2, 7)}`,
          date: iso,
          dateDisplay: display,
          dayOfWeek: getDayOfWeekFromDate(iso),
          merchantName,
          description: pendingDesc,
          originalText: `${pendingDate} - ${pendingDesc} - ${line}`,
          amount,
          type: 'expense',
          category: classification.category,
          aiConfidence: classification.confidence,
          aiSource: classification.source,
          aiReason: classification.reason,
          statementName: fileName
        });
      }

      pendingDate = null;
      pendingDesc = null;
      continue;
    }

    if (isCurrencyOnlyRegex.test(line)) {
      pendingDate = null;
      pendingDesc = null;
    }
  }

  return {
    fileName,
    pageCount: 1,
    transactions,
    rawTextPreview: lines.slice(0, 30).join('\n'),
    detectedBank,
    warnings: transactions.length === 0 ? ['Nenhuma transação com valor e estabelecimento reconhecido foi encontrada nesta entrada.'] : []
  };
}

// Analisar texto bruto copiado diretamente da página do banco/fatura
export function parseRawStatementText(rawText: string, sourceName = 'Histórico Copiado do Site'): ParsedPDFResult {
  return parseStatementLines(rawText, sourceName);
}

// Função de parsing completa a partir do arquivo PDF
export async function parsePDFFile(file: File): Promise<ParsedPDFResult> {
  const { text, pageCount } = await extractTextFromPDF(file);
  const result = parseStatementLines(text, file.name);
  result.pageCount = pageCount;
  return result;
}
