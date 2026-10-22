// Serviço especializado na extração e limpeza do Nome do Estabelecimento de extratos bancários brasileiros

// Prefíxos comuns de bancos, marcadores de cartão e maquininhas a serem removidos
const NOISE_PREFIXES = [
  // Marcadores de fatura de cartão (ex: "• 9344 ", "9344 ", "* 3313 ")
  /^[•\*\-·\s]*\d{3,4}\s+/i,
  /^COMPRA\s+(?:NO\s+)?(?:DEBITO|CREDITO|A\s+VISTA|PARCELAD[AO]|ELO|VISA|MASTER(?:CARD)?|AMEX|HIPERCARD)\s*/i,
  /^COMPRA\s+CARTAO\s+(?:\d{1,2}\/\d{1,2}\s*)?/i,
  /^COMPRA\s+/i,
  /^PIX\s+(?:TRANSF(?:ERENCIA)?|ENVIAD[AO]|RECEBID[AO]|PAG(?:AMENT)?O|EMITID[AO]|COBRANCA)\s*(?:[-–:]\s*)?/i,
  /^TRANSFERENCIA\s+(?:PIX|TED|DOC|ENTRE\s+CONTAS)\s*/i,
  /^TRANSF(?:\.|\s+)(?:PIX|TED|DOC)\s*/i,
  /^ENVIO\s+(?:PIX|TED|DOC)\s*/i,
  /^PAG(?:TO|\.|\s+)?\s*(?:ELETRON(?:ICO)?|TITULO|BOLETO|COBRANCA|FATURA|SERVICO|DEBITO\s+AUTOMATICO|DEB(?:\.|\s+)AUT(?:OM)?)\s*/i,
  /^DEBITO\s+(?:AUTOMATICO|AUT(?:\.|\s+))\s*/i,
  /^DEB(?:\.|\s+)AUTOM(?:\.|\s+)?\s*/i,
  /^PAGAMENTO\s+(?:DE\s+)?(?:TITULO|BOLETO|CONTA|AGUA|LUZ|TELEFONE|ENERGIA|GAS)\s*/i,
  // Gateways e adquirentes com asterisco (Ec*, Ifd*, Vmt*, Dm*, Pgz*, Mp*, etc.)
  /^(?:EC\*|EC\s*\*|IFD\*|IFD\s*\*|VMT\*|VMT\s*\*|DM\*|DM\s*\*|PGZ\*|PGZ\s*\*|PAG\*|MP\*|UBR\*|STONE\*|CIELO\*|REDE\*|SUMUP\*|PAGSEGURO\*|PAYPAL\*|MERCADOPAGO\*|APP\*|DL\*|HOTMART\*)\s*/i
];

// Sufixos comuns a serem limpos no final da linha
const NOISE_SUFFIXES = [
  /\s+(?:LTDA|S\/?A|EPP|ME|EIRELI|EIR|CIA|SA)\b/i,
  /\s+\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\s*$/i, // data no final
  /\s+(?:BR|BRA|SAO PAULO|SP|RIO DE JANEIRO|RJ|CURITIBA|PR|BELO HORIZONTE|MG|BRASILIA|DF)\s*$/i,
  /\s+\*?\d{3,}\s*$/i // IDs numéricos ou códigos de terminal
];

