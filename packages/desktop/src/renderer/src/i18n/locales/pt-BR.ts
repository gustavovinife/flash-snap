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
    selectLanguage: 'Selecione seu idioma preferido',
    verifyEmailTitle: 'Verifique seu email',
    verifyEmailMessage:
      'Enviamos um link de confirmação para seu email. Por favor, clique no link para verificar sua conta.',
    verifyEmailTip:
      'Não recebeu o email? Verifique sua pasta de spam ou tente se registrar novamente com outro email.',
    backToLogin: 'Voltar para Login'
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
    save: 'Salvar',
    addTemplate: 'Instalar Templates',
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
    install: 'Instalar Template',
    installed: 'Instalado',
    alreadyInstalled: 'Este template já está instalado nos seus baralhos.',
    installError: 'Falha ao instalar template. Por favor, tente novamente.'
  },

  // DeckList component
  deckList: {
    title: 'Seus Baralhos',
    startReview: 'Iniciar Revisão',
    cardsDue: '({{count}} cartões pendentes)',
    deckCount: '{{count}} {{deck}}',
    noDeck: 'Nenhum baralho ainda',
    createFirstDeck: 'Crie seu primeiro baralho',
    addDeck: 'Novo Baralho',
    becomePremium: 'Seja Premium',
    deckName: 'Nome do baralho',
    deleteDeck: 'Excluir baralho',
    deckType: 'Tipo de Baralho',
    language: 'Idioma',
    knowledge: 'Conhecimento',
    commandToInsertText: 'Selecione um texto e pressione {{key}} para inserir no baralho',
    deckLimitReached:
      'Usuários Free podem criar apenas 1 baralho. Faça upgrade para Premium para baralhos ilimitados.',
    upgradeToPremium: 'Upgrade para Premium'
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
    enterContext: 'Digite o contexto do cartão (opcional)',
    editDeck: 'Editar',
    deckName: 'Nome do baralho',
    deckType: 'Tipo de baralho'
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
    testNotification: 'Testar',
    language: {
      label: 'Idioma da Aplicação',
      description: 'Selecione o idioma preferido para a interface da aplicação.'
    },
    reviewTime: {
      label: 'Horário Diário de Revisão',
      description: 'Defina um horário diário para lembretes de revisão. O padrão é 9:00.'
    }
  },

  // Subscription
  subscription: {
    title: 'Assinatura',
    currentPlan: 'Plano Atual',
    upgrade: 'Upgrade',
    manageSubscription: 'Gerenciar Assinatura',
    renewsOn: 'Renova em {{date}}',
    cancelNotice:
      'Sua assinatura terminará em {{date}}. Você pode reativar a qualquer momento antes disso.',
    pastDueNotice:
      'Seu pagamento está atrasado. Por favor, atualize seu método de pagamento para continuar sua assinatura.',
    checkoutError: 'Falha ao abrir o checkout. Por favor, tente novamente.',
    portalError: 'Falha ao abrir o portal de assinatura. Por favor, tente novamente.'
  },

  // AI Generation
  aiGeneration: {
    // Page title and description
    title: 'Criar com IA',
    description:
      'Gere flashcards instantaneamente usando IA. Selecione um preset ou digite seu próprio tópico.',

    // Entry point card
    createWithAI: 'Criar com IA',
    createWithAIDescription: 'Gere flashcards instantaneamente usando IA',

    // Preset prompts
    presets: {
      title: 'Início Rápido',
      jsProgram: 'Aprender Programação JavaScript',
      englishTravel: 'Aprender Inglês para Viagens',
      englishInterviews: 'Aprender Inglês para Entrevistas',
      spanishBasics: 'Aprender Espanhol Básico',
      pythonProgram: 'Aprender Programação Python'
    },

    // Input and generation
    promptPlaceholder: 'Digite um tópico para seus flashcards...',
    modifyPromptPlaceholder: 'Digite alterações ou um novo tópico para regenerar...',
    generateButton: 'Gerar Cartões',
    generating: 'Gerando...',
    minCharacters: 'Digite pelo menos 3 caracteres',

    // Preview section
    preview: {
      title: 'Pré-visualização',
      cardCount: '{{count}} cartões gerados',
      emptyState: 'Os cartões gerados aparecerão aqui',
      emptyStateHint: 'Selecione um preset ou digite um tópico acima para gerar flashcards'
    },

    // Deck saving
    deckName: 'Nome do Baralho',
    deckNamePlaceholder: 'Digite o nome do baralho',
    saveDeck: 'Salvar Baralho',
    saving: 'Salvando...',
    saveSuccess: 'Baralho salvo com sucesso!',

    // Errors
    errors: {
      apiKeyMissing:
        'A chave da API OpenAI não está configurada. Por favor, adicione VITE_OPENAI_API_KEY ao seu ambiente.',
      generationFailed: 'Falha ao gerar cartões. Por favor, tente novamente.',
      saveFailed: 'Falha ao salvar baralho. Por favor, tente novamente.',
      invalidPrompt: 'Por favor, digite um tópico válido',
      emptyPrompt: 'Por favor, digite um tópico para seus flashcards',
      rateLimited: 'Muitas requisições. Por favor, aguarde um momento e tente novamente.',
      networkError: 'Erro de conexão. Por favor, verifique sua conexão com a internet.',
      parseError: 'Falha ao processar resposta da IA. Por favor, tente novamente.'
    },

    // Actions
    retry: 'Tentar Novamente',
    cancel: 'Cancelar',

    // Premium required
    premiumRequired: {
      title: 'Recurso Premium',
      description:
        'A geração de flashcards com IA é um recurso premium. Faça upgrade para criar baralhos ilimitados com assistência de IA.',
      upgradeButton: 'Fazer Upgrade para Premium'
    },

    // Deck limit reached
    deckLimitReached: {
      title: 'Limite de Baralhos Atingido',
      description:
        'Usuários gratuitos podem criar apenas 1 baralho. Faça upgrade para Premium para baralhos ilimitados e flashcards gerados por IA.',
      upgradeButton: 'Fazer Upgrade para Premium'
    }
  }
}

export default ptBR
