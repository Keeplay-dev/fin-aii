import type { CategoryId, CategoryInfo } from '../types/finance';

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  comida: {
    id: 'comida',
    name: 'Comida & Alimentação',
    iconName: 'UtensilsCrossed',
    color: '#F59E0B',
    accentBg: 'rgba(245, 158, 11, 0.15)',
    textColor: '#FBBF24',
    description: 'Supermercados, delivery, restaurantes, padarias, lanches e açougues',
    keywords: [
      // Apps e Delivery
      'IFOOD', 'IFD*', 'RAPPI', 'ZE DELIVERY', 'ZE DELIV', 'UBER EATS', 'AIQFOME', 'DELIVERY',
      // Supermercados e Atacados
      'MERCADO', 'SUPERMERCADO', 'SUPERM', 'HIPERMERCADO', 'ATACADAO', 'ATACADÃO', 'ASSAI', 'ASSAÍ',
      'CARREFOUR', 'PAO DE ACUCAR', 'PÃO DE AÇÚCAR', 'EXTRA', 'BIG', 'BOMPRECO', 'BOMPREÇO',
      'SONDA', 'ZAFFARI', 'MAMBO', 'HIROTA', 'ST MARCHE', 'DIA %', 'SUPERMERCADOS DIA', 'SPANI',
      'TENDA ATACADO', 'RODAO', 'RODÃO', 'MAKRO', 'GIGA ATACADO', 'SAVEGNAGO', 'SUPER NOSSO',
      'GUANABARA', 'PREZUNIC', 'MUNDIAL', 'ANGELONI', 'CONDOR', 'SUPER', 'MERCADINHO',
      'JOANIN', 'SUPERMERCADOS JOANIN',
      // Restaurantes, Lanchonetes e Rodoviários
      'RESTAURANTE', 'REST', 'LANCHONETE', 'LANCHES', 'BURGER', 'HAMBURGUER', 'MCDONALD', 'MC DONALD',
      'BURGER KING', 'BK BRASIL', 'SUBWAY', 'OUTBACK', 'MADERIO', 'HABIB', 'RAGAZZO', 'GIRAFFAS',
      'PIZZARIA', 'PIZZA', 'CHURRASCARIA', 'CHURRASCO', 'CHOPP', 'BAR', 'BOTEQUIM', 'PUB', 'ESPETINHO',
      'SUSHI', 'JAPONES', 'JAPONÊS', 'TEMAKERIA', 'BUFFET', 'REFEITORIO', 'REFEITÓRIO',
      'RODOSNACK', 'RODO SNACK', 'RESTAURANTE DA FAZENDA', 'REALFOOD',
      // Padarias, Doces e Cafés
      'PADARIA', 'PANIFICADORA', 'PAO DE QUEIJO', 'CONFEITARIA', 'DOCERIA', 'BOMBONIERE', 'BOLO',
      'SORVETERIA', 'SORVETE', 'GELATO', 'BACCIO', 'CACAU SHOW', 'KOPENHAGEN', 'DENGGO', 'CHOCOLATE',
      'CAFE', 'CAFÉ', 'STARBUCKS', 'CASA DO PAO', 'CASA DO PÃO', 'CHIMARRAO', 'CHIMARRÃO',
      'CASA DO FORNO', 'FORNO',
      // Hortifruti e Açougues
      'HORTIFRUTI', 'SACOLAO', 'SACOLÃO', 'QUITANDA', 'FEIRA', 'NATURAL DA TERRA', 'OBRIGADO NATURAL',
      'ACOUGUE', 'AÇOUGUE', 'CARNES', 'SWIFT', 'BOI BRANCO', 'FRIGORIFICO', 'PEIXARIA',
      // Palavras genéricas alimentares
      'ALIMENTACAO', 'ALIMENTAÇÃO', 'REFEICAO', 'REFEIÇÃO', 'COMIDA', 'RANGO', 'LANCHE', 'PASTEL'
    ]
  },
  gasolina: {
    id: 'gasolina',
    name: 'Gasolina & Combustível',
    iconName: 'Fuel',
    color: '#EF4444',
    accentBg: 'rgba(239, 68, 68, 0.15)',
    textColor: '#F87171',
    description: 'Postos de combustíveis, álcool, diesel, GNV e serviços de pista',
    keywords: [
      // Postos e Redes
      'POSTO', 'AUTO POSTO', 'AUTOPOSTO', 'POSTOS', 'PST', 'PST.', 'POSTO DE GASOLINA',
      'SHELL', 'SHELL BOX', 'IPIRANGA', 'ABASTECE AI', 'ABASTECE AÍ', 'KM DE VANTAGENS',
      'PETROBRAS', 'BR DISTRIBUIDORA', 'POSTO BR', 'PREMMIA', 'V-POWER', 'GRID',
      'ALE', 'POSTO ALE', 'RAIZEN', 'RODOIL', 'DISLUB', 'PETROX', 'REDE GRAAL', 'GRAAL',
      'EMIGRANTES AUTO POSTO', 'EMIGRANTES POSTO', 'POSTO EMIGRANTES',
      'FRANGO ASSADO', 'POSTO BANDEIRANTES', 'POSTO ANHANGUERA', 'POSTO CASTELO',
      // Tipos de combustível e abastecimento
      'GASOLINA', 'ETANOL', 'DIESEL', 'GNV', 'COMBUSTIVEL', 'COMBUSTÍVEL', 'COMBUSTIVEIS', 'COMBUSTÍVEIS',
      'ABASTECIMENTO', 'ABASTECE', 'ABAST', 'TROCA DE OLEO', 'LUBRIFICANTE', 'LUBRAX'
    ]
  },
  transporte: {
    id: 'transporte',
    name: 'Transporte & Mobilidade',
    iconName: 'Car',
    color: '#06B6D4',
    accentBg: 'rgba(6, 182, 212, 0.15)',
    textColor: '#22D3EE',
    description: 'Uber, 99, pedágios, estacionamento, ônibus, metrô e passagens',
    keywords: [
      // Ridesharing e Táxi
      'UBER', 'UBR*', 'UBER *TRIP', 'UBER BR', 'UBER EATS', '99APP', '99 APP', '99 POP', '99 TAXI',
      '99 TECNOLOGIA', '99*', 'TAXI', 'RÁDIO TÁXI', 'CABIFY', 'INDRIVER',
      // Transporte Público
      'METRO', 'METRÔ', 'CPTM', 'SPTRANS', 'BILHETE UNICO', 'BILHETE ÚNICO', 'TOP AUTOPASS',
      'AUTOPASS', 'CARTAO BOM', 'EMTU', 'URBS', 'VEM RECIFE', 'RIOCARD', 'METRO RIO',
      // Tags e Pedágios
      'SEM PARAR', 'SEMPARAR', 'VELOE', 'CONECTCAR', 'TAGGY', 'MOVE MAIS', 'PEDAGIO', 'PEDÁGIO',
      'AUTOBAN', 'CCR', 'ECOVIAS', 'VIAROESTE', 'RODOANEL', 'CARTAO PEDAGIO', 'CONCESSIONARIA',
      // Estacionamentos
      'ESTAPAR', 'INDIGO', 'ESTACIONAMENTO', 'ESTAC', 'GARAGEM', 'PARKING', 'VALET', 'ROTATIVO',
      'ANCAR', 'ANCAR PARKING', 'ESTACION',
      // Viagens, Ônibus e Locadoras
      'LATAM', 'GOL LINHAS', 'AZUL LINHAS', 'BUSER', 'FLIXBUS', 'VIACAO', 'VIAÇÃO', 'COMETA',
      '1001', 'CATARINENSE', 'PASSAGEM', 'RODOVIARIA', 'AEROPORTO', 'LOCALIZA', 'MOVIDA', 'UNIDAS',
      'VIACAO PIRACICABANA', 'VIAÇÃO PIRACICABANA', 'PIRACICABANA',
      // Motos e Oficinas
      'XTREMEMOT', 'XTREME MOTOS', 'MOTO PEÇAS'
    ]
  },
  financiamentos: {
    id: 'financiamentos',
    name: 'Financiamentos & Parcelas',
    iconName: 'HomeModern',
    color: '#8B5CF6',
    accentBg: 'rgba(139, 92, 246, 0.15)',
    textColor: '#A78BFA',
    description: 'Financiamento imobiliário, veicular, consórcios e parcelas de compras',
    keywords: [
      // Financiamento Imobiliário e Habitação
      'FINANCIAMENTO', 'FINANC', 'HABITACAO', 'HABITAÇÃO', 'HABITACIONAL', 'CAIXA HAB',
      'CAIXA ECONOMICA HAB', 'CEF HAB', 'IMOBILIARIO', 'IMOBILIÁRIO', 'CREDITO IMOBILIARIO',
      'PARC HABIT', 'PARCELA HABIT', 'PARC FINANC', 'PARCELA FINANC',
      // Financiamento de Veículos e Financeiras
      'BV FINANCEIRA', 'BV FINANC', 'SANTANDER FINANC', 'ITAU FINANC', 'ITAÚ FINANC',
      'BRADESCO FINANC', 'BANCO PAN', 'AYMORE', 'SAFRA FINANC', 'FINAME', 'CDC', 'LEASING',
      'PARCELA CARRO', 'PARCELA MOTO', 'PARCELA VEICULO', 'PARCELA VEÍCULO',
      // Consórcios e Empréstimos
      'CONSORCIO', 'CONSÓRCIO', 'PORTO CONSORCIO', 'RODOBENS', 'EMPRESTIMO', 'EMPRÉSTIMO', 'EMPR',
      'CREDITO PESSOAL', 'CRÉDITO PESSOAL', 'CONSIGNADO', 'RENEGOCIACAO', 'RENEGOCIAÇÃO', 'REFIN',
      // Padrões de Parcelas Numéricas de Compras (ex: PARCELA 2/4, PARCELA 10/10)
      'PARC', 'PARC.', 'PARCELA', 'DEB PARC', 'DEBITO PARC', 'PLANALTO', 'EBAZAR', 'EBAZARCOMBRLT'
    ]
  },
  saude: {
    id: 'saude',
    name: 'Saúde & Farmácia',
    iconName: 'HeartPulse',
    color: '#10B981',
    accentBg: 'rgba(16, 185, 129, 0.15)',
    textColor: '#34D399',
    description: 'Farmácias, remédios, planos de saúde, médicos, dentistas, academias e laboratórios',
    keywords: [
      // Farmácias e Drogarias
      'DROGA RAIA', 'RAIA', 'DROGASIL', 'DROGARIA SAO PAULO', 'DROG SAO PAULO', 'DSP',
      'DROGARIA PACHECO', 'PACHECO', 'PAGUE MENOS', 'PANVEL', 'DROGARIA ARAUJO', 'ARAUJO',
      'ULTRAFARMA', 'FARMACIA', 'FARMÁCIA', 'FARMA', 'DROGARIA', 'DROG', 'REMEDIO', 'REMÉDIO',
      'MEDICAMENTOS', 'MANIPULACAO', 'MANIPULAÇÃO', 'FARMACIA POPULAR',
      // Odontologia e Dentistas
      'ODONTOLOGIA', 'ODONTO', 'ODONTOPREV', 'SANDRESCHI', 'ODONTOLOGIA SANDRESCHI', 'DENTISTA',
      'SORRIDENTES', 'ORTHOPRIDE',
      // Bem-estar e Atividade Física
      'TOTALPASS', 'TOTAL PASS', 'GYMPASS',
      // Planos de Saúde e Hospitais
      'UNIMED', 'SULAMERICA', 'SUL AMÉRICA', 'BRADESCO SAUDE', 'BRADESCO SAÚDE', 'AMIL',
      'NOTREDAME', 'INTERMEDICA', 'HAPVIDA', 'PORTO SAUDE', 'PREVENT SENIOR', 'HOSPITAL',
      'HOSP', 'PRONTO SOCORRO', 'SANTA CASA', 'ALBERT EINSTEIN', 'SIRIO LIBANES',
      // Clínicas e Profissionais
      'CLINICA', 'CLÍNICA', 'CONSULTA', 'CONSULTORIO', 'CONSULTÓRIO', 'MEDICO', 'MÉDICO',
      'PSICOLOGO', 'PSICÓLOGO', 'FISIOTERAPIA', 'OTICA', 'ÓTICA', 'OFTALMO', 'VACINA', 'EXAME',
      // Laboratórios
      'LABORATORIO', 'LABORATÓRIO', 'LAB', 'FLEURY', 'DASA', 'LAVOISIER', 'HERMES PARDINI',
      'DELBONI', 'A+ MEDICINA', 'SALOMAO ZOPPI'
    ]
  },
  pet: {
    id: 'pet',
    name: 'Animal de Estimação (Pet)',
    iconName: 'Dog',
    color: '#EC4899',
    accentBg: 'rgba(236, 72, 153, 0.15)',
    textColor: '#F472B6',
    description: 'Pet shops, ração, clínicas veterinárias, banho & tosa e remédios animais',
    keywords: [
      // Redes de Pet Shop
      'PETZ', 'COBASI', 'PETLOVE', 'PET SHOP', 'PETSHOP', 'PET CARE', 'MEU AMIGO PET',
      'AGROPET', 'AGROPECUARIA', 'AGROPECUÁRIA', 'CÃO E GATO', 'ANIMALIA',
      // Veterinários e Cuidados
      'VETERINARIO', 'VETERINÁRIO', 'VETERINARIA', 'VETERINÁRIA', 'VET', 'CLINICA VET', 'CLÍNICA VET',
      'HOSPITAL VET', 'BANHO E TOSA', 'BANHO & TOSA', 'TOSA', 'RACAO', 'RAÇÃO', 'PREMIER PET',
      'ROYAL CANIN', 'GOLDEN PET', 'MEDICAMENTO VET', 'PATAS', 'PATINHAS', 'CANIL', 'GATO', 'CACHORRO'
    ]
  },
  moradia: {
    id: 'moradia',
    name: 'Moradia & Contas Fixas',
    iconName: 'Home',
    color: '#3B82F6',
    accentBg: 'rgba(59, 130, 246, 0.15)',
    textColor: '#60A5FA',
    description: 'Aluguel, condomínio, luz, água, gás, internet e IPTU',
    keywords: [
      // Contas de Consumo
      'ENEL', 'SABESP', 'COMGAS', 'COMGÁS', 'CPFL', 'LIGHT', 'COPEL', 'CEMIG', 'ENERGIA',
      'ELEKTRO', 'AGUA', 'ÁGUA', 'SANEPAR', 'COPASA', 'EMBASA', 'CONTA DE LUZ', 'CONTA DE AGUA',
      'GAS', 'GÁS', 'ULTRAGAZ', 'SUPERGASBRAS', 'LIQUIGAS', 'NACIONAL GAS',
      // Moradia e Condomínio
      'CONDOMINIO', 'CONDOMÍNIO', 'CONDOM', 'ALUGUEL', 'QUINTOANDAR', 'QUINTO ANDAR',
      'IMOBILIARIA', 'IMOBILIÁRIA', 'IPTU', 'PREFEITURA IPTU',
      // Telecomunicações
      'INTERNET', 'CLARO', 'VIVO', 'TIM', 'OI FIBRA', 'NET SERVICOS', 'ALGAR'
    ]
  },
  lazer: {
    id: 'lazer',
    name: 'Lazer & Assinaturas',
    iconName: 'Tv',
    color: '#F43F5E',
    accentBg: 'rgba(244, 63, 94, 0.15)',
    textColor: '#FB7185',
    description: 'Streaming, entretenimento, jogos, cinema, parques e lazer',
    keywords: [
      // Streaming e Mídia
      'NETFLIX', 'SPOTIFY', 'AMAZON PRIME', 'PRIME VIDEO', 'HBO MAX', 'MAX.COM', 'DISNEY',
      'STAR PLUS', 'GLOBOPLAY', 'YOUTUBE PREMIUM', 'APPLE.COM/BILL', 'DEEZER', 'PARAMOUNT',
      'DM*SPOTIFY',
      // Diversão, Parques e Games
      'NICK FUN', 'NICK FUN DIVERSOES', 'DIVERSOES', 'DIVERSÕES', 'FLIPERAMA', 'GAME',
      // Cinema e Eventos
      'CINEMA', 'CINEMARK', 'UCI', 'KINOPLEX', 'INGRESSO.COM', 'INGRESSO', 'SYMPLA', 'EVENTIM',
      'TEATRO', 'SHOW', 'FESTIVAL',
      // Jogos
      'STEAM', 'PLAYSTATION', 'PSN', 'XBOX', 'NINTENDO', 'EPIC GAMES', 'RIOT GAMES', 'BLIZZARD',
      // Academia
      'SMARTFIT', 'SMART FIT', 'BLUEFIT', 'BIO RITMO', 'ACADEMIA',
      // Viagens e Livros
      'HOTEL', 'AIRBNB', 'BOOKING', 'DECOLAR', 'CVC', 'LIVRARIA', 'SARAIVA', 'LEITURA'
    ]
  },
  outros: {
    id: 'outros',
    name: 'Outros / Diversos',
    iconName: 'Tag',
    color: '#94A3B8',
    accentBg: 'rgba(148, 163, 184, 0.15)',
    textColor: '#CBD5E1',
    description: 'Lançamentos sem categoria específica detectada',
    keywords: [
      'IOF', 'TARIFA', 'TAXA', 'SAQUE', 'ENCARGOS', 'ANUIDADE'
    ]
  }
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
