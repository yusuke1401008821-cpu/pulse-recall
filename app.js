const STORAGE_KEY = "pulse-recall-state-v1";

const dayMs = 24 * 60 * 60 * 1000;
const hourMs = 60 * 60 * 1000;
const minuteMs = 60 * 1000;
const learningStepsMinutes = [10, 180];
const relearningStepsMinutes = [10, 360];
const PDFJS_MODULE_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4/legacy/build/pdf.mjs";
const PDFJS_WORKER_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4/legacy/build/pdf.worker.mjs";
const SUPABASE_MODULE_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const CLOUD_CONFIG_ENDPOINT = "/api/client-config";
const LOCAL_SHARE_PARAM = "deckshare";
const CLOUD_SHARE_PARAM = "share";
const DEMO_RESET_CONFIRM_TEXT = "サンプルを読み込む";
const QUESTION_MAP_STOPWORDS = new Set([
  "こと",
  "もの",
  "ため",
  "よう",
  "それぞれ",
  "次の",
  "以下",
  "最も",
  "正しい",
  "誤り",
  "選べ",
  "選ぶ",
  "どれ",
  "ついて",
  "について",
  "含む",
  "含ま",
  "ない",
  "ある",
  "及び",
  "また",
  "where",
  "which",
  "what",
  "when",
  "with",
  "from",
  "that",
  "this",
  "these",
  "those",
  "into",
  "only",
  "most",
  "least",
  "except",
]);
const TRACKS = [
  {
    id: "medical",
    eyebrow: "医学トラック",
    title: "医学部コア学習",
    description: "解剖・生理・病態・臨床推論をテーマ別に回して、知識をつなげて定着させます。",
    recommendation: "解剖、生理、病態、症候のように階層を分けると医学系の復習効率が安定します。",
  },
  {
    id: "english",
    eyebrow: "英語トラック",
    title: "英語学習トラック",
    description: "医学英語の語彙、英語長文、構文理解を分けて回し、英語の処理速度を上げます。",
    recommendation: "語彙と長文を別デッキにすると、英語学習の弱点が見えやすくなります。",
  },
];
const STARTER_PACKS = {
  medical: [
    {
      name: "解剖・生理ベーシック",
      subject: "解剖 / 生理",
      description: "構造と機能を対で覚える、医学部基礎向けのスターターデッキ。",
      cards: [
        {
          front: "僧帽弁はどの部屋の間にある？",
          back: "左心房と左心室の間にある。",
          hint: "房室弁の左右差で整理する。",
          topic: "循環",
          tags: ["解剖", "循環", "必修"],
          note: "右は三尖弁、左は僧帽弁。弁膜症の病態整理にも直結する。",
          example: "僧帽弁狭窄では左房圧が上がり、肺うっ血につながる。",
          dueOffset: -40 * minuteMs,
          intervalDays: 0,
        },
        {
          front: "細胞外液量を規定する主要イオンは？",
          back: "ナトリウムイオン（Na+）。",
          hint: "体液区分と主要イオンをセットで覚える。",
          topic: "体液",
          tags: ["生理", "腎", "電解質"],
          note: "Na+は細胞外液、K+は細胞内液の代表。脱水・浮腫の整理で重要。",
          example: "低Na血症では水分バランス異常の評価が必要になる。",
          dueOffset: -90 * minuteMs,
          intervalDays: 1,
        },
        {
          front: "NSAIDsで糸球体濾過量が低下しやすい理由は？",
          back: "プロスタグランジン産生が抑制され、輸入細動脈が収縮しやすくなるから。",
          hint: "輸入細動脈と輸出細動脈の作用差を確認。",
          topic: "腎機能",
          tags: ["薬理", "腎", "臨床"],
          note: "脱水や高齢者ではAKIリスクが上がるため、NSAIDsの扱いに注意する。",
          example: "ACE阻害薬・利尿薬・NSAIDsの併用は腎前性AKIの典型的リスク。",
          dueOffset: -20 * minuteMs,
          intervalDays: 0,
        },
      ],
    },
    {
      name: "病態・臨床推論",
      subject: "病態 / 内科",
      description: "症状から病態をつなぐ、臨床寄りの復習デッキ。",
      cards: [
        {
          front: "ネフローゼ症候群の4徴は？",
          back: "高度蛋白尿、低アルブミン血症、浮腫、高脂血症。",
          hint: "低Albから浮腫につながる流れを押さえる。",
          topic: "腎疾患",
          tags: ["病理", "腎", "内科"],
          note: "糸球体障害で蛋白漏出が起こり、膠質浸透圧低下から浮腫が出る。",
          example: "膜性腎症や微小変化型ネフローゼで典型的にみられる。",
          dueOffset: -70 * minuteMs,
          intervalDays: 2,
        },
        {
          front: "呼吸性アシドーシスで一次的に上昇するのは？",
          back: "PaCO2。",
          hint: "代謝性か呼吸性かを最初に分ける。",
          topic: "酸塩基平衡",
          tags: ["生理", "呼吸", "救急"],
          note: "慢性化すると腎代償でHCO3-も上がるが、最初に見るのはCO2。",
          example: "COPD増悪ではPaCO2上昇とアシドーシスが問題になる。",
          dueOffset: -15 * minuteMs,
          intervalDays: 0,
        },
        {
          front: "胸痛・冷汗・ST上昇で最優先に疑う病態は？",
          back: "急性冠症候群、特にST上昇型心筋梗塞（STEMI）。",
          hint: "症候から緊急度を判断する。",
          topic: "循環救急",
          tags: ["循環", "救急", "症候"],
          note: "発症時刻、誘導部位、再灌流適応を一緒に確認すると臨床像が残りやすい。",
          example: "冷汗を伴う強い胸痛なら、まずACSを想起して12誘導心電図を急ぐ。",
          dueOffset: -5 * minuteMs,
          intervalDays: 0,
        },
      ],
    },
  ],
  english: [
    {
      name: "Medical English Core",
      subject: "医学英語 / 語彙",
      description: "医療現場や論文で頻出の表現を回す語彙デッキ。",
      cards: [
        {
          front: "administer",
          back: "投与する、実施する。",
          hint: "薬剤や酸素、検査の文脈で頻出。",
          topic: "医学英語",
          tags: ["vocabulary", "medical english", "verb"],
          note: "administer a drug, administer oxygen, administer a test の形が多い。",
          example: "The nurse administered the medication intravenously.",
          dueOffset: -55 * minuteMs,
          intervalDays: 1,
        },
        {
          front: "adverse event",
          back: "有害事象。",
          hint: "副作用より広く、介入後に起こる好ましくない出来事を指す。",
          topic: "医学英語",
          tags: ["vocabulary", "clinical trial", "noun"],
          note: "side effect よりも臨床試験では adverse event の方が広い概念。",
          example: "No serious adverse events were reported during the study.",
          dueOffset: -18 * minuteMs,
          intervalDays: 0,
        },
        {
          front: "underlying condition",
          back: "基礎疾患、背景にある病態。",
          hint: "患者背景を説明するときの定番表現。",
          topic: "医学英語",
          tags: ["vocabulary", "history taking", "noun"],
          note: "underlying disease と近いが、condition の方が広く使いやすい。",
          example: "Patients with underlying conditions were excluded from the trial.",
          dueOffset: -12 * minuteMs,
          intervalDays: 0,
        },
      ],
    },
    {
      name: "English Reading Patterns",
      subject: "読解 / 構文",
      description: "英語長文や論文読解に必要な構文を確認するデッキ。",
      cards: [
        {
          front: "be associated with",
          back: "A is associated with B = AはBと関連している。",
          hint: "因果関係ではなく関連性を示すことが多い。",
          topic: "読解",
          tags: ["reading", "論文", "phrase"],
          note: "論文では cause より控えめな言い方として頻出する。",
          example: "Obesity is associated with an increased risk of hypertension.",
          dueOffset: -28 * minuteMs,
          intervalDays: 2,
        },
        {
          front: "Although A, B",
          back: "Aではあるが、B。",
          hint: "逆接の主張は後半に来る。",
          topic: "構文",
          tags: ["reading", "grammar", "contrast"],
          note: "読解では although 節のあとよりも、主節の内容を優先して把握する。",
          example: "Although the sample size was small, the trend was consistent.",
          dueOffset: -8 * minuteMs,
          intervalDays: 0,
        },
        {
          front: "Patients who were treated early had lower mortality.",
          back: "早期に治療された患者では死亡率が低かった。",
          hint: "who were treated early が patients を修飾している。",
          topic: "読解",
          tags: ["reading", "relative clause", "medical english"],
          note: "主語の患者像をまず把握し、その後に述語の評価指標を読むと速い。",
          example: "Patients who received early antibiotics had shorter hospital stays.",
          dueOffset: -3 * minuteMs,
          intervalDays: 0,
        },
      ],
    },
  ],
};

const demoState = createDemoState();
let state = loadState();
let activeSection = "dashboard";
let currentCardId = null;
let isAnswerVisible = false;
let studyMode = "review";
let studySourceKey = "due";
let studySessionSize = 8;
let studySession = null;
let homeHistoryExpanded = false;
let importContextDeckId = "";
let questionMapContextDeckId = "";
let deckActionDeckId = "";
let editingDeckId = null;
let editingCardId = null;
let toastTimer = null;
let importDraft = null;
let pdfjsModulePromise = null;
let isAssistantLoading = false;
let assistantErrorMessage = "";
let createMode = "deck";
let selectedDeckDetailId = "";
let deckDetailTab = "overview";
let shareLinkCache = "";
let importSelection = new Set();
let questionMapDraft = null;
let isQuestionMapLoading = false;
let questionMapErrorMessage = "";
let cloudState = {
  status: "idle",
  config: null,
  client: null,
  module: null,
  session: null,
  profile: null,
  shareToken: "",
  joinMode: "",
  localSharePayload: null,
  lastLocalShareDeckId: "",
  pendingRequests: [],
  membersByDeck: {},
  lastSharePreview: null,
};

const tabs = [...document.querySelectorAll(".tab")];
const sections = [...document.querySelectorAll(".content")];
const createModeButtons = [...document.querySelectorAll("[data-create-mode]")];
const studyModeButtons = [...document.querySelectorAll("[data-study-mode]")];
const templateButtons = [...document.querySelectorAll("[data-template]")];
const deckDetailTabButtons = [...document.querySelectorAll("[data-deck-detail-tab]")];
const dashboardSection = document.getElementById("dashboard");
const dueCount = document.getElementById("dueCount");
const heroTitle = document.getElementById("heroTitle");
const heroText = document.getElementById("heroText");
const quickSummary = document.getElementById("quickSummary");
const homeCreateDeckButton = document.getElementById("homeCreateDeckButton");
const medicalDeckList = document.getElementById("medicalDeckList");
const medicalDeckCount = document.getElementById("medicalDeckCount");
const englishDeckList = document.getElementById("englishDeckList");
const englishDeckCount = document.getElementById("englishDeckCount");
const generalDeckSection = document.getElementById("generalDeckSection");
const generalDeckList = document.getElementById("generalDeckList");
const generalDeckCount = document.getElementById("generalDeckCount");
const ownedSharedDeckList = document.getElementById("ownedSharedDeckList");
const ownedSharedDeckCount = document.getElementById("ownedSharedDeckCount");
const joinedSharedDeckList = document.getElementById("joinedSharedDeckList");
const joinedSharedDeckCount = document.getElementById("joinedSharedDeckCount");
const pendingShareLabel = document.getElementById("pendingShareLabel");
const pendingShareList = document.getElementById("pendingShareList");
const historyChart = document.getElementById("historyChart");
const historySummary = document.getElementById("historySummary");
const historyBreakdown = document.getElementById("historyBreakdown");
const historyCompactList = document.getElementById("historyCompactList");
const historyDetailsPanel = document.getElementById("historyDetailsPanel");
const toggleHistoryDetailsButton = document.getElementById("toggleHistoryDetailsButton");
const studyDeckFilter = document.getElementById("studyDeckFilter");
const studyModeSummary = document.getElementById("studyModeSummary");
const studySessionSizeInput = document.getElementById("studySessionSizeInput");
const startStudySessionButton = document.getElementById("startStudySessionButton");
const studySmartListGrid = document.getElementById("studySmartListGrid");
const assistantDeckFilter = document.getElementById("assistantDeckFilter");
const libraryDeckFilter = document.getElementById("libraryDeckFilter");
const libraryTagFilter = document.getElementById("libraryTagFilter");
const librarySubjectFilter = document.getElementById("librarySubjectFilter");
const libraryStorageFilter = document.getElementById("libraryStorageFilter");
const libraryStudyStateFilter = document.getElementById("libraryStudyStateFilter");
const libraryTextFilter = document.getElementById("libraryTextFilter");
const cardDeckId = document.getElementById("cardDeckId");
const searchCardifyTarget = document.getElementById("searchCardifyTarget");
const emptyState = document.getElementById("emptyState");
const flashcard = document.getElementById("flashcard");
const shortQuizCard = document.getElementById("shortQuizCard");
const choiceQuizCard = document.getElementById("choiceQuizCard");
const cardFront = document.getElementById("cardFront");
const cardBack = document.getElementById("cardBack");
const cardHint = document.getElementById("cardHint");
const cardDeckName = document.getElementById("cardDeckName");
const cardTopic = document.getElementById("cardTopic");
const cardTags = document.getElementById("cardTags");
const cardNote = document.getElementById("cardNote");
const cardExample = document.getElementById("cardExample");
const answerArea = document.getElementById("answerArea");
const toggleAnswerButton = document.getElementById("toggleAnswerButton");
const studyProgress = document.getElementById("studyProgress");
const emptyStateEyebrow = document.getElementById("emptyStateEyebrow");
const emptyStateTitle = document.getElementById("emptyStateTitle");
const emptyStateText = document.getElementById("emptyStateText");
const shortQuizFront = document.getElementById("shortQuizFront");
const shortQuizMeta = document.getElementById("shortQuizMeta");
const shortQuizTopic = document.getElementById("shortQuizTopic");
const shortQuizTags = document.getElementById("shortQuizTags");
const shortQuizAnswerInput = document.getElementById("shortQuizAnswerInput");
const shortQuizAnswerArea = document.getElementById("shortQuizAnswerArea");
const shortQuizBack = document.getElementById("shortQuizBack");
const shortQuizHint = document.getElementById("shortQuizHint");
const shortQuizNote = document.getElementById("shortQuizNote");
const shortQuizExample = document.getElementById("shortQuizExample");
const shortQuizRevealButton = document.getElementById("shortQuizRevealButton");
const shortQuizNextButton = document.getElementById("shortQuizNextButton");
const shortQuizFeedbackPanel = document.getElementById("shortQuizFeedbackPanel");
const shortQuizProgress = document.getElementById("shortQuizProgress");
const choiceQuizFront = document.getElementById("choiceQuizFront");
const choiceQuizMeta = document.getElementById("choiceQuizMeta");
const choiceQuizTopic = document.getElementById("choiceQuizTopic");
const choiceQuizTags = document.getElementById("choiceQuizTags");
const choiceQuizOptions = document.getElementById("choiceQuizOptions");
const choiceQuizAnswerArea = document.getElementById("choiceQuizAnswerArea");
const choiceQuizBack = document.getElementById("choiceQuizBack");
const choiceQuizHint = document.getElementById("choiceQuizHint");
const choiceQuizNote = document.getElementById("choiceQuizNote");
const choiceQuizExample = document.getElementById("choiceQuizExample");
const choiceQuizNextButton = document.getElementById("choiceQuizNextButton");
const choiceQuizFeedbackPanel = document.getElementById("choiceQuizFeedbackPanel");
const choiceQuizStatus = document.getElementById("choiceQuizStatus");
const choiceQuizScore = document.getElementById("choiceQuizScore");
const reviewFeedbackPanel = document.getElementById("reviewFeedbackPanel");
const ratingButtons = Object.fromEntries(
  [...document.querySelectorAll("[data-rating]")].map((button) => [button.dataset.rating, button]),
);
const libraryList = document.getElementById("libraryList");
const toast = document.getElementById("toast");
const startReviewButton = document.getElementById("startReviewButton");
const seedDemoButton = document.getElementById("seedDemoButton");
const demoResetStatus = document.getElementById("demoResetStatus");
const demoResetConfirmInput = document.getElementById("demoResetConfirmInput");
const deckForm = document.getElementById("deckForm");
const cardForm = document.getElementById("cardForm");
const deckFormTitle = document.getElementById("deckFormTitle");
const cardFormTitle = document.getElementById("cardFormTitle");
const deckSubmitButton = document.getElementById("deckSubmitButton");
const cardSubmitButton = document.getElementById("cardSubmitButton");
const cancelDeckEditButton = document.getElementById("cancelDeckEditButton");
const cancelCardEditButton = document.getElementById("cancelCardEditButton");
const deckIdInput = document.getElementById("deckIdInput");
const cardIdInput = document.getElementById("cardIdInput");
const deckNameInput = document.getElementById("deckName");
const deckFocusInput = document.getElementById("deckFocus");
const deckSubjectInput = document.getElementById("deckSubject");
const deckDescriptionInput = document.getElementById("deckDescription");
const cardFrontInput = document.getElementById("cardFrontInput");
const cardBackInput = document.getElementById("cardBackInput");
const cardHintInput = document.getElementById("cardHintInput");
const cardTopicInput = document.getElementById("cardTopicInput");
const cardTagsInput = document.getElementById("cardTagsInput");
const cardNoteInput = document.getElementById("cardNoteInput");
const cardExampleInput = document.getElementById("cardExampleInput");
const importForm = document.getElementById("importForm");
const importFileInput = document.getElementById("importFileInput");
const importTextInput = document.getElementById("importTextInput");
const importFocusInput = document.getElementById("importFocus");
const importDeckNameInput = document.getElementById("importDeckName");
const importSubjectInput = document.getElementById("importSubject");
const importInstructionsInput = document.getElementById("importInstructions");
const importLimitInput = document.getElementById("importLimit");
const importStatus = document.getElementById("importStatus");
const importPreview = document.getElementById("importPreview");
const saveImportButton = document.getElementById("saveImportButton");
const clearImportDraftButton = document.getElementById("clearImportDraftButton");
const selectAllImportButton = document.getElementById("selectAllImportButton");
const clearImportSelectionButton = document.getElementById("clearImportSelectionButton");
const removeSelectedImportButton = document.getElementById("removeSelectedImportButton");
const dedupeImportButton = document.getElementById("dedupeImportButton");
const bulkImportTagsInput = document.getElementById("bulkImportTagsInput");
const applyImportTagsButton = document.getElementById("applyImportTagsButton");
const questionMapForm = document.getElementById("questionMapForm");
const questionMapQuestionFileInput = document.getElementById("questionMapQuestionFileInput");
const questionMapQuestionTextInput = document.getElementById("questionMapQuestionTextInput");
const questionMapSlideFileInput = document.getElementById("questionMapSlideFileInput");
const questionMapSlideTextInput = document.getElementById("questionMapSlideTextInput");
const questionMapTopMatchesInput = document.getElementById("questionMapTopMatchesInput");
const questionMapStatus = document.getElementById("questionMapStatus");
const questionMapSummary = document.getElementById("questionMapSummary");
const questionMapResults = document.getElementById("questionMapResults");
const clearQuestionMapButton = document.getElementById("clearQuestionMapButton");
const analyzeQuestionMapButton = document.getElementById("analyzeQuestionMapButton");
const assistantMessages = document.getElementById("assistantMessages");
const assistantStatus = document.getElementById("assistantStatus");
const assistantForm = document.getElementById("assistantForm");
const assistantInput = document.getElementById("assistantInput");
const assistantSubmitButton = document.getElementById("assistantSubmitButton");
const clearAssistantButton = document.getElementById("clearAssistantButton");
const deckDetailTitle = document.getElementById("deckDetailTitle");
const deckDetailContent = document.getElementById("deckDetailContent");
const createPanels = {
  deck: document.getElementById("createDeckPanel"),
  card: document.getElementById("createCardPanel"),
  import: document.getElementById("createImportPanel"),
  locator: document.getElementById("createLocatorPanel"),
  share: document.getElementById("createSharePanel"),
};
const createGuideTitle = document.getElementById("createGuideTitle");
const createGuideSummary = document.getElementById("createGuideSummary");
const createGuideSteps = document.getElementById("createGuideSteps");
const createGuideActions = document.getElementById("createGuideActions");
const authStatus = document.getElementById("authStatus");
const authEmailInput = document.getElementById("authEmailInput");
const signInMagicLinkButton = document.getElementById("signInMagicLinkButton");
const signOutButton = document.getElementById("signOutButton");
const shareDeckSelect = document.getElementById("shareDeckSelect");
const shareDeckButton = document.getElementById("shareDeckButton");
const copyShareLinkButton = document.getElementById("copyShareLinkButton");
const syncSharedDeckButton = document.getElementById("syncSharedDeckButton");
const duplicateSharedDeckButton = document.getElementById("duplicateSharedDeckButton");
const refreshShareLinkButton = document.getElementById("refreshShareLinkButton");
const leaveSharedDeckButton = document.getElementById("leaveSharedDeckButton");
const exportJsonButton = document.getElementById("exportJsonButton");
const importJsonFileInput = document.getElementById("importJsonFileInput");
const refreshCloudButton = document.getElementById("refreshCloudButton");
const shareStatus = document.getElementById("shareStatus");
const shareRequestList = document.getElementById("shareRequestList");
const shareMemberList = document.getElementById("shareMemberList");
const shareGuideSummary = document.getElementById("shareGuideSummary");
const shareGuideList = document.getElementById("shareGuideList");
const onboardingModal = document.getElementById("onboardingModal");
const dismissOnboardingButton = document.getElementById("dismissOnboardingButton");
const completeOnboardingButton = document.getElementById("completeOnboardingButton");
const settingsOpenGuideButton = document.getElementById("settingsOpenGuideButton");
const settingsOverviewSummary = document.getElementById("settingsOverviewSummary");
const settingsSnapshotList = document.getElementById("settingsSnapshotList");
const deckActionModal = document.getElementById("deckActionModal");
const deckActionTitle = document.getElementById("deckActionTitle");
const deckActionStatus = document.getElementById("deckActionStatus");
const deckActionCardButton = document.getElementById("deckActionCardButton");
const deckActionImportButton = document.getElementById("deckActionImportButton");
const deckActionLocatorButton = document.getElementById("deckActionLocatorButton");
const closeDeckActionButton = document.getElementById("closeDeckActionButton");
const shareJoinModal = document.getElementById("shareJoinModal");
const shareJoinTitle = document.getElementById("shareJoinTitle");
const shareJoinStatus = document.getElementById("shareJoinStatus");
const shareJoinRoleField = document.getElementById("shareJoinRoleField");
const shareJoinRoleSelect = document.getElementById("shareJoinRoleSelect");
const requestShareAccessButton = document.getElementById("requestShareAccessButton");
const closeShareJoinButton = document.getElementById("closeShareJoinButton");

bootstrap();

function bootstrap() {
  render();
  bindEvents();
  initializeCloud();
  maybeOpenOnboarding();
  registerServiceWorker();
}

function bindEvents() {
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchSection(tab.dataset.section));
  });
  createModeButtons.forEach((button) => {
    button.addEventListener("click", () => setCreateMode(button.dataset.createMode));
  });
  studyModeButtons.forEach((button) => {
    button.addEventListener("click", () => setStudyMode(button.dataset.studyMode));
  });
  templateButtons.forEach((button) => {
    button.addEventListener("click", () => applyTemplate(button.dataset.template));
  });
  deckDetailTabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      deckDetailTab = button.dataset.deckDetailTab;
      renderDeckDetail();
    });
  });

  toggleAnswerButton.addEventListener("click", toggleAnswer);
  if (startReviewButton) {
    startReviewButton.addEventListener("click", () => {
      switchSection("study");
    });
  }
  if (homeCreateDeckButton) {
    homeCreateDeckButton.addEventListener("click", () => {
      openDeckComposer("medical");
    });
  }
  demoResetConfirmInput.addEventListener("input", renderDemoRestorePanel);
  seedDemoButton.addEventListener("click", restoreDemoData);
  if (settingsOpenGuideButton) {
    settingsOpenGuideButton.addEventListener("click", () => {
      onboardingModal.hidden = false;
    });
  }
  dismissOnboardingButton.addEventListener("click", () => {
    onboardingModal.hidden = true;
  });
  completeOnboardingButton.addEventListener("click", completeOnboarding);
  closeShareJoinButton.addEventListener("click", () => {
    closeShareJoinModal();
  });
  requestShareAccessButton.addEventListener("click", requestShareAccess);

  deckForm.addEventListener("submit", handleDeckSubmit);
  cardForm.addEventListener("submit", handleCardSubmit);
  importForm.addEventListener("submit", handleImportSubmit);
  questionMapForm.addEventListener("submit", handleQuestionMapSubmit);
  assistantForm.addEventListener("submit", handleAssistantSubmit);
  cancelDeckEditButton.addEventListener("click", () => {
    clearDeckEditing();
    renderForms();
    showToast("デッキ編集を終了しました");
  });
  cancelCardEditButton.addEventListener("click", () => {
    clearCardEditing();
    renderForms();
    showToast("カード編集を終了しました");
  });

  studyDeckFilter.addEventListener("change", () => {
    resetStudySession();
    currentCardId = null;
    isAnswerVisible = false;
    renderStudy();
  });
  studySessionSizeInput.addEventListener("input", () => {
    studySessionSize = clampNumber(Number.parseInt(studySessionSizeInput.value, 10), 3, 20, 8);
    studySessionSizeInput.value = String(studySessionSize);
    renderStudy();
  });
  startStudySessionButton.addEventListener("click", startStudySession);
  shortQuizRevealButton.addEventListener("click", revealShortQuizAnswer);
  shortQuizNextButton.addEventListener("click", advanceStudySession);
  choiceQuizNextButton.addEventListener("click", advanceStudySession);
  libraryDeckFilter.addEventListener("change", renderLibrary);
  libraryTagFilter.addEventListener("change", renderLibrary);
  librarySubjectFilter.addEventListener("change", renderLibrary);
  libraryStorageFilter.addEventListener("change", renderLibrary);
  libraryStudyStateFilter.addEventListener("change", renderLibrary);
  libraryTextFilter.addEventListener("input", renderLibrary);
  cardDeckId.addEventListener("change", applyCardContextPlaceholders);
  deckFocusInput.addEventListener("change", applyDeckFocusPreset);
  importFocusInput.addEventListener("change", applyImportFocusPreset);
  importFileInput.addEventListener("change", syncImportDeckNameFromFile);
  saveImportButton.addEventListener("click", saveImportDraftAsDeck);
  clearImportDraftButton.addEventListener("click", clearImportDraft);
  selectAllImportButton.addEventListener("click", selectAllImportCandidates);
  clearImportSelectionButton.addEventListener("click", clearImportSelection);
  removeSelectedImportButton.addEventListener("click", removeSelectedImportCandidates);
  dedupeImportButton.addEventListener("click", dedupeImportCandidates);
  applyImportTagsButton.addEventListener("click", applyBulkImportTags);
  clearQuestionMapButton.addEventListener("click", clearQuestionMapDraft);
  assistantDeckFilter.addEventListener("change", handleAssistantSettingsChange);
  clearAssistantButton.addEventListener("click", clearAssistantHistory);
  shareDeckSelect.addEventListener("change", () => {
    selectedDeckDetailId = shareDeckSelect.value || selectedDeckDetailId;
    renderSharePanel();
    renderDeckDetail();
  });
  authEmailInput.addEventListener("input", renderSharePanel);
  signInMagicLinkButton.addEventListener("click", sendMagicLink);
  signOutButton.addEventListener("click", signOutCloud);
  shareDeckButton.addEventListener("click", shareDeck);
  copyShareLinkButton.addEventListener("click", copyShareLink);
  syncSharedDeckButton.addEventListener("click", syncSelectedSharedDeck);
  duplicateSharedDeckButton.addEventListener("click", duplicateSelectedDeck);
  refreshShareLinkButton.addEventListener("click", () => regenerateShareLinkForDeck());
  leaveSharedDeckButton.addEventListener("click", stopOrLeaveSelectedDeck);
  exportJsonButton.addEventListener("click", exportJsonBackup);
  importJsonFileInput.addEventListener("change", importJsonBackup);
  refreshCloudButton.addEventListener("click", refreshCloudData);
  if (toggleHistoryDetailsButton) {
    toggleHistoryDetailsButton.addEventListener("click", toggleHistoryDetails);
  }
  if (closeDeckActionButton) {
    closeDeckActionButton.addEventListener("click", closeDeckActionModal);
  }
  if (deckActionModal) {
    deckActionModal.addEventListener("click", (event) => {
      if (event.target === deckActionModal) {
        closeDeckActionModal();
      }
    });
  }
  if (deckActionCardButton) {
    deckActionCardButton.addEventListener("click", () => openDeckActionTarget("card"));
  }
  if (deckActionImportButton) {
    deckActionImportButton.addEventListener("click", () => openDeckActionTarget("import"));
  }
  if (deckActionLocatorButton) {
    deckActionLocatorButton.addEventListener("click", () => openDeckActionTarget("locator"));
  }

  document.querySelectorAll("[data-rating]").forEach((button) => {
    button.addEventListener("click", () => reviewCurrentCard(button.dataset.rating));
  });

  if (dashboardSection) {
    dashboardSection.addEventListener("click", handleDeckActions);
  }
  libraryList.addEventListener("click", handleLibraryActions);
  createGuideActions.addEventListener("click", handleGuideActions);
  shareRequestList.addEventListener("click", handleDeckDetailActions);
  shareMemberList.addEventListener("click", handleDeckDetailActions);
  deckDetailContent.addEventListener("click", handleDeckDetailActions);
  studySmartListGrid.addEventListener("click", handleStudySmartListActions);
  importPreview.addEventListener("click", handleImportPreviewActions);
  assistantMessages.addEventListener("click", handleAssistantActions);
  choiceQuizOptions.addEventListener("click", handleChoiceQuizActions);
  document.querySelectorAll("[data-short-quiz-grade]").forEach((button) => {
    button.addEventListener("click", () => gradeShortQuiz(button.dataset.shortQuizGrade));
  });
}

function switchSection(sectionId) {
  activeSection = sectionId;

  tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.section === sectionId);
  });

  sections.forEach((section) => {
    section.classList.toggle("is-active", section.id === sectionId);
  });

  if (sectionId === "study") {
    renderStudy();
  }

  if (sectionId === "assistant") {
    renderAssistant();
    renderLibrary();
    renderDeckDetail();
  }

  if (sectionId === "manage") {
    renderCreatePanels();
    renderSharePanel();
  }

  if (sectionId === "settings") {
    renderSettingsPanel();
  }
}

