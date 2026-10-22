import type { Transaction } from '../types/finance';
import { getDayOfWeekFromDate } from './pdfParser';
import { classifyTransaction } from './aiEngine';
import { extractMerchantName } from './merchantExtractor';

interface MockItem {
  date: string;
  rawLine: string;
  amount: number;
}

// Lançamentos reais extraídos exatamente do formato da fatura do usuário
const REAL_INVOICE_SAMPLE_DATA: MockItem[] = [
  // Financiamentos / Parcelas
  { date: '2026-09-03', rawLine: '• 9344  Planalto - Parcela 2/4', amount: 190.35 },
  { date: '2026-09-05', rawLine: '• 9344  Ec *Ebazarcombrlt - Parcela 10/10', amount: 270.00 },

  // Saúde & Odontologia & Academia
  { date: '2026-09-08', rawLine: '• 9344  Odontologia Sandreschi - Parcela 4/5', amount: 300.00 },
  { date: '2026-09-12', rawLine: '• 9344  Totalpass', amount: 89.90 },

  // Comida & Alimentação
  { date: '2026-09-09', rawLine: '• 9344  Rodosnack Ouro Verde L', amount: 25.80 },
  { date: '2026-09-11', rawLine: '• 9344  Ifd*Paulo da Silva Res', amount: 19.98 },
  { date: '2026-09-13', rawLine: '• 9344  Restaurante da Fazenda', amount: 129.60 },
  { date: '2026-09-14', rawLine: '• 9344  Supermercados Joanin', amount: 6.30 },
  { date: '2026-09-15', rawLine: '• 9344  Casa do Forno', amount: 32.90 },
  { date: '2026-09-16', rawLine: '• 9344  Realfood', amount: 16.94 },
  { date: '2026-09-19', rawLine: '• 9344  Burger King', amount: 70.30 },

  // Transporte & Mobilidade & Estacionamento
  { date: '2026-09-10', rawLine: '• 9344  99app *99app', amount: 86.00 },
  { date: '2026-09-14', rawLine: '• 9344  Ancar Parking Estacion', amount: 32.00 },
  { date: '2026-09-17', rawLine: '• 9344  Pgz*Xtrememot', amount: 90.00 },
  { date: '2026-09-13', rawLine: 'Estorno de "Viacao Piracicabana"', amount: 360.52 },

  // Gasolina & Combustível
  { date: '2026-09-18', rawLine: '• 9344  Emigrantes Auto Posto', amount: 28.30 },

  // Lazer & Assinaturas
  { date: '2026-09-11', rawLine: '• 9344  Vmt*Nick Fun', amount: 9.00 },
  { date: '2026-09-12', rawLine: '• 3313  Dm*Spotify', amount: 12.90 },

  // Animal de Estimação (Pet)
  { date: '2026-09-07', rawLine: '• 9344  Cobasi Pet Care & Ração', amount: 125.40 },

  // Moradia & Serviços
  { date: '2026-09-06', rawLine: '• 9344  Claro Telecom Internet Fibra', amount: 119.90 },

  // Outros / Contato direto
  { date: '2026-09-10', rawLine: '• 9344  55160637ariane', amount: 25.00 }
];

export function getMockTransactions(): Transaction[] {
  return REAL_INVOICE_SAMPLE_DATA.map((item, index) => {
    const [year, month, day] = item.date.split('-');
    const dateDisplay = `${day}/${month}/${year}`;
    const dayOfWeek = getDayOfWeekFromDate(item.date);
    const classification = classifyTransaction(item.rawLine);
    const merchantName = extractMerchantName(item.rawLine);

    return {
      id: `invoice_real_${index + 1}`,
      date: item.date,
      dateDisplay,
      dayOfWeek,
      merchantName,
      description: item.rawLine,
      originalText: `${item.rawLine}   R$ ${item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      amount: item.amount,
      type: 'expense',
      category: classification.category,
      aiConfidence: classification.confidence,
      aiSource: classification.source,
      aiReason: classification.reason,
      statementName: 'Fatura_Cartao_Historico_Real.pdf'
    };
  });
}
