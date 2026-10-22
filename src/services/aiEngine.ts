import type { CategoryId, Transaction, UserLearningRule, AIAdvisorInsight, FinancialMetrics } from '../types/finance';
import { CATEGORIES, CATEGORY_LIST } from './categories';
import { extractMerchantName } from './merchantExtractor';

const LEARNING_STORAGE_KEY = 'finai_learned_rules_v1';

// Helper de remoção de acentos e caracteres especiais para comparação
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Carregar regras aprendidas pelo usuário
export function getLearnedRules(): UserLearningRule[] {
  try {
    const raw = localStorage.getItem(LEARNING_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao carregar regras aprendidas:', e);
    return [];
  }
}

// Salvar nova regra aprendida
export function saveLearnedRule(merchantPattern: string, category: CategoryId): void {
  try {
    const rules = getLearnedRules();
    const normalizedPattern = normalizeText(merchantPattern);
    
    if (normalizedPattern.length < 3) return;

    // Remove regra anterior para o mesmo padrão se existir
    const filtered = rules.filter(r => r.merchantPattern !== normalizedPattern);
    filtered.push({
      merchantPattern: normalizedPattern,
      category,
      updatedAt: new Date().toISOString()
    });

    localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Erro ao salvar regra aprendida:', e);
  }
}

// Excluir todas as regras aprendidas (reset)
export function resetLearnedRules(): void {
  localStorage.removeItem(LEARNING_STORAGE_KEY);
}

// Motor de Classificação Inteligente Híbrido
export interface ClassificationResult {
  category: CategoryId;
  confidence: number;
  source: 'learned' | 'knowledge_base' | 'nlp_heuristic' | 'manual';
  reason: string;
}

// Padrões Regex com alta precisão para o comércio e faturas de cartão brasileiras
const REGEX_HEURISTICS: Record<CategoryId, RegExp[]> = {
  saude: [
    /\b(?:ODONTOLOGIA\s+SANDRESCHI|SANDRESCHI|ODONTOLOGIA|ODONTO\b|ODONTOPREV|SORRIDENTES|DENTISTA)\b/i,
    /\b(?:TOTALPASS|TOTAL\s*PASS|GYMPASS)\b/i,
    /\b(?:DROGA\s*RAIA|RAIA\b|DROGASIL|DROGARIA\s+SAO\s+PAULO|DROG\b|PACHECO|PAGUE\s*MENOS|PANVEL|ARAUJO|ULTRAFARMA)\b/i,
    /\b(?:FARMACIA|FARMÁCIA|FARMA\b|DROGARIA|REMEDIO|REMÉDIO|MEDICAMENTO)\b/i,
    /\b(?:UNIMED|SULAMERICA|BRADESCO\s*SAUDE|AMIL|NOTREDAME|HAPVIDA|PREVENT\s*SENIOR|HOSPITAL|HOSP\b|PRONTO\s*SOCORRO)\b/i,
    /\b(?:CLINICA|CLÍNICA|CONSULTA|CONSULTORIO|CONSULTÓRIO|MEDICO|MÉDICO|PSICOLOG|FISIOTERAPIA|OTICA|ÓTICA|EXAME|VACINA)\b/i,
    /\b(?:LABORATORIO|LABORATÓRIO|LAB\b|FLEURY|DASA|LAVOISIER|DELBONI)\b/i
  ],
  comida: [
    /\b(?:IFD\*|IFOOD|RAPPI|ZE\s*DELIVERY|AIQFOME)\b/i,
    /\b(?:RODOSNACK|RODO\s*SNACK|RESTAURANTE\s+DA\s+FAZENDA|REALFOOD|CASA\s+DO\s+FORNO)\b/i,
    /\b(?:SUPERMERCADOS\s+JOANIN|JOANIN|SUPERMERCADO|MERCADO|MERCADINHO|HIPERMERCADO|ATACADAO|ATACADÃO|ASSAI|ASSAÍ|CARREFOUR|PAO\s+DE\s+ACUCAR|PÃO\s+DE\s+AÇÚCAR|EXTRA|SONDA|ZAFFARI|MAMBO|HIROTA|DIA\b)\b/i,
    /\b(?:RESTAURANTE|REST\b|LANCHONETE|LANCHES|BURGER|HAMBURGUER|MCDONALD|BURGER\s*KING|SUBWAY|OUTBACK|HABIB|RAGAZZO)\b/i,
    /\b(?:PIZZARIA|PIZZA|CHURRASCARIA|CHURRASCO|CHOPP|BOTEQUIM|PUB|SUSHI|TEMAKI|BUFFET|ESPETINHO)\b/i,
    /\b(?:PADARIA|PANIFICADORA|CONFEITARIA|DOCERIA|BOLO|SORVETERIA|SORVETE|GELATO|CACAU\s*SHOW|KOPENHAGEN|STARBUCKS)\b/i,
    /\b(?:HORTIFRUTI|SACOLAO|SACOLÃO|QUITANDA|ACOUGUE|AÇOUGUE|CARNES|SWIFT|PEIXARIA)\b/i
  ],
  gasolina: [
    /\b(?:EMIGRANTES\s+AUTO\s+POSTO|AUTO\s*POSTO|AUTOPOSTO|POSTO\b|POSTOS\b|PST\b|PST\.)/i,
    /\b(?:POSTO\s+SHELL|SHELL\s+BOX|POSTO\s+IPIRANGA|ABASTECE\s*AI|POSTO\s+BR|PETROBRAS|PREMMIA|POSTO\s+ALE|REDE\s+GRAAL|GRAAL\b)/i,
    /\b(?:GASOLINA|COMBUSTIVEL|COMBUSTÍVEL|COMBUSTIVEIS|COMBUSTÍVEIS|ETANOL|DIESEL|GNV|ABASTECIMENTO|ABASTECE|LUBRAX)\b/i
  ],
  transporte: [
    /\b(?:UBER|UBR\*|99APP|99\s*POP|99\s*TAXI|99\s*TECNOLOGIA|TAXI\b|CABIFY|INDRIVER)\b/i,
    /\b(?:ANCAR\s+PARKING|ESTACION\b|ESTACIONAMENTO|ESTAPAR|INDIGO|GARAGEM|PARKING|VALET)\b/i,
    /\b(?:VIACAO\s+PIRACICABANA|VIAÇÃO\s+PIRACICABANA|PIRACICABANA|BUSER|FLIXBUS|VIACAO|VIAÇÃO|COMETA|1001|AEROPORTO|RODOVIARIA|PASSAGEM)\b/i,
    /\b(?:XTREMEMOT|XTREME\s*MOT|MOTO\s*PECAS)\b/i,
    /\b(?:METRO|METRÔ|CPTM|SPTRANS|BILHETE\s*UNICO|BILHETE\s*ÚNICO|AUTOPASS|TOP\s*AUTOPASS|CARTAO\s*BOM|EMTU)\b/i,
    /\b(?:SEM\s*PARAR|SEMPARAR|VELOE|CONECTCAR|TAGGY|MOVE\s*MAIS|PEDAGIO|PEDÁGIO|AUTOBAN|CCR|ECOVIAS|RODOANEL)\b/i,
    /\b(?:LATAM|GOL\s*LINHAS|AZUL\s*LINHAS)\b/i
  ],
  pet: [
    /\b(?:PETZ|COBASI|PETLOVE|PET\s*SHOP|PETSHOP|PET\s*CARE|MEU\s*AMIGO\s*PET|AGROPET|AGROPECUARIA)\b/i,
    /\b(?:VETERINARIO|VETERINÁRIO|VETERINARIA|VETERINÁRIA|VET\b|CLINICA\s*VET|HOSPITAL\s*VET)\b/i,
    /\b(?:BANHO\s*E\s*TOSA|BANHO\s*&\s*TOSA|TOSA\b|RACAO|RAÇÃO|PREMIER\s*PET|ROYAL\s*CANIN|GOLDEN\s*PET)\b/i,
    /\b(?:PATAS|PATINHAS|CANIL|GATO|CACHORRO)\b/i
  ],
  moradia: [
    /\b(?:ENEL|SABESP|COMGAS|COMGÁS|CPFL|LIGHT|COPEL|CEMIG|ELEKTRO|ENERGIA|AGUA\b|ÁGUA\b|SANEPAR|COPASA)\b/i,
    /\b(?:CONTA\s*DE\s*LUZ|CONTA\s*DE\s*AGUA|GAS\b|GÁS\b|ULTRAGAZ|SUPERGASBRAS|LIQUIGAS)\b/i,
    /\b(?:CONDOMINIO|CONDOMÍNIO|CONDOM\b|ALUGUEL|QUINTOANDAR|IPTU)\b/i,
    /\b(?:INTERNET|CLARO|VIVO|TIM|OI\s*FIBRA|NET\s*SERVICOS)\b/i
  ],
  lazer: [
    /\b(?:NICK\s*FUN|DIVERSOES|DIVERSÕES|FLIPERAMA)\b/i,
    /\b(?:NETFLIX|SPOTIFY|DM\*SPOTIFY|AMAZON\s*PRIME|PRIME\s*VIDEO|HBO|DISNEY|GLOBOPLAY|YOUTUBE\s*PREMIUM|APPLE\.COM)\b/i,
    /\b(?:CINEMA|CINEMARK|UCI|KINOPLEX|INGRESSO|SYMPLA|EVENTIM|TEATRO|SHOW)\b/i,
    /\b(?:STEAM|PLAYSTATION|PSN|XBOX|NINTENDO|SMARTFIT|BLUEFIT)\b/i,
    /\b(?:HOTEL|AIRBNB|BOOKING|DECOLAR|CVC|LIVRARIA)\b/i
  ],
  financiamentos: [
    /\b(?:FINANCIAMENTO|FINANC\b|FINAN\b|HABITACAO|HABITAÇÃO|HABITACIONAL|IMOBILIARIO|IMOBILIÁRIO)\b/i,
    /\b(?:CAIXA\s*HAB|CAIXA\s*ECONOMICA\s*HAB|CEF\s*HAB|PARC\s*HABIT|PARCELA\s*HABIT)\b/i,
    /\b(?:BV\s*FINANC|SANTANDER\s*FINANC|ITAU\s*FINANC|BRADESCO\s*FINANC|BANCO\s*PAN|AYMORE|SAFRA\s*FINANC)\b/i,
    /\b(?:CONSORCIO|CONSÓRCIO|PORTO\s*CONSORCIO|RODOBENS|EMPRESTIMO|EMPRÉSTIMO|EMPR\b|CONSIGNADO|RENEGOCIACAO)\b/i,
    /\b(?:PARCELA\s+\d+\s*\/\s*\d+|PARC\s+\d+\s*\/\s*\d+)\b/i,
    /\b(?:PLANALTO|EBAZAR|EBAZARCOMBRLT)\b/i,
    /\b(?:PARC\b|PARC\.|PARCELA)\s*(?:\d{1,2}(?:\/\d{1,2})?|\b)/i,
    /\b(?:DEB\s*PARC|DEBITO\s*PARC|CDC\b|LEASING\b)/i
  ],
  outros: [
    /\b(?:IOF|TARIFA|TAXA|SAQUE|ENCARGOS|ANUIDADE)\b/i
  ]
};

// Ordem de avaliação para garantir que despesas de saúde/odontologia tenham precedência
const EVALUATION_ORDER: CategoryId[] = [
  'saude',
  'comida',
  'gasolina',
  'transporte',
  'pet',
  'moradia',
  'lazer',
  'financiamentos',
  'outros'
];

export function classifyTransaction(description: string, rawText = ''): ClassificationResult {
  const normDesc = normalizeText(description);
  const normRaw = normalizeText(rawText);
  const fullText = `${normDesc} ${normRaw}`;

  // 1. TIER 1: Regras aprendidas diretamente com o usuário (Prioridade Máxima)
  const learnedRules = getLearnedRules();
  for (const rule of learnedRules) {
    if (fullText.includes(rule.merchantPattern) || normDesc.includes(rule.merchantPattern)) {
      return {
        category: rule.category,
        confidence: 100,
        source: 'learned',
        reason: `Aprendido com suas correções para "${rule.merchantPattern}"`
      };
    }
  }

  // 2. TIER 2: Heurísticas Regex de Alta Precisão (Avaliadas na ordem prioritária)
  for (const catId of EVALUATION_ORDER) {
    const regexList = REGEX_HEURISTICS[catId] || [];
    for (const regex of regexList) {
      if (regex.test(fullText)) {
        return {
          category: catId,
          confidence: 96,
          source: 'knowledge_base',
          reason: `Padrão comercial reconhecido: ${CATEGORIES[catId].name}`
        };
      }
    }
  }

  // 3. TIER 3: Sistema de Pontuação Ponderada Multi-Keyword (Scoring Matrix)
  const scores: Record<CategoryId, number> = {
    comida: 0,
    gasolina: 0,
    transporte: 0,
    financiamentos: 0,
    saude: 0,
    pet: 0,
    moradia: 0,
    lazer: 0,
    outros: 0
  };

  const tokens = fullText.split(' ');

  for (const cat of CATEGORY_LIST) {
    if (cat.id === 'outros') continue;

    for (const kw of cat.keywords) {
      const normKw = normalizeText(kw);
      if (normKw.length < 3) continue;

      if (fullText.includes(normKw)) {
        // Ponderação baseada no tamanho da palavra-chave
        const weight = normKw.length > 5 ? 30 : 15;
        scores[cat.id] += weight;
      }
    }

    // Pontos extras por radicais de palavras nos tokens
    for (const token of tokens) {
      if (cat.id === 'gasolina' && (token.startsWith('POST') || token.startsWith('COMB') || token.startsWith('ABAST'))) {
        scores.gasolina += 25;
      }
      if (cat.id === 'comida' && (token.startsWith('MERC') || token.startsWith('REST') || token.startsWith('LANCH') || token.startsWith('PIZZ') || token.startsWith('BURG') || token.startsWith('PADAR') || token.startsWith('ACOUG') || token.startsWith('SNACK') || token.startsWith('FORNO'))) {
        scores.comida += 25;
      }
      if (cat.id === 'pet' && (token.startsWith('PET') || token.startsWith('VET') || token.startsWith('RACA') || token.startsWith('BANHO'))) {
        scores.pet += 30;
      }
      if (cat.id === 'financiamentos' && (token.startsWith('FINAN') || token.startsWith('PARC') || token.startsWith('HABIT') || token.startsWith('CONSOR') || token.startsWith('EMPRES'))) {
        scores.financiamentos += 30;
      }
      if (cat.id === 'saude' && (token.startsWith('FARM') || token.startsWith('DROG') || token.startsWith('CLIN') || token.startsWith('HOSP') || token.startsWith('ODONT') || token.startsWith('MEDIC') || token.startsWith('TOTALPASS'))) {
        scores.saude += 25;
      }
      if (cat.id === 'transporte' && (token.startsWith('UBER') || token.startsWith('PEDAG') || token.startsWith('ESTAC') || token.startsWith('PASSAG') || token.startsWith('VIAC') || token.startsWith('PARK'))) {
        scores.transporte += 25;
      }
    }
  }

  // Encontrar categoria com maior pontuação respeitando a ordem prioritária
  let bestCategory: CategoryId = 'outros';
  let highestScore = 0;

  for (const cId of EVALUATION_ORDER) {
    if (cId === 'outros') continue;
    const score = scores[cId];
    if (score > highestScore) {
      highestScore = score;
      bestCategory = cId;
    }
  }

  if (highestScore >= 15) {
    return {
      category: bestCategory,
      confidence: Math.min(95, 75 + Math.round(highestScore / 2)),
      source: 'nlp_heuristic',
      reason: `Semântica e termos identificados para ${CATEGORIES[bestCategory].name}`
    };
  }

  // 4. Fallback padrão apenas se nenhuma categoria atingiu pontuação mínima
  return {
    category: 'outros',
    confidence: 40,
    source: 'nlp_heuristic',
    reason: 'Não foi possível identificar o ramo de atividade no texto'
  };
}

// Reclassificar todas as transações com o motor atualizado e extrair nomes higienizados
export function reclassifyAllTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.map(t => {
    // Se o usuário classificou manualmente, preserva a categoria
    if (t.aiSource === 'manual') {
      const cleanMerchant = extractMerchantName(t.description || t.originalText);
      return { ...t, merchantName: cleanMerchant };
    }

    const classification = classifyTransaction(t.description, t.originalText);
    const cleanMerchant = extractMerchantName(t.description || t.originalText);

    return {
      ...t,
      merchantName: cleanMerchant,
      category: classification.category,
      aiConfidence: classification.confidence,
      aiSource: classification.source,
      aiReason: classification.reason
    };
  });
}