// Mapeamentos conhecidos para nomes amigáveis de grandes redes e estabelecimentos reais
const WELL_KNOWN_MERCHANTS: { pattern: RegExp; cleanName: string }[] = [
  // E-commerce e Mercado Livre
  { pattern: /EBAZAR|EBAZARCOMBRLT/i, cleanName: 'Mercado Livre (Ebazar)' },
  { pattern: /MERCADO\s*LIVRE|MERCADOLIVRE/i, cleanName: 'Mercado Livre' },
  { pattern: /MERCADO\s*PAGO|MERCADOPAGO/i, cleanName: 'Mercado Pago' },
  { pattern: /AMAZON(?:\s*BRASIL|\.COM)?/i, cleanName: 'Amazon' },
  { pattern: /SHOPEE/i, cleanName: 'Shopee' },
  { pattern: /ALIEXPRESS|SHEIN/i, cleanName: 'AliExpress / Shein' },

  // Comida / Delivery / Supermercados
  { pattern: /IFOOD|IFD\*/i, cleanName: 'iFood' },
  { pattern: /RODOSNACK/i, cleanName: 'Rodosnack Ouro Verde' },
  { pattern: /RESTAURANTE\s+DA\s+FAZENDA/i, cleanName: 'Restaurante da Fazenda' },
  { pattern: /SUPERMERCADOS\s+JOANIN|JOANIN/i, cleanName: 'Supermercados Joanin' },
  { pattern: /CASA\s+DO\s+FORNO/i, cleanName: 'Casa do Forno' },
  { pattern: /REALFOOD/i, cleanName: 'Realfood' },
  { pattern: /BURGER\s*KING|BK\s*BRASIL/i, cleanName: 'Burger King' },
  { pattern: /RAPPI/i, cleanName: 'Rappi' },
  { pattern: /ZE\s*DELIVERY/i, cleanName: 'Zé Delivery' },
  { pattern: /AIQFOME/i, cleanName: 'Aiqfome' },
  { pattern: /CARREFOUR/i, cleanName: 'Carrefour' },
  { pattern: /PAO\s+DE\s+ACUCAR/i, cleanName: 'Pão de Açúcar' },
  { pattern: /ASSAI|ASSAÍ/i, cleanName: 'Assaí Atacadista' },
  { pattern: /ATACADAO|ATACADÃO/i, cleanName: 'Atacadão' },
  { pattern: /MCDONALD|MC\s*DONALD/i, cleanName: "McDonald's" },
  { pattern: /OUTBACK/i, cleanName: 'Outback Steakhouse' },
  { pattern: /SUBWAY/i, cleanName: 'Subway' },
  { pattern: /HABIB/i, cleanName: "Habib's" },
  { pattern: /SWIFT/i, cleanName: 'Swift Carnes' },
  { pattern: /CACAU\s*SHOW/i, cleanName: 'Cacau Show' },
  { pattern: /KOPENHAGEN/i, cleanName: 'Kopenhagen' },
  { pattern: /NATURAL\s+DA\s+TERRA/i, cleanName: 'Natural da Terra' },
  { pattern: /ST\s*MARCHE/i, cleanName: 'St. Marche' },
  { pattern: /HIROTA/i, cleanName: 'Hirota Food' },
  { pattern: /SONDA/i, cleanName: 'Sonda Supermercados' },

  // Gasolina / Postos
  { pattern: /EMIGRANTES\s+AUTO\s+POSTO/i, cleanName: 'Emigrantes Auto Posto' },
  { pattern: /POSTO\s+SHELL|SHELL\s+BOX|SHELL/i, cleanName: 'Posto Shell' },
  { pattern: /POSTO\s+IPIRANGA|ABASTECE\s*AI|IPIRANGA/i, cleanName: 'Posto Ipiranga' },
  { pattern: /POSTO\s+BR|PETROBRAS|PREMMIA/i, cleanName: 'Posto Petrobras (BR)' },
  { pattern: /REDE\s+GRAAL|GRAAL/i, cleanName: 'Rede Graal' },
  { pattern: /POSTO\s+ALE/i, cleanName: 'Posto ALE' },
  { pattern: /AUTO\s*POSTO/i, cleanName: 'Auto Posto' },

  // Transporte & Estacionamento & Motos
  { pattern: /99APP|99\s*\*?\s*(?:POP|APP|TAXI|TECNOLOGIA)/i, cleanName: '99 App' },
  { pattern: /UBER\s*\*?\s*TRIP|UBER/i, cleanName: 'Uber' },
  { pattern: /ANCAR\s+PARKING|ANCAR.*ESTACION/i, cleanName: 'Ancar Parking Estacionamento' },
  { pattern: /ESTAPAR/i, cleanName: 'Estapar Estacionamentos' },
  { pattern: /INDIGO\s+PARK/i, cleanName: 'Indigo Estacionamentos' },
  { pattern: /VIACAO\s+PIRACICABANA|VIAÇÃO\s+PIRACICABANA/i, cleanName: 'Viação Piracicabana' },
  { pattern: /XTREMEMOT|XTREME\s*MOT/i, cleanName: 'Xtreme Motos' },
  { pattern: /SEM\s*PARAR/i, cleanName: 'Sem Parar' },
  { pattern: /VELOE/i, cleanName: 'Veloe' },
  { pattern: /CONECTCAR/i, cleanName: 'ConectCar' },
  { pattern: /LATAM/i, cleanName: 'LATAM Airlines' },
  { pattern: /GOL\s+LINHAS/i, cleanName: 'GOL Linhas Aéreas' },
  { pattern: /AZUL\s+LINHAS/i, cleanName: 'Azul Linhas Aéreas' },
  { pattern: /BUSER/i, cleanName: 'Buser' },
  { pattern: /METRO|METRÔ/i, cleanName: 'Metrô' },
  { pattern: /CPTM/i, cleanName: 'CPTM Trem' },
  { pattern: /SPTRANS|BILHETE\s*UNICO/i, cleanName: 'SPTrans Bilhete Único' },

  // Saúde & Odontologia & Academias
  { pattern: /ODONTOLOGIA\s+SANDRESCHI|SANDRESCHI/i, cleanName: 'Odontologia Sandreschi' },
  { pattern: /TOTALPASS|GYMPASS/i, cleanName: 'TotalPass' },
  { pattern: /DROGA\s*RAIA|RAIA/i, cleanName: 'Droga Raia' },
  { pattern: /DROGASIL/i, cleanName: 'Drogasil' },
  { pattern: /DROGARIA\s+SAO\s+PAULO/i, cleanName: 'Drogaria São Paulo' },
  { pattern: /DROGARIA\s+PACHECO|PACHECO/i, cleanName: 'Drogaria Pacheco' },
  { pattern: /PAGUE\s*MENOS/i, cleanName: 'Farmácia Pague Menos' },
  { pattern: /PANVEL/i, cleanName: 'Farmácia Panvel' },
  { pattern: /DROGARIA\s+ARAUJO/i, cleanName: 'Drogaria Araújo' },
  { pattern: /ULTRAFARMA/i, cleanName: 'Ultrafarma' },
  { pattern: /UNIMED/i, cleanName: 'Unimed Saúde' },
  { pattern: /SULAMERICA|SUL\s*AMERICA/i, cleanName: 'SulAmérica Saúde' },
  { pattern: /BRADESCO\s*SAUDE/i, cleanName: 'Bradesco Saúde' },
  { pattern: /AMIL/i, cleanName: 'Amil Saúde' },
  { pattern: /NOTREDAME|HAPVIDA/i, cleanName: 'Hapvida NotreDame' },
  { pattern: /FLEURY/i, cleanName: 'Laboratório Fleury' },
  { pattern: /DASA|LAVOISIER|DELBONI/i, cleanName: 'Laboratório Diagnóstico' },

  // Lazer & Assinaturas
  { pattern: /NICK\s*FUN/i, cleanName: 'Nick Fun Diversões' },
  { pattern: /SPOTIFY/i, cleanName: 'Spotify' },
  { pattern: /NETFLIX/i, cleanName: 'Netflix' },
  { pattern: /AMAZON\s*PRIME|PRIME\s*VIDEO/i, cleanName: 'Amazon Prime' },
  { pattern: /DISNEY\s*(?:PLUS|\+)?/i, cleanName: 'Disney+' },
  { pattern: /HBO\s*MAX|MAX\.COM/i, cleanName: 'HBO Max' },
  { pattern: /CINEMARK/i, cleanName: 'Cinemark' },
  { pattern: /SMART\s*FIT/i, cleanName: 'Smart Fit' },

  // Pet
  { pattern: /PETZ/i, cleanName: 'Petz' },
  { pattern: /COBASI/i, cleanName: 'Cobasi' },
  { pattern: /PETLOVE/i, cleanName: 'Petlove' },
  { pattern: /CLINICA\s+VET|CLÍNICA\s+VET/i, cleanName: 'Clínica Veterinária' },
  { pattern: /HOSPITAL\s+VET/i, cleanName: 'Hospital Veterinário' },

  // Moradia & Contas
  { pattern: /ENEL/i, cleanName: 'Enel Energia' },
  { pattern: /SABESP/i, cleanName: 'Sabesp Água e Esgoto' },
  { pattern: /COMGAS|COMGÁS/i, cleanName: 'Comgás' },
  { pattern: /CPFL/i, cleanName: 'CPFL Energia' },
  { pattern: /LIGHT\s+ENERGIA|LIGHT\s+RJ/i, cleanName: 'Light Energia' },
  { pattern: /CLARO/i, cleanName: 'Claro Telecom' },
  { pattern: /VIVO/i, cleanName: 'Vivo Telefonia & Internet' },
  { pattern: /TIM/i, cleanName: 'TIM Celular' },

  // Financiamentos
  { pattern: /CAIXA\s*(?:HABITAC(?:AO|AL)|ECONOMICA\s+HAB)/i, cleanName: 'Caixa Econômica - Financiamento Habitação' },
  { pattern: /SANTANDER\s*FINANC/i, cleanName: 'Santander Financiamentos' },
  { pattern: /BV\s*FINANCEIRA|BV\s*FINANC/i, cleanName: 'BV Financeira' },
  { pattern: /ITAU\s*FINANC|ITAÚ\s*FINANC/i, cleanName: 'Itaú Financiamentos' },
  { pattern: /BRADESCO\s*FINANC/i, cleanName: 'Bradesco Financiamentos' },
  { pattern: /BANCO\s*PAN/i, cleanName: 'Banco Pan' },
  { pattern: /PORTO\s*SEGURO\s*CONSORCIO/i, cleanName: 'Porto Seguro Consórcio' }
];

