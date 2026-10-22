import type { CategoryId, Transaction, FinancialMetrics } from '../types/finance';
import { CATEGORIES } from './categories';
import { loadGeminiKey, saveGeminiKey } from './storage';

const GEMINI_MODEL = 'gemini-1.5-flash';

// Verificar se há uma chave de API configurada
export function getSavedGeminiKey(): string {
  return loadGeminiKey();
}

export function setSavedGeminiKey(key: string): void {
  saveGeminiKey(key);
}

// Chamar a API REST oficial do Google Gemini
async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('Chave de API do Gemini não informada. Adicione sua chave para acionar a IA Generativa.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${cleanKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1200
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData?.error?.message || `Erro HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`Falha na API Gemini: ${errorMsg}`);
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error('A IA Generativa retornou uma resposta vazia.');
  }

  return textOutput;
}

// 1. Diagnóstico Executivo Financeiro Gerado pelo Gemini
export async function generateFinancialAuditWithGemini(
  metrics: FinancialMetrics,
  transactions: Transaction[],
  apiKey: string
): Promise<string> {
  const topCategories = Object.entries(metrics.categoryTotals)
    .filter(([_, val]) => val > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([catId, val]) => {
      const name = CATEGORIES[catId as CategoryId]?.name || catId;
      const pct = metrics.categoryPercentages[catId as CategoryId]?.toFixed(1) || '0';
      return `- ${name}: R$ ${val.toFixed(2)} (${pct}% do total de gastos)`;
    })
    .join('\n');

  const topTransactions = [...transactions]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)
    .map(t => `- ${t.dateDisplay}: ${t.merchantName || t.description} (R$ ${t.amount.toFixed(2)}) [${CATEGORIES[t.category]?.name || t.category}]`)
    .join('\n');

  const prompt = `Você é um consultor financeiro sênior especializado em finanças pessoais brasileiras.
Analise os dados financeiros do mês a seguir e produza um diagnóstico executivo, claro, empático e prático em língua portuguesa do Brasil.

DADOS DO MÊS:
- Salário Líquido Informado: R$ ${metrics.salary.toFixed(2)}
- Total de Gastos: R$ ${metrics.totalExpenses.toFixed(2)}
- Saldo Restante (Sobrou): R$ ${metrics.remainingSalary.toFixed(2)} (${metrics.savingsPercentage.toFixed(1)}% do salário)
- Quantidade de Lançamentos: ${metrics.transactionCount}

DISTRIBUIÇÃO POR CATEGORIA:
${topCategories || 'Nenhum gasto registrado'}

MAIORES GASTOS REGISTRADOS:
${topTransactions || 'Nenhum'}

INSTRUÇÕES DE FORMATAÇÃO:
Por favor, formate a resposta com títulos claros em markdown:
1. 📊 Diagnóstico Geral da Saúde Financeira (Como está a situação em relação ao salário e quanto sobrou)
2. ⚠️ Pontos de Atenção (Categorias com maior peso como Comida, Gasolina, Financiamentos ou Transporte)
3. 💡 3 Ações Práticas para Economizar no Próximo Mês
Seja direto, encorajador e objetivo.`;

  return await callGeminiAPI(prompt, apiKey);
}

// 2. Chat / Pergunta ao Assistente Financeiro com Gemini
export async function askGeminiAssistant(
  question: string,
  metrics: FinancialMetrics,
  transactions: Transaction[],
  apiKey: string
): Promise<string> {
  const summary = `
Contexto do usuário:
Salário: R$ ${metrics.salary.toFixed(2)}
Total Gasto: R$ ${metrics.totalExpenses.toFixed(2)}
Sobrou do Salário: R$ ${metrics.remainingSalary.toFixed(2)}
Total de Transações: ${transactions.length}
Categorias:
${Object.entries(metrics.categoryTotals).map(([cat, val]) => `${cat}: R$ ${val.toFixed(2)}`).join(', ')}
`;

  const prompt = `Você é o assistente financeiro pessoal FinAI, movido a IA generativa.
${summary}

O usuário fez a seguinte pergunta sobre as suas finanças:
"${question}"

Responda em português do Brasil de forma concisa, útil, analítica e educada, baseando-se estritamente nos números do contexto acima.`;

  return await callGeminiAPI(prompt, apiKey);
}