function render() {
  renderStats();
  renderDeckSelectors();
  renderForms();
  renderDemoRestorePanel();
  renderDashboard();
  renderStudy();
  renderAssistant();
  renderLibrary();
  renderDeckDetail();
  renderCreatePanels();
  renderSharePanel();
  renderSettingsPanel();
}

function renderStats() {
  const stats = buildStats();
  dueCount.textContent = String(stats.dueCount);
  heroTitle.textContent = state.decks.length ? "科目別にデッキを管理する" : "最初の科目デッキを作る";
  heroText.textContent =
    stats.totalCards > 0
      ? `医学${stats.medicalCards}枚・英語${stats.englishCards}枚を管理しながら、科目ごとにすぐ資料追加や復習へ進めます。`
      : "医学や英語の科目ごとにデッキを分けておくと、カード追加やPDF整理がかなり楽になります。";
  quickSummary.textContent =
    stats.dueCount > 0
      ? `いまは医学${stats.medicalDue}枚・英語${stats.englishDue}枚が復習待ちです。上から必要なデッキをそのまま開けます。`
      : "復習待ちがないときは、科目ごとにカードや資料を追加して次の学習に備えられます。";
}

function buildStats() {
  const now = Date.now();
  const cards = state.cards.length;
  const dueCards = state.cards.filter((card) => card.study.dueAt <= now);
  const todayKey = formatDateKey(new Date(now));
  const todayReviewed = state.reviewLog.filter((entry) => entry.dateKey === todayKey).length;
  const mastered = state.cards.filter((card) => card.study.mode === "review" && card.study.intervalDays >= 7).length;
  const medicalCards = state.cards.filter((card) => getDeckFocus(card.deckId) === "medical").length;
  const englishCards = state.cards.filter((card) => getDeckFocus(card.deckId) === "english").length;
  const medicalDue = dueCards.filter((card) => getDeckFocus(card.deckId) === "medical").length;
  const englishDue = dueCards.filter((card) => getDeckFocus(card.deckId) === "english").length;

  return {
    dueCount: dueCards.length,
    todayReviewed,
    totalCards: cards,
    medicalCards,
    englishCards,
    medicalDue,
    englishDue,
    cards: [
      { label: "医学カード", value: medicalCards },
      { label: "英語カード", value: englishCards },
      { label: "今日の回答数", value: todayReviewed },
      { label: "7日以上に伸びた枚数", value: mastered },
    ],
  };
}

function renderDeckSelectors() {
  const previousStudy = studyDeckFilter.value || "all";
  const previousAssistant = assistantDeckFilter.value || state.assistant.deckFilter || "all";
  const previousLibrary = libraryDeckFilter.value || "all";
  const previousCardDeck = cardDeckId.value;
  const previousShareDeck = shareDeckSelect.value || selectedDeckDetailId || "";
  const previousSearchCardifyTarget = searchCardifyTarget.value || "new";
  const allOption = '<option value="all">すべてのデッキ</option>';
  const focusOptions = TRACKS.map(
    (track) => `<option value="focus:${track.id}">${escapeHtml(track.title)}</option>`,
  ).join("");
  const deckOptions = state.decks
    .map((deck) => `<option value="${deck.id}">${escapeHtml(deck.name)}</option>`)
    .join("");

  studyDeckFilter.innerHTML = allOption + focusOptions + deckOptions;
  assistantDeckFilter.innerHTML = allOption + focusOptions + deckOptions;
  libraryDeckFilter.innerHTML = allOption + focusOptions + deckOptions;
  cardDeckId.innerHTML = deckOptions;
  shareDeckSelect.innerHTML = deckOptions || '<option value="">デッキがありません</option>';
  searchCardifyTarget.innerHTML =
    '<option value="new">新規デッキを作る</option>' + deckOptions;

  if (optionExists(studyDeckFilter, previousStudy)) {
    studyDeckFilter.value = previousStudy;
  }

  if (optionExists(libraryDeckFilter, previousLibrary)) {
    libraryDeckFilter.value = previousLibrary;
  }

  if (optionExists(assistantDeckFilter, previousAssistant)) {
    assistantDeckFilter.value = previousAssistant;
  }

  if (optionExists(cardDeckId, previousCardDeck)) {
    cardDeckId.value = previousCardDeck;
  } else if (state.decks[0]) {
    cardDeckId.value = state.decks[0].id;
  }

  if (optionExists(shareDeckSelect, previousShareDeck)) {
    shareDeckSelect.value = previousShareDeck;
  } else if (state.decks[0]) {
    shareDeckSelect.value = state.decks[0].id;
  }

  if (optionExists(searchCardifyTarget, previousSearchCardifyTarget)) {
    searchCardifyTarget.value = previousSearchCardifyTarget;
  }

  if (!selectedDeckDetailId || !getDeckById(selectedDeckDetailId)) {
    selectedDeckDetailId = state.decks[0]?.id || "";
  }

  renderLibraryFilterControls();
}

function renderForms() {
  syncDeckForm();
  syncCardForm();
  renderImportPanel();
  renderQuestionMapPanel();
  syncAssistantControls();
}

function renderCreatePanels() {
  Object.entries(createPanels).forEach(([mode, panel]) => {
    if (!panel) {
      return;
    }
    panel.classList.toggle("is-active", mode === createMode);
  });

  createModeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.createMode === createMode);
  });

  renderCreateGuide();
}

function setCreateMode(mode) {
  if (!createPanels[mode]) {
    return;
  }

  if (mode !== "import") {
    importContextDeckId = "";
  }
  if (mode !== "locator") {
    questionMapContextDeckId = "";
  }

  createMode = mode;
  renderCreatePanels();
  if (mode === "share") {
    renderSharePanel();
  }
  if (mode === "locator") {
    renderQuestionMapPanel();
  }
}

function openCreateMode(mode) {
  setCreateMode(mode);
  switchSection("manage");
}

function openDeckComposer(focus = "medical") {
  clearDeckEditing();
  clearCardEditing();
  setCreateMode("deck");
  switchSection("manage");
  deckFocusInput.value = normalizeDeckFocus(focus);
  applyDeckFocusPreset();
  deckSubjectInput.value = "";
  deckNameInput.focus();
}

function openCardComposer(deckId) {
  const deck = getDeckById(deckId);
  if (!deck) {
    showToast("対象デッキが見つかりません");
    return;
  }

  if (!canEditDeckContent(deck)) {
    showToast("このデッキにはカードを追加できません");
    return;
  }

  clearDeckEditing();
  clearCardEditing();
  setCreateMode("card");
  switchSection("manage");
  if (optionExists(cardDeckId, deck.id)) {
    cardDeckId.value = deck.id;
  }
  applyCardContextPlaceholders();
  showToast(`「${deck.name}」にカードを追加します`);
}

function openImportComposer(deckId) {
  const deck = getDeckById(deckId);
  if (!deck) {
    showToast("対象デッキが見つかりません");
    return;
  }

  if (!canEditDeckContent(deck)) {
    showToast("このデッキには資料を追加できません");
    return;
  }

  importContextDeckId = deck.id;
  clearImportDraft();
  importSelection.clear();
  setCreateMode("import");
  switchSection("manage");
  importFocusInput.value = normalizeDeckFocus(deck.focus);
  applyImportFocusPreset();
  importDeckNameInput.value = deck.name;
  importSubjectInput.value = deck.subject || "";
  importInstructionsInput.value = "";
  renderImportPanel();
  showToast(`「${deck.name}」へ追加する資料を選べます`);
}

function openQuestionMapComposer(deckId) {
  const deck = getDeckById(deckId);
  if (!deck) {
    showToast("対象デッキが見つかりません");
    return;
  }

  questionMapContextDeckId = deck.id;
  setCreateMode("locator");
  switchSection("manage");
  renderQuestionMapPanel();
  showToast(`「${deck.name}」向けに過去問参照を開きました`);
}

function openShareManager() {
  setCreateMode("share");
  switchSection("manage");
}

function openDeckActionModal(deckId) {
  const deck = getDeckById(deckId);
  if (!deck) {
    showToast("対象デッキが見つかりません");
    return;
  }

  deckActionDeckId = deck.id;
  deckActionTitle.textContent = `「${deck.subject || deck.name}」に何を追加しますか？`;
  deckActionStatus.textContent = canEditDeckContent(deck)
    ? `カード追加、PDF取り込み、過去問参照を、いま見ているデッキに合わせて始められます。`
    : "この共有デッキは閲覧のみです。過去問参照は使えますが、カードやPDFの追加はできません。";
  deckActionCardButton.disabled = !canEditDeckContent(deck);
  deckActionImportButton.disabled = !canEditDeckContent(deck);
  deckActionLocatorButton.disabled = false;
  deckActionModal.hidden = false;
}

function closeDeckActionModal() {
  deckActionDeckId = "";
  deckActionModal.hidden = true;
}

function openDeckActionTarget(target) {
  if (!deckActionDeckId) {
    closeDeckActionModal();
    return;
  }

  if (target === "card") {
    closeDeckActionModal();
    openCardComposer(deckActionDeckId);
    return;
  }

  if (target === "import") {
    closeDeckActionModal();
    openImportComposer(deckActionDeckId);
    return;
  }

  closeDeckActionModal();
  openQuestionMapComposer(deckActionDeckId);
}

function toggleHistoryDetails() {
  homeHistoryExpanded = !homeHistoryExpanded;
  renderHistoryPanel();
}

function setStudyMode(mode) {
  if (!["review", "test", "choice"].includes(String(mode || ""))) {
    return;
  }

  studyMode = mode;
  resetStudySession();
  currentCardId = null;
  isAnswerVisible = false;
  renderStudy();
}

function setStudySource(key) {
  if (!["due", "again", "hard", "weak", "all"].includes(String(key || ""))) {
    return;
  }

  studySourceKey = key;
  resetStudySession();
  currentCardId = null;
  isAnswerVisible = false;
  renderStudy();
}

function resetStudySession() {
  studySession = null;
  shortQuizAnswerInput.value = "";
  shortQuizAnswerArea.classList.add("is-hidden");
  choiceQuizAnswerArea.classList.add("is-hidden");
}

function runUiShortcut(action, { focus = "", mode = "" } = {}) {
  if (action === "study") {
    switchSection("study");
    return;
  }

  if (action === "create-mode") {
    openCreateMode(mode || "deck");
    return;
  }

  if (action === "install-starter") {
    installStarterPack(focus || "medical");
    return;
  }

  if (action === "share") {
    openCreateMode("share");
    return;
  }

  if (action === "onboarding") {
    onboardingModal.hidden = false;
    return;
  }

  if (action === "library") {
    switchSection("assistant");
    return;
  }

  if (action === "settings") {
    switchSection("settings");
  }
}

function applyTemplate(templateId) {
  if (templateId === "medical-diff") {
    setCreateMode("card");
    deckFocusInput.value = "medical";
    applyDeckFocusPreset();
    cardTopicInput.value = "症候 / 鑑別";
    cardTagsInput.value = "医学, 鑑別, 必修";
    cardHintInput.value = "症候から病態へつなぐ一言ヒント";
    cardNoteInput.value = "鑑別の軸、除外所見、まず疑う病態";
    cardExampleInput.value = "例: 胸痛 + 冷汗 + ST上昇 → STEMI をまず疑う";
    switchSection("manage");
    showToast("症候→鑑別テンプレートをカード作成に反映しました");
    return;
  }

  if (templateId === "english-vocab") {
    setCreateMode("card");
    deckFocusInput.value = "english";
    applyDeckFocusPreset();
    cardTopicInput.value = "医学英語 / 語彙";
    cardTagsInput.value = "english, vocabulary, medical english";
    cardHintInput.value = "語源、品詞、似た表現";
    cardNoteInput.value = "使い分けやコロケーション";
    cardExampleInput.value = "例文を英文のまま残す";
    switchSection("manage");
    showToast("英単語→例文テンプレートをカード作成に反映しました");
    return;
  }

  if (templateId === "english-reading") {
    setCreateMode("import");
    importFocusInput.value = "english";
    importSubjectInput.value = "読解 / 要点";
    importInstructionsInput.value = "長文の要点、構文、重要語彙をバランスよく抽出する";
    applyImportFocusPreset();
    switchSection("manage");
    showToast("長文→要点テンプレートを PDF 取り込みに反映しました");
  }
}

function maybeOpenOnboarding() {
  onboardingModal.hidden = Boolean(state.settings?.onboardingCompleted);
}

function renderShortcutButtons(items) {
  return (items || [])
    .map(
      (item) => `
        <button
          class="${escapeHtml(item.kind === "ghost" ? "ghost-button" : "primary-button")}"
          data-ui-action="${escapeHtml(item.action)}"
          data-ui-focus="${escapeHtml(item.focus || "")}"
          data-ui-mode="${escapeHtml(item.mode || "")}"
          type="button"
        >
          ${escapeHtml(item.label)}
        </button>
      `,
    )
    .join("");
}

function renderGuideSteps(items) {
  return (items || [])
    .map(
      (item, index) => `
        <article class="library-card">
          <h4>${index + 1}. ${escapeHtml(item.title)}</h4>
          <p class="muted">${escapeHtml(item.text)}</p>
        </article>
      `,
    )
    .join("");
}

function buildHomeQuickActions() {
  const stats = buildStats();
  const pendingCount = cloudState.pendingRequests.length;
  const hasMedicalDeck = state.decks.some((deck) => deck.focus === "medical");
  const hasEnglishDeck = state.decks.some((deck) => deck.focus === "english");
  const hasSharedDeck = state.decks.some((deck) => deck.storageMode === "shared");
  const actions = [];

  const pushAction = (item) => {
    const key = `${item.action}:${item.focus || ""}:${item.mode || ""}`;
    if (!actions.some((entry) => `${entry.action}:${entry.focus || ""}:${entry.mode || ""}` === key)) {
      actions.push(item);
    }
  };

  if (!state.cards.length) {
    if (!hasMedicalDeck) {
      pushAction({
        title: "医学スターターを入れる",
        text: "解剖・生理と病態の土台をすぐに追加して、最初の復習ルートを作れます。",
        label: "医学スターター追加",
        action: "install-starter",
        focus: "medical",
      });
    }
    if (!hasEnglishDeck) {
      pushAction({
        title: "英語スターターを入れる",
        text: "医学英語と長文読解の土台を用意して、英語トラックをすぐ始められます。",
        label: "英語スターター追加",
        action: "install-starter",
        focus: "english",
      });
    }
    pushAction({
      title: "PDFからまとめて作る",
      text: "講義資料や配布ノートをそのまま読み込んで、カード候補を一気に作れます。",
      label: "PDF取り込みへ",
      action: "create-mode",
      mode: "import",
    });
    pushAction({
      title: "使い方を先に見る",
      text: "3ステップのガイドを開いて、最初にどこを触るか確認できます。",
      label: "使い方を見る",
      action: "onboarding",
      kind: "ghost",
    });
    return actions.slice(0, 3);
  }

  if (stats.dueCount > 0) {
    pushAction({
      title: `${stats.dueCount}枚の復習を進める`,
      text: "まずは期限が来たカードから片づけると、学習サイクルが崩れにくくなります。",
      label: "学習へ",
      action: "study",
    });
  }

  if (pendingCount > 0) {
    pushAction({
      title: "共有申請を確認する",
      text: `${pendingCount}件の参加申請があります。owner なら共有タブで承認やロール選択ができます。`,
      label: "共有を見る",
      action: "share",
    });
  }

  if (!hasSharedDeck) {
    pushAction({
      title: "デッキを仲間と共有する",
      text: "まずは複製リンク、必要なら共同編集へと段階的に共有を始められます。",
      label: "共有へ",
      action: "share",
    });
  }

  if (!hasEnglishDeck) {
    pushAction({
      title: "英語トラックを補強する",
      text: "医学英語や読解のデッキがまだ少ないなら、英語スターターを足すと始めやすいです。",
      label: "英語スターター追加",
      action: "install-starter",
      focus: "english",
    });
  }

  if (!hasMedicalDeck) {
    pushAction({
      title: "医学トラックを補強する",
      text: "基礎科目の復習が薄いときは、医学スターターから埋めると全体が安定します。",
      label: "医学スターター追加",
      action: "install-starter",
      focus: "medical",
    });
  }

  pushAction({
    title: "PDFから一気に増やす",
    text: "講義資料や英語本文からカード候補を作って、入力の手間を減らせます。",
    label: "PDF取り込みへ",
    action: "create-mode",
    mode: "import",
  });
  pushAction({
    title: "保存済みカードを検索する",
    text: "今あるカードだけで要点を引きたいときは、ライブラリ内検索が早いです。",
    label: "ライブラリへ",
    action: "library",
    kind: "ghost",
  });

  return actions.slice(0, 3);
}

function buildCreateGuideModel() {
  const hasDecks = state.decks.length > 0;
  const hasSharedDeck = state.decks.some((deck) => deck.storageMode === "shared");
  const hasClientConfig = Boolean(cloudState.config?.supabaseUrl && cloudState.config?.supabaseAnonKey);

  if (createMode === "card") {
    if (!hasDecks) {
      return {
        title: "カードの前にデッキを用意する",
        summary: "カードは必ずどこかのデッキに入ります。まずは医学か英語のデッキを1つ作ると進めやすいです。",
        steps: [
          { title: "先にデッキを作る", text: "科目や目的ごとに箱を作ってからカードを入れると、復習範囲が整理されます。" },
          { title: "そのあとカードへ戻る", text: "問題・答え・補足を短く入力して、1枚ずつ増やします。" },
        ],
        actions: [
          { label: "デッキ作成へ", action: "create-mode", mode: "deck" },
          { label: "医学スターター追加", action: "install-starter", focus: "medical", kind: "ghost" },
        ],
      };
    }

    return {
      title: "1枚ずつ丁寧にカードを追加する",
      summary: "重要度が高い内容や、PDFから拾い切れない細かい知識は手入力で補うのが向いています。",
      steps: [
        { title: "入れるデッキを選ぶ", text: "まず対象デッキを決めて、医学か英語かの文脈を揃えます。" },
        { title: "問題と答えを短く分ける", text: "1カード1論点にすると、暗記と復習の効率が上がります。" },
        { title: "補足や例文で定着させる", text: "臨床メモや例文を添えると、覚える場面が頭に残りやすくなります。" },
      ],
      actions: [
        { label: "PDF取り込みへ", action: "create-mode", mode: "import" },
        { label: "共有へ", action: "share", kind: "ghost" },
      ],
    };
  }

  if (createMode === "import") {
    return {
      title: "資料からまとめてカード候補を作る",
      summary: "大量の講義資料や英語本文を扱うときは、まず取り込みで候補を作ってから必要なものだけ残すのが速いです。",
      steps: [
        { title: "PDFか本文を入れる", text: "講義PDF、配布ノート、英語本文などをそのまま投入できます。" },
        { title: "候補を整理する", text: "重複統合、一括タグ付け、不要候補の削除で質を整えます。" },
        { title: "新規または既存デッキへ保存", text: "まとめて新規デッキを作るか、既存デッキに追記できます。" },
      ],
      actions: [
        { label: "カード作成へ", action: "create-mode", mode: "card" },
        { label: "過去問参照へ", action: "create-mode", mode: "locator", kind: "ghost" },
      ],
    };
  }

  if (createMode === "locator") {
    return {
      title: "過去問とスライドの対応表を作る",
      summary: "過去問PDFと講義スライドPDFを同時に読むと、各設問がどのスライドに近いかを候補で確認できます。",
      steps: [
        { title: "過去問を入れる", text: "番号付きの設問を自動で区切り、設問文と選択肢を検索キーとして使います。" },
        { title: "スライドを入れる", text: "講義PDFをページ単位で解析して、各ページから近い本文箇所を抜き出します。" },
        { title: "候補を確認する", text: "設問ごとに関連スライド候補、ページ番号、該当抜粋が並ぶので、見直しの起点にできます。" },
      ],
      actions: [
        { label: "PDF取り込みへ", action: "create-mode", mode: "import" },
        { label: "ライブラリへ", action: "library", kind: "ghost" },
      ],
    };
  }

  if (createMode === "share") {
    return {
      title: hasSharedDeck ? "共有の運用を整える" : "共有は2段階で使い分ける",
      summary: hasSharedDeck
        ? "すでに共有中のデッキがあります。承認待ち、ロール変更、リンク再発行、共有終了をここでまとめて管理できます。"
        : hasClientConfig
          ? "まずはローカル複製リンクで試し、必要になったらログインして共同編集へ進めるのが一番わかりやすい流れです。"
          : "Supabase 未設定でもローカル複製共有は使えます。共同編集が必要になった時だけ Supabase を接続すれば十分です。",
      steps: [
        { title: "まずは共有したいデッキを選ぶ", text: "学習中のデッキから1つ選んで、共有リンクを作ります。" },
        { title: "軽い共有ならローカル複製", text: "相手は自分の端末へそのまま追加でき、ログインも不要です。" },
        { title: "共同編集ならクラウド共有", text: "magic link でログインすると、viewer / editor を分けて運用できます。" },
      ],
      actions: [
        { label: "設定へ", action: "settings" },
        { label: "使い方を見る", action: "onboarding", kind: "ghost" },
      ],
    };
  }

  return {
    title: "まずは学習の箱を作る",
    summary: "デッキは科目や用途ごとのまとまりです。あとから共有やPDF取り込みを使うときも、デッキ設計が土台になります。",
    steps: [
      { title: "デッキ名を決める", text: "解剖・生理、病態、医学英語、読解のように用途ごとに分けると管理しやすいです。" },
      { title: "学習トラックと分野を入れる", text: "医学 / 英語と分野名を入れておくと、検索や絞り込みがしやすくなります。" },
      { title: "次にカードかPDFへ進む", text: "箱を作ったら、手入力のカード追加か、資料からの一括取り込みに進みます。" },
    ],
    actions: [
      { label: "カード作成へ", action: "create-mode", mode: "card" },
      { label: "PDF取り込みへ", action: "create-mode", mode: "import", kind: "ghost" },
    ],
  };
}

function renderCreateGuide() {
  const guide = buildCreateGuideModel();
  createGuideTitle.textContent = guide.title;
  createGuideSummary.textContent = guide.summary;
  createGuideSteps.innerHTML = renderGuideSteps(guide.steps);
  createGuideActions.innerHTML = renderShortcutButtons(guide.actions);
}

function buildCurrentDataSummary() {
  return `${state.decks.length}デッキ / ${state.cards.length}枚 / 学習履歴${state.reviewLog.length}件`;
}

function renderSettingsPanel() {
  const sharedDeckCount = state.decks.filter((deck) => deck.storageMode === "shared").length;
  const localDeckCount = state.decks.length - sharedDeckCount;
  const latestDeck = [...state.decks].sort((left, right) => right.updatedAt - left.updatedAt)[0] || null;

  settingsOverviewSummary.textContent =
    "バックアップ、ガイドの再表示、初期化のような誤操作に注意したい項目をここへまとめています。初期化は必ず確認を挟む安全な導線にしています。";
  settingsSnapshotList.innerHTML = [
    {
      title: "データ量",
      text: `${state.decks.length}デッキ / ${state.cards.length}枚 / 学習履歴${state.reviewLog.length}件を保存中です。`,
    },
    {
      title: "保存先の内訳",
      text:
        sharedDeckCount > 0
          ? `ローカル ${localDeckCount}件、共有 ${sharedDeckCount}件です。共有内容を守りたいときは先に JSON バックアップを取ると安全です。`
          : `現在はローカル ${localDeckCount}件です。端末変更や初期化に備えて、JSON バックアップを取っておくと安心です。`,
    },
    {
      title: "最近更新したデッキ",
      text: latestDeck
        ? `${latestDeck.name} を最後に更新しました。必要ならこのタイミングでバックアップを残せます。`
        : "まだデッキがありません。スターター追加やデッキ作成から始められます。",
    },
    {
      title: "ガイドの状態",
      text: state.settings?.onboardingCompleted
        ? "初回ガイドは完了済みです。必要になったらこの設定画面からいつでも開き直せます。"
        : "初回ガイドはまだ未完了です。使い方があいまいなら先に見ておくと安心です。",
    },
  ]
    .map(
      (item) => `
        <article class="library-card">
          <h4>${escapeHtml(item.title)}</h4>
          <p class="muted">${escapeHtml(item.text)}</p>
        </article>
      `,
    )
    .join("");
}

function renderDemoRestorePanel() {
  const typed = String(demoResetConfirmInput.value || "").trim();
  const hasMeaningfulData = state.cards.length > 0 || state.reviewLog.length > 0 || state.decks.length > 0;

  demoResetStatus.textContent = hasMeaningfulData
    ? `現在の ${buildCurrentDataSummary()} をサンプルデータで初期化します。この操作は元に戻せないため、必要なら先に JSON を書き出してください。`
    : "使い方を試すためのサンプルデータで初期化できます。すでに入力がある場合は上書きされます。";
  seedDemoButton.disabled = typed !== DEMO_RESET_CONFIRM_TEXT;
}

function restoreDemoData() {
  const typed = String(demoResetConfirmInput.value || "").trim();
  if (typed !== DEMO_RESET_CONFIRM_TEXT) {
    showToast(`確認のため「${DEMO_RESET_CONFIRM_TEXT}」と入力してください`);
    return;
  }

  const approved = window.confirm(
    `本当に初期化するんですか？\n現在の ${buildCurrentDataSummary()} をサンプルデータで置き換えます。\nこの操作は元に戻せません。必要なら先に JSON を書き出してください。`,
  );
  if (!approved) {
    return;
  }

  const preservedSettings = normalizeSettingsState(state.settings);
  state = normalizeState({
    ...clone(demoState),
    settings: {
      ...clone(demoState.settings),
      ...preservedSettings,
    },
  });
  currentCardId = null;
  isAnswerVisible = false;
  assistantErrorMessage = "";
  selectedDeckDetailId = "";
  deckDetailTab = "overview";
  shareLinkCache = "";
  clearDeckEditing();
  clearCardEditing();
  clearImportDraft();
  demoResetConfirmInput.value = "";
  persist();
  render();
  switchSection("dashboard");
  showToast("サンプルデータで初期化しました");
}

function completeOnboarding() {
  state.settings.onboardingCompleted = true;
  onboardingModal.hidden = true;
  persist();
  showToast("使い方ガイドを閉じました。必要なときは設定から開き直せます");
}

function formatStorageMode(mode) {
  return mode === "shared" ? "共有" : "ローカル";
}

function formatSyncState(syncState) {
  if (syncState === "synced") {
    return "同期済み";
  }
  if (syncState === "dirty") {
    return "未同期";
  }
  if (syncState === "syncing") {
    return "同期中";
  }
  if (syncState === "offline") {
    return "オフライン";
  }
  return "未共有";
}

function formatRoleLabel(role) {
  if (role === "owner") {
    return "オーナー";
  }
  if (role === "editor") {
    return "編集者";
  }
  if (role === "viewer") {
    return "閲覧のみ";
  }
  if (role === "pending_request") {
    return "申請中";
  }
  return "ローカル";
}

function getSelectedShareDeck() {
  return getDeckById(shareDeckSelect.value || selectedDeckDetailId || "");
}

function canEditDeckContent(deck) {
  if (!deck) {
    return false;
  }
  if (deck.storageMode !== "shared") {
    return true;
  }
  return deck.role === "owner" || deck.role === "editor";
}

function canManageDeckShare(deck) {
  return Boolean(deck && deck.storageMode === "shared" && deck.role === "owner");
}

function setShareJoinRoleVisibility(isVisible) {
  shareJoinRoleField.hidden = !isVisible;
  if (!isVisible) {
    shareJoinRoleSelect.value = "viewer";
  }
}

function markDeckDirty(deckId) {
  const deck = getDeckById(deckId);
  if (!deck || deck.storageMode !== "shared") {
    return;
  }
  deck.syncState = "dirty";
}

function closeShareJoinModal() {
  shareJoinModal.hidden = true;
  if (cloudState.joinMode === "local") {
    clearLocalShareQuery();
  }
  cloudState.joinMode = "";
  cloudState.localSharePayload = null;
  setShareJoinRoleVisibility(false);
  requestShareAccessButton.textContent = "参加を申請する";
}

function getDeckShareMembers(deck) {
  if (!deck?.sharedDeckId) {
    return [];
  }
  return Array.isArray(cloudState.membersByDeck[deck.sharedDeckId]) ? cloudState.membersByDeck[deck.sharedDeckId] : [];
}

function formatShareMemberName(member) {
  if (!member) {
    return "メンバー";
  }
  if (member.isCurrentUser) {
    return member.role === "owner" ? "あなた (owner)" : "あなた";
  }
  if (member.email) {
    return member.email;
  }
  if (member.displayName) {
    return member.displayName;
  }
  return "共有メンバー";
}