// Função para formatar em Title Case (Primeiras letras maiúsculas)
function toTitleCase(str: string): string {
  const minorWords = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'com', 'no', 'na', 'nos', 'nas', 'por', 'para']);
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word, idx) => {
      if (word.length === 0) return '';
      if (idx > 0 && minorWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Expansão de abreviações comerciais brasileiras frequentes
function expandCommonAbbreviations(text: string): string {
  return text
    .replace(/\bRES\b/gi, 'Restaurante')
    .replace(/\bESTACION\b/gi, 'Estacionamento')
    .replace(/\bFARM\b/gi, 'Farmácia')
    .replace(/\bDROG\b/gi, 'Drogaria')
    .replace(/\bSUP\b/gi, 'Supermercado')
    .replace(/\bPANIF\b/gi, 'Panificadora')
    .replace(/\bCHURRAS\b/gi, 'Churrascaria')
    .replace(/\bCOM\b/gi, 'Comércio');
}

// Extrai e higieniza o Nome do Estabelecimento a partir da descrição do extrato
export function extractMerchantName(rawDesc: string): string {
  if (!rawDesc || rawDesc.trim().length === 0) {
    return 'Estabelecimento Não Identificado';
  }

  let clean = rawDesc.trim();

  // Tratamento de Estorno: Estorno de "Viacao Piracicabana"
  const estornoMatch = clean.match(/estorno\s+de\s+["'“](.+?)["'”]/i);
  if (estornoMatch) {
    const innerName = extractMerchantName(estornoMatch[1]);
    return `${innerName} (Estorno)`;
  }

  // 1. Remover marcadores de cartão e dígitos (ex: "• 9344 ", "* 3313 ", "9344 ")
  clean = clean.replace(/^[•\*\-·\s]*\d{3,4}\s+/i, '');

  // 2. Tratar sequências de telefone/documento concatenadas com nome (ex: "55160637ariane" -> "Ariane (Pagamento)")
  const digitConcatMatch = clean.match(/^(\d{6,})([a-zA-Z]{3,})$/);
  if (digitConcatMatch) {
    return `${toTitleCase(digitConcatMatch[2])} (Pagamento)`;
  }

  // 3. Verificar estabelecimentos conhecidos
  for (const item of WELL_KNOWN_MERCHANTS) {
    if (item.pattern.test(clean)) {
      // Se tiver detalhes específicos depois do prefixo (ex: "IFD*PAULO DA SILVA RES")
      const matched = clean.match(new RegExp(`(?:${item.pattern.source})\\s*[*–-]?\\s*(.*)`, 'i'));
      if (matched && matched[1] && matched[1].trim().length > 2) {
        let subName = matched[1].replace(/[*–-]/g, ' ').replace(/\s+/g, ' ').trim();
        subName = expandCommonAbbreviations(subName);
        // Remove cidades ou sufixos
        const cleanedSub = subName.replace(/\s+(?:BR|SAO PAULO|SP|RJ)\s*$/i, '');
        if (cleanedSub.length > 2 && !cleanedSub.toUpperCase().includes(item.cleanName.toUpperCase())) {
          return `${item.cleanName} - ${toTitleCase(cleanedSub)}`;
        }
      }
      return item.cleanName;
    }
  }

  // 4. Aplicar filtros de remoção de prefixos bancários e gateways
  for (const prefix of NOISE_PREFIXES) {
    clean = clean.replace(prefix, '').trim();
  }

  // 5. Aplicar filtros de sufixos de ruído (LTDA, datas, etc.)
  for (const suffix of NOISE_SUFFIXES) {
    clean = clean.replace(suffix, '').trim();
  }

  // 6. Se restou algo como "PAG*NOME" ou "VMT*NICK FUN", divide pelo asterisco
  if (clean.includes('*')) {
    const parts = clean.split('*');
    clean = parts[parts.length - 1].trim();
  }

  // 7. Expande abreviações comuns
  clean = expandCommonAbbreviations(clean);

  // Limpeza final de caracteres residuais
  clean = clean.replace(/^[-–:*\s]+/, '').replace(/[-–:*\s]+$/, '').trim();

  if (clean.length < 2) {
    return toTitleCase(rawDesc.slice(0, 30));
  }

  return toTitleCase(clean);
}