// Gerador de diagnósticos e recomendações executivas locais
export function generateAIInsights(metrics: FinancialMetrics, transactions: Transaction[]): AIAdvisorInsight[] {
  const insights: AIAdvisorInsight[] = [];

  // 1. Diagnóstico de Salário e Sobra
  if (metrics.salary > 0) {
    if (metrics.remainingSalary < 0) {
      insights.push({
        id: 'ins_deficit',
        type: 'alert',
        title: 'Atenção: Despesas superam seu salário',
        message: `Seus gastos totais somam R$ ${metrics.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, gerando um saldo negativo de R$ ${Math.abs(metrics.remainingSalary).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Reavalie parcelas ou compras não essenciais.`,
        category: 'financiamentos',
        impactLevel: 'high'
      });
    } else if (metrics.savingsPercentage >= 20) {
      insights.push({
        id: 'ins_savings_good',
        type: 'praise',
        title: 'Excelente capacidade de poupança',
        message: `Você está poupando ${metrics.savingsPercentage.toFixed(1)}% do seu salário (R$ ${metrics.remainingSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} livres). Esse montante é ideal para investimentos ou reserva de emergência.`,
        category: 'outros',
        impactLevel: 'high'
      });
    } else {
      insights.push({
        id: 'ins_savings_moderate',
        type: 'tip',
        title: 'Sobra moderada do salário',
        message: `Restam R$ ${metrics.remainingSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${metrics.savingsPercentage.toFixed(1)}% do salário). A meta recomendada por consultores financeiros é reservar ao menos 15% a 20% ao mês.`,
        category: 'outros',
        impactLevel: 'medium'
      });
    }
  }

  // 2. Análise de Comida / Alimentação
  const foodTotal = metrics.categoryTotals.comida || 0;
  if (metrics.salary > 0 && foodTotal > 0) {
    const foodRatio = (foodTotal / metrics.salary) * 100;
    if (foodRatio > 30) {
      insights.push({
        id: 'ins_food_high',
        type: 'alert',
        title: 'Gastos elevados com Comida & Alimentação',
        message: `Alimentação consumiu ${foodRatio.toFixed(1)}% do seu salário (R$ ${foodTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). Reduzir pedidos por delivery e otimizar supermercado pode liberar recursos no fim do mês.`,
        category: 'comida',
        impactLevel: 'high'
      });
    }
  }

  // 3. Análise de Financiamentos & Parcelas
  const loansTotal = metrics.categoryTotals.financiamentos || 0;
  if (metrics.salary > 0 && loansTotal > 0) {
    const loansRatio = (loansTotal / metrics.salary) * 100;
    if (loansRatio > 35) {
      insights.push({
        id: 'ins_loans_high',
        type: 'alert',
        title: 'Alerta de Endividamento com Parcelas & Financiamentos',
        message: `Financiamentos e parcelas comprometem ${loansRatio.toFixed(1)}% do seu salário (R$ ${loansTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). O teto saudável recomendado para parcelas fixas é de 30% da renda.`,
        category: 'financiamentos',
        impactLevel: 'high'
      });
    }
  }

  // 4. Análise de Combustível & Transporte
  const fuelTotal = metrics.categoryTotals.gasolina || 0;
  const transportTotal = metrics.categoryTotals.transporte || 0;
  const totalMobility = fuelTotal + transportTotal;
  if (totalMobility > 0 && metrics.salary > 0) {
    const mobRatio = (totalMobility / metrics.salary) * 100;
    if (mobRatio > 25) {
      insights.push({
        id: 'ins_mob_high',
        type: 'tip',
        title: 'Custo relevante de Transporte & Combustível',
        message: `Mobilidade (gasolina, apps e pedágios) somou R$ ${totalMobility.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${mobRatio.toFixed(1)}% da renda).`,
        category: 'transporte',
        impactLevel: 'medium'
      });
    }
  }

  // 5. Maior transação do mês
  if (transactions.length > 0) {
    const highestTx = [...transactions].sort((a, b) => b.amount - a.amount)[0];
    if (highestTx && highestTx.amount > 200) {
      insights.push({
        id: 'ins_top_expense',
        type: 'tip',
        title: `Maior despesa única: ${highestTx.merchantName}`,
        message: `O maior valor individual registrado foi de R$ ${highestTx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em ${highestTx.dateDisplay} (${CATEGORIES[highestTx.category].name}).`,
        category: highestTx.category,
        impactLevel: 'low'
      });
    }
  }

  return insights;
}