function renderShareRequestsMarkup(deck, canManage) {
  const pendingRequests = cloudState.pendingRequests.filter((request) => request.deckId === deck.sharedDeckId);
  if (!pendingRequests.length) {
    return `
      <article class="library-card">
        <h4>承認待ちはありません</h4>
        <p class="muted">共有リンクを配ると、参加申請がここに出ます。</p>
      </article>
    `;
  }

  return pendingRequests
    .map(
      (request) => `
        <article class="library-card">
          <h4>${escapeHtml(request.requesterEmail || "参加申請")}</h4>
          <p class="muted">希望ロール: ${escapeHtml(formatRoleLabel(request.requestedRole || "viewer"))}</p>
          <div class="button-row">
            <button
              class="primary-button"
              data-approve-request="${request.id}"
              data-approved-role="viewer"
              type="button"
              ${canManage ? "" : "disabled"}
            >
              閲覧で承認
            </button>
            <button
              class="ghost-button"
              data-approve-request="${request.id}"
              data-approved-role="editor"
              type="button"
              ${canManage ? "" : "disabled"}
            >
              編集で承認
            </button>
            <button class="ghost-button danger-button" data-reject-request="${request.id}" type="button" ${canManage ? "" : "disabled"}>拒否</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderShareMembersMarkup(deck, canManage) {
  const roleRank = { owner: 0, editor: 1, viewer: 2 };
  const members = getDeckShareMembers(deck)
    .slice()
    .sort((left, right) => {
      const leftRank = roleRank[left.role] ?? 9;
      const rightRank = roleRank[right.role] ?? 9;
      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }
      if (left.isCurrentUser !== right.isCurrentUser) {
        return left.isCurrentUser ? -1 : 1;
      }
      return String(left.email || left.displayName || "").localeCompare(String(right.email || right.displayName || ""));
    });
  if (!members.length) {
    return `
      <article class="library-card">
        <h4>参加中メンバーはまだいません</h4>
        <p class="muted">承認済みになると、ここに現在のメンバーとロールが並びます。</p>
      </article>
    `;
  }

  return members
    .map((member) => {
      const isOwner = member.role === "owner";
      const canChangeRole = canManage && !isOwner;
      const canRemove = !isOwner && (canManage || member.isCurrentUser);
      return `
        <article class="library-card">
          <h4>${escapeHtml(formatShareMemberName(member))}</h4>
          <div class="card-row-meta">
            <span class="meta-pill">${escapeHtml(formatRoleLabel(member.role))}</span>
            ${member.isCurrentUser ? '<span class="meta-pill">この端末</span>' : ""}
          </div>
          <div class="button-row">
            ${
              canChangeRole
                ? `
                  <button
                    class="ghost-button"
                    data-change-member-role="${member.id}"
                    data-deck-id="${deck.id}"
                    data-next-role="viewer"
                    type="button"
                    ${member.role === "viewer" ? "disabled" : ""}
                  >
                    閲覧のみ
                  </button>
                  <button
                    class="ghost-button"
                    data-change-member-role="${member.id}"
                    data-deck-id="${deck.id}"
                    data-next-role="editor"
                    type="button"
                    ${member.role === "editor" ? "disabled" : ""}
                  >
                    編集可
                  </button>
                `
                : ""
            }
            ${
              canRemove
                ? `
                  <button
                    class="ghost-button danger-button"
                    data-remove-member="${member.id}"
                    data-deck-id="${deck.id}"
                    type="button"
                  >
                    ${member.isCurrentUser ? "共有から抜ける" : "メンバーを外す"}
                  </button>
                `
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");
}

function getCurrentShareUrl(deck) {
  if (!deck) {
    return "";
  }
  if (deck.storageMode === "shared" && deck.shareToken) {
    return buildShareUrl(deck.shareToken);
  }
  if (cloudState.lastLocalShareDeckId === deck.id) {
    return shareLinkCache;
  }
  return "";
}

function renderShareGuidePanel(deck) {
  const hasClientConfig = Boolean(cloudState.config?.supabaseUrl && cloudState.config?.supabaseAnonKey);
  const isSignedIn = Boolean(cloudState.session?.user);
  const currentStateText = !deck
    ? "まだ対象デッキがないので、まずはデッキ作成かスターター追加から始めるのがおすすめです。"
    : deck.storageMode === "shared"
      ? `今選んでいる「${deck.name}」は共同編集モードです。${canManageDeckShare(deck) ? "owner としてメンバー管理まで行えます。" : "あなたの学習進捗は個別に保持されます。"}`
      : hasClientConfig
        ? isSignedIn
          ? `今選んでいる「${deck.name}」はローカルデッキです。共有リンクを作ると、複製共有か共同編集に進めます。`
          : `今選んでいる「${deck.name}」はローカルデッキです。まずは複製共有を使い、共同編集したい時だけログインすると迷いにくいです。`
        : `今選んでいる「${deck.name}」はローカルデッキです。現状でも複製共有は使えます。共同編集が必要になった時だけ Supabase を足せば十分です。`;

  shareGuideSummary.textContent = currentStateText;
  shareGuideList.innerHTML = `
    <article class="library-card">
      <h4>1. まずはローカル複製で共有</h4>
      <p class="muted">ログイン不要です。相手はリンクを開いて、自分の端末にローカルデッキとして追加できます。</p>
    </article>
    <article class="library-card">
      <h4>2. 共同編集が必要ならクラウド共有</h4>
      <p class="muted">${
        hasClientConfig
          ? "magic link でログインすると、owner 承認制の editor / viewer 共有が使えます。"
          : "Supabase を接続すると、owner 承認制の editor / viewer 共有が使えるようになります。"
      }</p>
    </article>
    <article class="library-card">
      <h4>3. 学習進捗は人ごとに分離</h4>
      <p class="muted">共有されるのはカード内容だけです。復習間隔や学習履歴は各ユーザーで別々に保持します。</p>
    </article>
    <article class="library-card">
      <h4>4. バックアップや初期化は設定へ</h4>
      <p class="muted">JSON バックアップやサンプル読み込みは、誤操作を避けるため設定タブへ分離しています。</p>
    </article>
  `;
}

function renderSharePanel() {
  const deck = getSelectedShareDeck();
  const hasClientConfig = Boolean(cloudState.config?.supabaseUrl && cloudState.config?.supabaseAnonKey);
  const isSignedIn = Boolean(cloudState.session?.user);

  renderShareGuidePanel(deck);

  authStatus.textContent = !hasClientConfig
    ? "Supabase 未設定ならローカル専用のまま使えます。共有を使う時だけ接続してください。"
    : isSignedIn
      ? `${cloudState.session.user.email || "ログイン中"} で共有機能を使えます。`
      : "共有リンクを使う時だけログインします。普段の学習はログイン不要です。";
  signOutButton.disabled = !isSignedIn;
  signInMagicLinkButton.disabled = !hasClientConfig || !String(authEmailInput.value || "").trim();
  refreshCloudButton.disabled = !hasClientConfig;

  if (!deck) {
    shareDeckButton.disabled = true;
    copyShareLinkButton.disabled = true;
    syncSharedDeckButton.disabled = true;
    duplicateSharedDeckButton.disabled = true;
    refreshShareLinkButton.disabled = true;
    leaveSharedDeckButton.hidden = true;
    leaveSharedDeckButton.disabled = true;
    shareStatus.textContent = "対象デッキがありません。先にデッキを作成してください。";
    shareRequestList.innerHTML = `
      <article class="library-card">
        <h4>共有対象がありません</h4>
        <p class="muted">デッキを作ると、ここから共有リンクを作れます。</p>
      </article>
    `;
    shareMemberList.innerHTML = "";
    return;
  }

  const shareUrl = getCurrentShareUrl(deck);
  const canEdit = canEditDeckContent(deck);
  const canManage = canManageDeckShare(deck);

  shareDeckButton.disabled = !canEdit;
  copyShareLinkButton.disabled = !shareUrl;
  syncSharedDeckButton.disabled = !hasClientConfig || !isSignedIn || deck.storageMode !== "shared";
  duplicateSharedDeckButton.disabled = false;
  refreshShareLinkButton.disabled = !canManage;
  leaveSharedDeckButton.hidden = deck.storageMode !== "shared";
  leaveSharedDeckButton.disabled = deck.storageMode !== "shared" || !isSignedIn;
  leaveSharedDeckButton.textContent = canManage ? "共有をやめる" : "共有から抜ける";

  shareStatus.textContent =
    deck.storageMode === "shared"
      ? `このデッキは共有中です。権限: ${formatRoleLabel(deck.role)} / 状態: ${formatSyncState(deck.syncState)}${
          shareUrl ? ` / リンク: ${shareUrl}` : ""
        }`
      : hasClientConfig
        ? shareUrl
          ? `このローカルデッキの複製用リンクを作成済みです。共同編集にしたい場合はログイン後にもう一度「共有リンクを作る」を押してください。 / リンク: ${shareUrl}`
          : "まだローカルデッキです。今は複製用の共有リンクを作れます。共同編集にしたい場合は Supabase にログインするとクラウド共有へ切り替わります。"
        : shareUrl
          ? `このローカルデッキの複製用リンクを作成済みです。 / リンク: ${shareUrl}`
          : "Supabase 未設定でも、まずは複製用の共有リンクを作れます。共同編集を使いたい時だけ Supabase を接続してください。";

  shareRequestList.innerHTML = renderShareRequestsMarkup(deck, canManage);
  shareMemberList.innerHTML =
    deck.storageMode === "shared"
      ? renderShareMembersMarkup(deck, canManage)
      : `
          <article class="library-card">
            <h4>共有後のメンバー管理</h4>
            <p class="muted">クラウド共有を有効にすると、ここで editor / viewer の切り替えやメンバー管理ができます。</p>
          </article>
        `;
}

function syncDeckForm() {
  const deck = getDeckById(editingDeckId);
  deckFormTitle.textContent = deck ? "デッキを編集" : "デッキを作る";
  deckSubmitButton.textContent = deck ? "デッキを更新" : "デッキを追加";
  cancelDeckEditButton.hidden = !deck;
  deckIdInput.value = deck?.id || "";
  deckNameInput.value = deck?.name || "";
  deckFocusInput.value = deck?.focus || "medical";
  deckSubjectInput.value = deck?.subject || "";
  deckDescriptionInput.value = deck?.description || "";
  applyDeckFocusPreset();
}

function syncCardForm() {
  const card = getCardById(editingCardId);
  cardFormTitle.textContent = card ? "カードを編集" : "カードを追加";
  cardSubmitButton.textContent = card ? "カードを更新" : "カードを保存";
  cancelCardEditButton.hidden = !card;
  cardIdInput.value = card?.id || "";
  cardFrontInput.value = card?.front || "";
  cardBackInput.value = card?.back || "";
  cardHintInput.value = card?.hint || "";
  cardTopicInput.value = card?.topic || "";
  cardTagsInput.value = Array.isArray(card?.tags) ? card.tags.join(", ") : "";
  cardNoteInput.value = card?.note || "";
  cardExampleInput.value = card?.example || "";

  if (card && optionExists(cardDeckId, card.deckId)) {
    cardDeckId.value = card.deckId;
  }

  applyCardContextPlaceholders();
}

function renderImportPanel() {
  applyImportFocusPreset();
  clearImportDraftButton.hidden = !importDraft;
  saveImportButton.hidden = !importDraft;
  selectAllImportButton.disabled = !importDraft;
  clearImportSelectionButton.disabled = !importDraft;
  removeSelectedImportButton.disabled = !importDraft;
  dedupeImportButton.disabled = !importDraft;
  applyImportTagsButton.disabled = !importDraft;

  if (!importDraft) {
    const contextDeck = getDeckById(importContextDeckId);
    importStatus.textContent = contextDeck
      ? `「${contextDeck.name}」へ追加する資料を選ぶと、自動でカード候補を作成します。スキャンPDFは文字抽出できないことがあります。`
      : "PDF または本文を入れると、自動でカード候補を作成します。スキャンPDFは文字抽出できないことがあります。";
    saveImportButton.textContent = "この候補でデッキ作成";
    importPreview.innerHTML = `
      <article class="library-card">
        <h4>まだ自動生成の候補はありません</h4>
        <p class="muted">${
          contextDeck
            ? `講義PDF、英語の資料、配布ノートを読み込むと、「${escapeHtml(contextDeck.name)}」へ追加する候補がここに並びます。`
            : "講義PDF、英語の資料、配布ノートを読み込むとここに候補が並びます。"
        }</p>
      </article>
    `;
    return;
  }

  const cardIds = new Set(importDraft.cards.map((card) => card.id));
  importSelection = new Set([...importSelection].filter((id) => cardIds.has(id)));
  const selectedCount = importSelection.size;
  const selectedDeck = getDeckById(importDraft.targetDeckId);

  saveImportButton.textContent = selectedDeck ? "既存デッキへ追加" : "この候補でデッキ作成";
  importStatus.textContent = `${importDraft.sourceName} から ${importDraft.cards.length} 枚の候補を作成しました。内容を確認してから保存できます。${
    selectedCount ? ` 現在 ${selectedCount} 枚を選択中です。` : ""
  }`;
  importPreview.innerHTML = importDraft.cards
    .map(
      (card, index) => `
        <article class="library-card">
          <div class="card-row-header">
            <div>
              <label class="selection-row">
                <input type="checkbox" data-toggle-import-card="${card.id}" ${importSelection.has(card.id) ? "checked" : ""} />
                <span class="muted">候補を選択</span>
              </label>
              <h4>${index + 1}. ${escapeHtml(card.front)}</h4>
              <p class="muted">${escapeHtml(card.back)}</p>
            </div>
            <div class="button-row">
              <button class="ghost-button danger-button" data-remove-import-card="${card.id}" type="button">候補から外す</button>
            </div>
          </div>
          ${card.note ? `<p class="flashcard-note">${escapeHtml(card.note)}</p>` : ""}
          ${card.example ? `<p class="flashcard-example">${escapeHtml(card.example)}</p>` : ""}
          <div class="card-row-meta">
            <span class="meta-pill ${escapeHtml(importDraft.focus)}">${escapeHtml(formatDeckFocus(importDraft.focus))}</span>
            ${card.topic ? `<span class="meta-pill">${escapeHtml(card.topic)}</span>` : ""}
            ${(card.tags || []).slice(0, 4).map((tag) => `<span class="meta-pill">${escapeHtml(tag)}</span>`).join("")}
          </div>
          <p class="import-source">出典: ${escapeHtml(card.sourceLine || importDraft.sourceName)}</p>
        </article>
      `,
    )
    .join("");
}

function renderQuestionMapPanel() {
  const topMatches = clampNumber(Number.parseInt(questionMapTopMatchesInput.value, 10), 1, 5, 3);
  questionMapTopMatchesInput.value = String(topMatches);
  clearQuestionMapButton.hidden = !questionMapDraft;
  analyzeQuestionMapButton.disabled = isQuestionMapLoading;
  questionMapQuestionFileInput.disabled = isQuestionMapLoading;
  questionMapQuestionTextInput.disabled = isQuestionMapLoading;
  questionMapSlideFileInput.disabled = isQuestionMapLoading;
  questionMapSlideTextInput.disabled = isQuestionMapLoading;
  questionMapTopMatchesInput.disabled = isQuestionMapLoading;

  if (isQuestionMapLoading) {
    questionMapStatus.textContent =
      "過去問とスライドを解析しています。設問を区切りながら、関連スライド候補を探しています。";
  }

  if (!questionMapDraft) {
    const contextDeck = getDeckById(questionMapContextDeckId);
    if (!isQuestionMapLoading && questionMapErrorMessage) {
      questionMapStatus.textContent = questionMapErrorMessage;
    } else if (!isQuestionMapLoading) {
      questionMapStatus.textContent = contextDeck
        ? `「${contextDeck.name}」向けに、過去問と講義スライドを入れると設問ごとの関連候補を表示します。`
        : "過去問と講義スライドを入れると、設問ごとに関連スライド候補、ページ番号、該当箇所の抜粋を表示します。";
    }
    questionMapSummary.innerHTML = "";
    questionMapResults.innerHTML = questionMapErrorMessage
      ? `
          <article class="library-card">
            <h4>解析に失敗しました</h4>
            <p class="muted">${escapeHtml(questionMapErrorMessage)}</p>
          </article>
        `
      : `
          <article class="library-card">
            <h4>まだ対応表はありません</h4>
            <p class="muted">過去問 PDF と講義スライド PDF を入れて解析すると、ここに設問ごとの参照候補が並びます。</p>
          </article>
        `;
    return;
  }

  questionMapErrorMessage = "";
  questionMapStatus.textContent = `${questionMapDraft.questionSourceName} と ${questionMapDraft.slideSourceLabel} から、${questionMapDraft.questions.length} 問の対応候補を作成しました。`;
  questionMapSummary.innerHTML = [
    { label: "解析した設問", value: `${questionMapDraft.questions.length}問` },
    { label: "使ったスライド", value: `${questionMapDraft.slidePageCount}ページ` },
    { label: "候補が見つかった設問", value: `${questionMapDraft.matchedQuestionCount}問` },
    { label: "参照資料", value: questionMapDraft.slideSourceLabel },
  ]
    .map(
      (item) => `
        <article class="library-card">
          <p class="eyebrow">${escapeHtml(item.label)}</p>
          <h4>${escapeHtml(item.value)}</h4>
        </article>
      `,
    )
    .join("");

  questionMapResults.innerHTML = questionMapDraft.questions
    .map(
      (question) => `
        <article class="library-card question-map-card">
          <div class="card-row-header">
            <div>
              <p class="eyebrow">設問 ${escapeHtml(question.label)}</p>
              <h4>${escapeHtml(question.prompt)}</h4>
            </div>
            <span class="meta-pill">${question.matches.length ? `候補 ${question.matches.length}件` : "候補なし"}</span>
          </div>
          ${
            question.options.length
              ? `<p class="muted">選択肢: ${escapeHtml(question.options.slice(0, 5).join(" / "))}</p>`
              : ""
          }
          ${
            question.matches.length
              ? `
                <div class="stack-list">
                  ${question.matches
                    .map(
                      (match, index) => `
                        <article class="subpanel match-card">
                          <div class="card-row-header">
                            <div>
                              <h4>${index + 1}. ${escapeHtml(match.sourceName)} / p.${match.pageNumber}</h4>
                              <p class="muted">${escapeHtml(formatQuestionMatchConfidence(match))}</p>
                            </div>
                            <div class="card-row-meta">
                              <span class="meta-pill">${escapeHtml(match.matchedTokens.length)}語一致</span>
                              <span class="meta-pill">${escapeHtml(match.coverageLabel)}</span>
                            </div>
                          </div>
                          <p class="flashcard-note">${escapeHtml(match.snippet)}</p>
                          ${
                            match.matchedTokens.length
                              ? `<div class="card-row-meta">${renderPillRow(match.matchedTokens.slice(0, 6))}</div>`
                              : ""
                          }
                        </article>
                      `,
                    )
                    .join("")}
                </div>
              `
              : `
                <article class="subpanel">
                  <h4>はっきりした候補が見つかりませんでした</h4>
                  <p class="muted">設問文が短い場合は選択肢も入れ直すか、スライドPDFを科目ごとに分けると見つかりやすくなります。</p>
                </article>
              `
          }
        </article>
      `,
    )
    .join("");
}

function syncAssistantControls() {
  if (optionExists(assistantDeckFilter, state.assistant.deckFilter)) {
    assistantDeckFilter.value = state.assistant.deckFilter;
  }
}

function renderAssistant() {
  syncAssistantControls();
  assistantSubmitButton.disabled = isAssistantLoading;
  clearAssistantButton.disabled = isAssistantLoading;

  if (isAssistantLoading) {
    assistantStatus.textContent = "保存済みカードを検索しています。";
  } else if (assistantErrorMessage) {
    assistantStatus.textContent = assistantErrorMessage;
  }

  if (!state.assistant.messages.length) {
    if (!isAssistantLoading && !assistantErrorMessage) {
      assistantStatus.textContent =
        "医学や英語の質問に対して、保存済みカードだけから要点を返します。外部AIや課金APIは使いません。";
    }
    assistantMessages.innerHTML = `
      <article class="assistant-message">
        <div class="assistant-message-header">
          <h4>ローカル検索の使い方</h4>
        </div>
        <p>例: 「ネフローゼ症候群の4徴」「administer と prescribe の違い」「腎前性AKIのポイント」</p>
      </article>
    `;
    return;
  }

  const latestAssistant = [...state.assistant.messages].reverse().find((message) => message.role === "assistant");
  if (!isAssistantLoading && !assistantErrorMessage) {
    assistantStatus.textContent =
      latestAssistant && latestAssistant.matchCount > 0
        ? `最新の検索では保存済みカードから ${latestAssistant.matchCount} 件ヒットしました。`
        : "一致するカードが少ない場合は、キーワードを短くしたり参照範囲を切り替えると見つかりやすくなります。";
  }

  assistantMessages.innerHTML = state.assistant.messages
    .map((message) => {
      const sourceMarkup =
        message.role === "assistant" && message.sources?.length
          ? `
            <div class="assistant-sources">
              ${message.sources
                .map(
                  (source) =>
                    source.url
                      ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(
                          source.title || source.url,
                        )}</a>`
                      : `<span class="meta-pill">${escapeHtml(source.title)}</span>`,
                )
                .join("")}
            </div>
          `
          : "";

      const actionMarkup =
        message.role === "assistant"
          ? `
            <div class="button-row">
              <button class="ghost-button" data-make-assistant-cards="${message.id}" type="button">結果からカード候補化</button>
            </div>
          `
          : "";

      return `
        <article class="assistant-message ${message.role}">
          <div class="assistant-message-header">
            <h4>${escapeHtml(message.role === "assistant" ? "検索結果" : "あなた")}</h4>
            <span class="muted">${escapeHtml(formatMessageTime(message.createdAt))}</span>
          </div>
          <p>${escapeHtml(message.text).replaceAll("\n", "<br />")}</p>
          ${actionMarkup}
          ${sourceMarkup}
        </article>
      `;
    })
    .join("");
}

function renderDashboard() {
  const collections = buildDashboardDeckCollections();
  const pendingCount = cloudState.pendingRequests.length;

  renderDashboardDeckSection({
    decks: collections.medical,
    listElement: medicalDeckList,
    countElement: medicalDeckCount,
    emptyTitle: "医学のデッキがまだありません",
    emptyText: "解剖、生理、病態など、科目ごとにデッキを分けると管理しやすくなります。",
    emptyButtonLabel: "医学のデッキを作る",
    emptyFocus: "medical",
  });
  renderDashboardDeckSection({
    decks: collections.english,
    listElement: englishDeckList,
    countElement: englishDeckCount,
    emptyTitle: "英語のデッキがまだありません",
    emptyText: "医学英語、語彙、長文読解などで分けておくと、後から探しやすくなります。",
    emptyButtonLabel: "英語のデッキを作る",
    emptyFocus: "english",
  });

  if (generalDeckSection) {
    generalDeckSection.hidden = !collections.general.length;
  }
  renderDashboardDeckSection({
    decks: collections.general,
    listElement: generalDeckList,
    countElement: generalDeckCount,
    emptyTitle: "その他のデッキはありません",
    emptyText: "医学と英語以外の汎用デッキは、ここにまとまります。",
    emptyButtonLabel: "汎用デッキを作る",
    emptyFocus: "general",
  });

  renderDashboardDeckSection({
    decks: collections.ownedShared,
    listElement: ownedSharedDeckList,
    countElement: ownedSharedDeckCount,
    emptyTitle: "まだ共有しているデッキはありません",
    emptyText: "グループで使うデッキを作ると、ここから owner として管理できます。",
    emptyButtonLabel: "共有を開く",
    emptyFocus: "",
    emptyAction: "share",
  });
  renderDashboardDeckSection({
    decks: collections.joinedShared,
    listElement: joinedSharedDeckList,
    countElement: joinedSharedDeckCount,
    emptyTitle: "受け取った共有デッキはまだありません",
    emptyText: "共有リンクや招待されたデッキは、ここに並びます。",
    emptyButtonLabel: "共有を開く",
    emptyFocus: "",
    emptyAction: "share",
  });

  pendingShareLabel.textContent = pendingCount ? `${pendingCount}件` : "共有なし";
  pendingShareList.innerHTML = pendingCount
    ? cloudState.pendingRequests
        .slice(0, 4)
        .map(
          (request) => `
            <article class="library-card">
              <div class="card-row-header">
                <div>
                  <h4>${escapeHtml(request.deckName || "共有デッキ")}</h4>
                  <p class="muted">${escapeHtml(request.requesterEmail || "参加申請")} / 承認待ち</p>
                </div>
                <button class="ghost-button" data-open-share-panel="true" type="button">共有を開く</button>
              </div>
            </article>
          `,
        )
        .join("")
    : `
        <article class="library-card">
          <h4>いま承認待ちはありません</h4>
          <p class="muted">共有デッキを作ると、ここに参加申請が表示されます。</p>
          <div class="button-row">
            <button class="ghost-button" data-open-share-panel="true" type="button">共有を開く</button>
          </div>
        </article>
      `;

  renderHistoryPanel();
}

function buildDashboardDeckCollections() {
  const localDecks = state.decks.filter((deck) => deck.storageMode !== "shared");
  return {
    medical: sortDashboardDecks(localDecks.filter((deck) => deck.focus === "medical")),
    english: sortDashboardDecks(localDecks.filter((deck) => deck.focus === "english")),
    general: sortDashboardDecks(localDecks.filter((deck) => deck.focus === "general")),
    ownedShared: sortDashboardDecks(state.decks.filter((deck) => deck.storageMode === "shared" && deck.role === "owner")),
    joinedShared: sortDashboardDecks(
      state.decks.filter((deck) => deck.storageMode === "shared" && ["editor", "viewer"].includes(deck.role)),
    ),
  };
}

function sortDashboardDecks(decks) {
  return [...decks].sort((left, right) => {
    const leftSubject = String(left.subject || "").trim();
    const rightSubject = String(right.subject || "").trim();
    if (leftSubject && !rightSubject) {
      return -1;
    }
    if (!leftSubject && rightSubject) {
      return 1;
    }
    const subjectDiff = leftSubject.localeCompare(rightSubject, "ja");
    if (subjectDiff !== 0) {
      return subjectDiff;
    }
    return left.name.localeCompare(right.name, "ja");
  });
}

function renderDashboardDeckSection({
  decks,
  listElement,
  countElement,
  emptyTitle,
  emptyText,
  emptyButtonLabel,
  emptyFocus = "",
  emptyAction = "create",
}) {
  if (!listElement || !countElement) {
    return;
  }

  countElement.textContent = `${decks.length}件`;
  listElement.innerHTML = decks.length
    ? decks.map((deck) => buildDashboardDeckRow(deck)).join("")
    : `
        <article class="library-card board-empty-card">
          <h4>${escapeHtml(emptyTitle)}</h4>
          <p class="muted">${escapeHtml(emptyText)}</p>
          <div class="button-row">
            ${
              emptyAction === "share"
                ? '<button class="ghost-button" data-open-share-panel="true" type="button">共有を開く</button>'
                : `<button class="ghost-button" data-home-create-deck-focus="${escapeHtml(emptyFocus)}" type="button">${escapeHtml(emptyButtonLabel)}</button>`
            }
          </div>
        </article>
      `;
}

function buildDashboardDeckRow(deck) {
  const metrics = buildDashboardDeckMetrics(deck);
  const primaryLabel = deck.subject || deck.name;
  const supportingLine = [deck.subject ? deck.name : "", deck.description || ""].filter(Boolean).join(" / ");
  const canEdit = canEditDeckContent(deck);

  return `
    <article class="board-deck-row">
      <button class="board-deck-main" data-open-deck-detail="${deck.id}" type="button">
        <span class="board-status-dot ${metrics.statusClass}" aria-hidden="true"></span>
        <span class="board-deck-copy">
          <strong>${escapeHtml(primaryLabel)}</strong>
          <span class="muted">${escapeHtml(supportingLine || "説明はまだありません")}</span>
          <span class="board-meta-row">
            <span class="meta-pill">${metrics.cardCount}枚</span>
            <span class="meta-pill">復習待ち ${metrics.dueCount}枚</span>
            ${
              metrics.learningCount
                ? `<span class="meta-pill">学習中 ${metrics.learningCount}枚</span>`
                : ""
            }
            ${
              deck.storageMode === "shared"
                ? `<span class="meta-pill">${escapeHtml(formatRoleLabel(deck.role))}</span>`
                : ""
            }
          </span>
        </span>
      </button>
      <div class="board-deck-actions">
        <button class="ghost-button board-action-button" data-start-deck="${deck.id}" type="button">学習</button>
        <button
          class="secondary-button board-action-button"
          data-open-deck-sheet="${deck.id}"
          type="button"
          ${canEdit ? "" : "disabled"}
        >
          資料追加
        </button>
      </div>
    </article>
  `;
}

function buildDashboardDeckMetrics(deck) {
  const deckCards = state.cards.filter((card) => card.deckId === deck.id);
  const dueCount = deckCards.filter((card) => card.study.dueAt <= Date.now()).length;
  const learningCount = deckCards.filter((card) => card.study.mode === "learning" || card.study.mode === "relearning").length;

  if (dueCount > 0) {
    return {
      cardCount: deckCards.length,
      dueCount,
      learningCount,
      statusClass: "is-due",
    };
  }

  if (learningCount > 0) {
    return {
      cardCount: deckCards.length,
      dueCount,
      learningCount,
      statusClass: "is-learning",
    };
  }

  if (deck.storageMode === "shared") {
    return {
      cardCount: deckCards.length,
      dueCount,
      learningCount,
      statusClass: "is-shared",
    };
  }

  return {
    cardCount: deckCards.length,
    dueCount,
    learningCount,
    statusClass: "is-resting",
  };
}

function renderLibraryFilterControls() {
  const previousTag = libraryTagFilter.value || "all";
  const previousSubject = librarySubjectFilter.value || "all";
  const previousStorage = libraryStorageFilter.value || "all";
  const previousStudyState = libraryStudyStateFilter.value || "all";
  const tags = [...new Set(state.cards.flatMap((card) => card.tags || []))].sort();
  const subjects = [...new Set(state.decks.map((deck) => deck.subject).filter(Boolean))].sort();

  libraryTagFilter.innerHTML =
    '<option value="all">すべてのタグ</option>' +
    tags.map((tag) => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`).join("");
  librarySubjectFilter.innerHTML =
    '<option value="all">すべての分野</option>' +
    subjects.map((subject) => `<option value="${escapeHtml(subject)}">${escapeHtml(subject)}</option>`).join("");
  libraryStorageFilter.innerHTML = `
    <option value="all">ローカル / 共有 すべて</option>
    <option value="local">ローカルのみ</option>
    <option value="shared">共有のみ</option>
  `;
  libraryStudyStateFilter.innerHTML = `
    <option value="all">すべての学習状態</option>
    <option value="new">新規</option>
    <option value="learning">学習中</option>
    <option value="review">定着レビュー</option>
    <option value="relearning">再学習</option>
  `;

  if (optionExists(libraryTagFilter, previousTag)) {
    libraryTagFilter.value = previousTag;
  }
  if (optionExists(librarySubjectFilter, previousSubject)) {
    librarySubjectFilter.value = previousSubject;
  }
  if (optionExists(libraryStorageFilter, previousStorage)) {
    libraryStorageFilter.value = previousStorage;
  }
  if (optionExists(libraryStudyStateFilter, previousStudyState)) {
    libraryStudyStateFilter.value = previousStudyState;
  }
}

function renderTrackGrid() {
  if (typeof trackGrid === "undefined" || !trackGrid) {
    return;
  }

  trackGrid.innerHTML = TRACKS.map((track) => {
    const summary = buildTrackSummary(track.id);

    return `
      <article class="track-card ${track.id}">
        <div class="track-card-header">
          <div>
            <p class="eyebrow">${escapeHtml(track.eyebrow)}</p>
            <h3>${escapeHtml(track.title)}</h3>
          </div>
          <span class="meta-pill ${track.id}">${summary.deckCount}デッキ</span>
        </div>
        <p class="muted">${escapeHtml(track.description)}</p>
        <div class="track-stats">
          <div class="track-stat">
            <span class="eyebrow">復習待ち</span>
            <strong>${summary.dueCount}</strong>
          </div>
          <div class="track-stat">
            <span class="eyebrow">カード枚数</span>
            <strong>${summary.cardCount}</strong>
          </div>
          <div class="track-stat">
            <span class="eyebrow">分野</span>
            <strong>${escapeHtml(summary.subjectCountLabel)}</strong>
          </div>
        </div>
        <p class="muted">${escapeHtml(summary.subjectLine)}</p>
        <div class="button-row">
          <button class="secondary-button" data-study-focus="${track.id}" type="button">${escapeHtml(
            track.id === "medical" ? "医学を学習" : "英語を学習",
          )}</button>
          <button class="ghost-button" data-install-track="${track.id}" type="button">${escapeHtml(
            track.id === "medical" ? "医学スターター追加" : "英語スターター追加",
          )}</button>
        </div>
      </article>
    `;
  }).join("");
}

function buildTrackSummary(focus) {
  const trackDecks = state.decks.filter((deck) => deck.focus === focus);
  const trackCards = state.cards.filter((card) => getDeckFocus(card.deckId) === focus);
  const dueCount = trackCards.filter((card) => card.study.dueAt <= Date.now()).length;
  const subjects = [...new Set(trackDecks.map((deck) => deck.subject).filter(Boolean))];
  const track = TRACKS.find((item) => item.id === focus);

  return {
    deckCount: trackDecks.length,
    cardCount: trackCards.length,
    dueCount,
    subjectCountLabel: subjects.length > 0 ? `${subjects.length}分野` : "準備中",
    subjectLine:
      subjects.length > 0 ? `分野: ${subjects.slice(0, 4).join(" / ")}` : track?.recommendation || "スターターを追加できます。",
  };
}

function buildStudySourceGroups() {
  const filter = studyDeckFilter.value || "all";
  const candidateCards = state.cards.filter((card) => matchesCardFilter(card, filter));
  const reviewStats = buildStudyReviewStats(candidateCards);
  const now = Date.now();
  const weakCandidates = candidateCards
    .map((card) => ({
      card,
      score: scoreStudyWeakness(card, reviewStats.get(card.id)),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || right.card.updatedAt - left.card.updatedAt)
    .map((item) => item.card);

  return {
    due: {
      key: "due",
      title: "復習待ち",
      description: "期限が来たカードを優先して通常復習に戻します。",
      cards: candidateCards
        .filter((card) => card.study.dueAt <= now)
        .sort((left, right) => left.study.dueAt - right.study.dueAt),
    },
    again: {
      key: "again",
      title: "直近ミス",
      description: "最近の不正解が多いカードだけを先に回します。",
      cards: candidateCards
        .filter((card) => (reviewStats.get(card.id)?.againRecent || 0) > 0 || reviewStats.get(card.id)?.lastRating === "again")
        .sort(
          (left, right) =>
            (reviewStats.get(right.id)?.againRecent || 0) - (reviewStats.get(left.id)?.againRecent || 0) ||
            right.updatedAt - left.updatedAt,
        ),
    },
    hard: {
      key: "hard",
      title: "あいまい多め",
      description: "惜しい回答や学習中カードを固めて解きます。",
      cards: candidateCards
        .filter(
          (card) =>
            (reviewStats.get(card.id)?.hardRecent || 0) > 0 ||
            reviewStats.get(card.id)?.lastRating === "hard" ||
            card.study.mode === "learning" ||
            card.study.mode === "relearning",
        )
        .sort(
          (left, right) =>
            (reviewStats.get(right.id)?.hardRecent || 0) - (reviewStats.get(left.id)?.hardRecent || 0) ||
            right.updatedAt - left.updatedAt,
        ),
    },
    weak: {
      key: "weak",
      title: "伸び悩み",
      description: "ミス回数や lapse を見て、今つまずいているカードをまとめます。",
      cards: weakCandidates,
    },
    all: {
      key: "all",
      title: "全カード",
      description: "対象デッキのカードから広く出題します。",
      cards: [...candidateCards].sort((left, right) => right.updatedAt - left.updatedAt),
    },
  };
}

function buildStudyReviewStats(cards) {
  const cardIds = new Set(cards.map((card) => card.id));
  const stats = new Map();
  const now = Date.now();

  state.reviewLog.forEach((entry) => {
    if (!cardIds.has(entry.cardId)) {
      return;
    }

    const current = stats.get(entry.cardId) || {
      againRecent: 0,
      hardRecent: 0,
      totalRecent: 0,
      lastRating: "",
      lastTimestamp: 0,
    };
    const ageMs = now - Number(entry.timestamp || 0);
    if (ageMs <= 21 * dayMs) {
      current.totalRecent += 1;
      if (entry.rating === "again") {
        current.againRecent += 1;
      }
      if (entry.rating === "hard") {
        current.hardRecent += 1;
      }
    }

    if (Number(entry.timestamp || 0) >= current.lastTimestamp) {
      current.lastTimestamp = Number(entry.timestamp || 0);
      current.lastRating = String(entry.rating || "");
    }

    stats.set(entry.cardId, current);
  });

  return stats;
}

function scoreStudyWeakness(card, stats = {}) {
  let score = 0;
  score += Number(stats.againRecent || 0) * 5;
  score += Number(stats.hardRecent || 0) * 3;
  score += Number(card.study.lapses || 0) * 4;
  if (card.study.mode === "relearning") {
    score += 4;
  } else if (card.study.mode === "learning") {
    score += 2;
  }
  if ((card.study.intervalDays || 0) < 3) {
    score += 1;
  }
  if (stats.lastRating === "again") {
    score += 3;
  } else if (stats.lastRating === "hard") {
    score += 1;
  }

  return score;
}

function renderStudy() {
  const groups = buildStudySourceGroups();
  const source = groups[studySourceKey] || groups.due;
  const sourceCards = source.cards;
  const choiceReadyCards = sourceCards.filter((card) => canBuildChoiceOptions(card, sourceCards));
  const size = clampNumber(Number.parseInt(studySessionSizeInput.value, 10), 3, 20, 8);
  studySessionSize = size;
  studySessionSizeInput.value = String(size);

  studyModeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.studyMode === studyMode);
  });
  startStudySessionButton.hidden = studyMode === "review";
  startStudySessionButton.textContent = studyMode === "choice" ? "4択クイズを作る" : "小テストを作る";
  studyModeSummary.textContent =
    studyMode === "review"
      ? `${source.title} を中心に、通常の復習キューとして回します。`
      : `${source.title} から ${Math.min(studySessionSize, studyMode === "choice" ? choiceReadyCards.length : sourceCards.length)} 問を選び、${studyMode === "choice" ? "4択クイズ" : "記述小テスト"}を作ります。`;
  studySmartListGrid.innerHTML = ["due", "again", "hard", "weak"]
    .map((key) => {
      const item = groups[key];
      return `
        <article class="library-card ${studySourceKey === key ? "is-selected-card" : ""}">
          <div class="card-row-header">
            <div>
              <h4>${escapeHtml(item.title)}</h4>
              <p class="muted">${escapeHtml(item.description)}</p>
            </div>
            <span class="meta-pill">${item.cards.length}枚</span>
          </div>
          <div class="button-row">
            <button class="${studySourceKey === key ? "primary-button" : "ghost-button"}" data-study-source="${key}" type="button">
              ${studySourceKey === key ? "現在の出題元" : "このリストを使う"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  if (studyMode === "review") {
    renderReviewStudy(sourceCards);
    return;
  }

  if (!studySession || studySession.mode !== studyMode || studySession.sourceKey !== studySourceKey) {
    renderStudySessionPending(source, size, choiceReadyCards.length);
    return;
  }

  if (studySession.index >= studySession.items.length) {
    renderStudySessionComplete(source);
    return;
  }

  if (studyMode === "test") {
    renderShortQuizStudy(source);
    return;
  }

  renderChoiceQuizStudy(source);
}

function renderReviewStudy(queue) {
  const currentCard = pickCurrentCard(queue);
  const deck = currentCard ? getDeckById(currentCard.deckId) : null;

  reviewFeedbackPanel.hidden = false;
  shortQuizFeedbackPanel.hidden = true;
  choiceQuizFeedbackPanel.hidden = true;
  toggleAnswerButton.hidden = false;
  shortQuizRevealButton.hidden = true;
  shortQuizNextButton.hidden = true;
  choiceQuizNextButton.hidden = true;
  flashcard.classList.toggle("is-hidden", !currentCard);
  shortQuizCard.classList.add("is-hidden");
  choiceQuizCard.classList.add("is-hidden");

  if (!currentCard) {
    showStudyEmpty({
      eyebrow: "いまは空き時間",
      title: "今は復習待ちのカードがありません",
      text: "カードを追加するか、弱点リストへ切り替えて小テストから回すこともできます。",
    });
    studyProgress.textContent = "復習待ちはありません。「作成」タブからカードを追加できます。";
    toggleAnswerButton.disabled = true;
    renderRatingHints(null);
    return;
  }

  emptyState.classList.add("is-hidden");
  toggleAnswerButton.disabled = false;
  cardFront.textContent = currentCard.front;
  cardBack.textContent = currentCard.back;
  setElementCopy(
    cardDeckName,
    [getDeckName(currentCard.deckId), deck?.subject || formatDeckFocus(deck?.focus), formatStudyMode(currentCard.study)]
      .filter(Boolean)
      .join(" · "),
  );
  setElementCopy(cardTopic, currentCard.topic ? `テーマ: ${currentCard.topic}` : deck?.subject ? `テーマ: ${deck.subject}` : "");
  cardTags.innerHTML = renderPillRow(currentCard.tags || [], deck?.focus || "general");
  cardTags.hidden = !(currentCard.tags || []).length;
  setElementCopy(cardHint, currentCard.hint);
  setElementCopy(cardNote, currentCard.note);
  setElementCopy(cardExample, currentCard.example ? `例: ${currentCard.example}` : "");
  answerArea.classList.toggle("is-hidden", !isAnswerVisible);
  toggleAnswerButton.textContent = isAnswerVisible ? "答えを隠す" : "答えを見る";
  studyProgress.textContent = `${queue.length}枚の対象カードがあります。現在は${formatStudyMode(currentCard.study)}フェーズです。`;
  renderRatingHints(currentCard);
}

function renderStudySessionPending(source, size, choiceReadyCount = 0) {
  const readyCount = studyMode === "choice" ? choiceReadyCount : source.cards.length;
  const sessionCount = Math.min(size, readyCount);
  reviewFeedbackPanel.hidden = studyMode !== "review";
  shortQuizFeedbackPanel.hidden = studyMode !== "test";
  choiceQuizFeedbackPanel.hidden = studyMode !== "choice";
  flashcard.classList.add("is-hidden");
  shortQuizCard.classList.add("is-hidden");
  choiceQuizCard.classList.add("is-hidden");
  toggleAnswerButton.hidden = true;
  shortQuizRevealButton.hidden = true;
  shortQuizNextButton.hidden = true;
  choiceQuizNextButton.hidden = true;
  showStudyEmpty({
    eyebrow: studyMode === "choice" ? "4択準備" : "小テスト準備",
    title: readyCount
      ? `${source.title} から ${sessionCount} 問の${studyMode === "choice" ? "4択クイズ" : "小テスト"}を作れます`
      : `${source.title} に使えるカードがまだありません`,
    text: readyCount
      ? studyMode === "choice"
        ? "上の「セッションを作る」を押すと、その場で4択の出題セットを組みます。"
        : "上の「セッションを作る」を押すと、その場で出題セットを組みます。"
      : "出題元を変えるか、まず通常復習で回答履歴を増やすと弱点リストが育ちます。",
  });
  if (studyMode === "test") {
    shortQuizProgress.textContent = "まずは小テストを作ると、ここに進捗が出ます。";
  } else {
    choiceQuizStatus.textContent = readyCount
      ? "4択クイズを作ると、選択結果がここに出ます。"
      : "4択は答え候補が4つ以上そろうカードから自動生成されます。";
    choiceQuizScore.textContent = readyCount
      ? "まだセッションは始まっていません。"
      : "別のデッキを選ぶか、カード数を増やすと始めやすくなります。";
  }
}

function renderStudySessionComplete(source) {
  const summary = buildStudySessionSummary(studySession);
  reviewFeedbackPanel.hidden = studyMode !== "review";
  shortQuizFeedbackPanel.hidden = studyMode !== "test";
  choiceQuizFeedbackPanel.hidden = studyMode !== "choice";
  flashcard.classList.add("is-hidden");
  shortQuizCard.classList.add("is-hidden");
  choiceQuizCard.classList.add("is-hidden");
  toggleAnswerButton.hidden = true;
  shortQuizRevealButton.hidden = true;
  shortQuizNextButton.hidden = true;
  choiceQuizNextButton.hidden = true;
  showStudyEmpty({
    eyebrow: "セッション完了",
    title: `${source.title} の${studyMode === "choice" ? "4択クイズ" : "小テスト"}が終わりました`,
    text:
      studyMode === "choice"
        ? `正解 ${summary.good} / ${summary.total} 問でした。間違えた問題は復習待ちへ戻しています。`
        : `正解 ${summary.good}、惜しい ${summary.hard}、不正解 ${summary.again} でした。弱点リストへ戻して再挑戦できます。`,
  });
  if (studyMode === "test") {
    shortQuizProgress.textContent = `正解 ${summary.good} / 惜しい ${summary.hard} / 不正解 ${summary.again}`;
  } else {
    choiceQuizStatus.textContent = "4択クイズを完了しました。";
    choiceQuizScore.textContent = `正解 ${summary.good} / ${summary.total} 問`;
  }
}

function renderShortQuizStudy(source) {
  const item = getCurrentStudySessionItem();
  const card = item ? getCardById(item.cardId) : null;
  const deck = card ? getDeckById(card.deckId) : null;

  reviewFeedbackPanel.hidden = true;
  shortQuizFeedbackPanel.hidden = false;
  choiceQuizFeedbackPanel.hidden = true;
  flashcard.classList.add("is-hidden");
  shortQuizCard.classList.toggle("is-hidden", !card);
  choiceQuizCard.classList.add("is-hidden");
  toggleAnswerButton.hidden = true;
  shortQuizRevealButton.hidden = !card || item.revealed;
  shortQuizNextButton.hidden = true;
  choiceQuizNextButton.hidden = true;

  if (!card || !item) {
    renderStudySessionPending(source, studySessionSize);
    return;
  }

  emptyState.classList.add("is-hidden");
  shortQuizFront.textContent = card.front;
  setElementCopy(shortQuizMeta, `${getDeckName(card.deckId)} · ${item.index + 1}/${studySession.items.length}`);
  setElementCopy(shortQuizTopic, card.topic ? `テーマ: ${card.topic}` : deck?.subject ? `テーマ: ${deck.subject}` : "");
  shortQuizTags.innerHTML = renderPillRow(card.tags || [], deck?.focus || "general");
  shortQuizTags.hidden = !(card.tags || []).length;
  shortQuizAnswerInput.value = item.typedAnswer || "";
  shortQuizAnswerInput.disabled = item.revealed;
  shortQuizAnswerArea.classList.toggle("is-hidden", !item.revealed);
  shortQuizBack.textContent = card.back;
  setElementCopy(shortQuizHint, card.hint);
  setElementCopy(shortQuizNote, card.note);
  setElementCopy(shortQuizExample, card.example ? `例: ${card.example}` : "");

  const summary = buildStudySessionSummary(studySession);
  shortQuizProgress.textContent = item.revealed
    ? `第${item.index + 1}問を採点してください。現在の集計: 正解 ${summary.good} / 惜しい ${summary.hard} / 不正解 ${summary.again}`
    : `第${item.index + 1}問 / ${studySession.items.length}問。${source.title} から出題しています。`;
}

function renderChoiceQuizStudy(source) {
  const item = getCurrentStudySessionItem();
  const card = item ? getCardById(item.cardId) : null;
  const deck = card ? getDeckById(card.deckId) : null;

  reviewFeedbackPanel.hidden = true;
  shortQuizFeedbackPanel.hidden = true;
  choiceQuizFeedbackPanel.hidden = false;
  flashcard.classList.add("is-hidden");
  shortQuizCard.classList.add("is-hidden");
  choiceQuizCard.classList.toggle("is-hidden", !card);
  toggleAnswerButton.hidden = true;
  shortQuizRevealButton.hidden = true;
  shortQuizNextButton.hidden = true;
  choiceQuizNextButton.hidden = !item || !item.answered;

  if (!card || !item) {
    renderStudySessionPending(source, studySessionSize);
    return;
  }

  emptyState.classList.add("is-hidden");
  choiceQuizFront.textContent = card.front;
  setElementCopy(choiceQuizMeta, `${getDeckName(card.deckId)} · ${item.index + 1}/${studySession.items.length}`);
  setElementCopy(choiceQuizTopic, card.topic ? `テーマ: ${card.topic}` : deck?.subject ? `テーマ: ${deck.subject}` : "");
  choiceQuizTags.innerHTML = renderPillRow(card.tags || [], deck?.focus || "general");
  choiceQuizTags.hidden = !(card.tags || []).length;
  choiceQuizOptions.innerHTML = item.choiceOptions
    .map((option, index) => {
      const isSelected = item.selectedOptionId === option.id;
      const isCorrect = item.answered && option.id === card.id;
      const isWrong = item.answered && isSelected && option.id !== card.id;
      const className = isCorrect ? "correct" : isWrong ? "wrong" : "";

      return `
        <button
          class="ghost-button quiz-option ${className}"
          data-choice-option-id="${option.id}"
          type="button"
          ${item.answered ? "disabled" : ""}
        >
          <span class="eyebrow">選択肢 ${index + 1}</span>
          <strong>${escapeHtml(option.label)}</strong>
        </button>
      `;
    })
    .join("");

  choiceQuizAnswerArea.classList.toggle("is-hidden", !item.answered);
  choiceQuizBack.textContent = card.back;
  setElementCopy(choiceQuizHint, card.hint);
  setElementCopy(choiceQuizNote, card.note);
  setElementCopy(choiceQuizExample, card.example ? `例: ${card.example}` : "");
  const summary = buildStudySessionSummary(studySession);
  choiceQuizStatus.textContent = item.answered
    ? item.selectedOptionId === card.id
      ? "正解です。解説を確認して次へ進めます。"
      : "不正解です。正解と解説を確認してから次へ進めます。"
    : `第${item.index + 1}問 / ${studySession.items.length}問。1つ選んでください。`;
  choiceQuizScore.textContent = `現在の正解数: ${summary.good} / ${studySession.items.length}`;
}

function showStudyEmpty({ eyebrow, title, text }) {
  emptyState.classList.remove("is-hidden");
  emptyStateEyebrow.textContent = eyebrow;
  emptyStateTitle.textContent = title;
  emptyStateText.textContent = text;
}

function pickCurrentCard(queue) {
  if (!queue.length) {
    currentCardId = null;
    isAnswerVisible = false;
    return null;
  }

  const stillExists = queue.find((card) => card.id === currentCardId);
  const selected = stillExists || queue[0];

  if (!stillExists) {
    currentCardId = selected.id;
    isAnswerVisible = false;
  }

  return selected;
}

function startStudySession() {
  if (studyMode === "review") {
    showToast("復習モードではそのままカードを回せます");
    return;
  }

  const groups = buildStudySourceGroups();
  const source = groups[studySourceKey] || groups.due;
  const cards =
    studyMode === "choice"
      ? source.cards.filter((card) => canBuildChoiceOptions(card, source.cards))
      : source.cards;
  const size = clampNumber(Number.parseInt(studySessionSizeInput.value, 10), 3, 20, 8);
  studySessionSize = size;
  studySessionSizeInput.value = String(size);

  if (!cards.length) {
    showToast(studyMode === "choice" ? "4択に使えるカードがまだありません" : "小テストに使えるカードがまだありません");
    renderStudy();
    return;
  }

  studySession = buildStudySession(studyMode, cards, size);
  currentCardId = null;
  isAnswerVisible = false;
  renderStudy();
  showToast(studyMode === "choice" ? "4択クイズを作成しました" : "小テストを作成しました");
}

function buildStudySession(mode, cards, size) {
  const selectedCards = shuffleList([...cards]).slice(0, Math.min(size, cards.length));

  return {
    id: crypto.randomUUID(),
    mode,
    sourceKey: studySourceKey,
    items: selectedCards.map((card) => ({
      cardId: card.id,
      typedAnswer: "",
      revealed: false,
      answered: false,
      rating: "",
      selectedOptionId: "",
      choiceOptions: mode === "choice" ? buildChoiceOptions(card, cards) : [],
    })),
    index: 0,
  };
}

function getCurrentStudySessionItem() {
  if (!studySession || studySession.index >= studySession.items.length) {
    return null;
  }

  return studySession.items[studySession.index];
}

function revealShortQuizAnswer() {
  const item = getCurrentStudySessionItem();
  if (!item || studyMode !== "test") {
    return;
  }

  item.typedAnswer = String(shortQuizAnswerInput.value || "").trim();
  item.revealed = true;
  renderStudy();
}

function gradeShortQuiz(rating) {
  const item = getCurrentStudySessionItem();
  const card = item ? getCardById(item.cardId) : null;
  if (!item || !card) {
    return;
  }

  if (!item.revealed) {
    showToast("先に答えを確認してください");
    return;
  }

  item.typedAnswer = String(shortQuizAnswerInput.value || "").trim();
  item.answered = true;
  item.rating = rating;
  recordPracticeResult(card, rating, "quiz-test");
  advanceStudySession();
}

function handleChoiceQuizActions(event) {
  const optionButton = event.target.closest("[data-choice-option-id]");
  if (!optionButton || studyMode !== "choice") {
    return;
  }

  const item = getCurrentStudySessionItem();
  const card = item ? getCardById(item.cardId) : null;
  if (!item || !card || item.answered) {
    return;
  }

  item.selectedOptionId = optionButton.dataset.choiceOptionId;
  item.answered = true;
  item.rating = item.selectedOptionId === card.id ? "good" : "again";
  recordPracticeResult(card, item.rating, "quiz-choice");
  render();
}

function advanceStudySession() {
  const item = getCurrentStudySessionItem();
  if (!item || !item.answered) {
    return;
  }

  shortQuizAnswerInput.value = "";
  if (studySession.index < studySession.items.length) {
    studySession.index += 1;
  }
  render();
}

function recordPracticeResult(card, rating, sessionType) {
  const now = Date.now();
  card.updatedAt = now;
  card.study.reps = (card.study.reps || 0) + 1;
  card.study.lastReviewedAt = now;

  if (rating === "again") {
    card.study.dueAt = Math.min(card.study.dueAt, now);
    card.study.lapses = (card.study.lapses || 0) + 1;
  } else if (rating === "hard") {
    card.study.dueAt = Math.min(card.study.dueAt, now + 2 * hourMs);
  }

  state.reviewLog.push({
    id: crypto.randomUUID(),
    cardId: card.id,
    rating,
    timestamp: now,
    dateKey: formatDateKey(new Date(now)),
    mode: card.study.mode,
    intervalDays: card.study.intervalDays,
    sessionType,
  });
  state.reviewLog = state.reviewLog.slice(-400);
  persist();
  syncSharedProgressForCard(card, rating).catch((error) => {
    console.warn("Failed to sync shared progress:", error);
  });
}

function buildStudySessionSummary(session) {
  const summary = { total: session?.items?.length || 0, good: 0, hard: 0, again: 0 };
  (session?.items || []).forEach((item) => {
    if (item.rating === "good") {
      summary.good += 1;
    } else if (item.rating === "hard") {
      summary.hard += 1;
    } else if (item.rating === "again") {
      summary.again += 1;
    }
  });
  return summary;
}

function buildChoiceOptions(card, sourceCards) {
  const correctLabel = buildChoiceLabel(card.back);
  const distractorPool = getChoiceDistractorPool(card, sourceCards);
  const distractors = distractorPool.slice(0, 3);
  const options = [
    { id: card.id, label: correctLabel },
    ...distractors.map((candidate) => ({ id: candidate.id, label: buildChoiceLabel(candidate.back) })),
  ];

  return shuffleList(options).slice(0, 4);
}

function buildChoiceLabel(text) {
  return cleanImportedSegment(String(text || "").split(/[。.\n]/)[0] || String(text || "")).slice(0, 90);
}

function isChoiceEligibleCard(card) {
  return Boolean(card && cleanImportedSegment(card.back).length >= 2 && cleanImportedSegment(card.back).length <= 120);
}

function getChoiceDistractorPool(card, sourceCards) {
  const correctLabel = buildChoiceLabel(card.back);
  return shuffleList(
    dedupeById(
      [...sourceCards, ...state.cards]
        .filter((candidate) => candidate.id !== card.id)
        .filter((candidate) => isChoiceEligibleCard(candidate))
        .filter((candidate) => buildChoiceLabel(candidate.back) !== correctLabel),
    ),
  );
}

function canBuildChoiceOptions(card, sourceCards) {
  if (!isChoiceEligibleCard(card)) {
    return false;
  }

  return getChoiceDistractorPool(card, sourceCards).length >= 3;
}

function dedupeById(items) {
  const seen = new Set();
  return (items || []).filter((item) => {
    if (!item || seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

function shuffleList(items) {
  const list = [...items];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }
  return list;
}

function handleStudySmartListActions(event) {
  const sourceButton = event.target.closest("[data-study-source]");
  if (!sourceButton) {
    return;
  }

  setStudySource(sourceButton.dataset.studySource);
}

function renderLibrary() {
  const filter = libraryDeckFilter.value || "all";
  const tagFilter = libraryTagFilter.value || "all";
  const subjectFilter = librarySubjectFilter.value || "all";
  const storageFilter = libraryStorageFilter.value || "all";
  const studyStateFilter = libraryStudyStateFilter.value || "all";
  const textFilter = String(libraryTextFilter.value || "").trim().toLowerCase();
  const items = state.cards
    .filter((card) => matchesCardFilter(card, filter))
    .filter((card) => (tagFilter === "all" ? true : (card.tags || []).includes(tagFilter)))
    .filter((card) => (subjectFilter === "all" ? true : (getDeckById(card.deckId)?.subject || "") === subjectFilter))
    .filter((card) => {
      if (storageFilter === "all") {
        return true;
      }
      return (getDeckById(card.deckId)?.storageMode || "local") === storageFilter;
    })
    .filter((card) => (studyStateFilter === "all" ? true : card.study.mode === studyStateFilter))
    .filter((card) => {
      if (!textFilter) {
        return true;
      }
      return [card.front, card.back, card.topic, card.note, card.example, ...(card.tags || []), getDeckName(card.deckId)]
        .join(" ")
        .toLowerCase()
        .includes(textFilter);
    });

  if (!items.length) {
    libraryList.innerHTML = `
      <article class="library-card">
        <h4>表示できるカードがありません</h4>
        <p class="muted">デッキやカードを追加するとここに並びます。</p>
      </article>
    `;
    return;
  }

  libraryList.innerHTML = items
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((card) => {
      const nextReview = formatDueLabel(card.study.dueAt);
      const deck = getDeckById(card.deckId);
      const canEdit = canEditDeckContent(deck);

      return `
        <article class="library-card">
          <div class="card-row-header">
            <div>
              <h4>${escapeHtml(card.front)}</h4>
              <p class="muted">${escapeHtml(card.back)}</p>
            </div>
            <div class="button-row">
              <button class="ghost-button" data-open-deck-detail="${card.deckId}" type="button">デッキ詳細</button>
              <button class="ghost-button" data-edit-card="${card.id}" type="button" ${canEdit ? "" : "disabled"}>編集</button>
              <button class="ghost-button danger-button" data-delete-card="${card.id}" type="button" ${canEdit ? "" : "disabled"}>削除</button>
            </div>
          </div>
          ${card.note ? `<p class="flashcard-note">${escapeHtml(card.note)}</p>` : ""}
          ${card.example ? `<p class="flashcard-example">${escapeHtml(card.example)}</p>` : ""}
          <div class="card-row-meta">
            <span class="meta-pill">${escapeHtml(getDeckName(card.deckId))}</span>
            <span class="meta-pill ${escapeHtml(deck?.focus || "general")}">${escapeHtml(
              formatDeckFocus(deck?.focus),
            )}</span>
            ${card.topic ? `<span class="meta-pill">${escapeHtml(card.topic)}</span>` : deck?.subject ? `<span class="meta-pill">${escapeHtml(deck.subject)}</span>` : ""}
            <span class="meta-pill">${escapeHtml(formatStudyMode(card.study))}</span>
            <span class="meta-pill">次回 ${escapeHtml(nextReview)}</span>
            <span class="meta-pill">間隔 ${escapeHtml(formatInterval(card.study.intervalDays))}</span>
          </div>
          ${(card.tags || []).length ? `<div class="card-row-meta">${renderPillRow(card.tags, deck?.focus || "general")}</div>` : ""}
        </article>
      `;
    })
    .join("");
}

function renderDeckDetail() {
  const deck = getDeckById(selectedDeckDetailId);
  deckDetailTitle.textContent = deck?.name || "デッキ詳細";
  deckDetailTabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.deckDetailTab === deckDetailTab);
  });

  if (!deck) {
    deckDetailContent.innerHTML = `
      <article class="library-card">
        <h4>デッキを選ぶと詳細が見られます</h4>
        <p class="muted">一覧の「デッキ詳細」から、概要・カード・共有・学習状況を切り替えられます。</p>
      </article>
    `;
    return;
  }

  const deckCards = state.cards.filter((card) => card.deckId === deck.id);
  const dueCount = deckCards.filter((card) => card.study.dueAt <= Date.now()).length;

  if (deckDetailTab === "cards") {
    deckDetailContent.innerHTML = deckCards.length
      ? deckCards
          .slice()
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 8)
          .map(
            (card) => `
              <article class="library-card">
                <div class="card-row-header">
                  <div>
                    <h4>${escapeHtml(card.front)}</h4>
                    <p class="muted">${escapeHtml(card.back)}</p>
                  </div>
                  <button class="ghost-button" data-edit-card="${card.id}" type="button" ${canEditDeckContent(deck) ? "" : "disabled"}>編集</button>
                </div>
                <div class="card-row-meta">
                  ${card.topic ? `<span class="meta-pill">${escapeHtml(card.topic)}</span>` : ""}
                  ${(card.tags || []).slice(0, 4).map((tag) => `<span class="meta-pill">${escapeHtml(tag)}</span>`).join("")}
                </div>
              </article>
            `,
          )
          .join("")
      : `
          <article class="library-card">
            <h4>カードはまだありません</h4>
            <p class="muted">「作成」タブからカード追加や PDF 取り込みを行えます。</p>
          </article>
        `;
    return;
  }

  if (deckDetailTab === "share") {
    const canEdit = canEditDeckContent(deck);
    const canManage = canManageDeckShare(deck);
    deckDetailContent.innerHTML = `
      <article class="library-card">
        <h4>${escapeHtml(deck.storageMode === "shared" ? "共有デッキ" : "ローカルデッキ")}</h4>
        <p class="muted">${escapeHtml(deck.storageMode === "shared" ? "共有リンクで他メンバーと共同編集できます。" : "必要なときだけ共有デッキ化できます。")}</p>
        <div class="card-row-meta">
          <span class="meta-pill">${escapeHtml(formatStorageMode(deck.storageMode))}</span>
          ${deck.role ? `<span class="meta-pill">${escapeHtml(formatRoleLabel(deck.role))}</span>` : ""}
          <span class="meta-pill">${escapeHtml(formatSyncState(deck.syncState))}</span>
        </div>
        <div class="button-row">
          <button class="primary-button" data-share-deck="${deck.id}" type="button" ${canEdit ? "" : "disabled"}>共有する</button>
          <button class="ghost-button" data-sync-deck="${deck.id}" type="button" ${deck.storageMode === "shared" ? "" : "disabled"}>同期</button>
          <button class="ghost-button" data-duplicate-deck="${deck.id}" type="button">自分用に複製</button>
          <button class="ghost-button" data-regenerate-share="${deck.id}" type="button" ${canManage ? "" : "disabled"}>リンク再発行</button>
          <button
            class="ghost-button danger-button"
            data-stop-share="${deck.id}"
            type="button"
            ${deck.storageMode === "shared" && cloudState.session?.user ? "" : "disabled"}
          >
            ${canManage ? "共有をやめる" : "共有から抜ける"}
          </button>
        </div>
      </article>
      ${renderShareRequestsMarkup(deck, canManage)}
      ${
        deck.storageMode === "shared"
          ? renderShareMembersMarkup(deck, canManage)
          : `
              <article class="library-card">
                <h4>共有後のメンバー管理</h4>
                <p class="muted">共有リンクを作ると、ここから承認・ロール変更・共有終了をまとめて管理できます。</p>
              </article>
            `
      }
    `;
    return;
  }

  if (deckDetailTab === "status") {
    deckDetailContent.innerHTML = `
      <article class="library-card">
        <h4>学習状況</h4>
        <div class="card-row-meta">
          <span class="meta-pill">${deckCards.length}枚</span>
          <span class="meta-pill">復習待ち ${dueCount}枚</span>
          <span class="meta-pill">${escapeHtml(formatStorageMode(deck.storageMode))}</span>
        </div>
        <p class="muted">共有デッキでも、学習進捗はユーザーごとに分離して保持します。</p>
      </article>
    `;
    return;
  }

  deckDetailContent.innerHTML = `
    <article class="library-card">
      <h4>${escapeHtml(deck.name)}</h4>
      <p class="muted">${escapeHtml(deck.description || "説明はまだありません")}</p>
      <div class="card-row-meta">
        <span class="meta-pill ${escapeHtml(deck.focus)}">${escapeHtml(formatDeckFocus(deck.focus))}</span>
        ${deck.subject ? `<span class="meta-pill">${escapeHtml(deck.subject)}</span>` : ""}
        <span class="meta-pill">${escapeHtml(formatStorageMode(deck.storageMode))}</span>
      </div>
    </article>
    <article class="library-card">
      <h4>このデッキでできること</h4>
      <div class="button-row">
        <button class="primary-button" data-start-deck="${deck.id}" type="button">このデッキを学習</button>
        <button class="ghost-button" data-edit-deck="${deck.id}" type="button" ${canEditDeckContent(deck) ? "" : "disabled"}>編集</button>
      </div>
    </article>
  `;
}

function handleDeckSubmit(event) {
  event.preventDefault();
  const formData = new FormData(deckForm);
  const deckId = String(formData.get("deckId") || "").trim();
  const name = String(formData.get("deckName") || "").trim();
  const focus = String(formData.get("deckFocus") || "medical").trim();
  const subject = String(formData.get("deckSubject") || "").trim();
  const description = String(formData.get("deckDescription") || "").trim();

  if (!name) {
    showToast("デッキ名を入力してください");
    return;
  }

  if (deckId) {
    const deck = getDeckById(deckId);
    if (!deck) {
      showToast("編集中のデッキが見つかりません");
      clearDeckEditing();
      render();
      return;
    }

    if (!canEditDeckContent(deck)) {
      showToast("この共有デッキは編集できません");
      return;
    }

    deck.name = name;
    deck.focus = normalizeDeckFocus(focus);
    deck.subject = subject;
    deck.description = description;
    deck.updatedAt = Date.now();
    markDeckDirty(deck.id);
    clearDeckEditing();
    persist();
    render();
    showToast("デッキを更新しました");
    return;
  }

  const deck = {
    id: crypto.randomUUID(),
    name,
    focus: normalizeDeckFocus(focus),
    subject,
    description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    storageMode: "local",
    role: "owner",
    syncState: "local-only",
  };

  state.decks.unshift(deck);
  clearDeckEditing();
  persist();
  render();
  cardDeckId.value = deck.id;
  showToast("デッキを追加しました");
}

function handleCardSubmit(event) {
  event.preventDefault();
  const formData = new FormData(cardForm);
  const cardId = String(formData.get("cardId") || "").trim();
  const deckId = String(formData.get("cardDeckId") || "");
  const front = String(formData.get("cardFront") || "").trim();
  const back = String(formData.get("cardBack") || "").trim();
  const hint = String(formData.get("cardHint") || "").trim();
  const topic = String(formData.get("cardTopic") || "").trim();
  const tags = parseTags(String(formData.get("cardTags") || ""));
  const note = String(formData.get("cardNote") || "").trim();
  const example = String(formData.get("cardExample") || "").trim();

  if (!deckId || !front || !back) {
    showToast("カードの必須項目を入力してください");
    return;
  }

  const targetDeck = getDeckById(deckId);
  if (!targetDeck) {
    showToast("保存先デッキが見つかりません");
    return;
  }

  if (!canEditDeckContent(targetDeck)) {
    showToast("この共有デッキにはカードを追加できません");
    return;
  }

  const now = Date.now();

  if (cardId) {
    const card = getCardById(cardId);
    if (!card) {
      showToast("編集中のカードが見つかりません");
      clearCardEditing();
      render();
      return;
    }

    if (!canEditDeckContent(getDeckById(card.deckId))) {
      showToast("この共有デッキのカードは編集できません");
      return;
    }

    const previousDeckId = card.deckId;
    card.deckId = deckId;
    card.front = front;
    card.back = back;
    card.hint = hint;
    card.topic = topic;
    card.tags = tags;
    card.note = note;
    card.example = example;
    card.updatedAt = now;
    markDeckDirty(previousDeckId);
    markDeckDirty(deckId);
    clearCardEditing();
    persist();
    render();
    showToast("カードを更新しました");
    return;
  }

  state.cards.unshift({
    id: crypto.randomUUID(),
    deckId,
    front,
    back,
    hint,
    topic,
    tags,
    note,
    example,
    createdAt: now,
    updatedAt: now,
    study: {
      dueAt: now,
      intervalDays: 0,
      ease: 2.3,
      reps: 0,
      lapses: 0,
      lastReviewedAt: null,
      mode: "new",
      stepIndex: -1,
      recoveryDays: 1,
    },
    sharedCardId: "",
  });

  targetDeck.updatedAt = now;
  markDeckDirty(deckId);
  clearCardEditing();
  persist();
  render();
  cardDeckId.value = deckId;
  showToast("カードを保存しました");
}

async function handleImportSubmit(event) {
  event.preventDefault();
  importStatus.textContent = "資料を分析しています。少し待つと候補が表示されます。";

  try {
    const source = await loadImportSource();
    const focus = normalizeDeckFocus(importFocusInput.value);
    const limit = clampNumber(Number.parseInt(importLimitInput.value, 10), 4, 30, 12);
    importLimitInput.value = String(limit);
    const deckName = (importDeckNameInput.value || "").trim() || buildDeckNameFromSource(source.sourceName);
    importDeckNameInput.value = deckName;

    importDraft = buildImportDraft({
      text: source.text,
      sourceName: source.sourceName,
      deckName,
      focus,
      subject: String(importSubjectInput.value || "").trim(),
      instructions: String(importInstructionsInput.value || "").trim(),
      limit,
    });
    importDraft.targetDeckId = importContextDeckId || "";

    renderImportPanel();
    showToast(`${importDraft.cards.length}枚の候補を作成しました`);
  } catch (error) {
    importDraft = null;
    renderImportPanel();
    importStatus.textContent = error.message || "資料の分析に失敗しました。";
    showToast(error.message || "資料の分析に失敗しました");
  }
}

async function handleQuestionMapSubmit(event) {
  event.preventDefault();
  if (isQuestionMapLoading) {
    return;
  }

  questionMapDraft = null;
  questionMapErrorMessage = "";
  isQuestionMapLoading = true;
  renderQuestionMapPanel();

  try {
    const topMatches = clampNumber(Number.parseInt(questionMapTopMatchesInput.value, 10), 1, 5, 3);
    questionMapTopMatchesInput.value = String(topMatches);
    const sources = await loadQuestionMapSources();
    questionMapErrorMessage = "";
    questionMapDraft = buildQuestionMapDraft({
      questionSource: sources.questionSource,
      slidePages: sources.slidePages,
      topMatches,
    });
    renderQuestionMapPanel();
    showToast(
      questionMapDraft.matchedQuestionCount > 0
        ? `${questionMapDraft.matchedQuestionCount}問で関連スライド候補を見つけました`
        : "関連スライド候補は見つかりませんでした",
    );
  } catch (error) {
    questionMapDraft = null;
    questionMapErrorMessage = error.message || "過去問とスライドの対応づけに失敗しました。";
    showToast(error.message || "過去問参照の解析に失敗しました");
  } finally {
    isQuestionMapLoading = false;
    renderQuestionMapPanel();
  }
}

async function handleAssistantSubmit(event) {
  event.preventDefault();
  const question = String(assistantInput.value || "").trim();

  if (!question || isAssistantLoading) {
    return;
  }

  const userMessage = {
    id: crypto.randomUUID(),
    role: "user",
    text: question,
    createdAt: Date.now(),
  };

  state.assistant.messages.push(userMessage);
  state.assistant.messages = state.assistant.messages.slice(-16);
  assistantInput.value = "";
  isAssistantLoading = true;
  assistantErrorMessage = "";
  assistantStatus.textContent = "保存済みカードを検索しています。";
  persist();
  renderAssistant();

  try {
    const response = await requestAssistantAnswer(question);
    state.assistant.messages.push({
      id: crypto.randomUUID(),
      role: "assistant",
      text: response.answer,
      createdAt: Date.now(),
      sources: response.sources || [],
      matchCount: response.matchCount || 0,
    });
    state.assistant.messages = state.assistant.messages.slice(-16);
    assistantErrorMessage = "";
    persist();
    renderAssistant();
    showToast(
      response.matchCount > 0
        ? `${response.matchCount}件の関連カードを見つけました`
        : "一致するカードは見つかりませんでした",
    );
  } catch (error) {
    assistantErrorMessage = error.message || "ローカル検索に失敗しました。";
    assistantStatus.textContent = assistantErrorMessage;
    showToast(assistantErrorMessage);
  } finally {
    isAssistantLoading = false;
    renderAssistant();
  }
}

function handleDeckActions(event) {
  const createButton = event.target.closest("[data-home-create-deck-focus]");
  if (createButton) {
    openDeckComposer(createButton.dataset.homeCreateDeckFocus || "medical");
    return;
  }

  const sharePanelButton = event.target.closest("[data-open-share-panel]");
  if (sharePanelButton) {
    openShareManager();
    return;
  }

  const detailButton = event.target.closest("[data-open-deck-detail]");
  if (detailButton) {
    selectedDeckDetailId = detailButton.dataset.openDeckDetail;
    deckDetailTab = "overview";
    switchSection("assistant");
    return;
  }

  const startButton = event.target.closest("[data-start-deck]");
  if (startButton) {
    studyDeckFilter.value = startButton.dataset.startDeck;
    currentCardId = null;
    isAnswerVisible = false;
    switchSection("study");
    return;
  }

  const sheetButton = event.target.closest("[data-open-deck-sheet]");
  if (sheetButton) {
    openDeckActionModal(sheetButton.dataset.openDeckSheet);
    return;
  }

  const editButton = event.target.closest("[data-edit-deck]");
  if (editButton) {
    startDeckEditing(editButton.dataset.editDeck);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-deck]");
  if (deleteButton) {
    deleteDeck(deleteButton.dataset.deleteDeck);
  }
}

function handleTrackActions(event) {
  const studyButton = event.target.closest("[data-study-focus]");
  if (studyButton) {
    studyDeckFilter.value = `focus:${studyButton.dataset.studyFocus}`;
    currentCardId = null;
    isAnswerVisible = false;
    switchSection("study");
    return;
  }

  const installButton = event.target.closest("[data-install-track]");
  if (installButton) {
    installStarterPack(installButton.dataset.installTrack);
  }
}

function handleHomeQuickActions(event) {
  const actionButton = event.target.closest("[data-ui-action]");
  if (!actionButton) {
    return;
  }

  runUiShortcut(actionButton.dataset.uiAction, {
    focus: actionButton.dataset.uiFocus || "",
    mode: actionButton.dataset.uiMode || "",
  });
}

function handleGuideActions(event) {
  const actionButton = event.target.closest("[data-ui-action]");
  if (!actionButton) {
    return;
  }

  runUiShortcut(actionButton.dataset.uiAction, {
    focus: actionButton.dataset.uiFocus || "",
    mode: actionButton.dataset.uiMode || "",
  });
}

function handleLibraryActions(event) {
  const detailButton = event.target.closest("[data-open-deck-detail]");
  if (detailButton) {
    selectedDeckDetailId = detailButton.dataset.openDeckDetail;
    deckDetailTab = "overview";
    renderDeckDetail();
    return;
  }

  const editButton = event.target.closest("[data-edit-card]");
  if (editButton) {
    startCardEditing(editButton.dataset.editCard);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-card]");
  if (deleteButton) {
    deleteCard(deleteButton.dataset.deleteCard);
  }
}

function handleDeckDetailActions(event) {
  const startButton = event.target.closest("[data-start-deck]");
  if (startButton) {
    studyDeckFilter.value = startButton.dataset.startDeck;
    currentCardId = null;
    isAnswerVisible = false;
    switchSection("study");
    return;
  }

  const editDeckButton = event.target.closest("[data-edit-deck]");
  if (editDeckButton) {
    startDeckEditing(editDeckButton.dataset.editDeck);
    return;
  }

  const editCardButton = event.target.closest("[data-edit-card]");
  if (editCardButton) {
    startCardEditing(editCardButton.dataset.editCard);
    return;
  }

  const shareButton = event.target.closest("[data-share-deck]");
  if (shareButton) {
    shareDeckSelect.value = shareButton.dataset.shareDeck;
    shareDeck();
    return;
  }

  const syncButton = event.target.closest("[data-sync-deck]");
  if (syncButton) {
    shareDeckSelect.value = syncButton.dataset.syncDeck;
    syncSelectedSharedDeck();
    return;
  }

  const duplicateButton = event.target.closest("[data-duplicate-deck]");
  if (duplicateButton) {
    shareDeckSelect.value = duplicateButton.dataset.duplicateDeck;
    duplicateSelectedDeck();
    return;
  }

  const approveButton = event.target.closest("[data-approve-request]");
  if (approveButton) {
    approveShareRequest(approveButton.dataset.approveRequest, approveButton.dataset.approvedRole || "viewer");
    return;
  }

  const rejectButton = event.target.closest("[data-reject-request]");
  if (rejectButton) {
    rejectShareRequest(rejectButton.dataset.rejectRequest);
    return;
  }

  const changeMemberRoleButton = event.target.closest("[data-change-member-role]");
  if (changeMemberRoleButton) {
    changeDeckMemberRole(
      changeMemberRoleButton.dataset.deckId,
      changeMemberRoleButton.dataset.changeMemberRole,
      changeMemberRoleButton.dataset.nextRole,
    );
    return;
  }

  const removeMemberButton = event.target.closest("[data-remove-member]");
  if (removeMemberButton) {
    removeDeckMember(removeMemberButton.dataset.deckId, removeMemberButton.dataset.removeMember);
    return;
  }

  const regenerateButton = event.target.closest("[data-regenerate-share]");
  if (regenerateButton) {
    regenerateShareLinkForDeck(regenerateButton.dataset.regenerateShare);
    return;
  }

  const stopShareButton = event.target.closest("[data-stop-share]");
  if (stopShareButton) {
    stopOrLeaveDeck(stopShareButton.dataset.stopShare);
  }
}

function handleImportPreviewActions(event) {
  const toggleButton = event.target.closest("[data-toggle-import-card]");
  if (toggleButton && importDraft) {
    if (toggleButton.checked) {
      importSelection.add(toggleButton.dataset.toggleImportCard);
    } else {
      importSelection.delete(toggleButton.dataset.toggleImportCard);
    }
    renderImportPanel();
    return;
  }

  const removeButton = event.target.closest("[data-remove-import-card]");
  if (!removeButton || !importDraft) {
    return;
  }

  importDraft.cards = importDraft.cards.filter((card) => card.id !== removeButton.dataset.removeImportCard);
  importSelection.delete(removeButton.dataset.removeImportCard);

  if (!importDraft.cards.length) {
    clearImportDraft();
    showToast("候補がなくなったので下書きを消しました");
    return;
  }

  renderImportPanel();
  showToast("候補を1枚外しました");
}

function selectAllImportCandidates() {
  if (!importDraft) {
    return;
  }

  importSelection = new Set(importDraft.cards.map((card) => card.id));
  renderImportPanel();
  showToast("候補をすべて選択しました");
}

function clearImportSelection() {
  importSelection.clear();
  renderImportPanel();
  if (importDraft) {
    showToast("候補の選択を解除しました");
  }
}

function removeSelectedImportCandidates() {
  if (!importDraft || !importSelection.size) {
    showToast("削除する候補を選択してください");
    return;
  }

  importDraft.cards = importDraft.cards.filter((card) => !importSelection.has(card.id));
  const removedCount = importSelection.size;
  importSelection.clear();

  if (!importDraft.cards.length) {
    clearImportDraft();
    showToast("選択した候補を削除した結果、下書きが空になりました");
    return;
  }

  renderImportPanel();
  showToast(`${removedCount}枚の候補を削除しました`);
}

function dedupeImportCandidates() {
  if (!importDraft) {
    return;
  }

  const before = importDraft.cards.length;
  importDraft.cards = dedupeImportCards(importDraft.cards);
  importSelection = new Set(importDraft.cards.map((card) => card.id).filter((id) => importSelection.has(id)));
  renderImportPanel();
  showToast(before === importDraft.cards.length ? "重複候補は見つかりませんでした" : `${before - importDraft.cards.length}件の重複候補を統合しました`);
}

function applyBulkImportTags() {
  if (!importDraft) {
    return;
  }

  const targetIds = importSelection.size ? importSelection : new Set(importDraft.cards.map((card) => card.id));
  const tags = parseTags(bulkImportTagsInput.value);
  if (!tags.length) {
    showToast("追加するタグを入力してください");
    return;
  }

  importDraft.cards = importDraft.cards.map((card) =>
    targetIds.has(card.id)
      ? {
          ...card,
          tags: dedupeTags([...(card.tags || []), ...tags]),
        }
      : card,
  );
  renderImportPanel();
  showToast(`${targetIds.size}枚の候補にタグを追加しました`);
}

function handleAssistantSettingsChange() {
  state.assistant.deckFilter = assistantDeckFilter.value || "all";
  assistantErrorMessage = "";
  persist();
  renderAssistant();
}

function clearAssistantHistory() {
  state.assistant.messages = [];
  assistantErrorMessage = "";
  persist();
  renderAssistant();
  showToast("ローカル検索の履歴を消しました");
}

function handleAssistantActions(event) {
  const makeCardsButton = event.target.closest("[data-make-assistant-cards]");
  if (!makeCardsButton) {
    return;
  }

  const message = state.assistant.messages.find((item) => item.id === makeCardsButton.dataset.makeAssistantCards);
  if (!message) {
    showToast("対象の回答が見つかりません");
    return;
  }

  try {
    const focus = inferAssistantFocus(state.assistant.deckFilter);
    const selectedTarget = searchCardifyTarget.value || "new";
    const targetDeck = selectedTarget === "new" ? null : getDeckById(selectedTarget);
    const deckName = targetDeck ? targetDeck.name : buildDeckNameFromSource(`ローカル検索 ${formatDateKey(new Date())}`);
    importDraft = buildImportDraft({
      text: message.text,
      sourceName: "ローカル検索結果",
      deckName,
      focus,
      subject: focus === "medical" ? "ローカル検索要点" : focus === "english" ? "Local Search Notes" : "ローカル検索要点",
      instructions: "ローカル検索の結果からカード候補化",
      limit: 12,
    });
    importDraft.targetDeckId = targetDeck?.id || "";
    importFocusInput.value = focus;
    importDeckNameInput.value = deckName;
    if (targetDeck && optionExists(cardDeckId, targetDeck.id)) {
      cardDeckId.value = targetDeck.id;
    }
    if (targetDeck && optionExists(shareDeckSelect, targetDeck.id)) {
      shareDeckSelect.value = targetDeck.id;
    }
    switchSection("manage");
    render();
    showToast(targetDeck ? "ローカル検索結果を既存デッキへ追加する候補にしました" : "ローカル検索結果からカード候補を作成しました");
  } catch (error) {
    showToast(error.message || "カード候補化に失敗しました");
  }
}

function saveImportDraftAsDeck() {
  if (!importDraft || !importDraft.cards.length) {
    showToast("保存できる候補がありません");
    return;
  }

  const now = Date.now();
  const targetDeck = getDeckById(importDraft.targetDeckId);
  const deckId = targetDeck?.id || crypto.randomUUID();
  const deckName = targetDeck ? targetDeck.name : createUniqueDeckName(importDraft.deckName);
  const descriptionBase = importDraft.sourceName ? `${importDraft.sourceName} から自動生成` : "資料から自動生成";

  if (targetDeck && !canEditDeckContent(targetDeck)) {
    showToast("この共有デッキにはカードを追加できません");
    return;
  }

  if (!targetDeck) {
    state.decks.unshift({
      id: deckId,
      name: deckName,
      focus: importDraft.focus,
      subject: importDraft.subject,
      description: importDraft.instructions ? `${descriptionBase} / ${importDraft.instructions}` : descriptionBase,
      createdAt: now,
      storageMode: "local",
      role: "owner",
      syncState: "local-only",
    });
  } else {
    targetDeck.updatedAt = now;
    targetDeck.subject = targetDeck.subject || importDraft.subject;
    if (!targetDeck.description) {
      targetDeck.description = importDraft.instructions ? `${descriptionBase} / ${importDraft.instructions}` : descriptionBase;
    }
  }

  importDraft.cards
    .slice()
    .reverse()
    .forEach((card, index) => {
      state.cards.unshift(
        makeCard({
          id: crypto.randomUUID(),
          deckId,
          front: card.front,
          back: card.back,
          hint: card.hint || "",
          topic: card.topic || importDraft.subject,
          tags: card.tags || [],
          note: card.note || "",
          example: card.example || "",
          createdAt: now + index,
          dueAt: now,
          intervalDays: 0,
          sharedCardId: "",
        }),
      );
    });

  const cardCount = importDraft.cards.length;
  markDeckDirty(deckId);
  clearImportDraft();
  persist();
  render();
  studyDeckFilter.value = deckId;
  libraryDeckFilter.value = deckId;
  cardDeckId.value = deckId;
  shareDeckSelect.value = deckId;
  applyCardContextPlaceholders();
  showToast(targetDeck ? `${deckName} に ${cardCount} 枚追加しました` : `${deckName} を作成しました（${cardCount}枚）`);
}

async function requestAssistantAnswer(question) {
  const matches = findAssistantMatches(question, state.assistant.deckFilter);
  return buildAssistantLocalResponse(question, matches, state.assistant.deckFilter);
}

function findAssistantMatches(question, filter) {
  const tokens = tokenizeSearchText(question);
  return state.cards
    .filter((card) => matchesCardFilter(card, filter || "all"))
    .map((card) => ({ card, score: scoreCardAgainstTokens(card, tokens) }))
    .filter((item) => item.score > 0 || !tokens.length)
    .sort((a, b) => b.score - a.score || b.card.updatedAt - a.card.updatedAt)
    .slice(0, 18);
}

function tokenizeSearchText(text) {
  const matches = String(text || "").match(/[A-Za-z0-9+\-]+|[ぁ-んァ-ヶー一-龠]{2,}/g) || [];
  return [...new Set(matches.map((token) => token.toLowerCase()).filter((token) => token.length >= 2))];
}

function scoreCardAgainstTokens(card, tokens) {
  if (!tokens.length) {
    return 1;
  }

  const weightedFields = [
    { text: card.front, weight: 4 },
    { text: card.back, weight: 3 },
    { text: card.topic, weight: 2 },
    { text: card.note, weight: 2 },
    { text: card.hint, weight: 1 },
    { text: card.example, weight: 1 },
    { text: (card.tags || []).join(" "), weight: 2 },
    { text: getDeckName(card.deckId), weight: 2 },
    { text: getDeckById(card.deckId)?.subject || "", weight: 2 },
  ].map((field) => ({ ...field, text: String(field.text || "").toLowerCase() }));

  return tokens.reduce(
    (score, token) =>
      score +
      weightedFields.reduce(
        (fieldScore, field) => (field.text.includes(token) ? fieldScore + field.weight : fieldScore),
        0,
      ),
    0,
  );
}

function buildAssistantLocalResponse(question, matches, filter) {
  const filterLabel = getAssistantFilterLabel(filter);

  if (!matches.length) {
    return {
      answer: [
        `参照範囲「${filterLabel}」の保存済みカードからは、一致する内容が見つかりませんでした。`,
        "キーワードを短くするか、参照範囲を切り替えてもう一度検索してください。",
        "まだ未登録の内容なら、カード追加や PDF 取り込みを先に行うと検索できるようになります。",
      ].join("\n"),
      sources: [],
      matchCount: 0,
    };
  }

  const topMatches = matches.slice(0, 4);
  const lines = [`質問: ${question}`, "", `参照範囲「${filterLabel}」の保存済みカードから ${matches.length} 件見つかりました。`, "", "要点"];

  topMatches.forEach(({ card }, index) => {
    lines.push(`${index + 1}. ${card.front}`);
    lines.push(`答え: ${card.back}`);
    if (card.note) {
      lines.push(`補足: ${card.note}`);
    } else if (card.hint) {
      lines.push(`ヒント: ${card.hint}`);
    }

    if (card.example) {
      lines.push(`例: ${card.example}`);
    }

    lines.push(`出典: ${buildAssistantSourceLabel(card)}`);
    lines.push("");
  });

  if (matches.length > topMatches.length) {
    lines.push(`他にも ${matches.length - topMatches.length} 件の関連カードがあります。参照範囲を絞ると見やすくなります。`);
    lines.push("");
  }

  const relatedDecks = dedupeTags(topMatches.map(({ card }) => getDeckName(card.deckId)));
  if (relatedDecks.length) {
    lines.push(`関連デッキ: ${relatedDecks.join(" / ")}`);
  }

  return {
    answer: lines.join("\n").trim(),
    sources: topMatches.map(({ card }) => ({ title: buildAssistantSourceLabel(card) })),
    matchCount: matches.length,
  };
}

function getAssistantFilterLabel(filter) {
  if (!filter || filter === "all") {
    return "すべてのデッキ";
  }

  if (filter.startsWith("focus:")) {
    const focus = filter.slice("focus:".length);
    return TRACKS.find((track) => track.id === focus)?.title || `${formatDeckFocus(focus)}トラック`;
  }

  return getDeckName(filter);
}

function buildAssistantSourceLabel(card) {
  const deck = getDeckById(card.deckId);
  return [deck?.name || "未分類", deck?.subject || "", card.topic || ""]
    .filter(Boolean)
    .join(" / ");
}

function startDeckEditing(deckId) {
  const deck = getDeckById(deckId);
  if (!deck) {
    showToast("デッキが見つかりません");
    return;
  }

  if (!canEditDeckContent(deck)) {
    showToast("この共有デッキは編集できません");
    return;
  }

  clearCardEditing();
  editingDeckId = deck.id;
  setCreateMode("deck");
  switchSection("manage");
  renderForms();
}

function startCardEditing(cardId) {
  const card = getCardById(cardId);
  if (!card) {
    showToast("カードが見つかりません");
    return;
  }

  if (!canEditDeckContent(getDeckById(card.deckId))) {
    showToast("この共有デッキのカードは編集できません");
    return;
  }

  clearDeckEditing();
  editingCardId = card.id;
  setCreateMode("card");
  switchSection("manage");
  renderForms();
}

function deleteDeck(deckId) {
  if (state.decks.length <= 1) {
    showToast("最後のデッキは削除できません");
    return;
  }

  const deck = getDeckById(deckId);
  if (!deck) {
    showToast("デッキが見つかりません");
    return;
  }

  if (deck.storageMode === "shared") {
    showToast("共有デッキの削除は未対応です。必要なら自分用に複製して管理してください");
    return;
  }

  const cardIds = state.cards.filter((card) => card.deckId === deckId).map((card) => card.id);
  const approved = window.confirm(
    `「${deck.name}」を削除します。関連する${cardIds.length}枚のカードも削除されます。続けますか？`,
  );

  if (!approved) {
    return;
  }

  if (!canEditDeckContent(deck)) {
    showToast("この共有デッキは削除できません");
    return;
  }

  state.decks = state.decks.filter((item) => item.id !== deckId);
  state.cards = state.cards.filter((card) => card.deckId !== deckId);
  state.reviewLog = state.reviewLog.filter((entry) => !cardIds.includes(entry.cardId));

  if (editingDeckId === deckId) {
    clearDeckEditing();
  }

  if (editingCardId && !getCardById(editingCardId)) {
    clearCardEditing();
  }

  if (currentCardId && !getCardById(currentCardId)) {
    currentCardId = null;
    isAnswerVisible = false;
  }

  persist();
  render();
  showToast("デッキを削除しました");
}

function deleteCard(cardId) {
  const card = getCardById(cardId);
  if (!card) {
    showToast("カードが見つかりません");
    return;
  }

  const approved = window.confirm(`「${card.front}」を削除します。続けますか？`);
  if (!approved) {
    return;
  }

  if (!canEditDeckContent(getDeckById(card.deckId))) {
    showToast("この共有デッキのカードは削除できません");
    return;
  }

  state.cards = state.cards.filter((item) => item.id !== cardId);
  state.reviewLog = state.reviewLog.filter((entry) => entry.cardId !== cardId);
  markDeckDirty(card.deckId);

  if (editingCardId === cardId) {
    clearCardEditing();
  }

  if (currentCardId === cardId) {
    currentCardId = null;
    isAnswerVisible = false;
  }

  persist();
  render();
  showToast("カードを削除しました");
}

function reviewCurrentCard(rating) {
  const card = getCardById(currentCardId);
  if (!card) {
    showToast("学習できるカードがありません");
    return;
  }

  const now = Date.now();
  const outcome = calculateReviewOutcome(card, rating, now);
  card.updatedAt = now;
  card.study = {
    ...card.study,
    ...outcome.study,
    reps: (card.study.reps || 0) + 1,
    lastReviewedAt: now,
  };

  state.reviewLog.push({
    id: crypto.randomUUID(),
    cardId: card.id,
    rating,
    timestamp: now,
    dateKey: formatDateKey(new Date(now)),
    mode: card.study.mode,
    intervalDays: card.study.intervalDays,
  });

  state.reviewLog = state.reviewLog.slice(-250);
  currentCardId = null;
  isAnswerVisible = false;
  persist();
  render();
  syncSharedProgressForCard(card, rating).catch((error) => {
    console.warn("Failed to sync shared progress:", error);
  });
  showToast(outcome.toast);
}

function toggleAnswer() {
  if (!currentCardId) {
    showToast("まずは学習できるカードを選びます");
    return;
  }

  isAnswerVisible = !isAnswerVisible;
  answerArea.classList.toggle("is-hidden", !isAnswerVisible);
  toggleAnswerButton.textContent = isAnswerVisible ? "答えを隠す" : "答えを見る";
}

function clearDeckEditing() {
  editingDeckId = null;
  deckForm.reset();
  deckIdInput.value = "";
  deckFocusInput.value = "medical";
  applyDeckFocusPreset();
}

function clearCardEditing() {
  editingCardId = null;
  cardForm.reset();
  cardIdInput.value = "";
  applyCardContextPlaceholders();
}

function clearImportDraft() {
  importDraft = null;
  importSelection.clear();
  importForm.reset();
  importLimitInput.value = "12";
  const contextDeck = getDeckById(importContextDeckId);
  importFocusInput.value = contextDeck ? normalizeDeckFocus(contextDeck.focus) : "medical";
  if (contextDeck) {
    importDeckNameInput.value = contextDeck.name;
    importSubjectInput.value = contextDeck.subject || "";
  }
  applyImportFocusPreset();
  renderImportPanel();
}

function clearQuestionMapDraft() {
  questionMapDraft = null;
  isQuestionMapLoading = false;
  questionMapErrorMessage = "";
  questionMapForm.reset();
  questionMapTopMatchesInput.value = "3";
  renderQuestionMapPanel();
  showToast("過去問参照の結果を消しました");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

function applyDeckFocusPreset() {
  const focus = normalizeDeckFocus(deckFocusInput.value);

  if (focus === "medical") {
    deckSubjectInput.placeholder = "解剖 / 生理 / 病理 / 薬理 / 内科";
    deckDescriptionInput.placeholder = "例: 症候から病態を引けるようにする復習デッキ";
    return;
  }

  if (focus === "english") {
    deckSubjectInput.placeholder = "医学英語 / 語彙 / 読解 / リスニング";
    deckDescriptionInput.placeholder = "例: 医学英語と長文読解を分けて反復する";
    return;
  }

  deckSubjectInput.placeholder = "テーマ / 分野";
  deckDescriptionInput.placeholder = "用途やテーマを短く書く";
}

function applyCardContextPlaceholders() {
  const focus = getDeckFocus(cardDeckId.value);

  if (focus === "medical") {
    cardHintInput.placeholder = "病態の流れや鑑別のヒント";
    cardTopicInput.placeholder = "解剖 / 生理 / 病理 / 薬理 / 症候";
    cardTagsInput.placeholder = "循環, 腎, 呼吸, 必修";
    cardNoteInput.placeholder = "臨床ポイント、鑑別、関連知識を残す";
    cardExampleInput.placeholder = "症例ベースの覚え方や所見のつなぎ方";
    return;
  }

  if (focus === "english") {
    cardHintInput.placeholder = "語源、言い換え、読み方のヒント";
    cardTopicInput.placeholder = "医学英語 / 語彙 / 読解 / 構文";
    cardTagsInput.placeholder = "vocabulary, reading, phrase, medical english";
    cardNoteInput.placeholder = "語法メモ、似た表現、論文での使い分け";
    cardExampleInput.placeholder = "例文や英文のまま覚えたいフレーズ";
    return;
  }

  cardHintInput.placeholder = "例文や覚え方のヒント";
  cardTopicInput.placeholder = "テーマ";
  cardTagsInput.placeholder = "タグをカンマ区切りで入力";
  cardNoteInput.placeholder = "重要な関連知識や使い分けを記録";
  cardExampleInput.placeholder = "例文や症例ベースの覚え方";
}

function applyImportFocusPreset() {
  const focus = normalizeDeckFocus(importFocusInput.value);

  if (focus === "medical") {
    importSubjectInput.placeholder = "腎 / 循環 / 呼吸 / 解剖 / 病理";
    importDeckNameInput.placeholder = "腎生理講義 / 循環器総論";
    importInstructionsInput.placeholder = "例: 定義を優先して12枚、病態の流れが分かる形で";
    return;
  }

  if (focus === "english") {
    importSubjectInput.placeholder = "医学英語 / 語彙 / 読解 / リスニング";
    importDeckNameInput.placeholder = "Medical English Handout / 英語長文";
    importInstructionsInput.placeholder = "例: 語彙は例文付き、構文は意味が取りやすい形で";
    return;
  }

  importSubjectInput.placeholder = "テーマ / 分野";
  importDeckNameInput.placeholder = "資料から作る新規デッキ";
  importInstructionsInput.placeholder = "例: 覚えるべき定義と要点を優先";
}

function syncImportDeckNameFromFile() {
  const file = importFileInput.files?.[0];
  if (!file) {
    return;
  }

  if (!importDeckNameInput.value.trim()) {
    importDeckNameInput.value = buildDeckNameFromSource(file.name);
  }
}

function getStudyQueue() {
  const filter = studyDeckFilter.value || "all";
  const now = Date.now();

  return state.cards
    .filter((card) => matchesCardFilter(card, filter))
    .filter((card) => card.study.dueAt <= now)
    .sort((a, b) => a.study.dueAt - b.study.dueAt);
}

function matchesCardFilter(card, filter) {
  if (!filter || filter === "all") {
    return true;
  }

  if (filter.startsWith("focus:")) {
    return getDeckFocus(card.deckId) === filter.slice("focus:".length);
  }

  return card.deckId === filter;
}

function installStarterPack(focus) {
  const starterDecks = STARTER_PACKS[focus];
  if (!starterDecks) {
    return;
  }

  let addedDecks = 0;
  let addedCards = 0;
  let latestDeckId = "";
  const now = Date.now();

  starterDecks.forEach((starterDeck, deckIndex) => {
    if (state.decks.some((deck) => deck.name === starterDeck.name)) {
      return;
    }

    const deckId = crypto.randomUUID();
    latestDeckId = deckId;
    state.decks.unshift({
      id: deckId,
      name: starterDeck.name,
      focus,
      subject: starterDeck.subject,
      description: starterDeck.description,
      createdAt: now - deckIndex * hourMs,
    });
    addedDecks += 1;

    starterDeck.cards.forEach((starterCard, cardIndex) => {
      state.cards.unshift(
        makeCard({
          id: crypto.randomUUID(),
          deckId,
          front: starterCard.front,
          back: starterCard.back,
          hint: starterCard.hint,
          topic: starterCard.topic,
          tags: starterCard.tags,
          note: starterCard.note,
          example: starterCard.example,
          createdAt: now - (deckIndex * starterDeck.cards.length + cardIndex + 1) * minuteMs,
          dueAt: now + (starterCard.dueOffset || 0),
          intervalDays: starterCard.intervalDays || 0,
        }),
      );
      addedCards += 1;
    });
  });

  if (!addedDecks) {
    showToast(`${formatDeckFocus(focus)}スターターはすでに追加済みです`);
    return;
  }

  clearDeckEditing();
  clearCardEditing();
  persist();
  render();

  if (latestDeckId && optionExists(cardDeckId, latestDeckId)) {
    cardDeckId.value = latestDeckId;
    applyCardContextPlaceholders();
  }

  showToast(`${formatDeckFocus(focus)}スターターを追加しました（${addedDecks}デッキ / ${addedCards}枚）`);
}

async function loadImportSource() {
  const file = importFileInput.files?.[0] || null;
  const pastedText = String(importTextInput.value || "").trim();

  if (!file && !pastedText) {
    throw new Error("PDFまたは本文を入れてください");
  }

  if (file) {
    const sourceName = file.name || "imported file";
    if (!importDeckNameInput.value.trim()) {
      importDeckNameInput.value = buildDeckNameFromSource(sourceName);
    }

    if (isPdfFile(file)) {
      const text = await extractTextFromPdf(file);
      return { text, sourceName };
    }

    const text = await file.text();
    if (!text.trim()) {
      throw new Error("ファイルから文字を読み取れませんでした");
    }

    return { text, sourceName };
  }

  return { text: pastedText, sourceName: "貼り付けテキスト" };
}

async function loadQuestionMapSources() {
  const questionFile = questionMapQuestionFileInput.files?.[0] || null;
  const questionText = String(questionMapQuestionTextInput.value || "").trim();
  const slideFiles = [...(questionMapSlideFileInput.files || [])];
  const slideText = String(questionMapSlideTextInput.value || "").trim();

  if (!questionFile && !questionText) {
    throw new Error("まず過去問 PDF か過去問本文を入れてください");
  }

  if (!slideFiles.length && !slideText) {
    throw new Error("次に講義スライド PDF かスライド本文を入れてください");
  }

  const questionSource = await loadQuestionMapQuestionSource(questionFile, questionText);
  const slidePages = await loadQuestionMapSlidePages(slideFiles, slideText);

  if (!slidePages.length) {
    throw new Error("スライド側から文字を読み取れませんでした");
  }

  return { questionSource, slidePages };
}

async function loadQuestionMapQuestionSource(file, pastedText) {
  if (file) {
    const pages = await loadPagedSourceFromFile(file, { maxPages: 80, chunkSize: 2200 });
    const text = pages.map((page) => page.text).join("\n\n");
    if (!text.trim()) {
      throw new Error("過去問から文字を読み取れませんでした");
    }
    return {
      sourceName: file.name || "過去問",
      text,
    };
  }

  return {
    sourceName: "貼り付け過去問",
    text: normalizeImportedText(pastedText),
  };
}

async function loadQuestionMapSlidePages(files, pastedText) {
  const pages = [];

  for (const file of files) {
    const filePages = await loadPagedSourceFromFile(file, { maxPages: 140, chunkSize: 1200 });
    pages.push(...filePages);
  }

  if (pastedText) {
    pages.push(...buildTextPageEntries(pastedText, "貼り付けスライド", { chunkSize: 1200 }));
  }

  return pages.filter((page) => page.text && page.text.trim());
}

async function loadPagedSourceFromFile(file, { maxPages = 24, chunkSize = 1200 } = {}) {
  if (isPdfFile(file)) {
    return extractPdfPages(file, maxPages);
  }

  const text = await file.text();
  if (!text.trim()) {
    throw new Error(`${file.name || "ファイル"} から文字を読み取れませんでした`);
  }

  return buildTextPageEntries(text, file.name || "テキスト資料", { chunkSize });
}

function buildTextPageEntries(text, sourceName, { chunkSize = 1200 } = {}) {
  const normalized = normalizeImportedText(text);
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((item) => cleanImportedSegment(item))
    .filter(Boolean);

  const sourceLabel = sourceName || "テキスト資料";
  if (!paragraphs.length) {
    return normalized
      ? [
          {
            sourceName: sourceLabel,
            pageNumber: 1,
            text: normalized,
          },
        ]
      : [];
  }

  const pages = [];
  let buffer = "";
  let pageNumber = 1;

  paragraphs.forEach((paragraph) => {
    const next = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
    if (next.length > chunkSize && buffer) {
      pages.push({
        sourceName: sourceLabel,
        pageNumber,
        text: buffer,
      });
      pageNumber += 1;
      buffer = paragraph;
      return;
    }

    buffer = next;
  });

  if (buffer) {
    pages.push({
      sourceName: sourceLabel,
      pageNumber,
      text: buffer,
    });
  }

  return pages;
}

async function extractTextFromPdf(file) {
  const merged = (await extractPdfPages(file, 24)).map((page) => page.text).join("\n\n");
  if (!merged.trim()) {
    throw new Error("PDFから文字を抽出できませんでした。画像PDFの可能性があります");
  }

  return merged;
}

async function extractPdfPages(file, maxPages = 24) {
  let pdfjsLib;

  try {
    pdfjsLib = await getPdfJsModule();
  } catch (error) {
    console.warn("Failed to load PDF.js:", error);
    throw new Error("PDF解析ライブラリを読み込めませんでした。オンライン状態で再度試してください");
  }

  const arrayBuffer = await file.arrayBuffer();
  const documentTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: true,
  });
  const pdf = await documentTask.promise;
  const pages = [];
  const safeMaxPages = Math.min(pdf.numPages, maxPages);

  for (let pageNumber = 1; pageNumber <= safeMaxPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items ? buildPageText(textContent.items) : "";
    if (pageText.trim()) {
      pages.push({
        sourceName: file.name || "PDF",
        pageNumber,
        text: pageText.trim(),
      });
    }
  }

  return pages;
}

async function getPdfJsModule() {
  if (!pdfjsModulePromise) {
    pdfjsModulePromise = import(PDFJS_MODULE_URL).then((module) => {
      module.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      return module;
    });
  }

  return pdfjsModulePromise;
}

function buildPageText(items) {
  const lines = [];
  let currentLine = [];
  let previousY = null;

  items.forEach((item) => {
    const raw = String(item?.str || "").trim();
    if (!raw) {
      return;
    }

    const y = Array.isArray(item.transform) ? item.transform[5] : previousY;
    if (previousY !== null && typeof y === "number" && Math.abs(y - previousY) > 4) {
      pushLine();
    }

    currentLine.push(raw);
    previousY = typeof y === "number" ? y : previousY;
  });

  pushLine();
  return lines.join("\n");

  function pushLine() {
    if (!currentLine.length) {
      return;
    }

    lines.push(currentLine.join(" ").replace(/\s+/g, " ").trim());
    currentLine = [];
  }
}

function buildImportDraft({ text, sourceName, deckName, focus, subject, instructions, limit }) {
  const normalizedText = normalizeImportedText(text);
  const lines = extractMeaningfulLines(normalizedText);
  const cards = dedupeImportCards([
    ...buildDelimitedLineCards(lines, focus, subject),
    ...buildAdjacentPairCards(lines, focus, subject),
    ...buildBulletGroupCards(lines, focus, subject),
    ...buildParagraphFallbackCards(normalizedText, focus, subject),
  ]).slice(0, limit);

  if (!cards.length) {
    throw new Error("カード候補を作れませんでした。本文を少し整理してもう一度試してください");
  }

  return {
    id: crypto.randomUUID(),
    sourceName,
    deckName,
    targetDeckId: "",
    focus,
    subject,
    instructions,
    cards: cards.map((card) => ({
      ...card,
      id: crypto.randomUUID(),
      note: card.note || buildImportNote(sourceName, instructions),
      tags: dedupeTags([formatDeckFocus(focus), ...(card.tags || []), ...splitSubjectTags(subject)]),
    })),
  };
}

function buildQuestionMapDraft({ questionSource, slidePages, topMatches }) {
  const questions = parseQuestionBlocks(questionSource.text);
  if (!questions.length) {
    throw new Error("過去問から設問を切り出せませんでした。番号付きの設問か、改行入りの本文を入れてください");
  }

  const enrichedQuestions = questions.map((question) => ({
    ...question,
    matches: matchQuestionToSlidePages(question, slidePages, topMatches),
  }));
  const sourceNames = [...new Set(slidePages.map((page) => page.sourceName).filter(Boolean))];

  return {
    id: crypto.randomUUID(),
    questionSourceName: questionSource.sourceName,
    slideSourceNames: sourceNames,
    slideSourceLabel:
      sourceNames.length <= 2 ? sourceNames.join(" / ") : `${sourceNames.slice(0, 2).join(" / ")} ほか${sourceNames.length - 2}件`,
    slidePageCount: slidePages.length,
    questions: enrichedQuestions,
    matchedQuestionCount: enrichedQuestions.filter((question) => question.matches.length > 0).length,
  };
}

function parseQuestionBlocks(text) {
  const lines = normalizeImportedText(text)
    .split("\n")
    .map((line) => cleanImportedSegment(line))
    .filter(Boolean)
    .filter((line) => !/^page\s+\d+$/i.test(line));
  const blocks = [];
  let current = null;

  lines.forEach((line) => {
    const start = parseQuestionStart(line);
    if (start) {
      if (current?.lines?.length) {
        blocks.push(current);
      }

      current = {
        label: start.label,
        lines: start.body ? [start.body] : [],
      };
      return;
    }

    if (!current) {
      return;
    }

    current.lines.push(line);
  });

  if (current?.lines?.length) {
    blocks.push(current);
  }

  const parsed = blocks
    .map((block, index) => buildQuestionBlock(block.label || `問${index + 1}`, block.lines, index))
    .filter((block) => block && block.searchText.length >= 8);

  return parsed.length >= 2 ? parsed : buildFallbackQuestionBlocks(text);
}

function buildQuestionBlock(label, lines, index) {
  const cleanedLines = (lines || []).map((line) => cleanImportedSegment(line)).filter(Boolean);
  const optionLines = cleanedLines.filter(looksLikeQuestionOption).map(stripQuestionOptionPrefix);
  const promptLines = cleanedLines.filter((line) => !looksLikeQuestionOption(line));
  const prompt = cleanQuestionPrompt(promptLines.join(" "));
  const fallbackPrompt = cleanQuestionPrompt(cleanedLines.join(" "));
  const searchText = cleanImportedSegment([prompt, ...optionLines].filter(Boolean).join(" "));
  const tokens = tokenizeQuestionMapText(searchText);
  const optionTokens = tokenizeQuestionMapText(optionLines.join(" "));
  const phrases = extractQuestionMapPhrases(searchText);

  return {
    id: crypto.randomUUID(),
    label: label || `問${index + 1}`,
    prompt: prompt || fallbackPrompt || `設問 ${index + 1}`,
    options: optionLines,
    searchText: searchText || fallbackPrompt,
    tokens,
    optionTokens,
    phrases,
  };
}

function buildFallbackQuestionBlocks(text) {
  return normalizeImportedText(text)
    .split(/\n{2,}/)
    .map((paragraph) => cleanImportedSegment(paragraph))
    .filter((paragraph) => paragraph.length >= 18)
    .slice(0, 32)
    .map((paragraph, index) =>
      buildQuestionBlock(
        `問${index + 1}`,
        splitIntoSentences(paragraph).length > 1 ? splitIntoSentences(paragraph) : [paragraph],
        index,
      ),
    )
    .filter(Boolean);
}

function parseQuestionStart(line) {
  const patterns = [
    /^(問\s*\d+)\s*[.)．、:：]?\s*(.*)$/i,
    /^(第\s*\d+\s*問)\s*[.)．、:：]?\s*(.*)$/i,
    /^(Q\s*\d+)\s*[.)．、:：]?\s*(.*)$/i,
    /^(\d{1,3})[.)．、]\s*(.*)$/,
  ];

  for (const pattern of patterns) {
    const match = String(line || "").match(pattern);
    if (match) {
      return {
        label: String(match[1] || "").trim(),
        body: cleanImportedSegment(match[2] || ""),
      };
    }
  }

  return null;
}

function looksLikeQuestionOption(line) {
  return /^[\(（]?(?:[A-Ea-e]|[1-9]|[ア-オあ-お])[)）.．、:]\s*/.test(String(line || "").trim());
}

function stripQuestionOptionPrefix(line) {
  return cleanImportedSegment(String(line || "").replace(/^[\(（]?(?:[A-Ea-e]|[1-9]|[ア-オあ-お])[)）.．、:]\s*/, ""));
}

function cleanQuestionPrompt(text) {
  return cleanImportedSegment(String(text || "").replace(/\s+/g, " ")).slice(0, 220);
}

function tokenizeQuestionMapText(text) {
  return tokenizeSearchText(text).filter(
    (token) => token.length >= 2 && !QUESTION_MAP_STOPWORDS.has(token.toLowerCase()) && !/^\d+$/.test(token),
  );
}

function extractQuestionMapPhrases(text) {
  return [...new Set(
    (String(text || "").match(/[A-Za-z]{4,}(?:\s+[A-Za-z]{2,})?|[ぁ-んァ-ヶー一-龠]{4,}/g) || [])
      .map((phrase) => phrase.toLowerCase().trim())
      .filter((phrase) => !QUESTION_MAP_STOPWORDS.has(phrase))
      .slice(0, 8),
  )];
}

function matchQuestionToSlidePages(question, slidePages, topMatches) {
  const ranked = slidePages
    .map((page) => scoreQuestionAgainstSlidePage(question, page))
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score || left.pageNumber - right.pageNumber)
    .slice(0, topMatches);

  if (!ranked.length) {
    return [];
  }

  const bestScore = ranked[0].score || 1;
  return ranked
    .filter((match, index) => index === 0 || match.score >= Math.max(2, Math.round(bestScore * 0.35)))
    .map((match) => ({
      ...match,
      coverageLabel:
        match.coverage >= 0.55 ? "一致度 高め" : match.coverage >= 0.28 ? "一致度 中くらい" : "一致度 参考",
    }));
}

function scoreQuestionAgainstSlidePage(question, page) {
  const promptMatch = scoreTextAgainstTokens(page.text, question.tokens);
  const optionMatch = scoreTextAgainstTokens(page.text, question.optionTokens);
  const phraseMatches = (question.phrases || []).filter((phrase) => String(page.text || "").toLowerCase().includes(phrase));
  const matchedTokens = dedupeTags([...promptMatch.matchedTokens, ...optionMatch.matchedTokens, ...phraseMatches]);
  const snippet = findBestQuestionMapSnippet(page.text, matchedTokens.length ? matchedTokens : question.tokens);
  const score = promptMatch.score * 2 + optionMatch.score + phraseMatches.length * 3 + snippet.score;
  const coverage = matchedTokens.length / Math.max(1, question.tokens.length || matchedTokens.length || 1);

  return {
    sourceName: page.sourceName,
    pageNumber: page.pageNumber,
    snippet: snippet.text,
    matchedTokens,
    coverage,
    score,
  };
}

function findBestQuestionMapSnippet(text, tokens) {
  const candidates = extractMeaningfulLines(text).slice(0, 36);
  if (!candidates.length) {
    const fallbackText = cleanImportedSegment(String(text || "")).slice(0, 180);
    return {
      text: fallbackText || "該当箇所を表示できませんでした。",
      score: 0,
    };
  }

  let bestCandidate = candidates[0];
  let bestScore = -1;

  candidates.forEach((candidate) => {
    const candidateScore = scoreTextAgainstTokens(candidate, tokens).score;
    if (candidateScore > bestScore) {
      bestScore = candidateScore;
      bestCandidate = candidate;
    }
  });

  return {
    text: bestCandidate,
    score: Math.max(0, bestScore),
  };
}

function scoreTextAgainstTokens(text, tokens) {
  const normalized = String(text || "").toLowerCase();
  const matchedTokens = [];
  let score = 0;

  (tokens || []).forEach((token) => {
    if (!token || !normalized.includes(String(token).toLowerCase())) {
      return;
    }

    matchedTokens.push(token);
    if (token.length >= 8) {
      score += 6;
      return;
    }
    if (token.length >= 5) {
      score += 4;
      return;
    }
    if (token.length >= 3) {
      score += 3;
      return;
    }
    score += 2;
  });

  return {
    score,
    matchedTokens: dedupeTags(matchedTokens),
  };
}

function formatQuestionMatchConfidence(match) {
  if (match.coverage >= 0.55) {
    return "設問との重なりがかなり強い候補です";
  }
  if (match.coverage >= 0.28) {
    return "設問との重なりが見つかった候補です";
  }
  return "設問との重なりは弱めですが、見直しの起点として使える候補です";
}

function buildDelimitedLineCards(lines, focus, subject) {
  const cards = [];

  lines.forEach((line) => {
    const colonMatch = line.match(/^(.{2,80}?)[\s\u3000]*[:：=]\s*(.{6,240})$/);
    const dashMatch = line.match(/^(.{2,80}?)\s+[–—-]\s+(.{6,240})$/);
    const match = colonMatch || dashMatch;

    if (!match) {
      return;
    }

    const left = cleanImportedSegment(match[1]);
    const right = cleanImportedSegment(match[2]);
    if (!isViableCardPair(left, right)) {
      return;
    }

    cards.push(
      createImportedCard({
        focus,
        subject,
        title: left,
        body: right,
        sourceLine: line,
      }),
    );
  });

  return cards;
}

function buildAdjacentPairCards(lines, focus, subject) {
  const cards = [];

  for (let index = 0; index < lines.length - 1; index += 1) {
    const current = cleanImportedSegment(lines[index]);
    const next = cleanImportedSegment(lines[index + 1]);

    if (!current || !next) {
      continue;
    }

    if (current.length > 70 || next.length < 10 || next.length > 240) {
      continue;
    }

    if (/[。.!?]$/.test(current) || startsWithBullet(current) || startsWithBullet(next)) {
      continue;
    }

    if (focus === "english" && !looksLikeEnglishTerm(current)) {
      continue;
    }

    if (focus !== "english" && !looksLikeHeading(current)) {
      continue;
    }

    cards.push(
      createImportedCard({
        focus,
        subject,
        title: current,
        body: next,
        sourceLine: `${current} / ${next}`,
      }),
    );
  }

  return cards;
}

function buildBulletGroupCards(lines, focus, subject) {
  const cards = [];

  for (let index = 0; index < lines.length - 1; index += 1) {
    const heading = cleanImportedSegment(lines[index]);
    if (!looksLikeHeading(heading)) {
      continue;
    }

    const bullets = [];
    let lookahead = index + 1;
    while (lookahead < lines.length && startsWithBullet(lines[lookahead]) && bullets.length < 4) {
      bullets.push(stripBullet(lines[lookahead]));
      lookahead += 1;
    }

    if (bullets.length < 2) {
      continue;
    }

    cards.push(
      createImportedCard({
        focus,
        subject,
        title: heading,
        body: bullets.join(" / "),
        sourceLine: heading,
      }),
    );

    index = lookahead - 1;
  }

  return cards;
}

function buildParagraphFallbackCards(text, focus, subject) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => cleanImportedSegment(paragraph))
    .filter((paragraph) => paragraph.length >= 50 && paragraph.length <= 280)
    .slice(0, 8)
    .map((paragraph) => {
      const sentences = splitIntoSentences(paragraph);
      const title = cleanImportedSegment(sentences[0] || paragraph.slice(0, 40));
      const body = cleanImportedSegment(sentences.slice(1).join(" ") || paragraph);

      return createImportedCard({
        focus,
        subject,
        title,
        body,
        sourceLine: paragraph.slice(0, 120),
      });
    })
    .filter((card) => isViableCardPair(card.front, card.back));
}

function createImportedCard({ focus, subject, title, body, sourceLine }) {
  const cleanTitle = cleanImportedSegment(title);
  const cleanBody = cleanImportedSegment(body);
  const topic = inferImportedTopic(cleanTitle, subject, focus);

  return {
    front: buildImportedFront(cleanTitle, focus),
    back: cleanBody,
    hint: focus === "english" ? "資料取り込みから自動生成" : "講義資料から自動生成",
    topic,
    tags: buildImportedTags(cleanTitle, subject, focus),
    note: "",
    example: focus === "english" && /[A-Za-z]/.test(cleanBody) ? cleanBody : "",
    sourceLine,
  };
}

function getDueCountByDeck() {
  const now = Date.now();
  const counts = new Map();

  state.cards.forEach((card) => {
    if (card.study.dueAt <= now) {
      counts.set(card.deckId, (counts.get(card.deckId) || 0) + 1);
    }
  });

  return counts;
}

function getDeckById(deckId) {
  return state.decks.find((deck) => deck.id === deckId) || null;
}

function getCardById(cardId) {
  return state.cards.find((card) => card.id === cardId) || null;
}

function getDeckName(deckId) {
  return getDeckById(deckId)?.name || "未分類";
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return normalizeState(clone(demoState));
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.decks) || !Array.isArray(parsed.cards) || !Array.isArray(parsed.reviewLog)) {
      return normalizeState(clone(demoState));
    }
    return normalizeState(parsed);
  } catch (error) {
    console.warn("Failed to parse saved state:", error);
    return normalizeState(clone(demoState));
  }
}

async function fetchCloudConfig() {
  if (cloudState.config) {
    return cloudState.config;
  }

  try {
    const response = await fetch(CLOUD_CONFIG_ENDPOINT, { cache: "no-store" });
    if (!response.ok) {
      cloudState.config = {};
      return cloudState.config;
    }

    const config = await response.json();
    cloudState.config =
      config && config.supabaseUrl && config.supabaseAnonKey
        ? {
            supabaseUrl: String(config.supabaseUrl),
            supabaseAnonKey: String(config.supabaseAnonKey),
          }
        : {};
    return cloudState.config;
  } catch (error) {
    console.warn("Failed to load cloud config:", error);
    cloudState.config = {};
    return cloudState.config;
  }
}

async function getSupabaseClient() {
  if (cloudState.client) {
    return cloudState.client;
  }

  const config = await fetchCloudConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return null;
  }

  if (!cloudState.module) {
    cloudState.module = import(SUPABASE_MODULE_URL);
  }

  const { createClient } = await cloudState.module;
  cloudState.client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  cloudState.client.auth.onAuthStateChange((_event, session) => {
    cloudState.session = session;
    if (session?.user) {
      ensureCloudProfile().catch((error) => {
        console.warn("Failed to ensure profile:", error);
      });
    }
    refreshCloudData({ silent: true }).catch((error) => {
      console.warn("Failed to refresh cloud data:", error);
    });
    renderSharePanel();
  });

  return cloudState.client;
}

async function initializeCloud() {
  const url = new URL(window.location.href);
  cloudState.shareToken = String(url.searchParams.get(CLOUD_SHARE_PARAM) || "").trim();
  const localShareParam = String(url.searchParams.get(LOCAL_SHARE_PARAM) || "").trim();
  renderSharePanel();

  if (localShareParam) {
    await previewLocalShare(localShareParam);
  }

  const client = await getSupabaseClient();
  if (!client) {
    cloudState.status = "local-only";
    if (cloudState.shareToken) {
      shareJoinTitle.textContent = "共有デッキに参加";
      shareJoinStatus.textContent =
        "この共有リンクを使うには、Supabase を接続してから共有タブでログインしてください。";
      requestShareAccessButton.disabled = true;
      requestShareAccessButton.textContent = "参加を申請する";
      shareJoinModal.hidden = false;
    }
    renderSharePanel();
    return;
  }

  const {
    data: { session },
  } = await client.auth.getSession();
  cloudState.session = session;
  if (session?.user) {
    await ensureCloudProfile();
  }

  await refreshCloudData({ silent: true });
  cleanupAuthUrl();
}

function cleanupAuthUrl() {
  const url = new URL(window.location.href);
  let changed = false;

  ["code", "type"].forEach((key) => {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  });

  if (window.location.hash.includes("access_token") || window.location.hash.includes("refresh_token")) {
    changed = true;
  }

  if (changed) {
    history.replaceState({}, "", `${url.pathname}${url.search}`);
  }
}

async function ensureCloudProfile() {
  const client = cloudState.client || (await getSupabaseClient());
  const user = cloudState.session?.user;

  if (!client || !user) {
    return null;
  }

  const payload = {
    id: user.id,
    email: String(user.email || "").trim(),
    display_name: String(user.user_metadata?.full_name || user.user_metadata?.name || "").trim(),
  };

  const { data, error } = await client.from("profiles").upsert(payload).select("*").single();
  if (error) {
    console.warn("Failed to upsert profile:", error);
    cloudState.profile = payload;
    return payload;
  }

  cloudState.profile = data;
  return data;
}

function buildCloudMemberMap(memberRows, requestRows, userId) {
  const latestEmailByMember = new Map();
  (requestRows || []).forEach((request) => {
    const key = `${request.deck_id}:${request.user_id}`;
    const email = String(request.requester_email || "").trim();
    if (email && !latestEmailByMember.has(key)) {
      latestEmailByMember.set(key, email);
    }
  });

  return (memberRows || []).reduce((collection, row) => {
    const deckId = String(row.deck_id || "").trim();
    if (!deckId) {
      return collection;
    }

    if (!Array.isArray(collection[deckId])) {
      collection[deckId] = [];
    }

    const isCurrentUser = row.user_id === userId;
    collection[deckId].push({
      id: row.id,
      deckId,
      userId: row.user_id,
      role: row.role,
      email: isCurrentUser
        ? String(cloudState.session?.user?.email || cloudState.profile?.email || "").trim()
        : latestEmailByMember.get(`${deckId}:${row.user_id}`) || "",
      displayName: isCurrentUser ? String(cloudState.profile?.display_name || "").trim() : "",
      isCurrentUser,
      createdAt: parseCloudTimestamp(row.created_at),
    });
    return collection;
  }, {});
}

function detachDeckFromCloud(deck, reasonText = "") {
  if (!deck || deck.storageMode !== "shared") {
    return;
  }

  const now = Date.now();
  deck.storageMode = "local";
  deck.sharedDeckId = "";
  deck.shareToken = "";
  deck.role = "owner";
  deck.syncState = "local-only";
  deck.updatedAt = now;

  if (reasonText && !String(deck.description || "").includes(reasonText)) {
    deck.description = [String(deck.description || "").trim(), reasonText].filter(Boolean).join(" / ");
  }

  state.cards.forEach((card, index) => {
    if (card.deckId === deck.id) {
      card.sharedCardId = "";
      card.updatedAt = now + index;
    }
  });
}

function detachUnavailableSharedDecks(activeSharedDeckIds) {
  const activeSet = new Set((activeSharedDeckIds || []).filter(Boolean));

  state.decks.forEach((deck) => {
    if (deck.storageMode === "shared" && deck.sharedDeckId && !activeSet.has(deck.sharedDeckId)) {
      detachDeckFromCloud(deck, "共有から切り離されたためローカルコピーへ切り替え");
    }
  });
}

async function refreshCloudData({ silent = false } = {}) {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client) {
    cloudState.status = "local-only";
    cloudState.pendingRequests = [];
    cloudState.membersByDeck = {};
    renderSharePanel();
    return;
  }

  if (!cloudState.session?.user) {
    cloudState.status = "signed-out";
    cloudState.pendingRequests = [];
    cloudState.membersByDeck = {};
    cloudState.profile = null;
    render();
    if (cloudState.shareToken) {
      await refreshShareJoinPreview();
    }
    return;
  }

  if (!silent) {
    shareStatus.textContent = "共有データを読み込んでいます。";
  }

  try {
    await ensureCloudProfile();
    const userId = cloudState.session.user.id;
    const membershipResponse = await client
      .from("deck_members")
      .select("role, deck_id, shared_decks(id, name, focus, subject, description, share_token, owner_id, created_at, updated_at)")
      .eq("user_id", userId);

    if (membershipResponse.error) {
      throw membershipResponse.error;
    }

    const memberships = (membershipResponse.data || [])
      .map((row) =>
        row.shared_decks
          ? {
              ...row.shared_decks,
              role: row.role,
            }
          : null,
      )
      .filter(Boolean);
    const sharedDeckIds = memberships.map((deck) => deck.id);
    const ownerDeckIds = memberships.filter((deck) => deck.role === "owner").map((deck) => deck.id);

    const cardsResponse = sharedDeckIds.length
      ? await client.from("shared_cards").select("*").in("deck_id", sharedDeckIds).order("order_index", { ascending: true })
      : { data: [], error: null };
    if (cardsResponse.error) {
      throw cardsResponse.error;
    }

    const progressResponse = sharedDeckIds.length
      ? await client.from("user_card_progress").select("*").eq("user_id", userId).in("deck_id", sharedDeckIds)
      : { data: [], error: null };
    if (progressResponse.error) {
      throw progressResponse.error;
    }

    const memberResponse = sharedDeckIds.length
      ? await client.from("deck_members").select("id, deck_id, user_id, role, created_at").in("deck_id", sharedDeckIds)
      : { data: [], error: null };
    if (memberResponse.error) {
      throw memberResponse.error;
    }

    const requestResponse = ownerDeckIds.length
      ? await client.from("deck_access_requests").select("*").in("deck_id", ownerDeckIds).order("updated_at", { ascending: false })
      : { data: [], error: null };
    if (requestResponse.error) {
      throw requestResponse.error;
    }

    detachUnavailableSharedDecks(sharedDeckIds);
    mergeCloudDecks(memberships, cardsResponse.data || [], progressResponse.data || []);
    cloudState.pendingRequests = (requestResponse.data || [])
      .filter((request) => request.status === "pending")
      .map((request) => ({
        ...request,
        deckName: memberships.find((deck) => deck.id === request.deck_id)?.name || "共有デッキ",
        deckId: request.deck_id,
        requesterEmail: request.requester_email,
        requestedRole: request.requested_role,
      }));
    cloudState.membersByDeck = buildCloudMemberMap(memberResponse.data || [], requestResponse.data || [], userId);
    cloudState.status = "ready";
    persist();
    render();
    if (cloudState.shareToken) {
      await refreshShareJoinPreview();
    }
  } catch (error) {
    console.warn("Failed to refresh cloud data:", error);
    cloudState.status = "offline";
    renderSharePanel();
    if (!silent) {
      showToast("共有情報の読み込みに失敗しました");
    }
  }
}

function mergeCloudDecks(sharedDecks, sharedCards, progressRows) {
  sharedDecks.forEach((sharedDeck) => {
    const existingDeck = state.decks.find((deck) => deck.sharedDeckId === sharedDeck.id) || null;
    const localDeckId = existingDeck?.id || crypto.randomUUID();
    const mergedDeck = normalizeDeck({
      ...existingDeck,
      id: localDeckId,
      name: sharedDeck.name,
      focus: sharedDeck.focus,
      subject: sharedDeck.subject,
      description: sharedDeck.description,
      createdAt: existingDeck?.createdAt || parseCloudTimestamp(sharedDeck.created_at),
      updatedAt: parseCloudTimestamp(sharedDeck.updated_at) || Date.now(),
      storageMode: "shared",
      sharedDeckId: sharedDeck.id,
      shareToken: sharedDeck.share_token || existingDeck?.shareToken || "",
      role: sharedDeck.role || existingDeck?.role || "viewer",
      syncState: "synced",
    });

    if (existingDeck?.syncState === "dirty" && canEditDeckContent(existingDeck)) {
      mergedDeck.syncState = "dirty";
      upsertDeck(mergedDeck);
      return;
    }

    upsertDeck(mergedDeck);

    const currentCards = state.cards.filter((card) => card.deckId === localDeckId);
    const existingCardsBySharedId = new Map(currentCards.map((card) => [card.sharedCardId, card]));
    const deckCards = sharedCards.filter((card) => card.deck_id === sharedDeck.id);
    const nextCards = deckCards.map((cardRow, index) => {
      const existing = existingCardsBySharedId.get(cardRow.id);
      const progressRow = progressRows.find((row) => row.shared_card_id === cardRow.id);
      return normalizeCard({
        id: existing?.id || crypto.randomUUID(),
        deckId: localDeckId,
        front: cardRow.front,
        back: cardRow.back,
        hint: cardRow.hint || "",
        topic: cardRow.topic || "",
        tags: Array.isArray(cardRow.tags) ? cardRow.tags : parseTags(cardRow.tags),
        note: cardRow.note || "",
        example: cardRow.example || "",
        createdAt: existing?.createdAt || parseCloudTimestamp(cardRow.created_at) || Date.now() + index,
        updatedAt: parseCloudTimestamp(cardRow.updated_at) || existing?.updatedAt || Date.now(),
        sharedCardId: cardRow.id,
        study: progressRow ? progressRowToStudy(progressRow, existing?.study) : existing?.study,
      });
    });

    state.cards = state.cards.filter((card) => card.deckId !== localDeckId).concat(nextCards);
  });
}

function upsertDeck(nextDeck) {
  const index = state.decks.findIndex((deck) => deck.id === nextDeck.id);
  if (index >= 0) {
    state.decks[index] = nextDeck;
    return;
  }

  state.decks.unshift(nextDeck);
}

function parseCloudTimestamp(value) {
  const timestamp = Date.parse(String(value || ""));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function progressRowToStudy(progressRow, fallbackStudy) {
  return normalizeStudy(
    progressRow
      ? {
          dueAt: Number(progressRow.due_at || Date.now()),
          intervalDays: Number(progressRow.interval_days || 0),
          ease: Number(progressRow.ease || 2.3),
          reps: Number(progressRow.reps || 0),
          lapses: Number(progressRow.lapses || 0),
          lastReviewedAt: Number(progressRow.last_reviewed_at || 0) || null,
          mode: String(progressRow.mode || "new"),
          stepIndex: Number(progressRow.step_index || 0),
          recoveryDays: Number(progressRow.recovery_days || 1),
        }
      : fallbackStudy,
    Date.now(),
  );
}

function buildProgressPayload(deck, card) {
  return {
    user_id: cloudState.session.user.id,
    deck_id: deck.sharedDeckId,
    shared_card_id: card.sharedCardId,
    due_at: Math.round(card.study.dueAt),
    interval_days: Number(card.study.intervalDays || 0),
    ease: Number(card.study.ease || 2.3),
    reps: Number(card.study.reps || 0),
    lapses: Number(card.study.lapses || 0),
    last_reviewed_at: card.study.lastReviewedAt ? Math.round(card.study.lastReviewedAt) : null,
    mode: String(card.study.mode || "new"),
    step_index: Number(card.study.stepIndex || 0),
    recovery_days: Number(card.study.recoveryDays || 1),
    updated_at: new Date().toISOString(),
  };
}

async function syncDeckToCloud(deck) {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client || !cloudState.session?.user) {
    throw new Error("共有機能を使うにはログインが必要です");
  }
  if (!deck.sharedDeckId) {
    throw new Error("共有デッキIDがありません");
  }
  if (!canEditDeckContent(deck)) {
    throw new Error("この共有デッキは編集できません");
  }

  deck.syncState = "syncing";
  renderSharePanel();

  const deckPayload = {
    name: deck.name,
    focus: deck.focus,
    subject: deck.subject,
    description: deck.description,
    share_token: deck.shareToken,
    updated_at: new Date().toISOString(),
  };
  if (deck.role === "owner") {
    deckPayload.owner_id = cloudState.session.user.id;
  }

  const { error: deckError } = await client.from("shared_decks").update(deckPayload).eq("id", deck.sharedDeckId);
  if (deckError) {
    deck.syncState = "dirty";
    throw deckError;
  }

  const localCards = state.cards
    .filter((card) => card.deckId === deck.id)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((card, index) => {
      if (!card.sharedCardId) {
        card.sharedCardId = crypto.randomUUID();
      }
      return {
        id: card.sharedCardId,
        deck_id: deck.sharedDeckId,
        front: card.front,
        back: card.back,
        hint: card.hint || "",
        topic: card.topic || "",
        tags: card.tags || [],
        note: card.note || "",
        example: card.example || "",
        order_index: index,
        updated_at: new Date(card.updatedAt || Date.now()).toISOString(),
      };
    });

  const existingCardsResponse = await client.from("shared_cards").select("id").eq("deck_id", deck.sharedDeckId);
  if (existingCardsResponse.error) {
    deck.syncState = "dirty";
    throw existingCardsResponse.error;
  }

  const localSharedIds = new Set(localCards.map((card) => card.id));
  const staleIds = (existingCardsResponse.data || []).map((card) => card.id).filter((id) => !localSharedIds.has(id));
  if (staleIds.length) {
    const { error: deleteError } = await client.from("shared_cards").delete().in("id", staleIds);
    if (deleteError) {
      deck.syncState = "dirty";
      throw deleteError;
    }
  }

  if (localCards.length) {
    const { error: upsertError } = await client.from("shared_cards").upsert(localCards);
    if (upsertError) {
      deck.syncState = "dirty";
      throw upsertError;
    }
  }

  deck.syncState = "synced";
  await syncSharedDeckProgress(deck.id);
  persist();
}

async function syncSharedDeckProgress(deckId) {
  const deck = getDeckById(deckId);
  const client = cloudState.client || (await getSupabaseClient());
  if (!deck || deck.storageMode !== "shared" || !deck.sharedDeckId || !client || !cloudState.session?.user) {
    return;
  }

  const progressRows = state.cards
    .filter((card) => card.deckId === deck.id && card.sharedCardId)
    .map((card) => buildProgressPayload(deck, card));

  if (!progressRows.length) {
    return;
  }

  const { error } = await client.from("user_card_progress").upsert(progressRows, { onConflict: "user_id,shared_card_id" });
  if (error) {
    console.warn("Failed to sync deck progress:", error);
  }
}

async function syncSharedProgressForCard(card, rating = "") {
  const deck = getDeckById(card.deckId);
  const client = cloudState.client || (await getSupabaseClient());
  if (!deck || deck.storageMode !== "shared" || !deck.sharedDeckId || !card.sharedCardId || !client || !cloudState.session?.user) {
    return;
  }

  const { error: progressError } = await client
    .from("user_card_progress")
    .upsert(buildProgressPayload(deck, card), { onConflict: "user_id,shared_card_id" });
  if (progressError) {
    throw progressError;
  }

  if (rating) {
    const latestReview = [...state.reviewLog].reverse().find((entry) => entry.cardId === card.id);
    const { error: logError } = await client.from("user_review_log").insert({
      user_id: cloudState.session.user.id,
      deck_id: deck.sharedDeckId,
      shared_card_id: card.sharedCardId,
      rating,
      timestamp_ms: Math.round(latestReview?.timestamp || Date.now()),
      date_key: latestReview?.dateKey || formatDateKey(new Date()),
      mode: String(card.study.mode || "new"),
      interval_days: Number(card.study.intervalDays || 0),
    });
    if (logError) {
      console.warn("Failed to append review log:", logError);
    }
  }
}

function buildShareUrl(token) {
  return `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(token)}`;
}

function clearLocalShareQuery() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(LOCAL_SHARE_PARAM)) {
    return;
  }
  url.searchParams.delete(LOCAL_SHARE_PARAM);
  history.replaceState({}, "", `${url.pathname}${url.search}`);
}

function createLocalShareSnapshot(deck) {
  const cards = state.cards
    .filter((card) => card.deckId === deck.id)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((card) => ({
      front: card.front,
      back: card.back,
      hint: card.hint || "",
      topic: card.topic || "",
      tags: card.tags || [],
      note: card.note || "",
      example: card.example || "",
    }));

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    mode: "local-share",
    deck: {
      name: deck.name,
      focus: deck.focus,
      subject: deck.subject,
      description: deck.description,
    },
    cards,
  };
}

async function buildLocalShareUrl(deck) {
  const snapshot = createLocalShareSnapshot(deck);
  const encoded = await encodeSharePayload(snapshot);
  const url = `${window.location.origin}${window.location.pathname}?${LOCAL_SHARE_PARAM}=${encodeURIComponent(encoded)}`;

  if (url.length > 20000) {
    throw new Error("デッキが大きすぎるためリンク共有できません。JSON バックアップ共有か Supabase 共有を使ってください");
  }

  return url;
}

async function encodeSharePayload(payload) {
  const inputBytes = new TextEncoder().encode(JSON.stringify(payload));
  const compressedBytes = await gzipBytesIfAvailable(inputBytes);

  if (compressedBytes && compressedBytes.length < inputBytes.length) {
    return `gz.${bytesToBase64Url(compressedBytes)}`;
  }

  return `plain.${bytesToBase64Url(inputBytes)}`;
}

async function decodeSharePayload(encodedPayload) {
  const [mode, rawPayload] = String(encodedPayload || "").split(".", 2);
  if (!rawPayload) {
    throw new Error("共有リンクの形式が正しくありません");
  }

  const rawBytes = base64UrlToBytes(rawPayload);
  const outputBytes =
    mode === "gz"
      ? await gunzipBytes(rawBytes)
      : rawBytes;

  const parsed = JSON.parse(new TextDecoder().decode(outputBytes));
  if (!parsed?.deck || !Array.isArray(parsed.cards)) {
    throw new Error("共有リンクの内容を読み取れませんでした");
  }

  return parsed;
}

async function gzipBytesIfAvailable(bytes) {
  if (typeof CompressionStream === "undefined") {
    return null;
  }

  try {
    const stream = new CompressionStream("gzip");
    const writer = stream.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const buffer = await new Response(stream.readable).arrayBuffer();
    return new Uint8Array(buffer);
  } catch (error) {
    console.warn("Failed to gzip local share payload:", error);
    return null;
  }
}

async function gunzipBytes(bytes) {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("この端末では圧縮共有リンクの展開に対応していません");
  }

  const stream = new DecompressionStream("gzip");
  const writer = stream.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const buffer = await new Response(stream.readable).arrayBuffer();
  return new Uint8Array(buffer);
}

function bytesToBase64Url(bytes) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(index, index + chunkSize));
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function previewLocalShare(encodedPayload) {
  try {
    const payload = await decodeSharePayload(encodedPayload);
    cloudState.joinMode = "local";
    cloudState.localSharePayload = payload;
    setShareJoinRoleVisibility(false);
    shareJoinTitle.textContent = `${payload.deck.name || "共有デッキ"} を追加`;
    shareJoinStatus.textContent = `${payload.cards.length}枚のカードを、この端末のローカルデッキとして取り込めます。`;
    requestShareAccessButton.disabled = false;
    requestShareAccessButton.textContent = "自分のアプリに追加する";
    shareJoinModal.hidden = false;
  } catch (error) {
    cloudState.joinMode = "local";
    cloudState.localSharePayload = null;
    setShareJoinRoleVisibility(false);
    shareJoinTitle.textContent = "共有リンクを開けませんでした";
    shareJoinStatus.textContent = error.message || "共有リンクの読み込みに失敗しました。";
    requestShareAccessButton.disabled = true;
    requestShareAccessButton.textContent = "自分のアプリに追加する";
    shareJoinModal.hidden = false;
  }
}

function importLocalSharedDeck(payload) {
  const now = Date.now();
  const newDeckId = crypto.randomUUID();
  const deckName = createUniqueDeckName(payload.deck?.name || "共有デッキ");
  const description = [String(payload.deck?.description || "").trim(), "共有リンクから追加"].filter(Boolean).join(" / ");
  const deck = normalizeDeck({
    id: newDeckId,
    name: deckName,
    focus: normalizeDeckFocus(payload.deck?.focus),
    subject: String(payload.deck?.subject || "").trim(),
    description,
    createdAt: now,
    updatedAt: now,
    storageMode: "local",
    role: "owner",
    syncState: "local-only",
  });

  state.decks.unshift(deck);
  (payload.cards || []).forEach((card, index) => {
    state.cards.unshift(
      makeCard({
        id: crypto.randomUUID(),
        deckId: newDeckId,
        front: String(card.front || "").trim(),
        back: String(card.back || "").trim(),
        hint: String(card.hint || "").trim(),
        topic: String(card.topic || "").trim(),
        tags: Array.isArray(card.tags) ? card.tags : parseTags(card.tags),
        note: String(card.note || "").trim(),
        example: String(card.example || "").trim(),
        createdAt: now + index,
        dueAt: now,
        intervalDays: 0,
      }),
    );
  });

  persist();
  render();
  selectedDeckDetailId = newDeckId;
  shareDeckSelect.value = newDeckId;
  closeShareJoinModal();
  switchSection("assistant");
  showToast(`${deckName} を共有リンクから追加しました`);
}

async function sendMagicLink() {
  const email = String(authEmailInput.value || "").trim();
  const client = cloudState.client || (await getSupabaseClient());

  if (!client) {
    showToast("先に Supabase の設定を追加してください");
    return;
  }
  if (!email) {
    showToast("メールアドレスを入力してください");
    return;
  }

  const redirectUrl = cloudState.shareToken ? buildShareUrl(cloudState.shareToken) : `${window.location.origin}${window.location.pathname}`;
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    showToast(error.message || "マジックリンク送信に失敗しました");
    return;
  }

  showToast("マジックリンクを送信しました。メールから戻ってください");
}

async function signOutCloud() {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client) {
    return;
  }

  await client.auth.signOut();
  cloudState.session = null;
  cloudState.profile = null;
  cloudState.pendingRequests = [];
  cloudState.membersByDeck = {};
  render();
  showToast("共有アカウントからログアウトしました");
}

async function shareDeck() {
  const deck = getSelectedShareDeck();
  const client = cloudState.client || (await getSupabaseClient());

  if (!deck) {
    showToast("共有するデッキを選んでください");
    return;
  }
  if (!canEditDeckContent(deck)) {
    showToast("この共有デッキは編集できません");
    return;
  }

  if (!client || !cloudState.session?.user) {
    try {
      shareLinkCache = await buildLocalShareUrl(deck);
      cloudState.lastLocalShareDeckId = deck.id;
      renderSharePanel();
      showToast("共有リンクを作成しました。開いた相手はローカルに複製できます");
    } catch (error) {
      showToast(error.message || "共有リンクの作成に失敗しました");
    }
    return;
  }

  try {
    await ensureCloudProfile();

    if (!deck.sharedDeckId) {
      const payload = {
        owner_id: cloudState.session.user.id,
        name: deck.name,
        focus: deck.focus,
        subject: deck.subject,
        description: deck.description,
        share_token: deck.shareToken || crypto.randomUUID(),
      };
      const { data, error } = await client.from("shared_decks").insert(payload).select("*").single();
      if (error) {
        throw error;
      }

      const { error: memberError } = await client.from("deck_members").upsert(
        {
          deck_id: data.id,
          user_id: cloudState.session.user.id,
          role: "owner",
        },
        { onConflict: "deck_id,user_id" },
      );
      if (memberError) {
        throw memberError;
      }

      deck.storageMode = "shared";
      deck.sharedDeckId = data.id;
      deck.shareToken = data.share_token;
      deck.role = "owner";
      deck.syncState = "dirty";
    }

    await syncDeckToCloud(deck);
    shareLinkCache = buildShareUrl(deck.shareToken);
    render();
    showToast("共有リンクを作成しました");
  } catch (error) {
    console.warn("Failed to share deck:", error);
    showToast(error.message || "共有リンクの作成に失敗しました");
  }
}

async function copyShareLink() {
  const deck = getSelectedShareDeck();
  let link = getCurrentShareUrl(deck);

  if (!link && deck) {
    await shareDeck();
    link = getCurrentShareUrl(deck);
  }

  if (!link) {
    showToast("先に共有リンクを作成してください");
    return;
  }

  try {
    await navigator.clipboard.writeText(link);
    showToast("共有リンクをコピーしました");
  } catch (error) {
    window.prompt("このリンクをコピーしてください", link);
  }
}

async function syncSelectedSharedDeck() {
  const deck = getSelectedShareDeck();
  if (!deck) {
    showToast("同期するデッキを選んでください");
    return;
  }

  if (deck.storageMode !== "shared") {
    await shareDeck();
    return;
  }

  try {
    if (canEditDeckContent(deck)) {
      await syncDeckToCloud(deck);
    }
    await refreshCloudData({ silent: true });
    showToast(canEditDeckContent(deck) ? "共有デッキを同期しました" : "共有デッキの最新内容を取得しました");
  } catch (error) {
    console.warn("Failed to sync shared deck:", error);
    deck.syncState = "dirty";
    renderSharePanel();
    showToast(error.message || "同期に失敗しました");
  }
}

function duplicateSelectedDeck() {
  const sourceDeck = getSelectedShareDeck();
  if (!sourceDeck) {
    showToast("複製するデッキを選んでください");
    return;
  }

  const sourceCards = state.cards.filter((card) => card.deckId === sourceDeck.id);
  const now = Date.now();
  const newDeckId = crypto.randomUUID();
  const duplicateDeck = normalizeDeck({
    id: newDeckId,
    name: createUniqueDeckName(`${sourceDeck.name} 自分用`),
    focus: sourceDeck.focus,
    subject: sourceDeck.subject,
    description: sourceDeck.description || "共有デッキから複製",
    createdAt: now,
    updatedAt: now,
    storageMode: "local",
    role: "owner",
    syncState: "local-only",
  });

  state.decks.unshift(duplicateDeck);
  sourceCards
    .slice()
    .reverse()
    .forEach((card, index) => {
      state.cards.unshift(
        normalizeCard({
          ...clone(card),
          id: crypto.randomUUID(),
          deckId: newDeckId,
          createdAt: now + index,
          updatedAt: now + index,
          sharedCardId: "",
        }),
      );
    });

  persist();
  render();
  shareDeckSelect.value = newDeckId;
  selectedDeckDetailId = newDeckId;
  showToast("自分用のローカルデッキを複製しました");
}

async function refreshShareJoinPreview() {
  if (!cloudState.shareToken) {
    shareJoinModal.hidden = true;
    return;
  }

  requestShareAccessButton.textContent = "参加を申請する";
  cloudState.joinMode = "cloud";
  setShareJoinRoleVisibility(false);

  if (!cloudState.config?.supabaseUrl) {
    shareJoinTitle.textContent = "共有デッキに参加";
    shareJoinStatus.textContent =
      "このリンクを使うには Supabase の共有設定が必要です。接続後に共有タブからログインしてください。";
    requestShareAccessButton.disabled = true;
    shareJoinModal.hidden = false;
    return;
  }

  if (!cloudState.session?.user) {
    shareJoinTitle.textContent = "共有デッキに参加";
    shareJoinStatus.textContent = "ログインすると、この共有リンクへの参加申請を送れます。";
    requestShareAccessButton.disabled = true;
    shareJoinModal.hidden = false;
    return;
  }

  const client = cloudState.client || (await getSupabaseClient());
  const { data, error } = await client.rpc("get_share_preview", {
    target_token: cloudState.shareToken,
  });

  if (error) {
    console.warn("Failed to load share preview:", error);
    shareJoinTitle.textContent = "共有リンクを確認できませんでした";
    shareJoinStatus.textContent = "リンクが無効か、共有設定がまだ完了していない可能性があります。";
    requestShareAccessButton.disabled = true;
    shareJoinModal.hidden = false;
    return;
  }

  const preview = Array.isArray(data) ? data[0] : data;
  cloudState.lastSharePreview = preview || null;

  if (!preview?.deck_id) {
    shareJoinTitle.textContent = "共有リンクが見つかりません";
    shareJoinStatus.textContent = "管理者に新しい共有リンクを発行してもらってください。";
    requestShareAccessButton.disabled = true;
    shareJoinModal.hidden = false;
    return;
  }

  shareJoinTitle.textContent = `${preview.deck_name} に参加`;

  if (preview.membership_role) {
    const localDeck = state.decks.find((deck) => deck.sharedDeckId === preview.deck_id);
    if (localDeck) {
      selectedDeckDetailId = localDeck.id;
    }
    shareJoinStatus.textContent = "この共有デッキには既に参加済みです。ライブラリで内容を確認できます。";
    requestShareAccessButton.disabled = true;
    shareJoinModal.hidden = false;
    return;
  }

  if (preview.request_status === "pending") {
    shareJoinStatus.textContent = "参加申請は送信済みです。承認されるまでお待ちください。";
    requestShareAccessButton.disabled = true;
    shareJoinModal.hidden = false;
    return;
  }

  if (preview.request_status === "rejected") {
    shareJoinStatus.textContent = "前回の申請は拒否されました。必要ならもう一度申請できます。";
  } else {
    shareJoinStatus.textContent = `${preview.subject || formatDeckFocus(preview.focus)} の共有デッキです。承認制で参加できます。`;
  }

  setShareJoinRoleVisibility(true);
  requestShareAccessButton.disabled = false;
  shareJoinModal.hidden = false;
}

async function requestShareAccess() {
  if (cloudState.joinMode === "local") {
    if (!cloudState.localSharePayload) {
      showToast("共有リンクの内容を読み取れませんでした");
      return;
    }
    importLocalSharedDeck(cloudState.localSharePayload);
    return;
  }

  if (!cloudState.shareToken) {
    showToast("共有リンクが見つかりません");
    return;
  }

  const client = cloudState.client || (await getSupabaseClient());
  if (!client || !cloudState.session?.user) {
    showToast("参加申請にはログインが必要です");
    return;
  }

  const requestedRole = shareJoinRoleSelect.value === "editor" ? "editor" : "viewer";

  const { error } = await client.rpc("request_deck_access", {
    target_token: cloudState.shareToken,
    requested_role: requestedRole,
  });

  if (error) {
    showToast(error.message || "参加申請に失敗しました");
    return;
  }

  await refreshShareJoinPreview();
  await refreshCloudData({ silent: true });
  showToast(requestedRole === "editor" ? "編集権限で参加申請を送りました" : "参加申請を送りました");
}

async function approveShareRequest(requestId, approvedRole = "viewer") {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client) {
    return;
  }

  const { error } = await client.rpc("approve_deck_access", {
    target_request_id: requestId,
    approved_role: approvedRole === "editor" ? "editor" : "viewer",
  });

  if (error) {
    showToast(error.message || "申請の承認に失敗しました");
    return;
  }

  await refreshCloudData({ silent: true });
  renderSharePanel();
  showToast(approvedRole === "editor" ? "編集メンバーとして承認しました" : "閲覧メンバーとして承認しました");
}

async function rejectShareRequest(requestId) {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client) {
    return;
  }

  const { error } = await client.rpc("reject_deck_access", {
    target_request_id: requestId,
  });

  if (error) {
    showToast(error.message || "申請の拒否に失敗しました");
    return;
  }

  await refreshCloudData({ silent: true });
  renderSharePanel();
  showToast("参加申請を拒否しました");
}

async function changeDeckMemberRole(deckId, memberId, nextRole) {
  const deck = getDeckById(deckId);
  const client = cloudState.client || (await getSupabaseClient());
  const safeRole = nextRole === "editor" ? "editor" : "viewer";

  if (!deck || !canManageDeckShare(deck) || !client) {
    showToast("この共有デッキのロールは変更できません");
    return;
  }

  const member = getDeckShareMembers(deck).find((entry) => entry.id === memberId);
  if (!member || member.role === "owner" || member.role === safeRole) {
    return;
  }

  const { error } = await client.from("deck_members").update({ role: safeRole }).eq("id", memberId);
  if (error) {
    showToast(error.message || "ロール変更に失敗しました");
    return;
  }

  await refreshCloudData({ silent: true });
  showToast(`${formatShareMemberName(member)} を ${formatRoleLabel(safeRole)} に変更しました`);
}

async function removeDeckMember(deckId, memberId) {
  const deck = getDeckById(deckId);
  const client = cloudState.client || (await getSupabaseClient());

  if (!deck || deck.storageMode !== "shared" || !client || !cloudState.session?.user) {
    showToast("共有メンバーを操作するにはログインが必要です");
    return;
  }

  const member = getDeckShareMembers(deck).find((entry) => entry.id === memberId);
  if (!member || member.role === "owner") {
    return;
  }

  const removingSelf = member.isCurrentUser;
  const allowed = canManageDeckShare(deck) || removingSelf;
  if (!allowed) {
    showToast("この共有デッキのメンバー管理はできません");
    return;
  }

  const confirmed = window.confirm(
    removingSelf
      ? "共有から抜けますか？ この端末にはローカルコピーを残します。"
      : `${formatShareMemberName(member)} を共有から外しますか？ 相手の端末ではローカルコピーとして残ります。`,
  );
  if (!confirmed) {
    return;
  }

  const { error } = await client.from("deck_members").delete().eq("id", memberId);
  if (error) {
    showToast(error.message || "メンバーの更新に失敗しました");
    return;
  }

  if (removingSelf) {
    detachDeckFromCloud(deck, "共有から抜けたためローカルコピーへ切り替え");
  }

  await refreshCloudData({ silent: true });
  showToast(removingSelf ? "共有から抜けてローカルコピーへ切り替えました" : "メンバーを共有から外しました");
}

async function regenerateShareLinkForDeck(deckId = "") {
  const deck = deckId ? getDeckById(deckId) : getSelectedShareDeck();
  const client = cloudState.client || (await getSupabaseClient());

  if (!deck || !canManageDeckShare(deck) || !client || !cloudState.session?.user) {
    showToast("リンクを再発行できるのは owner のみです");
    return;
  }

  const nextToken = crypto.randomUUID();
  const { error } = await client.from("shared_decks").update({ share_token: nextToken }).eq("id", deck.sharedDeckId);
  if (error) {
    showToast(error.message || "リンク再発行に失敗しました");
    return;
  }

  deck.shareToken = nextToken;
  shareLinkCache = buildShareUrl(nextToken);
  persist();
  render();
  showToast("共有リンクを再発行しました。古いリンクは使えなくなります");
}

async function stopOrLeaveDeck(deckId) {
  const deck = getDeckById(deckId);
  const client = cloudState.client || (await getSupabaseClient());

  if (!deck || deck.storageMode !== "shared" || !client || !cloudState.session?.user) {
    showToast("共有操作にはログインが必要です");
    return;
  }

  if (canManageDeckShare(deck)) {
    const confirmed = window.confirm("この共有デッキを終了して、手元のデッキだけローカルに戻しますか？ 共有リンクは使えなくなります。");
    if (!confirmed) {
      return;
    }

    const { error } = await client.from("shared_decks").delete().eq("id", deck.sharedDeckId);
    if (error) {
      showToast(error.message || "共有終了に失敗しました");
      return;
    }

    detachDeckFromCloud(deck, "共有を終了したためローカルデッキに戻しました");
    await refreshCloudData({ silent: true });
    showToast("共有を終了してローカルデッキに戻しました");
    return;
  }

  const selfMember = getDeckShareMembers(deck).find((member) => member.isCurrentUser);
  if (!selfMember) {
    showToast("現在のメンバー情報を確認できませんでした");
    return;
  }

  await removeDeckMember(deck.id, selfMember.id);
}

function stopOrLeaveSelectedDeck() {
  const deck = getSelectedShareDeck();
  if (!deck) {
    showToast("対象デッキを選んでください");
    return;
  }
  stopOrLeaveDeck(deck.id);
}

function exportJsonBackup() {
  const snapshot = {
    exportedAt: new Date().toISOString(),
    version: 2,
    state,
  };
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pulse-recall-backup-${formatDateKey(new Date())}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("JSON バックアップを書き出しました");
}

async function importJsonBackup(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const nextState = normalizeState(parsed.state || parsed);
    if (!Array.isArray(nextState.decks) || !Array.isArray(nextState.cards)) {
      throw new Error("バックアップ形式が正しくありません");
    }

    const approved = window.confirm("現在のローカルデータを、この JSON バックアップで置き換えます。続けますか？");
    if (!approved) {
      importJsonFileInput.value = "";
      return;
    }

    state = nextState;
    clearDeckEditing();
    clearCardEditing();
    currentCardId = null;
    isAnswerVisible = false;
    importDraft = null;
    importSelection.clear();
    persist();
    render();
    showToast("JSON バックアップを読み込みました");
  } catch (error) {
    showToast(error.message || "JSON の読み込みに失敗しました");
  } finally {
    importJsonFileInput.value = "";
  }
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js", { updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
  }
}

function createDemoState() {
  const now = Date.now();
  const medicalBasicsDeckId = "deck-medical-basics";
  const medicalClinicalDeckId = "deck-medical-clinical";
  const englishMedicalDeckId = "deck-english-medical";
  const englishReadingDeckId = "deck-english-reading";

  return {
    decks: [
      {
        id: medicalBasicsDeckId,
        name: "解剖・生理ベーシック",
        focus: "medical",
        subject: "解剖 / 生理",
        description: "構造と機能を対で覚える医学部基礎デッキ",
        createdAt: now - 6 * dayMs,
      },
      {
        id: medicalClinicalDeckId,
        name: "病態・臨床推論",
        focus: "medical",
        subject: "病態 / 内科",
        description: "症状から病態をつなぐ臨床寄りデッキ",
        createdAt: now - 5 * dayMs,
      },
      {
        id: englishMedicalDeckId,
        name: "Medical English Core",
        focus: "english",
        subject: "医学英語 / 語彙",
        description: "医療現場や論文で頻出の語彙デッキ",
        createdAt: now - 4 * dayMs,
      },
      {
        id: englishReadingDeckId,
        name: "English Reading Patterns",
        focus: "english",
        subject: "読解 / 構文",
        description: "長文読解や論文読解の構文デッキ",
        createdAt: now - 4 * dayMs,
      },
    ],
    cards: [
      makeCard({
        id: "card-1",
        deckId: medicalBasicsDeckId,
        front: "僧帽弁はどの部屋の間にある？",
        back: "左心房と左心室の間。",
        hint: "房室弁の左右差で整理する。",
        topic: "循環",
        tags: ["解剖", "循環", "必修"],
        note: "右は三尖弁、左は僧帽弁。弁膜症の整理にもつながる。",
        example: "僧帽弁狭窄では左房圧上昇から肺うっ血につながる。",
        createdAt: now - 5 * dayMs,
        dueAt: now - 2 * hourMs,
        intervalDays: 0,
      }),
      makeCard({
        id: "card-2",
        deckId: medicalClinicalDeckId,
        front: "ネフローゼ症候群の4徴は？",
        back: "高度蛋白尿、低アルブミン血症、浮腫、高脂血症。",
        hint: "低Albから浮腫につながる流れを押さえる。",
        topic: "腎疾患",
        tags: ["病理", "腎", "内科"],
        note: "糸球体障害による蛋白漏出と膠質浸透圧低下を一続きで覚える。",
        example: "膜性腎症や微小変化型ネフローゼで典型的。",
        createdAt: now - 3 * dayMs,
        dueAt: now - hourMs,
        intervalDays: 1,
      }),
      makeCard({
        id: "card-3",
        deckId: englishMedicalDeckId,
        front: "administer",
        back: "投与する、実施する。",
        hint: "薬剤や酸素、検査の文脈で頻出。",
        topic: "医学英語",
        tags: ["vocabulary", "medical english", "verb"],
        note: "administer a drug, administer oxygen の形をセットで覚える。",
        example: "The nurse administered the medication intravenously.",
        createdAt: now - 4 * dayMs,
        dueAt: now - 30 * 60 * 1000,
        intervalDays: 0,
      }),
      makeCard({
        id: "card-4",
        deckId: englishReadingDeckId,
        front: "Although A, B",
        back: "Aではあるが、B。",
        hint: "逆接の主張は後半に来る。",
        topic: "構文",
        tags: ["reading", "grammar", "contrast"],
        note: "読解では although 節のあとよりも主節の内容を優先して把握する。",
        example: "Although the sample size was small, the trend was consistent.",
        createdAt: now - 2 * dayMs,
        dueAt: now + dayMs,
        intervalDays: 2,
      }),
    ],
    reviewLog: [],
    assistant: {
      messages: [],
      deckFilter: "all",
    },
    settings: {
      onboardingCompleted: false,
    },
  };
}

function makeCard({
  id,
  deckId,
  front,
  back,
  hint,
  topic = "",
  tags = [],
  note = "",
  example = "",
  createdAt,
  dueAt,
  intervalDays,
  sharedCardId = "",
}) {
  return {
    id,
    deckId,
    front,
    back,
    hint,
    topic,
    tags: Array.isArray(tags) ? tags : parseTags(String(tags || "")),
    note,
    example,
    createdAt,
    updatedAt: createdAt,
    sharedCardId,
    study: {
      dueAt,
      intervalDays,
      ease: 2.3,
      reps: 0,
      lapses: 0,
      lastReviewedAt: null,
      mode: intervalDays >= 1 ? "review" : "new",
      stepIndex: intervalDays >= 1 ? 0 : -1,
      recoveryDays: Math.max(1, Math.round(intervalDays || 1)),
    },
  };
}

function getIntervalMs(intervalDays) {
  if (intervalDays < 1) {
    return Math.round(intervalDays * dayMs);
  }

  return intervalDays * dayMs;
}

function formatInterval(intervalDays) {
  if (!intervalDays) {
    return "学習中";
  }

  if (intervalDays < 1) {
    return `${Math.max(1, Math.round(intervalDays * 24))}時間`;
  }

  return `${intervalDays}日`;
}

function formatDueLabel(timestamp) {
  const diff = timestamp - Date.now();
  if (diff <= 0) {
    return "今すぐ";
  }

  if (diff < dayMs) {
    return `${Math.ceil(diff / hourMs)}時間後`;
  }

  return `${Math.ceil(diff / dayMs)}日後`;
}

function getReviewToast(rating, intervalDays) {
  if (rating === "again") {
    return `短く復習に戻します。次回は約${formatInterval(intervalDays)}後です`;
  }

  if (rating === "hard") {
    return `少し慎重に調整しました。次回は約${formatInterval(intervalDays)}後です`;
  }

  return `順調です。次回は約${formatInterval(intervalDays)}後です`;
}

function formatDateKey(date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("-");
}

function formatShortDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function renderHistoryPanel() {
  const history = buildHistorySummary();

  historySummary.textContent =
    history.totalAnswers > 0
      ? `今日 ${history.todayAnswers}件回答 / 連続 ${history.streakDays}日 / 最終学習 ${history.lastAnsweredLabel}`
      : "まだ履歴がありません";
  historyCompactList.innerHTML = [
    { label: "今日の回答数", value: `${history.todayAnswers}件` },
    { label: "連続日数", value: `${history.streakDays}日` },
    { label: "最終学習日", value: history.lastAnsweredLabel },
  ]
    .map(
      (item) => `
        <article class="history-compact-item">
          <p class="eyebrow">${escapeHtml(item.label)}</p>
          <h4>${escapeHtml(item.value)}</h4>
        </article>
      `,
    )
    .join("");
  historyDetailsPanel.hidden = !homeHistoryExpanded || history.totalAnswers === 0;
  toggleHistoryDetailsButton.textContent = history.totalAnswers === 0
    ? "履歴はまだありません"
    : homeHistoryExpanded
      ? "閉じる"
      : "詳しく見る";
  toggleHistoryDetailsButton.disabled = history.totalAnswers === 0;

  historyChart.innerHTML = history.days
    .map((day) => {
      const height = history.maxCount > 0 ? Math.max(10, Math.round((day.count / history.maxCount) * 100)) : 10;

      return `
        <div class="history-day">
          <span class="history-count">${day.count}</span>
          <div class="history-bar-wrap">
            <div class="history-bar" style="height:${height}%"></div>
          </div>
          <span class="history-label">${day.label}</span>
        </div>
      `;
    })
    .join("");

  historyBreakdown.innerHTML = [
    { label: "覚えた", count: history.ratings.good, className: "success" },
    { label: "あいまい", count: history.ratings.hard, className: "caution" },
    { label: "忘れた", count: history.ratings.again, className: "danger" },
  ]
    .map(
      (item) => `
        <div class="history-pill ${item.className}">
          <span>${item.label}</span>
          <strong>${item.count}</strong>
        </div>
      `,
    )
    .join("");
}

function buildHistorySummary() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  const countsByDay = new Map();
  const ratings = { again: 0, hard: 0, good: 0 };
  let lastAnsweredAt = 0;

  state.reviewLog.forEach((entry) => {
    const date = new Date(entry.timestamp);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString().slice(0, 10);
    countsByDay.set(key, (countsByDay.get(key) || 0) + 1);
    if (entry.rating in ratings) {
      ratings[entry.rating] += 1;
    }
    if (Number(entry.timestamp || 0) > lastAnsweredAt) {
      lastAnsweredAt = Number(entry.timestamp || 0);
    }
  });

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    days.push({
      key,
      label: formatShortDate(date),
      count: countsByDay.get(key) || 0,
    });
  }

  let streakDays = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].count > 0) {
      streakDays += 1;
    } else {
      break;
    }
  }

  return {
    days,
    ratings,
    totalAnswers: days.reduce((sum, day) => sum + day.count, 0),
    todayAnswers: days[days.length - 1]?.count || 0,
    maxCount: Math.max(0, ...days.map((day) => day.count)),
    streakDays,
    lastAnsweredAt,
    lastAnsweredLabel: lastAnsweredAt ? formatHistoryDate(lastAnsweredAt) : "未学習",
  };
}

function formatHistoryDate(timestamp) {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function renderRatingHints(card) {
  Object.entries(ratingButtons).forEach(([rating, button]) => {
    if (!card) {
      button.innerHTML = getRatingLabel(rating);
      button.disabled = true;
      return;
    }

    const preview = calculateReviewOutcome(card, rating, Date.now());
    button.innerHTML = `${getRatingLabel(rating)}<small>${escapeHtml(preview.shortLabel)}</small>`;
    button.disabled = false;
  });
}

function calculateReviewOutcome(card, rating, now) {
  const study = normalizeStudy(card.study, now);

  if (study.mode === "review") {
    return calculateReviewPhaseOutcome(study, rating, now);
  }

  return calculateLearningPhaseOutcome(study, rating, now);
}

function calculateReviewPhaseOutcome(study, rating, now) {
  const previousInterval = Math.max(1, Math.round(study.intervalDays || 1));
  const daysLate = Math.max(0, (now - study.dueAt) / dayMs);

  if (rating === "again") {
    const recoveryDays = Math.max(1, Math.round(previousInterval * 0.5));

    return {
      study: {
        dueAt: now + relearningStepsMinutes[0] * minuteMs,
        intervalDays: 0,
        ease: Math.max(1.3, study.ease - 0.2),
        lapses: (study.lapses || 0) + 1,
        mode: "relearning",
        stepIndex: 0,
        recoveryDays,
      },
      shortLabel: `約${formatMinutesLabel(relearningStepsMinutes[0])}`,
      toast: `再学習に戻します。次回は約${formatMinutesLabel(relearningStepsMinutes[0])}後です`,
    };
  }

  if (rating === "hard") {
    const nextInterval = Math.max(previousInterval + 1, Math.round((previousInterval + daysLate * 0.25) * 1.2));

    return {
      study: {
        dueAt: now + nextInterval * dayMs,
        intervalDays: nextInterval,
        ease: Math.max(1.3, study.ease - 0.05),
        lapses: study.lapses || 0,
        mode: "review",
        stepIndex: 0,
        recoveryDays: Math.max(1, Math.round(nextInterval * 0.6)),
      },
      shortLabel: `${nextInterval}日後`,
      toast: `少し慎重に延ばします。次回は約${nextInterval}日後です`,
    };
  }

  const nextInterval = Math.max(previousInterval + 1, Math.round((previousInterval + daysLate * 0.5 + 1) * study.ease));

  return {
    study: {
      dueAt: now + nextInterval * dayMs,
      intervalDays: nextInterval,
      ease: Math.min(3.0, study.ease + 0.04),
      lapses: study.lapses || 0,
      mode: "review",
      stepIndex: 0,
      recoveryDays: Math.max(1, Math.round(nextInterval * 0.6)),
    },
    shortLabel: `${nextInterval}日後`,
    toast: `順調です。次回は約${nextInterval}日後です`,
  };
}

function calculateLearningPhaseOutcome(study, rating, now) {
  const steps = study.mode === "relearning" ? relearningStepsMinutes : learningStepsMinutes;
  const nextMode = study.mode === "relearning" ? "relearning" : "learning";
  const currentStep = typeof study.stepIndex === "number" ? study.stepIndex : -1;

  if (rating === "again") {
    return {
      study: {
        dueAt: now + steps[0] * minuteMs,
        intervalDays: 0,
        ease: study.ease,
        lapses: study.lapses || 0,
        mode: nextMode,
        stepIndex: 0,
        recoveryDays: study.recoveryDays || 1,
      },
      shortLabel: `約${formatMinutesLabel(steps[0])}`,
      toast: `短い反復に戻します。次回は約${formatMinutesLabel(steps[0])}後です`,
    };
  }

  if (rating === "hard") {
    const holdIndex = Math.max(0, currentStep);
    const hardMinutes =
      currentStep < 0
        ? steps[0]
        : Math.max(steps[holdIndex], Math.round(steps[Math.min(holdIndex + 1, steps.length - 1)] * 0.5));

    return {
      study: {
        dueAt: now + hardMinutes * minuteMs,
        intervalDays: 0,
        ease: study.ease,
        lapses: study.lapses || 0,
        mode: nextMode,
        stepIndex: holdIndex,
        recoveryDays: study.recoveryDays || 1,
      },
      shortLabel: `約${formatMinutesLabel(hardMinutes)}`,
      toast: `もう一度同じ段階で確認します。次回は約${formatMinutesLabel(hardMinutes)}後です`,
    };
  }

  const nextStep = currentStep + 1;
  if (nextStep < steps.length) {
    return {
      study: {
        dueAt: now + steps[nextStep] * minuteMs,
        intervalDays: 0,
        ease: study.ease,
        lapses: study.lapses || 0,
        mode: nextMode,
        stepIndex: nextStep,
        recoveryDays: study.recoveryDays || 1,
      },
      shortLabel: `約${formatMinutesLabel(steps[nextStep])}`,
      toast: `次の学習ステップへ進めます。次回は約${formatMinutesLabel(steps[nextStep])}後です`,
    };
  }

  const graduateDays = study.mode === "relearning" ? Math.max(1, study.recoveryDays || 1) : 1;
  return {
    study: {
      dueAt: now + graduateDays * dayMs,
      intervalDays: graduateDays,
      ease: study.mode === "relearning" ? study.ease : Math.min(3.0, study.ease + 0.03),
      lapses: study.lapses || 0,
      mode: "review",
      stepIndex: 0,
      recoveryDays: Math.max(1, Math.round(graduateDays * 0.6)),
    },
    shortLabel: `${graduateDays}日後`,
    toast: `定着レビューへ進みます。次回は約${graduateDays}日後です`,
  };
}

function normalizeState(rawState) {
  return {
    decks: Array.isArray(rawState.decks) ? rawState.decks.map((deck) => normalizeDeck(deck)) : [],
    cards: Array.isArray(rawState.cards) ? rawState.cards.map((card) => normalizeCard(card)) : [],
    reviewLog: Array.isArray(rawState.reviewLog) ? rawState.reviewLog : [],
    assistant: normalizeAssistantState(rawState.assistant),
    settings: normalizeSettingsState(rawState.settings),
  };
}

function normalizeSettingsState(settings) {
  const safeSettings = settings || {};
  return {
    onboardingCompleted: Boolean(safeSettings.onboardingCompleted),
  };
}

function normalizeAssistantState(assistant) {
  const safeAssistant = assistant || {};

  return {
    messages: Array.isArray(safeAssistant.messages)
      ? safeAssistant.messages
          .filter((message) => message && (message.role === "user" || message.role === "assistant"))
          .map((message) => ({
            id: String(message.id || crypto.randomUUID()),
            role: message.role,
            text: String(message.text || "").trim(),
            createdAt: Number.isFinite(message.createdAt) ? message.createdAt : Date.now(),
            sources: Array.isArray(message.sources)
              ? message.sources
                  .map((source) => ({
                    title: String(source.title || "").trim(),
                    url: String(source.url || "").trim(),
                  }))
                  .filter((source) => source.title || source.url)
              : [],
            matchCount: Number.isFinite(message.matchCount) ? message.matchCount : 0,
          }))
          .slice(-16)
      : [],
    deckFilter: String(safeAssistant.deckFilter || "all"),
  };
}

function normalizeDeck(deck) {
  const safeDeck = deck || {};

  return {
    id: String(safeDeck.id || crypto.randomUUID()),
    name: String(safeDeck.name || "無題デッキ"),
    focus: normalizeDeckFocus(safeDeck.focus),
    subject: String(safeDeck.subject || "").trim(),
    description: String(safeDeck.description || "").trim(),
    createdAt: Number.isFinite(safeDeck.createdAt) ? safeDeck.createdAt : Date.now(),
    updatedAt: Number.isFinite(safeDeck.updatedAt) ? safeDeck.updatedAt : Number.isFinite(safeDeck.createdAt) ? safeDeck.createdAt : Date.now(),
    storageMode: safeDeck.storageMode === "shared" ? "shared" : "local",
    sharedDeckId: String(safeDeck.sharedDeckId || "").trim(),
    shareToken: String(safeDeck.shareToken || "").trim(),
    role: ["owner", "editor", "viewer", "pending_request"].includes(String(safeDeck.role || ""))
      ? String(safeDeck.role)
      : "owner",
    syncState: ["local-only", "synced", "dirty", "syncing", "offline"].includes(String(safeDeck.syncState || ""))
      ? String(safeDeck.syncState)
      : safeDeck.storageMode === "shared"
        ? "dirty"
        : "local-only",
  };
}

function normalizeCard(card) {
  return {
    ...card,
    topic: String(card.topic || "").trim(),
    tags: Array.isArray(card.tags) ? card.tags.filter(Boolean) : parseTags(card.tags),
    note: String(card.note || "").trim(),
    example: String(card.example || "").trim(),
    createdAt: Number.isFinite(card.createdAt) ? card.createdAt : Date.now(),
    updatedAt: Number.isFinite(card.updatedAt) ? card.updatedAt : Number.isFinite(card.createdAt) ? card.createdAt : Date.now(),
    sharedCardId: String(card.sharedCardId || "").trim(),
    study: normalizeStudy(card.study, Date.now()),
  };
}

function normalizeStudy(study, now) {
  const safeStudy = study || {};
  const intervalDays = Number.isFinite(safeStudy.intervalDays) ? Math.max(0, safeStudy.intervalDays) : 0;
  const inferredMode =
    typeof safeStudy.mode === "string"
      ? safeStudy.mode
      : intervalDays >= 1
        ? "review"
        : (safeStudy.reps || 0) > 0
          ? "learning"
          : "new";

  return {
    dueAt: Number.isFinite(safeStudy.dueAt) ? safeStudy.dueAt : now,
    intervalDays,
    ease: Number.isFinite(safeStudy.ease) ? safeStudy.ease : 2.3,
    reps: Number.isFinite(safeStudy.reps) ? safeStudy.reps : 0,
    lapses: Number.isFinite(safeStudy.lapses) ? safeStudy.lapses : 0,
    lastReviewedAt: Number.isFinite(safeStudy.lastReviewedAt) ? safeStudy.lastReviewedAt : null,
    mode: inferredMode,
    stepIndex: Number.isFinite(safeStudy.stepIndex) ? safeStudy.stepIndex : inferredMode === "new" ? -1 : 0,
    recoveryDays: Number.isFinite(safeStudy.recoveryDays)
      ? Math.max(1, safeStudy.recoveryDays)
      : Math.max(1, Math.round(intervalDays || 1)),
  };
}

function formatStudyMode(study) {
  if (study.mode === "review") {
    return "定着レビュー";
  }

  if (study.mode === "relearning") {
    return "再学習";
  }

  if (study.mode === "learning") {
    return "学習中";
  }

  return "新規";
}

function getRatingLabel(rating) {
  if (rating === "again") {
    return "忘れた";
  }

  if (rating === "hard") {
    return "あいまい";
  }

  return "覚えた";
}

function formatMinutesLabel(minutes) {
  if (minutes < 60) {
    return `${minutes}分`;
  }

  const hours = Math.round((minutes / 60) * 10) / 10;
  if (hours < 24) {
    return Number.isInteger(hours) ? `${hours}時間` : `${hours}時間`;
  }

  const days = Math.round((minutes / (60 * 24)) * 10) / 10;
  return Number.isInteger(days) ? `${days}日` : `${days}日`;
}

function normalizeImportedText(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function extractMeaningfulLines(text) {
  return [...new Set(
    normalizeImportedText(text)
      .split("\n")
      .map((line) => cleanImportedSegment(line))
      .filter((line) => line.length >= 3 && line.length <= 240)
      .filter((line) => !/^\d+$/.test(line))
      .filter((line) => !/^page\s+\d+$/i.test(line)),
  )];
}

function cleanImportedSegment(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/^[:：\-–—=]+/, "")
    .replace(/[:：\-–—=]+$/, "")
    .trim();
}

function isViableCardPair(left, right) {
  return Boolean(left && right && left.length <= 120 && right.length >= 6 && right.length <= 260 && left !== right);
}

function buildImportedFront(title, focus) {
  if (focus === "english" && looksLikeEnglishTerm(title)) {
    return title;
  }

  if (/[?？]$/.test(title)) {
    return title;
  }

  if (title.endsWith("とは") || title.endsWith("は")) {
    return `${title}？`;
  }

  return `${title}とは？`;
}

function inferImportedTopic(title, subject, focus) {
  const baseTopic = splitSubjectTags(subject)[0];
  if (baseTopic) {
    return baseTopic;
  }

  if (focus === "medical") {
    if (/腎|電解質|体液/.test(title)) return "腎";
    if (/心|循環|冠|弁/.test(title)) return "循環";
    if (/呼吸|肺|酸塩基/.test(title)) return "呼吸";
    if (/薬|受容体|NSAIDs|ACE/.test(title)) return "薬理";
    return "医学";
  }

  if (focus === "english") {
    if (looksLikeEnglishTerm(title)) return "語彙";
    return "読解";
  }

  return "";
}

function buildImportedTags(title, subject, focus) {
  const tags = [];

  if (focus === "medical") {
    tags.push("医学");
  } else if (focus === "english") {
    tags.push("英語");
  }

  tags.push(...splitSubjectTags(subject));

  if (focus === "english" && looksLikeEnglishTerm(title)) {
    tags.push("vocabulary");
  }

  if (focus === "medical" && /症候|病態|鑑別/.test(title)) {
    tags.push("臨床");
  }

  return dedupeTags(tags);
}

function dedupeImportCards(cards) {
  const seen = new Set();

  return cards.filter((card) => {
    const key = `${card.front}__${card.back}`.toLowerCase();
    if (seen.has(key) || !isViableCardPair(card.front, card.back)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function dedupeTags(tags) {
  return [...new Set((tags || []).map((tag) => cleanImportedSegment(tag)).filter(Boolean))];
}

function splitSubjectTags(subject) {
  return String(subject || "")
    .split(/[\/,、，]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function buildImportNote(sourceName, instructions) {
  const base = sourceName ? `${sourceName} から自動生成` : "資料から自動生成";
  return instructions ? `${base} / ${instructions}` : base;
}

function buildDeckNameFromSource(sourceName) {
  return String(sourceName || "自動生成デッキ")
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

function inferAssistantFocus(filter) {
  if (String(filter || "").startsWith("focus:")) {
    return normalizeDeckFocus(String(filter).slice("focus:".length));
  }

  const deckFocus = getDeckFocus(filter);
  return deckFocus === "general" ? "medical" : deckFocus;
}

function createUniqueDeckName(baseName) {
  const name = cleanImportedSegment(baseName) || "自動生成デッキ";
  if (!state.decks.some((deck) => deck.name === name)) {
    return name;
  }

  let suffix = 2;
  while (state.decks.some((deck) => deck.name === `${name} (${suffix})`)) {
    suffix += 1;
  }

  return `${name} (${suffix})`;
}

function startsWithBullet(line) {
  return /^[\-*•●・■□▪◦]|^\d+[.)]/.test(String(line || "").trim());
}

function stripBullet(line) {
  return cleanImportedSegment(String(line || "").replace(/^[\-*•●・■□▪◦\d().\s]+/, ""));
}

function looksLikeEnglishTerm(value) {
  return /^[A-Za-z][A-Za-z0-9(),/+\- ]{1,80}$/.test(String(value || "").trim());
}

function splitIntoSentences(text) {
  return String(text || "")
    .replace(/([。.!?])/g, "$1\n")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function looksLikeHeading(value) {
  const line = String(value || "").trim();
  return Boolean(
    line &&
      line.length <= 70 &&
      !/[。.!?]$/.test(line) &&
      !startsWithBullet(line) &&
      !/[,:：=]/.test(line),
  );
}

function isPdfFile(file) {
  const fileName = String(file?.name || "").toLowerCase();
  return file?.type === "application/pdf" || fileName.endsWith(".pdf");
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function normalizeDeckFocus(value) {
  const focus = String(value || "").trim();
  if (focus === "medical" || focus === "english" || focus === "general") {
    return focus;
  }

  return "general";
}

function formatDeckFocus(focus) {
  if (focus === "medical") {
    return "医学";
  }

  if (focus === "english") {
    return "英語";
  }

  return "汎用";
}

function getDeckFocus(deckId) {
  return normalizeDeckFocus(getDeckById(deckId)?.focus);
}

function parseTags(input) {
  return [...new Set(
    String(input || "")
      .split(/[,\n、，]/)
      .map((tag) => tag.trim())
      .filter(Boolean),
  )];
}

function renderPillRow(items, className = "") {
  return items
    .map((item) => `<span class="meta-pill ${escapeHtml(className)}">${escapeHtml(item)}</span>`)
    .join("");
}

function setElementCopy(element, value) {
  element.textContent = value || "";
  element.hidden = !value;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function optionExists(select, value) {
  return [...select.options].some((option) => option.value === value);
}
