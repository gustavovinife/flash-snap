const ptBR = {
  // Layout component
  layout: {
    appName: 'Flash Snap',
    appDescription: 'Uma ferramenta leve de memorização passiva',
    settings: 'Configurações',
    copyright: '© 2025 FlashSnap por -'
  },

  // Authentication pages
  auth: {
    loginTitle: 'Entre na sua conta',
    registerTitle: 'Crie sua conta',
    email: 'Endereço de email',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    fullName: 'Nome Completo',
    signIn: 'Entrar',
    signingIn: 'Entrando...',
    createAccount: 'Criar conta',
    creatingAccount: 'Criando conta...',
    alreadyHaveAccount: 'Já tem uma conta? Entre',
    dontHaveAccount: 'Não tem uma conta? Registre-se',
    orContinueWith: 'Ou continue com',
    google: 'Google',
    emailRequired: 'Email e senha são obrigatórios',
    allFieldsRequired: 'Todos os campos são obrigatórios',
    passwordsDoNotMatch: 'As senhas não coincidem',
    passwordMinLength: 'A senha deve ter pelo menos 6 caracteres',
    registrationSuccess:
      'Registro bem-sucedido! Por favor, verifique seu email para confirmar sua conta.',
    emailAlreadyRegistered: 'Este email já está registrado. Tente entrar em vez disso.',
    unexpectedError: 'Ocorreu um erro inesperado',
    language: 'Idioma',
    selectLanguage: 'Selecione seu idioma preferido'
  },

  // Common terms
  common: {
    back: 'Voltar',
    backTo: 'Voltar para {{destination}}',
    deck: 'Baralho',
    decks: 'Baralhos',
    add: 'Adicionar',
    cards: 'cartões',
    card: 'cartão',
    cancel: 'Cancelar',
    create: 'Criar',
    loading: 'Carregando...',
    notFound: '{{item}} não encontrado',
    days: 'dias',
    review: 'Revisar',
    lastReviewed: 'Última revisão: {{date}}',
    neverReviewed: 'Nunca revisado',
    deleteConfirm: 'Tem certeza que deseja excluir este {{item}}?',
    optional: 'Opcional',
    addTemplate: 'Adicionar Template',
    language: 'Idioma',
    knowledge: 'Conhecimento'
  },

  // Templates page
  templates: {
    title: 'Biblioteca de Templates',
    availableTemplates: 'templates disponíveis',
    searchTemplates: 'Buscar templates...',
    previewCards: 'Pré-visualização dos Cartões',
    andMore: 'e mais {{count}} cartões',
    install: 'Instalar Template'
  },

  // DeckList component
  deckList: {
    title: 'Seus Baralhos',
    startReview: 'Iniciar Revisão',
    cardsDue: '({{count}} cartões pendentes)',
    deckCount: '{{count}} {{deck}}',
    noDeck: 'Nenhum baralho ainda',
    createFirstDeck: 'Crie seu primeiro baralho',
    addDeck: 'Adicionar Baralho',
    deckName: 'Nome do baralho',
    deleteDeck: 'Excluir baralho',
    deckType: 'Tipo de Baralho',
    language: 'Idioma',
    knowledge: 'Conhecimento',
    commandToInsertText: 'Selecione um texto e pressione {{key}} para inserir no baralho'
  },

  // DeckView component
  deckView: {
    backToDecks: 'Voltar para Baralhos',
    cardCount: '{{count}} {{card}}',
    searchCards: 'Buscar cartões...',
    addCard: 'Adicionar Cartão',
    reports: 'Relatórios',
    front: 'Frente',
    back: 'Verso',
    translation: 'Tradução (Português)',
    enterWord: 'Digite a palavra ou frase',
    enterDefinition: 'Digite a definição ou significado',
    enterTranslation: 'Digite a tradução em português',
    noCardsMatch: 'Nenhum cartão corresponde à sua busca',
    noCardsYet: 'Nenhum cartão neste baralho ainda',
    addFirstCard: 'Adicione seu primeiro cartão',
    deleteCard: 'Excluir cartão',
    playPronunciation: 'Reproduzir pronúncia',
    definition: 'Definição',
    portugueseTranslation: 'Tradução em Português',
    pronunciation: 'Pronúncia',
    context: 'Contexto',
    enterContext: 'Digite o contexto do cartão (opcional)'
  },

  // AddCard component
  addCard: {
    title: 'Adicionar aos Flashcards',
    selectDeck: 'Selecionar Baralho',
    noDecksAvailable: 'Nenhum baralho disponível',
    front: 'Frente',
    back: 'Verso',
    translation: 'Tradução (Opcional)',
    termPlaceholder: 'Termo ou pergunta',
    definitionPlaceholder: 'Definição ou resposta',
    translationPlaceholder: 'Tradução em português',
    addCard: 'Adicionar Cartão',
    contextPlaceholder: 'Digite o contexto do cartão (opcional)',
    context: 'Contexto'
  },

  // Review page
  review: {
    reviewMode: 'Modo de Revisão',
    reviewComplete: 'Revisão Concluída!',
    noCardsDue: 'Não há cartões pendentes para revisão!',
    cardStatistics: 'Estatísticas do Cartão',
    repetitions: 'Repetições',
    interval: 'Intervalo',
    easeFactor: 'Fator de Facilidade',
    nextReview: 'Próxima Revisão',
    notScheduled: 'Não agendado',
    cardsReviewed: 'Você revisou {{count}} cartões.',
    checkMoreCards: 'Verificar Mais Cartões',
    returnToDeck: 'Voltar para o Baralho',
    cardCount: '{{current}} de {{total}}',
    deckName: 'Baralho: {{name}}',
    front: 'Frente',
    back: 'Verso',
    showStats: 'Mostrar Estatísticas',
    hideStats: 'Ocultar Estatísticas',
    howWellRemembered: 'Quão bem você lembrou deste cartão?',
    grade1: '1 - Falhou',
    grade2: '2 - Difícil',
    grade3: '3 - Bom',
    grade4: '4 - Fácil',
    grade5: '5 - Perfeito',
    showAnswer: 'Mostrar Resposta',
    context: 'Contexto'
  },

  // Reports page
  reports: {
    title: '{{deckName}} - Relatórios',
    stats: {
      averageEaseFactor: 'Fator de Facilidade Médio',
      retentionRate: 'Taxa de Retenção',
      avgReviewInterval: 'Intervalo Médio de Revisão',
      cardStatusOverview: 'Visão Geral dos Cartões',
      newCards: 'Cartões Novos',
      learningCards: 'Cartões em Aprendizado',
      reviewCards: 'Cartões em Revisão',
      masteredCards: 'Cartões Dominados',
      dueCards: 'Cartões Pendentes',
      cardsDueNext7Days: 'cartões pendentes nos próximos 7 dias',
      startReview: 'Começar Revisão',
      easeFactorDistribution: 'Distribuição do Fator de Facilidade',
      cardDifficulty: 'Dificuldade dos Cartões',
      easyCards: 'Cartões Fáceis',
      mediumCards: 'Cartões Médios',
      hardCards: 'Cartões Difíceis',
      ofTotal: 'do total',
      deckProgress: 'Progresso do Baralho',
      masteredCardsMessage: 'Você dominou {{mastered}} de {{total}} cartões neste baralho.',
      masteredExplanation:
        'Cartões são considerados dominados quando seu fator de facilidade está acima de 2.5'
    }
  },

  // Settings page
  settings: {
    title: 'Configurações',
    saveSuccess: 'Configurações salvas com sucesso!',
    saveButton: 'Salvar Configurações',
    language: {
      label: 'Idioma da Aplicação',
      description: 'Selecione o idioma preferido para a interface da aplicação.'
    },
    reviewTime: {
      label: 'Horário Diário de Revisão',
      description: 'Defina um horário diário para lembretes de revisão. O padrão é 9:00.'
    }
  }
}

export default ptBR
