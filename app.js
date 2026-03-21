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
const AI_GENERATE_ENDPOINT = "/api/ai/generate";
const LOCAL_SHARE_PARAM = "deckshare";
const CLOUD_SHARE_PARAM = "share";
const COPY_SHARE_PARAM = "copy";
const SHARED_MEDIA_BUCKET = "shared-card-media";
const COPY_PACKAGE_BUCKET = "shared-copy-packages";
const BACKUP_SNAPSHOT_BUCKET = "user-backup-snapshots";
const BACKUP_SNAPSHOT_VERSION = 4;
const BACKUP_AUTO_DEBOUNCE_MS = 15 * 1000;
const BACKUP_RESTORE_POINT_LIMIT = 5;
const AUTH_INTENT_STORAGE_KEY = "pulse-recall-auth-intent-v1";
const MEDIA_DB_NAME = "pulse-recall-media-v1";
const MEDIA_DB_VERSION = 1;
const MEDIA_STORE_NAME = "card-media";
const MEDIA_SIDE_LIMIT = 4;
const MAX_MEDIA_SIZE_BYTES = 8 * 1024 * 1024;
const DEMO_RESET_CONFIRM_TEXT = "サンプルを読み込む";
const SHARE_LOCK_LEASE_SECONDS = 10 * 60;
const SHARE_LOCK_HEARTBEAT_MS = 30 * 1000;
const SHARE_EVENT_LIMIT = 36;
const SHARE_NOTIFICATION_LIMIT = 24;
const SHARE_PERMISSION_KEYS = [
  "edit_deck_meta",
  "add_cards",
  "edit_cards",
  "delete_cards",
  "upload_media",
  "manage_members",
  "approve_requests",
  "regenerate_share_link",
  "publish_copy_link",
];
const SHARE_ROLE_PERMISSION_PRESETS = {
  owner: SHARE_PERMISSION_KEYS.reduce((collection, key) => ({ ...collection, [key]: true }), {}),
  editor: {
    edit_deck_meta: true,
    add_cards: true,
    edit_cards: true,
    delete_cards: true,
    upload_media: true,
    manage_members: false,
    approve_requests: false,
    regenerate_share_link: false,
    publish_copy_link: false,
  },
  viewer: SHARE_PERMISSION_KEYS.reduce((collection, key) => ({ ...collection, [key]: false }), {}),
};
const AI_FALLBACK_ERROR_CODES = new Set([
  "AI_DISABLED",
  "AI_NOT_CONFIGURED",
  "AI_RATE_LIMITED",
  "FREE_TIER_EXCEEDED",
  "AI_ENDPOINT_UNAVAILABLE",
  "AI_FILE_TOO_LARGE",
  "AI_BAD_RESPONSE",
  "AI_UNSUPPORTED_PROVIDER",
]);
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
let mediaDbPromise = null;
let activeSection = "dashboard";
let currentCardId = null;
let isAnswerVisible = false;
let studyMode = "review";
let studySourceKey = "due";
let studySessionSize = 8;
let studySession = null;
let studyQuickMinutes = state.settings?.studyPreferences?.defaultSessionMinutes || 5;
let homeHistoryExpanded = false;
let importContextDeckId = "";
let questionMapContextDeckId = "";
let deckActionDeckId = "";
let editingDeckId = null;
let editingCardId = null;
let toastTimer = null;
let importDraft = null;
let pdfjsModulePromise = null;
let isImportLoading = false;
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
let aiStudyDraft = null;
let isAiStudyLoading = false;
let aiStudyErrorMessage = "";
let featureSearchVisible = false;
let selectedEditDeckId = "";
let editSubview = "deck";
let editCardQuery = "";
let editWorkspaceCardId = "";
let cardMediaDraft = createEmptyMediaDraft();
let quickCaptureMediaDraft = createEmptyMediaDraft();
let editCardMediaDraft = createEmptyMediaDraft();
let studyAdvanceTimer = null;
let settingsEmailAuthVisible = false;
let shareEmailAuthVisible = false;
let cloudState = {
  status: "idle",
  config: null,
  configError: "",
  client: null,
  module: null,
  session: null,
  profile: null,
  shareToken: "",
  joinMode: "",
  localSharePayload: null,
  copyToken: "",
  copySharePayload: null,
  lastLocalShareDeckId: "",
  pendingRequests: [],
  membersByDeck: {},
  notifications: [],
  deckEventsByDeck: {},
  editLocksByDeck: {},
  lastSharePreview: null,
  backupSnapshots: [],
  backupStatus: "idle",
  backupError: "",
  backupReadinessIssue: null,
  latestBackupAt: 0,
  lastBackupFingerprint: "",
  backupDirty: false,
  backupTimer: null,
  backupBusy: false,
  activeEditLocks: {
    deck: null,
    card: null,
  },
  lockHeartbeatTimer: null,
  authIntent: "",
  lastSessionUserId: "",
  authIssue: null,
};
const mediaPreviewUrlCache = new Map();

const tabs = [...document.querySelectorAll(".tab")];
const sections = [...document.querySelectorAll(".content")];
const createModeButtons = [...document.querySelectorAll("[data-create-mode]")];
const studyModeButtons = [...document.querySelectorAll("[data-study-mode]")];
const templateButtons = [...document.querySelectorAll("[data-template]")];
const deckDetailTabButtons = [...document.querySelectorAll("[data-deck-detail-tab]")];
const editSubviewButtons = [...document.querySelectorAll("[data-edit-subview]")];
const openFeatureSearchButton = document.getElementById("openFeatureSearchButton");
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
const homeShareNotificationStatus = document.getElementById("homeShareNotificationStatus");
const homeShareNotificationList = document.getElementById("homeShareNotificationList");
const homeBackupStatus = document.getElementById("homeBackupStatus");
const homeBackupActions = document.getElementById("homeBackupActions");
const historyChart = document.getElementById("historyChart");
const historySummary = document.getElementById("historySummary");
const historyBreakdown = document.getElementById("historyBreakdown");
const historyCompactList = document.getElementById("historyCompactList");
const historyDetailsPanel = document.getElementById("historyDetailsPanel");
const toggleHistoryDetailsButton = document.getElementById("toggleHistoryDetailsButton");
const studyDeckFilter = document.getElementById("studyDeckFilter");
const studyQuickCaptureButton = document.getElementById("studyQuickCaptureButton");
const studyQuickSummary = document.getElementById("studyQuickSummary");
const studyMinuteButtons = [...document.querySelectorAll("[data-study-minutes]")];
const studyQuickActionGrid = document.getElementById("studyQuickActionGrid");
const studyModeSummary = document.getElementById("studyModeSummary");
const studySessionSizeInput = document.getElementById("studySessionSizeInput");
const startStudySessionButton = document.getElementById("startStudySessionButton");
const aiStudyPanel = document.getElementById("aiStudyPanel");
const generateAiStudyButton = document.getElementById("generateAiStudyButton");
const startAiStudyButton = document.getElementById("startAiStudyButton");
const saveAiStudyCardsButton = document.getElementById("saveAiStudyCardsButton");
const clearAiStudyButton = document.getElementById("clearAiStudyButton");
const aiStudyStatus = document.getElementById("aiStudyStatus");
const aiStudyPreview = document.getElementById("aiStudyPreview");
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
const cardFrontMedia = document.getElementById("cardFrontMedia");
const cardBack = document.getElementById("cardBack");
const cardBackMedia = document.getElementById("cardBackMedia");
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
const shortQuizFrontMedia = document.getElementById("shortQuizFrontMedia");
const shortQuizMeta = document.getElementById("shortQuizMeta");
const shortQuizTopic = document.getElementById("shortQuizTopic");
const shortQuizTags = document.getElementById("shortQuizTags");
const shortQuizAnswerInput = document.getElementById("shortQuizAnswerInput");
const shortQuizAnswerArea = document.getElementById("shortQuizAnswerArea");
const shortQuizBack = document.getElementById("shortQuizBack");
const shortQuizBackMedia = document.getElementById("shortQuizBackMedia");
const shortQuizHint = document.getElementById("shortQuizHint");
const shortQuizNote = document.getElementById("shortQuizNote");
const shortQuizExample = document.getElementById("shortQuizExample");
const shortQuizRevealButton = document.getElementById("shortQuizRevealButton");
const shortQuizNextButton = document.getElementById("shortQuizNextButton");
const shortQuizFeedbackPanel = document.getElementById("shortQuizFeedbackPanel");
const shortQuizProgress = document.getElementById("shortQuizProgress");
const choiceQuizFront = document.getElementById("choiceQuizFront");
const choiceQuizFrontMedia = document.getElementById("choiceQuizFrontMedia");
const choiceQuizMeta = document.getElementById("choiceQuizMeta");
const choiceQuizTopic = document.getElementById("choiceQuizTopic");
const choiceQuizTags = document.getElementById("choiceQuizTags");
const choiceQuizOptions = document.getElementById("choiceQuizOptions");
const choiceQuizAnswerArea = document.getElementById("choiceQuizAnswerArea");
const choiceQuizBack = document.getElementById("choiceQuizBack");
const choiceQuizBackMedia = document.getElementById("choiceQuizBackMedia");
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
const deckDefaultTopicInput = document.getElementById("deckDefaultTopic");
const deckDefaultTagsInput = document.getElementById("deckDefaultTags");
const deckFrontTemplateInput = document.getElementById("deckFrontTemplate");
const deckBackTemplateInput = document.getElementById("deckBackTemplate");
const deckPreferredCardStyleInput = document.getElementById("deckPreferredCardStyle");
const cardFrontInput = document.getElementById("cardFrontInput");
const cardBackInput = document.getElementById("cardBackInput");
const cardFrontMediaInput = document.getElementById("cardFrontMediaInput");
const cardBackMediaInput = document.getElementById("cardBackMediaInput");
const cardFrontMediaStatus = document.getElementById("cardFrontMediaStatus");
const cardBackMediaStatus = document.getElementById("cardBackMediaStatus");
const cardFrontMediaList = document.getElementById("cardFrontMediaList");
const cardBackMediaList = document.getElementById("cardBackMediaList");
const cardHintInput = document.getElementById("cardHintInput");
const cardTopicInput = document.getElementById("cardTopicInput");
const cardTagsInput = document.getElementById("cardTagsInput");
const cardNoteInput = document.getElementById("cardNoteInput");
const cardExampleInput = document.getElementById("cardExampleInput");
const importForm = document.getElementById("importForm");
const analyzeImportButton = document.getElementById("analyzeImportButton");
const analyzeImportAiButton = document.getElementById("analyzeImportAiButton");
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
const quickCaptureForm = document.getElementById("quickCaptureForm");
const quickCaptureDeckId = document.getElementById("quickCaptureDeckId");
const quickCaptureFrontInput = document.getElementById("quickCaptureFrontInput");
const quickCaptureBackInput = document.getElementById("quickCaptureBackInput");
const quickCaptureFrontMediaInput = document.getElementById("quickCaptureFrontMediaInput");
const quickCaptureBackMediaInput = document.getElementById("quickCaptureBackMediaInput");
const quickCaptureFrontMediaStatus = document.getElementById("quickCaptureFrontMediaStatus");
const quickCaptureBackMediaStatus = document.getElementById("quickCaptureBackMediaStatus");
const quickCaptureFrontMediaList = document.getElementById("quickCaptureFrontMediaList");
const quickCaptureBackMediaList = document.getElementById("quickCaptureBackMediaList");
const quickCaptureTagsInput = document.getElementById("quickCaptureTagsInput");
const quickCaptureStatus = document.getElementById("quickCaptureStatus");
const quickCaptureResetButton = document.getElementById("quickCaptureResetButton");
const bulkInputForm = document.getElementById("bulkInputForm");
const bulkTargetDeckId = document.getElementById("bulkTargetDeckId");
const bulkFocusInput = document.getElementById("bulkFocusInput");
const bulkDeckNameInput = document.getElementById("bulkDeckNameInput");
const bulkSubjectInput = document.getElementById("bulkSubjectInput");
const bulkInputText = document.getElementById("bulkInputText");
const bulkInputStatus = document.getElementById("bulkInputStatus");
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
const analyzeQuestionMapAiButton = document.getElementById("analyzeQuestionMapAiButton");
const assistantMessages = document.getElementById("assistantMessages");
const assistantStatus = document.getElementById("assistantStatus");
const assistantForm = document.getElementById("assistantForm");
const assistantInput = document.getElementById("assistantInput");
const assistantSubmitButton = document.getElementById("assistantSubmitButton");
const libraryQuickCaptureButton = document.getElementById("libraryQuickCaptureButton");
const clearAssistantButton = document.getElementById("clearAssistantButton");
const deckDetailTitle = document.getElementById("deckDetailTitle");
const deckDetailContent = document.getElementById("deckDetailContent");
const createPanels = {
  quick: document.getElementById("createQuickPanel"),
  bulk: document.getElementById("createBulkPanel"),
  edit: document.getElementById("createEditPanel"),
  deck: document.getElementById("createDeckPanel"),
  card: document.getElementById("createCardPanel"),
  import: document.getElementById("createImportPanel"),
  locator: document.getElementById("createLocatorPanel"),
  share: document.getElementById("createSharePanel"),
};
const editDeckSelect = document.getElementById("editDeckSelect");
const editWorkspaceTitle = document.getElementById("editWorkspaceTitle");
const editWorkspaceStatus = document.getElementById("editWorkspaceStatus");
const editWorkspaceSummary = document.getElementById("editWorkspaceSummary");
const editWorkspaceEmpty = document.getElementById("editWorkspaceEmpty");
const editDeckSubview = document.getElementById("editDeckSubview");
const editCardsSubview = document.getElementById("editCardsSubview");
const editDeckForm = document.getElementById("editDeckForm");
const editDeckIdInput = document.getElementById("editDeckIdInput");
const editDeckNameInput = document.getElementById("editDeckName");
const editDeckFocusInput = document.getElementById("editDeckFocus");
const editDeckSubjectInput = document.getElementById("editDeckSubject");
const editDeckDescriptionInput = document.getElementById("editDeckDescription");
const editDeckDefaultTopicInput = document.getElementById("editDeckDefaultTopic");
const editDeckDefaultTagsInput = document.getElementById("editDeckDefaultTags");
const editDeckFrontTemplateInput = document.getElementById("editDeckFrontTemplate");
const editDeckBackTemplateInput = document.getElementById("editDeckBackTemplate");
const editDeckPreferredCardStyleInput = document.getElementById("editDeckPreferredCardStyle");
const editDeckSubmitButton = document.getElementById("editDeckSubmitButton");
const resetEditDeckButton = document.getElementById("resetEditDeckButton");
const deleteEditDeckButton = document.getElementById("deleteEditDeckButton");
const editCardsTitle = document.getElementById("editCardsTitle");
const editCardCreateButton = document.getElementById("editCardCreateButton");
const editCardQuickAddButton = document.getElementById("editCardQuickAddButton");
const editCardSearchInput = document.getElementById("editCardSearchInput");
const editCardEditorTitle = document.getElementById("editCardEditorTitle");
const editCardEditorStatus = document.getElementById("editCardEditorStatus");
const editCardForm = document.getElementById("editCardForm");
const editCardIdInput = document.getElementById("editCardIdInput");
const editCardFrontInput = document.getElementById("editCardFrontInput");
const editCardBackInput = document.getElementById("editCardBackInput");
const editCardFrontMediaInput = document.getElementById("editCardFrontMediaInput");
const editCardBackMediaInput = document.getElementById("editCardBackMediaInput");
const editCardFrontMediaStatus = document.getElementById("editCardFrontMediaStatus");
const editCardBackMediaStatus = document.getElementById("editCardBackMediaStatus");
const editCardFrontMediaList = document.getElementById("editCardFrontMediaList");
const editCardBackMediaList = document.getElementById("editCardBackMediaList");
const editCardHintInput = document.getElementById("editCardHintInput");
const editCardTopicInput = document.getElementById("editCardTopicInput");
const editCardTagsInput = document.getElementById("editCardTagsInput");
const editCardNoteInput = document.getElementById("editCardNoteInput");
const editCardExampleInput = document.getElementById("editCardExampleInput");
const editCardSubmitButton = document.getElementById("editCardSubmitButton");
const cancelEditWorkspaceCardButton = document.getElementById("cancelEditWorkspaceCardButton");
const editCardList = document.getElementById("editCardList");
const createGuideTitle = document.getElementById("createGuideTitle");
const createGuideSummary = document.getElementById("createGuideSummary");
const createGuideSteps = document.getElementById("createGuideSteps");
const createGuideActions = document.getElementById("createGuideActions");
const authStatus = document.getElementById("authStatus");
const shareOpenAccountBackupButton = document.getElementById("shareOpenAccountBackupButton");
const shareToggleEmailAuthButton = document.getElementById("shareToggleEmailAuthButton");
const shareEmailAuthPanel = document.getElementById("shareEmailAuthPanel");
const shareAuthReadinessList = document.getElementById("shareAuthReadinessList");
const authEmailInput = document.getElementById("authEmailInput");
const signInMagicLinkButton = document.getElementById("signInMagicLinkButton");
const signOutButton = document.getElementById("signOutButton");
const shareDeckSelect = document.getElementById("shareDeckSelect");
const shareDeckButton = document.getElementById("shareDeckButton");
const copyShareLinkButton = document.getElementById("copyShareLinkButton");
const copyPackageLinkButton = document.getElementById("copyPackageLinkButton");
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
const shareNotificationStatus = document.getElementById("shareNotificationStatus");
const shareNotificationList = document.getElementById("shareNotificationList");
const shareEventStatus = document.getElementById("shareEventStatus");
const shareEventList = document.getElementById("shareEventList");
const markAllNotificationsReadButton = document.getElementById("markAllNotificationsReadButton");
const shareGuideSummary = document.getElementById("shareGuideSummary");
const shareGuideList = document.getElementById("shareGuideList");
const onboardingModal = document.getElementById("onboardingModal");
const dismissOnboardingButton = document.getElementById("dismissOnboardingButton");
const completeOnboardingButton = document.getElementById("completeOnboardingButton");
const settingsOpenGuideButton = document.getElementById("settingsOpenGuideButton");
const settingsOverviewSummary = document.getElementById("settingsOverviewSummary");
const settingsSnapshotList = document.getElementById("settingsSnapshotList");
const settingsAccountBackupSummary = document.getElementById("settingsAccountBackupSummary");
const settingsAccountBackupStatus = document.getElementById("settingsAccountBackupStatus");
const settingsSignInGoogleButton = document.getElementById("settingsSignInGoogleButton");
const settingsToggleEmailAuthButton = document.getElementById("settingsToggleEmailAuthButton");
const settingsEmailAuthPanel = document.getElementById("settingsEmailAuthPanel");
const settingsAuthEmailInput = document.getElementById("settingsAuthEmailInput");
const settingsSendMagicLinkButton = document.getElementById("settingsSendMagicLinkButton");
const settingsSignOutButton = document.getElementById("settingsSignOutButton");
const settingsProfilePromptPanel = document.getElementById("settingsProfilePromptPanel");
const settingsProfilePromptStatus = document.getElementById("settingsProfilePromptStatus");
const settingsProfileDisplayNameInput = document.getElementById("settingsProfileDisplayNameInput");
const settingsSaveProfileButton = document.getElementById("settingsSaveProfileButton");
const settingsAuthReadinessSummary = document.getElementById("settingsAuthReadinessSummary");
const settingsAuthReadinessList = document.getElementById("settingsAuthReadinessList");
const settingsAutoBackupCheckbox = document.getElementById("settingsAutoBackupCheckbox");
const settingsBackupLastSaved = document.getElementById("settingsBackupLastSaved");
const settingsBackupNowButton = document.getElementById("settingsBackupNowButton");
const settingsRefreshBackupButton = document.getElementById("settingsRefreshBackupButton");
const settingsBackupSnapshotList = document.getElementById("settingsBackupSnapshotList");
const settingsQuickKeepDeckCheckbox = document.getElementById("settingsQuickKeepDeckCheckbox");
const settingsQuickKeepTemplateCheckbox = document.getElementById("settingsQuickKeepTemplateCheckbox");
const settingsStudyDefaultMinutes = document.getElementById("settingsStudyDefaultMinutes");
const settingsStudyDefaultSpeedMode = document.getElementById("settingsStudyDefaultSpeedMode");
const settingsStudyAutoRepeatCheckbox = document.getElementById("settingsStudyAutoRepeatCheckbox");
const settingsStudyAutoAdvanceCheckbox = document.getElementById("settingsStudyAutoAdvanceCheckbox");
const deckActionModal = document.getElementById("deckActionModal");
const deckActionTitle = document.getElementById("deckActionTitle");
const deckActionStatus = document.getElementById("deckActionStatus");
const deckActionQuickButton = document.getElementById("deckActionQuickButton");
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
const featureSearchModal = document.getElementById("featureSearchModal");
const closeFeatureSearchButton = document.getElementById("closeFeatureSearchButton");
const featureSearchInput = document.getElementById("featureSearchInput");
const featureSearchStatus = document.getElementById("featureSearchStatus");
const featureSearchResults = document.getElementById("featureSearchResults");
const mediaViewerModal = document.getElementById("mediaViewerModal");
const mediaViewerTitle = document.getElementById("mediaViewerTitle");
const mediaViewerImage = document.getElementById("mediaViewerImage");
const closeMediaViewerButton = document.getElementById("closeMediaViewerButton");

const FEATURE_SEARCH_ITEMS = [
  {
    id: "review",
    title: "今日の復習を開く",
    sectionLabel: "学習",
    description: "期限が来たカードを通常復習で回します。",
    keywords: ["復習", "今日", "review", "勉強", "学習"],
    action: "study-mode",
    studyMode: "review",
    targetId: "studyDeckFilter",
    featured: true,
  },
  {
    id: "test",
    title: "小テストを始める",
    sectionLabel: "学習",
    description: "記述式の小テストを作って自己採点できます。",
    keywords: ["小テスト", "テスト", "quiz", "記述", "確認"],
    action: "study-mode",
    studyMode: "test",
    targetId: "startStudySessionButton",
    featured: true,
  },
  {
    id: "choice",
    title: "4択クイズを始める",
    sectionLabel: "学習",
    description: "4択で素早く確認しながら弱点を見つけます。",
    keywords: ["4択", "クイズ", "choice", "選択", "問題"],
    action: "study-mode",
    studyMode: "choice",
    targetId: "startStudySessionButton",
    featured: true,
  },
  {
    id: "ai-test",
    title: "AIで小テストを作る",
    sectionLabel: "学習",
    description: "選択中のデッキや弱点リストからAI問題案を作ります。",
    keywords: ["AI", "小テスト", "高精度", "自動生成", "quiz"],
    action: "study-mode",
    studyMode: "test",
    targetId: "generateAiStudyButton",
    featured: true,
  },
  {
    id: "ai-choice",
    title: "AIで4択クイズを作る",
    sectionLabel: "学習",
    description: "保存済みカードからAIで4択問題案を作ります。",
    keywords: ["AI", "4択", "クイズ", "高精度", "choice"],
    action: "study-mode",
    studyMode: "choice",
    targetId: "generateAiStudyButton",
    featured: false,
  },
  {
    id: "create-deck",
    title: "新しいデッキを作る",
    sectionLabel: "作成",
    description: "科目や単元ごとの学習デッキを追加します。",
    keywords: ["デッキ", "作成", "新規", "科目", "追加"],
    action: "create-mode",
    createMode: "deck",
    targetId: "deckName",
    featured: true,
  },
  {
    id: "edit-deck",
    title: "デッキを編集する",
    sectionLabel: "作成",
    description: "選んだデッキの名前変更、カード編集、削除をまとめて行います。",
    keywords: ["編集", "デッキ名", "カード編集", "削除", "変更"],
    action: "create-mode",
    createMode: "edit",
    targetId: "editDeckSelect",
    featured: true,
  },
  {
    id: "create-card",
    title: "カードを手入力で追加する",
    sectionLabel: "作成",
    description: "問題と答えを直接入力してカードを増やします。",
    keywords: ["カード", "手入力", "追加", "単語帳", "flashcard"],
    action: "create-mode",
    createMode: "card",
    targetId: "cardFrontInput",
    featured: true,
  },
  {
    id: "quick-capture",
    title: "クイック追加を開く",
    sectionLabel: "作成",
    description: "問題、答え、画像、タグだけで素早くカードを増やします。",
    keywords: ["クイック追加", "連続追加", "すぐ追加", "カード作成", "最短"],
    action: "create-mode",
    createMode: "quick",
    targetId: "quickCaptureFrontInput",
    featured: true,
  },
  {
    id: "bulk-input",
    title: "一括入力から候補を作る",
    sectionLabel: "作成",
    description: "講義メモやQ/Aを貼り付けて、候補レビューへまとめて送ります。",
    keywords: ["一括入力", "貼り付け", "Q/A", "メモ", "候補レビュー"],
    action: "create-mode",
    createMode: "bulk",
    targetId: "bulkInputText",
    featured: true,
  },
  {
    id: "import-pdf",
    title: "PDFからカード候補を作る",
    sectionLabel: "作成",
    description: "PDFや本文を解析してカード候補をまとめて作ります。",
    keywords: ["PDF", "資料", "取り込み", "import", "カード候補"],
    action: "create-mode",
    createMode: "import",
    targetId: "importFileInput",
    featured: true,
  },
  {
    id: "import-pdf-ai",
    title: "PDFをAIで高精度生成する",
    sectionLabel: "作成",
    description: "Gemini の無料枠で PDF からカード候補を高精度に作ります。",
    keywords: ["AI", "PDF", "高精度", "Gemini", "自動生成", "資料"],
    action: "create-mode",
    createMode: "import",
    targetId: "analyzeImportAiButton",
    featured: true,
  },
  {
    id: "question-map",
    title: "過去問とスライドを対応づける",
    sectionLabel: "作成",
    description: "設問がどの講義スライドに近いかを探します。",
    keywords: ["過去問", "スライド", "対応", "参照", "授業", "問題文"],
    action: "create-mode",
    createMode: "locator",
    targetId: "questionMapQuestionFileInput",
    featured: true,
  },
  {
    id: "speed-study",
    title: "高速学習を始める",
    sectionLabel: "学習",
    description: "おすすめセッションから、短時間で多く回す学習を始めます。",
    keywords: ["高速学習", "おすすめ", "スピード", "短時間", "5分学習"],
    action: "quick-study",
    quickStudyKind: "recommended",
    quickStudyMinutes: 5,
    targetId: "studyQuickActionGrid",
    featured: true,
  },
  {
    id: "mistake-study",
    title: "ミスだけを回す",
    sectionLabel: "学習",
    description: "直近ミスやあいまいカードだけを小テストで回します。",
    keywords: ["ミスだけ", "弱点", "直近ミス", "あいまい", "苦手"],
    action: "quick-study",
    quickStudyKind: "mistakes",
    quickStudyMinutes: 5,
    targetId: "studyQuickActionGrid",
    featured: true,
  },
  {
    id: "choice-speed",
    title: "4択で高速確認する",
    sectionLabel: "学習",
    description: "4択クイズを短時間で流して、弱点をすぐ見つけます。",
    keywords: ["4択で流す", "高速確認", "choice", "スピード", "4択"],
    action: "quick-study",
    quickStudyKind: "choice",
    quickStudyMinutes: 5,
    targetId: "studyQuickActionGrid",
    featured: false,
  },
  {
    id: "question-map-ai",
    title: "過去問参照をAIで補強する",
    sectionLabel: "作成",
    description: "対応候補の根拠説明を AI で補います。",
    keywords: ["AI", "過去問", "スライド", "高精度", "補強", "根拠"],
    action: "create-mode",
    createMode: "locator",
    targetId: "analyzeQuestionMapAiButton",
    featured: false,
  },
  {
    id: "library-search",
    title: "保存済みカードを検索する",
    sectionLabel: "ライブラリ",
    description: "医学や英語の知識を保存済みカードだけから探します。",
    keywords: ["検索", "ライブラリ", "知識", "カード検索", "調べる"],
    action: "section",
    sectionId: "assistant",
    targetId: "assistantInput",
    featured: true,
  },
  {
    id: "share",
    title: "共有デッキを管理する",
    sectionLabel: "作成",
    description: "共有リンクの作成、参加申請、共同編集の管理を行います。",
    keywords: ["共有", "share", "グループ", "共同編集", "リンク"],
    action: "create-mode",
    createMode: "share",
    targetId: "shareDeckSelect",
    featured: true,
  },
  {
    id: "backup",
    title: "JSONバックアップを書く",
    sectionLabel: "設定",
    description: "いまのデッキと学習履歴を JSON として保存します。",
    keywords: ["バックアップ", "JSON", "保存", "export", "エクスポート"],
    action: "section",
    sectionId: "settings",
    targetId: "exportJsonButton",
    featured: true,
  },
  {
    id: "account-backup",
    title: "アカウント保存を開く",
    sectionLabel: "設定",
    description: "Google とメールのログイン、自動バックアップ、復元ポイントをまとめて管理します。",
    keywords: ["アカウント", "バックアップ", "ログイン", "復元", "クラウド保存", "google", "メール", "アカウント作成"],
    action: "section",
    sectionId: "settings",
    targetId: "settingsAccountBackupPanel",
    featured: true,
  },
  {
    id: "guide",
    title: "使い方ガイドを開く",
    sectionLabel: "設定",
    description: "初回ガイドをもう一度見直せます。",
    keywords: ["ガイド", "使い方", "ヘルプ", "案内", "初心者"],
    action: "guide",
    targetId: "",
    featured: false,
  },
  {
    id: "reset",
    title: "初期化の場所を開く",
    sectionLabel: "設定",
    description: "危険操作なので、設定画面の初期化欄を安全に開きます。",
    keywords: ["初期化", "リセット", "サンプル", "危険", "削除"],
    action: "section",
    sectionId: "settings",
    targetId: "demoResetConfirmInput",
    featured: false,
    isDangerous: true,
  },
];

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
  editSubviewButtons.forEach((button) => {
    button.addEventListener("click", () => setEditSubview(button.dataset.editSubview));
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
  if (openFeatureSearchButton) {
    openFeatureSearchButton.addEventListener("click", () => openFeatureSearchModal());
  }
  if (closeFeatureSearchButton) {
    closeFeatureSearchButton.addEventListener("click", closeFeatureSearchModal);
  }
  if (featureSearchModal) {
    featureSearchModal.addEventListener("click", (event) => {
      if (event.target === featureSearchModal) {
        closeFeatureSearchModal();
      }
    });
  }
  if (closeMediaViewerButton) {
    closeMediaViewerButton.addEventListener("click", closeMediaViewer);
  }
  if (mediaViewerModal) {
    mediaViewerModal.addEventListener("click", (event) => {
      if (event.target === mediaViewerModal) {
        closeMediaViewer();
      }
    });
  }
  if (featureSearchInput) {
    featureSearchInput.addEventListener("input", renderFeatureSearchResults);
    featureSearchInput.addEventListener("keydown", handleFeatureSearchInputKeydown);
  }
  if (featureSearchResults) {
    featureSearchResults.addEventListener("click", handleFeatureSearchResultClick);
  }
  document.addEventListener("keydown", handleGlobalKeydown);
  document.addEventListener("click", (event) => {
    handleOpenMediaViewerClick(event).catch((error) => {
      console.warn("Failed to open media viewer:", error);
    });
  });
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
  editDeckForm.addEventListener("submit", handleEditDeckSubmit);
  editCardForm.addEventListener("submit", handleEditCardSubmit);
  if (quickCaptureForm) {
    quickCaptureForm.addEventListener("submit", handleQuickCaptureSubmit);
  }
  if (bulkInputForm) {
    bulkInputForm.addEventListener("submit", handleBulkInputSubmit);
  }
  if (cardFrontMediaInput) {
    cardFrontMediaInput.addEventListener("change", (event) => handleMediaInputChange(event, { formKey: "card", side: "front" }));
  }
  if (cardBackMediaInput) {
    cardBackMediaInput.addEventListener("change", (event) => handleMediaInputChange(event, { formKey: "card", side: "back" }));
  }
  if (quickCaptureFrontMediaInput) {
    quickCaptureFrontMediaInput.addEventListener("change", (event) => handleMediaInputChange(event, { formKey: "quick", side: "front" }));
  }
  if (quickCaptureBackMediaInput) {
    quickCaptureBackMediaInput.addEventListener("change", (event) => handleMediaInputChange(event, { formKey: "quick", side: "back" }));
  }
  if (editCardFrontMediaInput) {
    editCardFrontMediaInput.addEventListener("change", (event) => handleMediaInputChange(event, { formKey: "edit", side: "front" }));
  }
  if (editCardBackMediaInput) {
    editCardBackMediaInput.addEventListener("change", (event) => handleMediaInputChange(event, { formKey: "edit", side: "back" }));
  }
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
  editDeckSelect.addEventListener("change", () => {
    selectedEditDeckId = editDeckSelect.value || "";
    editSubview = "deck";
    clearEditWorkspaceCardEditing({ silent: true });
    renderEditWorkspace();
    syncEditWorkspaceLocks().catch((error) => {
      console.warn("Failed to sync edit locks:", error);
    });
  });
  resetEditDeckButton.addEventListener("click", () => {
    renderEditWorkspace();
    showToast("デッキ編集の入力を戻しました");
  });
  deleteEditDeckButton.addEventListener("click", () => {
    if (selectedEditDeckId) {
      deleteDeck(selectedEditDeckId);
    }
  });
  editCardCreateButton.addEventListener("click", () => {
    openEditWorkspace(selectedEditDeckId, { subview: "cards" });
    focusEditCardForm();
  });
  editCardSearchInput.addEventListener("input", () => {
    editCardQuery = String(editCardSearchInput.value || "");
    renderEditWorkspace();
  });
  editDeckFocusInput.addEventListener("change", applyEditDeckFocusPreset);
  if (editCardQuickAddButton) {
    editCardQuickAddButton.addEventListener("click", () => openQuickCapture(selectedEditDeckId));
  }
  cancelEditWorkspaceCardButton.addEventListener("click", () => {
    clearEditWorkspaceCardEditing();
    showToast("カード編集を終了しました");
  });
  if (cardFrontMediaList) {
    cardFrontMediaList.addEventListener("click", (event) => handleMediaListActions(event, { formKey: "card", side: "front" }));
  }
  if (cardBackMediaList) {
    cardBackMediaList.addEventListener("click", (event) => handleMediaListActions(event, { formKey: "card", side: "back" }));
  }
  if (editCardFrontMediaList) {
    editCardFrontMediaList.addEventListener("click", (event) => handleMediaListActions(event, { formKey: "edit", side: "front" }));
  }
  if (editCardBackMediaList) {
    editCardBackMediaList.addEventListener("click", (event) => handleMediaListActions(event, { formKey: "edit", side: "back" }));
  }
  if (quickCaptureFrontMediaList) {
    quickCaptureFrontMediaList.addEventListener("click", (event) => handleMediaListActions(event, { formKey: "quick", side: "front" }));
  }
  if (quickCaptureBackMediaList) {
    quickCaptureBackMediaList.addEventListener("click", (event) => handleMediaListActions(event, { formKey: "quick", side: "back" }));
  }

  studyDeckFilter.addEventListener("change", () => {
    resetStudySession();
    clearAiStudyDraft({ silent: true });
    currentCardId = null;
    isAnswerVisible = false;
    renderStudy();
  });
  if (studyQuickCaptureButton) {
    studyQuickCaptureButton.addEventListener("click", () => openQuickCapture(studyDeckFilter.value?.startsWith("focus:") ? "" : studyDeckFilter.value || ""));
  }
  studyMinuteButtons.forEach((button) => {
    button.addEventListener("click", () => setStudyQuickMinutes(Number(button.dataset.studyMinutes || 5)));
  });
  if (studyQuickActionGrid) {
    studyQuickActionGrid.addEventListener("click", handleStudyQuickActions);
  }
  studySessionSizeInput.addEventListener("input", () => {
    studySessionSize = clampNumber(Number.parseInt(studySessionSizeInput.value, 10), 3, 20, 8);
    studySessionSizeInput.value = String(studySessionSize);
    renderStudy();
  });
  startStudySessionButton.addEventListener("click", startStudySession);
  if (generateAiStudyButton) {
    generateAiStudyButton.addEventListener("click", generateAiStudyDraft);
  }
  if (startAiStudyButton) {
    startAiStudyButton.addEventListener("click", startAiStudySession);
  }
  if (saveAiStudyCardsButton) {
    saveAiStudyCardsButton.addEventListener("click", saveAiStudyDraftAsCards);
  }
  if (clearAiStudyButton) {
    clearAiStudyButton.addEventListener("click", () => clearAiStudyDraft({ withToast: true }));
  }
  shortQuizRevealButton.addEventListener("click", revealShortQuizAnswer);
  shortQuizNextButton.addEventListener("click", advanceStudySession);
  choiceQuizNextButton.addEventListener("click", advanceStudySession);
  libraryDeckFilter.addEventListener("change", renderLibrary);
  libraryTagFilter.addEventListener("change", renderLibrary);
  librarySubjectFilter.addEventListener("change", renderLibrary);
  libraryStorageFilter.addEventListener("change", renderLibrary);
  libraryStudyStateFilter.addEventListener("change", renderLibrary);
  libraryTextFilter.addEventListener("input", renderLibrary);
  if (libraryQuickCaptureButton) {
    libraryQuickCaptureButton.addEventListener("click", () => openQuickCapture(libraryDeckFilter.value?.startsWith("focus:") ? "" : libraryDeckFilter.value || ""));
  }
  cardDeckId.addEventListener("change", applyCardContextPlaceholders);
  if (quickCaptureDeckId) {
    quickCaptureDeckId.addEventListener("change", renderQuickCapturePanel);
  }
  if (quickCaptureResetButton) {
    quickCaptureResetButton.addEventListener("click", () => resetQuickCaptureForm({ withToast: true }));
  }
  deckFocusInput.addEventListener("change", applyDeckFocusPreset);
  if (bulkTargetDeckId) {
    bulkTargetDeckId.addEventListener("change", renderBulkInputPanel);
  }
  if (bulkFocusInput) {
    bulkFocusInput.addEventListener("change", renderBulkInputPanel);
  }
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
  if (shareOpenAccountBackupButton) {
    shareOpenAccountBackupButton.addEventListener("click", () => openAccountBackupSettings({ intent: "share" }));
  }
  if (shareToggleEmailAuthButton) {
    shareToggleEmailAuthButton.addEventListener("click", () => {
      shareEmailAuthVisible = !shareEmailAuthVisible;
      renderSharePanel();
    });
  }
  if (authEmailInput) {
    authEmailInput.addEventListener("input", () => {
      syncAuthEmailInputs(authEmailInput.value, "share");
      renderSharePanel();
      renderSettingsPanel();
    });
  }
  if (settingsAuthEmailInput) {
    settingsAuthEmailInput.addEventListener("input", () => {
      syncAuthEmailInputs(settingsAuthEmailInput.value, "settings");
      renderSharePanel();
      renderSettingsPanel();
    });
  }
  if (settingsToggleEmailAuthButton) {
    settingsToggleEmailAuthButton.addEventListener("click", () => {
      settingsEmailAuthVisible = !settingsEmailAuthVisible;
      renderSettingsPanel();
    });
  }
  if (settingsSignInGoogleButton) {
    settingsSignInGoogleButton.addEventListener("click", () => {
      signInWithProvider("google", "settings-backup").catch((error) => {
        console.warn("Failed to sign in with Google:", error);
      });
    });
  }
  if (signInMagicLinkButton) {
    signInMagicLinkButton.addEventListener("click", () => sendMagicLink(authEmailInput?.value || ""));
  }
  if (settingsSendMagicLinkButton) {
    settingsSendMagicLinkButton.addEventListener("click", () => sendMagicLink(settingsAuthEmailInput?.value || ""));
  }
  if (signOutButton) {
    signOutButton.addEventListener("click", signOutCloud);
  }
  if (settingsSignOutButton) {
    settingsSignOutButton.addEventListener("click", signOutCloud);
  }
  if (settingsSaveProfileButton) {
    settingsSaveProfileButton.addEventListener("click", () => {
      saveProfileDisplayName().catch((error) => {
        console.warn("Failed to save profile display name:", error);
      });
    });
  }
  if (settingsProfileDisplayNameInput) {
    settingsProfileDisplayNameInput.addEventListener("input", renderSettingsPanel);
  }
  shareDeckButton.addEventListener("click", shareDeck);
  copyShareLinkButton.addEventListener("click", copyShareLink);
  copyPackageLinkButton.addEventListener("click", copyDeckPackageLink);
  syncSharedDeckButton.addEventListener("click", syncSelectedSharedDeck);
  duplicateSharedDeckButton.addEventListener("click", duplicateSelectedDeck);
  refreshShareLinkButton.addEventListener("click", () => regenerateShareLinkForDeck());
  leaveSharedDeckButton.addEventListener("click", stopOrLeaveSelectedDeck);
  markAllNotificationsReadButton.addEventListener("click", () => {
    markNotificationsRead().catch((error) => {
      console.warn("Failed to mark notifications read:", error);
      showToast(error.message || "通知の既読化に失敗しました");
    });
  });
  exportJsonButton.addEventListener("click", exportJsonBackup);
  importJsonFileInput.addEventListener("change", importJsonBackup);
  refreshCloudButton.addEventListener("click", refreshCloudData);
  if (settingsAutoBackupCheckbox) {
    settingsAutoBackupCheckbox.addEventListener("change", handleAutoBackupToggle);
  }
  if (settingsQuickKeepDeckCheckbox) {
    settingsQuickKeepDeckCheckbox.addEventListener("change", handleQuickCapturePreferenceChange);
  }
  if (settingsQuickKeepTemplateCheckbox) {
    settingsQuickKeepTemplateCheckbox.addEventListener("change", handleQuickCapturePreferenceChange);
  }
  if (settingsStudyDefaultMinutes) {
    settingsStudyDefaultMinutes.addEventListener("change", handleStudyPreferenceChange);
  }
  if (settingsStudyDefaultSpeedMode) {
    settingsStudyDefaultSpeedMode.addEventListener("change", handleStudyPreferenceChange);
  }
  if (settingsStudyAutoRepeatCheckbox) {
    settingsStudyAutoRepeatCheckbox.addEventListener("change", handleStudyPreferenceChange);
  }
  if (settingsStudyAutoAdvanceCheckbox) {
    settingsStudyAutoAdvanceCheckbox.addEventListener("change", handleStudyPreferenceChange);
  }
  if (settingsBackupNowButton) {
    settingsBackupNowButton.addEventListener("click", () => {
      if (cloudState.backupReadinessIssue?.blocking) {
        showToast(cloudState.backupReadinessIssue.text);
        renderSettingsPanel();
        return;
      }
      createCloudBackupSnapshot({ kind: "manual" }).catch((error) => {
        console.warn("Failed to create manual cloud backup:", error);
      });
    });
  }
  if (settingsRefreshBackupButton) {
    settingsRefreshBackupButton.addEventListener("click", () => {
      refreshCloudData({ silent: false }).catch((error) => {
        console.warn("Failed to refresh cloud data:", error);
      });
      refreshCloudBackups({ silent: false }).catch((error) => {
        console.warn("Failed to refresh cloud backups:", error);
      });
    });
  }
  if (settingsBackupSnapshotList) {
    settingsBackupSnapshotList.addEventListener("click", handleBackupSnapshotActions);
  }
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
  if (deckActionQuickButton) {
    deckActionQuickButton.addEventListener("click", () => openDeckActionTarget("quick"));
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
  shareMemberList.addEventListener("change", handleShareMemberPermissionChanges);
  deckDetailContent.addEventListener("click", handleDeckDetailActions);
  deckDetailContent.addEventListener("change", handleShareMemberPermissionChanges);
  editCardList.addEventListener("click", handleEditCardListActions);
  studySmartListGrid.addEventListener("click", handleStudySmartListActions);
  importPreview.addEventListener("click", handleImportPreviewActions);
  assistantMessages.addEventListener("click", handleAssistantActions);
  choiceQuizOptions.addEventListener("click", handleChoiceQuizActions);
  document.querySelectorAll("[data-short-quiz-grade]").forEach((button) => {
    button.addEventListener("click", () => gradeShortQuiz(button.dataset.shortQuizGrade));
  });
  document.addEventListener("visibilitychange", handleDocumentVisibilityChange);
  window.addEventListener("pagehide", handlePageHide);
}

function createEmptyMediaDraft() {
  return { front: [], back: [] };
}

function getMediaDraft(formKey) {
  if (formKey === "edit") {
    return editCardMediaDraft;
  }
  if (formKey === "quick") {
    return quickCaptureMediaDraft;
  }
  return cardMediaDraft;
}

function getMediaDraftUi(formKey, side) {
  if (formKey === "edit") {
    return {
      listElement: side === "front" ? editCardFrontMediaList : editCardBackMediaList,
      statusElement: side === "front" ? editCardFrontMediaStatus : editCardBackMediaStatus,
    };
  }
  if (formKey === "quick") {
    return {
      listElement: side === "front" ? quickCaptureFrontMediaList : quickCaptureBackMediaList,
      statusElement: side === "front" ? quickCaptureFrontMediaStatus : quickCaptureBackMediaStatus,
    };
  }
  return {
    listElement: side === "front" ? cardFrontMediaList : cardBackMediaList,
    statusElement: side === "front" ? cardFrontMediaStatus : cardBackMediaStatus,
  };
}

function resetMediaDraft(formKey) {
  const currentDraft = getMediaDraft(formKey);
  ["front", "back"].forEach((side) => {
    currentDraft[side].forEach((item) => {
      if (item.previewUrl && item.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
  });
  if (formKey === "edit") {
    editCardMediaDraft = createEmptyMediaDraft();
  } else if (formKey === "quick") {
    quickCaptureMediaDraft = createEmptyMediaDraft();
  } else {
    cardMediaDraft = createEmptyMediaDraft();
  }
}

function normalizeCardMediaItem(item = {}) {
  const name = String(item.name || item.file?.name || "画像").trim();
  const mimeType = String(item.mimeType || item.file?.type || "").trim();
  return {
    assetId: String(item.assetId || crypto.randomUUID()),
    name: name || "画像",
    mimeType,
    size: Number.isFinite(Number(item.size)) ? Number(item.size) : Number(item.file?.size || 0),
    width: Number.isFinite(Number(item.width)) ? Number(item.width) : 0,
    height: Number.isFinite(Number(item.height)) ? Number(item.height) : 0,
    source: item.source === "shared" || item.sharedPath || item.sharedMediaId ? "shared" : "local",
    sharedPath: String(item.sharedPath || "").trim(),
    sharedMediaId: String(item.sharedMediaId || "").trim(),
    publicUrl: String(item.publicUrl || "").trim(),
    previewUrl: String(item.previewUrl || "").trim(),
    file: item.file instanceof Blob ? item.file : null,
  };
}

function normalizeCardMediaList(items) {
  return (Array.isArray(items) ? items : []).map((item) => normalizeCardMediaItem(item)).slice(0, MEDIA_SIDE_LIMIT);
}

function openMediaDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("この端末では画像保存に IndexedDB が使えません"));
      return;
    }
    const request = window.indexedDB.open(MEDIA_DB_NAME, MEDIA_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
        db.createObjectStore(MEDIA_STORE_NAME, { keyPath: "assetId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB を開けませんでした"));
  });
}

function getMediaDatabase() {
  if (!mediaDbPromise) {
    mediaDbPromise = openMediaDatabase().catch((error) => {
      mediaDbPromise = null;
      throw error;
    });
  }
  return mediaDbPromise;
}

async function runMediaStore(mode, callback) {
  const db = await getMediaDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MEDIA_STORE_NAME, mode);
    const store = transaction.objectStore(MEDIA_STORE_NAME);
    let result;
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error || new Error("画像保存に失敗しました"));
    transaction.onabort = () => reject(transaction.error || new Error("画像保存を完了できませんでした"));
    result = callback(store, transaction);
  });
}

async function putMediaBlob(assetId, blob) {
  if (!assetId || !(blob instanceof Blob)) {
    return;
  }
  await runMediaStore("readwrite", (store) => {
    store.put({
      assetId,
      blob,
      updatedAt: Date.now(),
    });
  });
}

async function getMediaBlob(assetId) {
  if (!assetId) {
    return null;
  }
  return runMediaStore("readonly", (store) => new Promise((resolve, reject) => {
    const request = store.get(assetId);
    request.onsuccess = () => resolve(request.result?.blob || null);
    request.onerror = () => reject(request.error || new Error("画像の読み込みに失敗しました"));
  }));
}

async function deleteMediaBlob(assetId) {
  if (!assetId) {
    return;
  }
  await runMediaStore("readwrite", (store) => {
    store.delete(assetId);
  });
  const cachedUrl = mediaPreviewUrlCache.get(assetId);
  if (cachedUrl) {
    URL.revokeObjectURL(cachedUrl);
    mediaPreviewUrlCache.delete(assetId);
  }
}

async function clearAllMediaAssets() {
  await runMediaStore("readwrite", (store) => {
    store.clear();
  });
  mediaPreviewUrlCache.forEach((url) => URL.revokeObjectURL(url));
  mediaPreviewUrlCache.clear();
}

function getReferencedMediaAssetIds() {
  const assetIds = new Set();
  state.cards.forEach((card) => {
    [...(card.frontMedia || []), ...(card.backMedia || [])].forEach((media) => {
      if (media.assetId) {
        assetIds.add(media.assetId);
      }
    });
  });
  return assetIds;
}

async function cleanupOrphanedMediaAssets() {
  try {
    const referenced = getReferencedMediaAssetIds();
    const storedAssetIds = await runMediaStore("readonly", (store) => new Promise((resolve, reject) => {
      const request = store.getAllKeys();
      request.onsuccess = () => resolve((request.result || []).map((value) => String(value)));
      request.onerror = () => reject(request.error || new Error("画像一覧を読み込めませんでした"));
    }));

    await Promise.all(
      storedAssetIds.filter((assetId) => !referenced.has(assetId)).map((assetId) => deleteMediaBlob(assetId)),
    );
  } catch (error) {
    console.warn("Failed to cleanup orphaned media assets:", error);
  }
}

function formatMediaBytes(bytes) {
  const size = Number(bytes || 0);
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))}KB`;
  }
  return `${Math.round((size / (1024 * 1024)) * 10) / 10}MB`;
}

async function readImageDimensions(blob) {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const size = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth || 0, height: image.naturalHeight || 0 });
      image.onerror = () => reject(new Error("画像サイズを読み取れませんでした"));
      image.src = objectUrl;
    });
    return size;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function buildDraftMediaItemFromFile(file) {
  if (!(file instanceof Blob) || !String(file.type || "").startsWith("image/")) {
    throw new Error("画像ファイルのみ追加できます");
  }
  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    throw new Error(`1枚あたり${formatMediaBytes(MAX_MEDIA_SIZE_BYTES)}までです`);
  }
  const { width, height } = await readImageDimensions(file);
  return normalizeCardMediaItem({
    assetId: crypto.randomUUID(),
    name: file.name || "画像",
    mimeType: file.type || "image/*",
    size: file.size,
    width,
    height,
    source: "local",
    previewUrl: URL.createObjectURL(file),
    file,
  });
}

function getSharedMediaPublicUrl(path, fallbackUrl = "") {
  if (fallbackUrl) {
    return fallbackUrl;
  }
  const safePath = String(path || "").trim().replace(/^\/+/, "");
  if (!safePath) {
    return "";
  }
  if (cloudState.client?.storage) {
    const response = cloudState.client.storage.from(SHARED_MEDIA_BUCKET).getPublicUrl(safePath);
    return response?.data?.publicUrl || "";
  }
  if (cloudState.config?.supabaseUrl) {
    return `${cloudState.config.supabaseUrl}/storage/v1/object/public/${SHARED_MEDIA_BUCKET}/${safePath}`;
  }
  return "";
}

async function resolveMediaPreviewUrl(item) {
  if (!item) {
    return "";
  }
  if (item.previewUrl) {
    return item.previewUrl;
  }
  const remoteUrl = getSharedMediaPublicUrl(item.sharedPath, item.publicUrl);
  if (remoteUrl) {
    return remoteUrl;
  }
  if (!item.assetId) {
    return "";
  }
  if (mediaPreviewUrlCache.has(item.assetId)) {
    return mediaPreviewUrlCache.get(item.assetId);
  }
  const blob = await getMediaBlob(item.assetId);
  if (!blob) {
    return "";
  }
  const objectUrl = URL.createObjectURL(blob);
  mediaPreviewUrlCache.set(item.assetId, objectUrl);
  return objectUrl;
}

function buildMediaImageMarkup(item, alt, className = "") {
  const remoteUrl = getSharedMediaPublicUrl(item.sharedPath, item.publicUrl);
  const srcAttribute = item.previewUrl || remoteUrl ? `src="${escapeHtml(item.previewUrl || remoteUrl)}"` : "";
  return `<img class="${escapeHtml(className)}" ${srcAttribute} data-media-asset-id="${escapeHtml(item.assetId || "")}" data-media-shared-path="${escapeHtml(item.sharedPath || "")}" data-media-public-url="${escapeHtml(item.publicUrl || "")}" alt="${escapeHtml(alt)}" />`;
}

async function hydrateMediaNodes(root = document) {
  const nodes = [...root.querySelectorAll("img[data-media-asset-id], img[data-media-shared-path], img[data-media-public-url]")];
  await Promise.all(
    nodes.map(async (node) => {
      if (!(node instanceof HTMLImageElement) || node.getAttribute("src")) {
        return;
      }
      const url = await resolveMediaPreviewUrl({
        assetId: node.dataset.mediaAssetId || "",
        sharedPath: node.dataset.mediaSharedPath || "",
        publicUrl: node.dataset.mediaPublicUrl || "",
      });
      if (url) {
        node.src = url;
      }
    }),
  );
}

function buildMediaDraftCard(item, index, { formKey, side }) {
  const dimensionLabel = item.width && item.height ? `${item.width} x ${item.height}` : "サイズ未取得";
  return `
    <article class="media-editor-card">
      ${buildMediaImageMarkup(item, `${side === "front" ? "表" : "裏"}の画像 ${index + 1}`, "media-editor-thumb")}
      <div class="media-editor-copy">
        <strong>${escapeHtml(item.name)}</strong>
        <span class="muted">${escapeHtml([formatMediaBytes(item.size), dimensionLabel].filter(Boolean).join(" / "))}</span>
        <div class="media-editor-actions">
          <button class="mini-button" data-media-action="preview" data-media-index="${index}" type="button">拡大</button>
          <button class="mini-button" data-media-action="move-left" data-media-index="${index}" type="button" ${index === 0 ? "disabled" : ""}>前へ</button>
          <button class="mini-button" data-media-action="move-right" data-media-index="${index}" type="button" ${index === MEDIA_SIDE_LIMIT - 1 || index === getMediaDraft(formKey)[side].length - 1 ? "disabled" : ""}>次へ</button>
          <button class="mini-button danger-button" data-media-action="remove" data-media-index="${index}" type="button">外す</button>
        </div>
      </div>
    </article>
  `;
}

function renderMediaDraftList(formKey, side) {
  const draft = getMediaDraft(formKey)[side];
  const { listElement, statusElement } = getMediaDraftUi(formKey, side);

  if (!listElement || !statusElement) {
    return;
  }

  statusElement.textContent = draft.length
    ? `${draft.length} / ${MEDIA_SIDE_LIMIT} 枚追加済み。並び替えると学習画面の表示順も変わります。`
    : side === "front"
      ? "図や写真を表側に置くと、どこの構造かを見ながら覚えやすくなります。"
      : "答え側には図表や写真の答え合わせ用画像を置けます。";

  listElement.innerHTML = draft.length
    ? draft.map((item, index) => buildMediaDraftCard(item, index, { formKey, side })).join("")
    : `
        <article class="library-card">
          <h4>${side === "front" ? "表の画像はまだありません" : "裏の画像はまだありません"}</h4>
          <p class="muted">文字だけでも保存できます。必要なときだけ画像を足してください。</p>
        </article>
      `;
  hydrateMediaNodes(listElement).catch((error) => console.warn("Failed to hydrate media draft list:", error));
}

function renderAllMediaDraftLists() {
  renderMediaDraftList("card", "front");
  renderMediaDraftList("card", "back");
  renderMediaDraftList("quick", "front");
  renderMediaDraftList("quick", "back");
  renderMediaDraftList("edit", "front");
  renderMediaDraftList("edit", "back");
}

async function handleMediaInputChange(event, { formKey, side }) {
  const input = event.target;
  const files = [...(input.files || [])];
  if (!files.length) {
    return;
  }
  const draft = getMediaDraft(formKey);
  const remainingSlots = Math.max(0, MEDIA_SIDE_LIMIT - draft[side].length);
  if (!remainingSlots) {
    input.value = "";
    showToast(`1面につき最大${MEDIA_SIDE_LIMIT}枚までです`);
    return;
  }
  const acceptedFiles = files.slice(0, remainingSlots);
  if (acceptedFiles.length < files.length) {
    showToast(`1面につき最大${MEDIA_SIDE_LIMIT}枚までなので、一部だけ追加しました`);
  }

  try {
    const items = [];
    for (const file of acceptedFiles) {
      items.push(await buildDraftMediaItemFromFile(file));
    }
    draft[side] = normalizeCardMediaList([...draft[side], ...items]);
    renderMediaDraftList(formKey, side);
  } catch (error) {
    showToast(error.message || "画像の追加に失敗しました");
  } finally {
    input.value = "";
  }
}

function moveMediaDraftItem(items, fromIndex, toIndex) {
  if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) {
    return items;
  }
  const nextItems = [...items];
  const [moved] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, moved);
  return nextItems;
}

function handleMediaListActions(event, { formKey, side }) {
  const actionButton = event.target.closest("[data-media-action]");
  if (!actionButton) {
    return;
  }
  const index = Number(actionButton.dataset.mediaIndex || -1);
  const draft = getMediaDraft(formKey);
  const item = draft[side][index];
  if (!item) {
    return;
  }

  if (actionButton.dataset.mediaAction === "preview") {
    openMediaViewerForItem(item, item.name);
    return;
  }

  if (actionButton.dataset.mediaAction === "remove") {
    if (item.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(item.previewUrl);
    }
    draft[side] = draft[side].filter((_, itemIndex) => itemIndex !== index);
    renderMediaDraftList(formKey, side);
    return;
  }

  if (actionButton.dataset.mediaAction === "move-left") {
    draft[side] = moveMediaDraftItem(draft[side], index, index - 1);
    renderMediaDraftList(formKey, side);
    return;
  }

  if (actionButton.dataset.mediaAction === "move-right") {
    draft[side] = moveMediaDraftItem(draft[side], index, index + 1);
    renderMediaDraftList(formKey, side);
  }
}

async function openMediaViewerForItem(item, title = "カード画像") {
  if (!mediaViewerModal || !mediaViewerImage) {
    return;
  }
  const previewUrl = await resolveMediaPreviewUrl(item);
  if (!previewUrl) {
    showToast("画像を開けませんでした");
    return;
  }
  mediaViewerTitle.textContent = title || "カード画像";
  mediaViewerImage.src = previewUrl;
  mediaViewerModal.hidden = false;
}

function closeMediaViewer() {
  if (!mediaViewerModal || !mediaViewerImage) {
    return;
  }
  mediaViewerModal.hidden = true;
  mediaViewerImage.removeAttribute("src");
}

function buildMediaGalleryMarkup(mediaItems = [], labelPrefix = "カード画像") {
  return normalizeCardMediaList(mediaItems)
    .map(
      (item, index) => `
        <article class="media-gallery-card">
          <button
            class="media-gallery-button"
            data-open-media-viewer="true"
            data-media-asset-id="${escapeHtml(item.assetId || "")}"
            data-media-shared-path="${escapeHtml(item.sharedPath || "")}"
            data-media-public-url="${escapeHtml(item.publicUrl || "")}"
            data-media-title="${escapeHtml(item.name || `${labelPrefix} ${index + 1}`)}"
            type="button"
          >
            ${buildMediaImageMarkup(item, `${labelPrefix} ${index + 1}`)}
          </button>
          <p class="media-caption">${escapeHtml(item.name || `${labelPrefix} ${index + 1}`)}</p>
        </article>
      `,
    )
    .join("");
}

function renderCardMediaGallery(element, mediaItems, labelPrefix) {
  if (!element) {
    return;
  }
  const safeItems = normalizeCardMediaList(mediaItems);
  element.hidden = !safeItems.length;
  element.innerHTML = safeItems.length ? buildMediaGalleryMarkup(safeItems, labelPrefix) : "";
  hydrateMediaNodes(element).catch((error) => console.warn("Failed to hydrate media gallery:", error));
}

function hasCardMedia(card) {
  return Boolean((card?.frontMedia || []).length || (card?.backMedia || []).length);
}

function hasDeckMedia(deckId) {
  return state.cards.some((card) => card.deckId === deckId && hasCardMedia(card));
}

function formatCardFrontLabel(card) {
  return String(card?.front || "").trim() || "画像カード";
}

function formatCardBackLabel(card) {
  return String(card?.back || "").trim() || "画像を見て確認";
}

function canUseLocalShare(deck) {
  return Boolean(deck) && !hasDeckMedia(deck.id);
}

function getDeckDefaults(deckOrId) {
  const deck = typeof deckOrId === "string" ? getDeckById(deckOrId) : deckOrId;
  return normalizeDeckDefaults(deck?.defaults, normalizeDeckFocus(deck?.focus));
}

function getPreferredCardStyle(card, deck = getDeckById(card?.deckId || "")) {
  return getDeckDefaults(deck).preferredCardStyle || "balanced";
}

function buildTagString(tags) {
  return dedupeTags(Array.isArray(tags) ? tags : parseTags(String(tags || ""))).join(", ");
}

function mergeTagString(...inputs) {
  return buildTagString(inputs.flatMap((input) => (Array.isArray(input) ? input : parseTags(String(input || "")))));
}

function getDefaultCardTextPlaceholders(focus) {
  if (focus === "medical") {
    return {
      front: "例: ネフローゼ症候群の4徴は？",
      back: "例: 高度蛋白尿、低アルブミン血症、浮腫、高脂血症。",
    };
  }

  if (focus === "english") {
    return {
      front: "例: administer",
      back: "例: 投与する / to give a drug or treatment",
    };
  }

  return {
    front: "表に出す内容",
    back: "裏面の内容",
  };
}

function applyDeckDefaultsToCardFields(deck, fields, { force = false } = {}) {
  if (!deck || !fields) {
    return;
  }

  const defaults = getDeckDefaults(deck);
  const placeholders = getDefaultCardTextPlaceholders(deck.focus);
  const shouldApplyTemplates = state.settings?.quickCapture?.keepTemplate !== false;

  if (fields.frontInput) {
    fields.frontInput.placeholder = defaults.frontPromptTemplate || placeholders.front;
  }
  if (fields.backInput) {
    fields.backInput.placeholder = defaults.backPromptTemplate || placeholders.back;
  }

  if (!shouldApplyTemplates) {
    return;
  }

  if (fields.topicInput && (force || !String(fields.topicInput.value || "").trim())) {
    fields.topicInput.value = defaults.defaultTopic || "";
  }

  if (fields.tagsInput) {
    const nextTags = mergeTagString(defaults.defaultTags, force ? "" : fields.tagsInput.value || "");
    if (force || !String(fields.tagsInput.value || "").trim()) {
      fields.tagsInput.value = nextTags;
    } else if (defaults.defaultTags) {
      fields.tagsInput.value = mergeTagString(fields.tagsInput.value, defaults.defaultTags);
    }
  }
}

function buildQuickCaptureDeckOptions() {
  return sortDashboardDecks(state.decks.filter((deck) => canAddCardsToDeck(deck)));
}

function syncQuickCaptureDeckOptions() {
  if (!quickCaptureDeckId) {
    return [];
  }

  const decks = buildQuickCaptureDeckOptions();
  const previousValue = quickCaptureDeckId.value || state.settings?.quickCapture?.lastDeckId || "";
  quickCaptureDeckId.innerHTML = decks.length
    ? decks.map((deck) => `<option value="${deck.id}">${escapeHtml(deck.subject ? `${deck.subject} / ${deck.name}` : deck.name)}</option>`).join("")
    : '<option value="">保存できるデッキがありません</option>';
  quickCaptureDeckId.disabled = !decks.length;

  if (optionExists(quickCaptureDeckId, previousValue)) {
    quickCaptureDeckId.value = previousValue;
  } else if (decks[0]) {
    quickCaptureDeckId.value = decks[0].id;
  } else {
    quickCaptureDeckId.value = "";
  }
  return decks;
}

function renderQuickCapturePanel() {
  const decks = syncQuickCaptureDeckOptions();
  const deck = getDeckById(quickCaptureDeckId?.value || "");
  const hasDeck = Boolean(deck);
  const canCreate = Boolean(deck && canAddCardsToDeck(deck));
  const canUploadMedia = Boolean(deck && canUploadMediaForDeck(deck));

  if (quickCaptureFrontInput) {
    quickCaptureFrontInput.disabled = !canCreate;
  }
  if (quickCaptureBackInput) {
    quickCaptureBackInput.disabled = !canCreate;
  }
  if (quickCaptureTagsInput) {
    quickCaptureTagsInput.disabled = !canCreate;
  }
  if (quickCaptureFrontMediaInput) {
    quickCaptureFrontMediaInput.disabled = !canCreate || !canUploadMedia;
  }
  if (quickCaptureBackMediaInput) {
    quickCaptureBackMediaInput.disabled = !canCreate || !canUploadMedia;
  }
  if (quickCaptureSaveNextButton) {
    quickCaptureSaveNextButton.disabled = !canCreate;
  }
  if (quickCaptureSaveButton) {
    quickCaptureSaveButton.disabled = !canCreate;
  }
  if (quickCaptureResetButton) {
    quickCaptureResetButton.disabled = !canCreate && !decks.length;
  }

  if (!hasDeck) {
    if (quickCaptureStatus) {
      quickCaptureStatus.textContent = decks.length
        ? "保存先デッキを選ぶと、問題と答えだけで素早く追加できます。"
        : "まずはカードを入れるデッキを作ると、ここから連続追加できるようになります。";
    }
    renderMediaDraftList("quick", "front");
    renderMediaDraftList("quick", "back");
    return;
  }

  const defaults = getDeckDefaults(deck);
  const rememberedTags =
    state.settings?.quickCapture?.lastDeckId === deck.id ? state.settings?.quickCapture?.lastTags || "" : "";
  if (state.settings?.quickCapture?.keepTemplate !== false && !String(quickCaptureTagsInput?.value || "").trim()) {
    quickCaptureTagsInput.value = mergeTagString(rememberedTags, defaults.defaultTags);
  }
  applyDeckDefaultsToCardFields(
    deck,
    {
      frontInput: quickCaptureFrontInput,
      backInput: quickCaptureBackInput,
      tagsInput: quickCaptureTagsInput,
    },
    { force: false },
  );

  const styleLabel =
    defaults.preferredCardStyle === "image-first"
      ? "画像中心"
      : defaults.preferredCardStyle === "text-first"
        ? "文字中心"
        : "バランス";
  quickCaptureStatus.textContent = `追加先: ${deck.name}${deck.subject ? ` / ${deck.subject}` : ""}。タグやテンプレはこのデッキの既定値を使えます。現在のおすすめ表示: ${styleLabel}。`;
  renderMediaDraftList("quick", "front");
  renderMediaDraftList("quick", "back");
}

function renderBulkInputPanel() {
  if (!bulkTargetDeckId) {
    return;
  }

  const editableDecks = sortDashboardDecks(state.decks.filter((deck) => canAddCardsToDeck(deck)));
  const previousValue = bulkTargetDeckId.value || "";
  bulkTargetDeckId.innerHTML =
    '<option value="">新しいデッキを作る</option>' +
    editableDecks
      .map((deck) => `<option value="${deck.id}">${escapeHtml(deck.subject ? `${deck.subject} / ${deck.name}` : deck.name)}</option>`)
      .join("");
  if (optionExists(bulkTargetDeckId, previousValue)) {
    bulkTargetDeckId.value = previousValue;
  }

  const targetDeck = getDeckById(bulkTargetDeckId.value || "");
  if (targetDeck) {
    bulkFocusInput.value = normalizeDeckFocus(targetDeck.focus);
    if (!String(bulkDeckNameInput.value || "").trim()) {
      bulkDeckNameInput.value = targetDeck.name;
    }
    if (!String(bulkSubjectInput.value || "").trim()) {
      bulkSubjectInput.value = targetDeck.subject || "";
    }
    bulkInputStatus.textContent = `保存先: 「${targetDeck.name}」。Q/Aや箇条書きを貼ると、既存デッキへ追加する候補レビューを作れます。`;
  } else {
    bulkInputStatus.textContent =
      "Q/A、箇条書き、番号付きメモを貼り付けると、候補レビューへまとめて送れます。新しいデッキにするか、あとから保存先を選べます。";
  }
}

async function persistDraftMediaItems(items) {
  const savedItems = [];
  for (const item of normalizeCardMediaList(items)) {
    const nextItem = normalizeCardMediaItem(item);
    if (nextItem.file instanceof Blob) {
      await putMediaBlob(nextItem.assetId, nextItem.file);
      nextItem.file = null;
      nextItem.previewUrl = "";
    }
    savedItems.push(nextItem);
  }
  return savedItems;
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("画像をバックアップ形式へ変換できませんでした"));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl) {
  const [meta, base64] = String(dataUrl || "").split(",", 2);
  const mimeMatch = /data:([^;]+);base64/.exec(meta || "");
  const mimeType = mimeMatch?.[1] || "application/octet-stream";
  const binary = atob(base64 || "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

async function getExportableMediaBlob(media) {
  const localBlob = await getMediaBlob(media.assetId);
  if (localBlob) {
    return localBlob;
  }
  const remoteUrl = getSharedMediaPublicUrl(media.sharedPath, media.publicUrl);
  if (!remoteUrl) {
    return null;
  }
  const response = await fetch(remoteUrl);
  if (!response.ok) {
    throw new Error("共有画像を取得できませんでした");
  }
  return response.blob();
}

async function collectBackupAssets() {
  const assets = [];
  const seen = new Set();
  for (const card of state.cards) {
    for (const media of [...(card.frontMedia || []), ...(card.backMedia || [])]) {
      if (!media.assetId || seen.has(media.assetId)) {
        continue;
      }
      const blob = await getExportableMediaBlob(media);
      if (!blob) {
        continue;
      }
      assets.push({
        assetId: media.assetId,
        name: media.name || "画像",
        mimeType: media.mimeType || blob.type || "image/*",
        size: media.size || blob.size,
        dataUrl: await blobToDataUrl(blob),
      });
      seen.add(media.assetId);
    }
  }
  return assets;
}

function buildMediaSummaryMarkup(card) {
  const mediaItems = normalizeCardMediaList([...(card.frontMedia || []), ...(card.backMedia || [])]);
  if (!mediaItems.length) {
    return "";
  }
  return `
    <div class="card-media-inline">
      <span class="meta-pill card-media-chip">画像 ${mediaItems.length}枚</span>
      ${buildMediaGalleryMarkup(mediaItems.slice(0, 1), "カード画像")}
    </div>
  `;
}

async function handleOpenMediaViewerClick(event) {
  const button = event.target.closest("[data-open-media-viewer]");
  if (!button) {
    return;
  }
  event.preventDefault();
  await openMediaViewerForItem(
    {
      assetId: button.dataset.mediaAssetId || "",
      sharedPath: button.dataset.mediaSharedPath || "",
      publicUrl: button.dataset.mediaPublicUrl || "",
    },
    button.dataset.mediaTitle || "カード画像",
  );
}

function switchSection(sectionId) {
  activeSection = sectionId;
  if (sectionId !== "study") {
    clearStudyAdvanceTimer();
  }

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
  renderFeatureSearchResults();
  hydrateMediaNodes().catch((error) => {
    console.warn("Failed to hydrate media nodes:", error);
  });
}

function openFeatureSearchModal(initialQuery = "") {
  if (!featureSearchModal || !featureSearchInput) {
    return;
  }

  featureSearchVisible = true;
  featureSearchModal.hidden = false;
  featureSearchInput.value = String(initialQuery || "");
  renderFeatureSearchResults();
  window.requestAnimationFrame(() => {
    featureSearchInput.focus();
    featureSearchInput.select();
  });
}

function closeFeatureSearchModal() {
  if (!featureSearchModal || !featureSearchInput) {
    return;
  }

  featureSearchVisible = false;
  featureSearchModal.hidden = true;
  featureSearchInput.value = "";
  renderFeatureSearchResults();
}

function renderFeatureSearchResults() {
  if (!featureSearchResults || !featureSearchStatus || !featureSearchInput) {
    return;
  }

  const query = String(featureSearchInput.value || "").trim();
  const rankedItems = getRankedFeatureSearchItems(query);

  if (!query) {
    featureSearchStatus.textContent =
      "例: PDF、過去問、共有、4択、バックアップ。よく使う機能を上に並べています。";
  } else if (!rankedItems.length) {
    featureSearchStatus.textContent = `「${query}」に近い機能は見つかりませんでした。言い換えでも探せます。`;
  } else {
    featureSearchStatus.textContent = `「${query}」に近い機能を ${rankedItems.length} 件見つけました。`;
  }

  featureSearchResults.innerHTML = rankedItems.length
    ? rankedItems
        .map(
          (item) => `
            <button class="feature-search-result" data-feature-search-id="${escapeHtml(item.id)}" type="button">
              <div class="feature-search-copy">
                <div class="feature-search-header">
                  <p class="eyebrow">${escapeHtml(item.sectionLabel)}</p>
                  ${item.isDangerous ? '<span class="meta-pill danger">注意</span>' : ""}
                </div>
                <strong>${escapeHtml(item.title)}</strong>
                <span class="muted">${escapeHtml(item.description)}</span>
              </div>
            </button>
          `,
        )
        .join("")
    : `
        <article class="library-card">
          <h4>近い機能が見つかりませんでした</h4>
          <p class="muted">「PDF」「過去問」「共有」「初期化」などの短い語で探すと見つけやすくなります。</p>
        </article>
      `;
}

function getRankedFeatureSearchItems(query) {
  const safeQuery = normalizeFeatureSearchText(query);
  const baseItems = FEATURE_SEARCH_ITEMS.map((item, index) => ({
    ...item,
    score: scoreFeatureSearchItem(item, safeQuery),
    order: index,
  }));

  if (!safeQuery) {
    return baseItems
      .filter((item) => item.featured)
      .slice(0, 8);
  }

  return baseItems
    .filter((item) => item.score >= 0)
    .sort((left, right) => right.score - left.score || left.order - right.order)
    .slice(0, 10);
}

function scoreFeatureSearchItem(item, query) {
  if (!query) {
    return item.featured ? 1 : 0;
  }

  const tokens = query.split(" ").filter(Boolean);
  if (!tokens.length) {
    return item.featured ? 1 : 0;
  }

  const title = normalizeFeatureSearchText(item.title);
  const sectionLabel = normalizeFeatureSearchText(item.sectionLabel);
  const description = normalizeFeatureSearchText(item.description);
  const keywords = (item.keywords || []).map((keyword) => normalizeFeatureSearchText(keyword));
  let score = 0;

  for (const token of tokens) {
    let tokenMatched = false;

    if (title === token) {
      score += 120;
      tokenMatched = true;
    } else if (title.startsWith(token)) {
      score += 90;
      tokenMatched = true;
    } else if (title.includes(token)) {
      score += 70;
      tokenMatched = true;
    }

    if (keywords.some((keyword) => keyword === token)) {
      score += 80;
      tokenMatched = true;
    } else if (keywords.some((keyword) => keyword.includes(token))) {
      score += 50;
      tokenMatched = true;
    }

    if (sectionLabel.includes(token)) {
      score += 20;
      tokenMatched = true;
    }

    if (description.includes(token)) {
      score += 18;
      tokenMatched = true;
    }

    if (!tokenMatched) {
      return -1;
    }
  }

  if (item.featured) {
    score += 6;
  }
  if (item.isDangerous) {
    score -= 4;
  }

  return score;
}

function normalizeFeatureSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[・/]/g, " ")
    .trim();
}

function handleFeatureSearchInputKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeFeatureSearchModal();
    return;
  }

  if (event.key === "Enter") {
    const firstItem = getRankedFeatureSearchItems(featureSearchInput.value || "")[0];
    if (firstItem) {
      event.preventDefault();
      executeFeatureSearchItem(firstItem.id);
    }
  }
}

function handleFeatureSearchResultClick(event) {
  const resultButton = event.target.closest("[data-feature-search-id]");
  if (!resultButton) {
    return;
  }

  executeFeatureSearchItem(resultButton.dataset.featureSearchId);
}

function handleGlobalKeydown(event) {
  const isSearchShortcut = (event.metaKey || event.ctrlKey) && String(event.key || "").toLowerCase() === "k";
  const isSlashShortcut = event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;

  if (featureSearchVisible && event.key === "Escape") {
    event.preventDefault();
    closeFeatureSearchModal();
    return;
  }

  if (!isSearchShortcut && !isSlashShortcut) {
    return;
  }

  if (isTypingIntoField(event.target)) {
    return;
  }

  event.preventDefault();
  openFeatureSearchModal(isSearchShortcut ? "" : "");
}

function isTypingIntoField(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tagName = target.tagName;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(tagName);
}

function executeFeatureSearchItem(itemId) {
  const item = FEATURE_SEARCH_ITEMS.find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }

  closeFeatureSearchModal();

  if (item.action === "study-mode") {
    switchSection("study");
    setStudyMode(item.studyMode || "review");
  } else if (item.action === "quick-study") {
    switchSection("study");
    setStudyQuickMinutes(item.quickStudyMinutes || state.settings?.studyPreferences?.defaultSessionMinutes || 5);
    startQuickStudy(item.quickStudyKind || "recommended");
  } else if (item.action === "create-mode") {
    openCreateMode(item.createMode || "deck");
  } else if (item.action === "section") {
    switchSection(item.sectionId || "dashboard");
  } else if (item.action === "guide") {
    switchSection("settings");
    onboardingModal.hidden = false;
  }

  focusFeatureTarget(item.targetId, {
    select: item.targetId === "demoResetConfirmInput" || item.targetId === "assistantInput" || item.targetId === "deckName",
  });
}

function focusFeatureTarget(targetId, { select = false } = {}) {
  if (!targetId) {
    return;
  }

  window.requestAnimationFrame(() => {
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    target.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });

    if (typeof target.focus === "function" && !target.disabled) {
      try {
        target.focus({ preventScroll: true });
      } catch (_error) {
        target.focus();
      }
      if (select && typeof target.select === "function") {
        target.select();
      }
    }
  });
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
  renderQuickCapturePanel();
  renderBulkInputPanel();
  renderEditWorkspace();
  renderImportPanel();
  renderQuestionMapPanel();
  syncAssistantControls();
  renderAllMediaDraftLists();
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
  if (mode === "edit") {
    renderEditWorkspace();
  }
  if (mode === "quick") {
    renderQuickCapturePanel();
  }
  if (mode === "bulk") {
    renderBulkInputPanel();
  }
}

function openCreateMode(mode) {
  setCreateMode(mode);
  switchSection("manage");
}

function clearLockHeartbeatTimer() {
  if (cloudState.lockHeartbeatTimer) {
    window.clearInterval(cloudState.lockHeartbeatTimer);
    cloudState.lockHeartbeatTimer = null;
  }
}

async function releaseSharedEditLock(lockInfo) {
  if (!lockInfo?.deckId || !lockInfo?.targetType || !lockInfo?.targetId) {
    return;
  }
  const client = cloudState.client || (await getSupabaseClient());
  if (!client || !cloudState.session?.user) {
    return;
  }
  await client.rpc("release_edit_lock", {
    target_deck_id: lockInfo.deckId,
    target_type: lockInfo.targetType,
    target_id: String(lockInfo.targetId),
  });
}

async function releaseAllEditLocks() {
  const activeLocks = Object.values(cloudState.activeEditLocks || {}).filter(Boolean);
  clearLockHeartbeatTimer();
  cloudState.activeEditLocks = { deck: null, card: null };
  await Promise.all(
    activeLocks.map((lockInfo) =>
      releaseSharedEditLock(lockInfo).catch((error) => {
        console.warn("Failed to release edit lock:", error);
      }),
    ),
  );
}

async function claimSharedEditLock(deck, targetType, targetId) {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client || !cloudState.session?.user || !deck?.sharedDeckId || !targetId) {
    return null;
  }

  const { data, error } = await client.rpc("claim_edit_lock", {
    target_deck_id: deck.sharedDeckId,
    target_type: targetType,
    target_id: String(targetId),
    lease_seconds: SHARE_LOCK_LEASE_SECONDS,
  });
  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return null;
  }

  const lockState = {
    id: String(row.lock_id || "").trim(),
    deckId: deck.sharedDeckId,
    targetType,
    targetId: String(targetId),
    holderUserId: String(row.holder_user_id || "").trim(),
    holderEmail: String(row.holder_email || "").trim(),
    expiresAt: parseCloudTimestamp(row.expires_at),
    isCurrentUser: Boolean(row.is_self),
    locked: Boolean(row.locked),
  };
  cloudState.editLocksByDeck[getShareLockKey(targetType, targetId)] = lockState;
  return lockState;
}

function scheduleLockHeartbeat() {
  clearLockHeartbeatTimer();
  const activeLocks = Object.values(cloudState.activeEditLocks || {}).filter(Boolean);
  if (!activeLocks.length) {
    return;
  }
  cloudState.lockHeartbeatTimer = window.setInterval(() => {
    syncEditWorkspaceLocks({ silentRender: true }).catch((error) => {
      console.warn("Failed to refresh edit locks:", error);
    });
  }, SHARE_LOCK_HEARTBEAT_MS);
}

async function syncEditWorkspaceLocks({ silentRender = false } = {}) {
  const deck = getSelectedEditDeck();
  if (!deck || deck.storageMode !== "shared" || !isCloudSignedIn()) {
    await releaseAllEditLocks();
    if (!silentRender) {
      renderEditWorkspace();
    }
    return;
  }

  const desiredDeckLock = editSubview === "deck" ? deck.sharedDeckId : "";
  const editingCard = editWorkspaceCardId ? getCardById(editWorkspaceCardId) : null;
  const desiredCardLock =
    editSubview === "cards" && editingCard && editingCard.deckId === deck.id ? editingCard.sharedCardId || editingCard.id : "";

  for (const [slot, activeLock] of Object.entries(cloudState.activeEditLocks)) {
    const desiredTarget = slot === "deck" ? desiredDeckLock : desiredCardLock;
    if (activeLock && activeLock.targetId !== desiredTarget) {
      await releaseSharedEditLock(activeLock).catch((error) => {
        console.warn("Failed to release stale edit lock:", error);
      });
      cloudState.activeEditLocks[slot] = null;
    }
  }

  if (desiredDeckLock) {
    const lockState = await claimSharedEditLock(deck, "deck", desiredDeckLock).catch((error) => {
      console.warn("Failed to claim deck lock:", error);
      return null;
    });
    cloudState.activeEditLocks.deck = lockState?.locked && lockState.isCurrentUser ? lockState : null;
  }

  if (desiredCardLock) {
    const lockState = await claimSharedEditLock(deck, "card", desiredCardLock).catch((error) => {
      console.warn("Failed to claim card lock:", error);
      return null;
    });
    cloudState.activeEditLocks.card = lockState?.locked && lockState.isCurrentUser ? lockState : null;
  }

  scheduleLockHeartbeat();
  if (!silentRender) {
    renderEditWorkspace();
  }
}

function setEditSubview(view) {
  if (!["deck", "cards"].includes(view)) {
    return;
  }

  editSubview = view;
  renderEditWorkspace();
  syncEditWorkspaceLocks().catch((error) => {
    console.warn("Failed to sync edit locks:", error);
  });
}

function openEditWorkspace(deckId, { subview = "deck", cardId = "", resetSearch = false } = {}) {
  const deck = getDeckById(deckId);
  if (!deck) {
    showToast("対象デッキが見つかりません");
    return;
  }

  if (!canEditDeckContent(deck)) {
    showToast("この共有デッキは編集できません");
    return;
  }

  const deckChanged = selectedEditDeckId !== deck.id;
  selectedEditDeckId = deck.id;
  editSubview = ["deck", "cards"].includes(subview) ? subview : "deck";
  if (deckChanged || resetSearch) {
    editCardQuery = "";
  }
  editWorkspaceCardId = cardId || "";
  clearDeckEditing();
  clearCardEditing();
  setCreateMode("edit");
  switchSection("manage");
  renderEditWorkspace();
  syncEditWorkspaceLocks().catch((error) => {
    console.warn("Failed to sync edit locks:", error);
  });

  if (editSubview === "cards") {
    window.requestAnimationFrame(() => {
      if (editWorkspaceCardId) {
        editCardFrontInput.focus();
      } else {
        editCardSearchInput.focus();
      }
    });
  }
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

function openQuickCapture(deckId = "", options = {}) {
  const requestedDeckId =
    String(deckId || "").trim() ||
    (state.settings?.quickCapture?.keepDeckContext !== false ? state.settings?.quickCapture?.lastDeckId || "" : "");
  clearDeckEditing();
  clearCardEditing();
  clearImportDraft();
  resetMediaDraft("quick");
  quickCaptureForm?.reset();
  setCreateMode("quick");
  switchSection("manage");
  syncQuickCaptureDeckOptions();

  if (requestedDeckId && optionExists(quickCaptureDeckId, requestedDeckId)) {
    quickCaptureDeckId.value = requestedDeckId;
  }
  if (options.tags && !String(quickCaptureTagsInput.value || "").trim()) {
    quickCaptureTagsInput.value = mergeTagString(options.tags);
  }
  renderQuickCapturePanel();
  window.requestAnimationFrame(() => {
    quickCaptureFrontInput?.focus();
  });
}

function openCardComposer(deckId) {
  const deck = getDeckById(deckId);
  if (!deck) {
    clearDeckEditing();
    clearCardEditing();
    setCreateMode("card");
    switchSection("manage");
    if (state.decks[0] && optionExists(cardDeckId, state.decks[0].id)) {
      cardDeckId.value = state.decks[0].id;
    }
    applyCardContextPlaceholders();
    showToast("対象デッキが見つからなかったため、通常のカード追加を開きました");
    return;
  }

  if (!canAddCardsToDeck(deck)) {
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
    importContextDeckId = "";
    clearImportDraft();
    importSelection.clear();
    setCreateMode("import");
    switchSection("manage");
    importFocusInput.value = "medical";
    applyImportFocusPreset();
    importDeckNameInput.value = "";
    importSubjectInput.value = "";
    importInstructionsInput.value = "";
    renderImportPanel();
    showToast("対象デッキが見つからなかったため、通常のPDF取り込みを開きました");
    return;
  }

  if (!canAddCardsToDeck(deck) && !canUploadMediaForDeck(deck)) {
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
    questionMapContextDeckId = "";
    clearQuestionMapDraft({ silent: true });
    setCreateMode("locator");
    switchSection("manage");
    renderQuestionMapPanel();
    showToast("対象デッキが見つからなかったため、通常の過去問参照を開きました");
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

function openAccountBackupSettings({ intent = "settings-backup", expandEmail = false } = {}) {
  setStoredAuthIntent(intent);
  if (expandEmail) {
    settingsEmailAuthVisible = true;
  }
  switchSection("settings");
  focusFeatureTarget(settingsEmailAuthVisible ? "settingsAuthEmailInput" : getPreferredAuthFocusTargetId());
}

function openDeckActionModal(deckId) {
  const deck = getDeckById(deckId);
  if (!deck) {
    showToast("対象デッキが見つかりません");
    return;
  }

  deckActionDeckId = deck.id;
  deckActionTitle.textContent = `「${deck.subject || deck.name}」に何を追加しますか？`;
  const canAddContent = canAddCardsToDeck(deck) || canUploadMediaForDeck(deck);
  deckActionStatus.textContent = canAddContent
    ? `クイック追加、カード追加、PDF取り込み、過去問参照を、いま見ているデッキに合わせて始められます。`
    : "この共有デッキは閲覧のみです。過去問参照は使えますが、カードやPDFの追加はできません。";
  deckActionQuickButton.disabled = !canAddCardsToDeck(deck);
  deckActionCardButton.disabled = !canAddCardsToDeck(deck);
  deckActionImportButton.disabled = !(canAddCardsToDeck(deck) || canUploadMediaForDeck(deck));
  deckActionLocatorButton.disabled = false;
  deckActionModal.hidden = false;
}

function closeDeckActionModal() {
  deckActionDeckId = "";
  deckActionModal.hidden = true;
}

function openDeckActionTarget(target) {
  const targetDeckId = deckActionDeckId;
  closeDeckActionModal();

  if (target === "quick") {
    openQuickCapture(targetDeckId);
    return;
  }

  if (target === "card") {
    openCardComposer(targetDeckId);
    return;
  }

  if (target === "import") {
    openImportComposer(targetDeckId);
    return;
  }

  openQuestionMapComposer(targetDeckId);
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
  clearAiStudyDraft({ silent: true });
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
  clearAiStudyDraft({ silent: true });
  currentCardId = null;
  isAnswerVisible = false;
  renderStudy();
}

function resetStudySession() {
  clearStudyAdvanceTimer();
  studySession = null;
  shortQuizAnswerInput.value = "";
  shortQuizAnswerArea.classList.add("is-hidden");
  choiceQuizAnswerArea.classList.add("is-hidden");
}

function clearStudyAdvanceTimer() {
  if (studyAdvanceTimer) {
    window.clearTimeout(studyAdvanceTimer);
    studyAdvanceTimer = null;
  }
}

function setStudyQuickMinutes(minutes) {
  const safeMinutes = [5, 10, 20].includes(Number(minutes)) ? Number(minutes) : state.settings?.studyPreferences?.defaultSessionMinutes || 5;
  studyQuickMinutes = safeMinutes;
  renderStudy();
}

function estimateStudySessionSize(mode, minutes, availableCount) {
  const perCardMinutes = mode === "test" ? 1 : mode === "choice" ? 0.5 : 0.33;
  const estimated = Math.max(3, Math.round((Number(minutes || 5) / perCardMinutes)));
  return clampNumber(Math.min(estimated, availableCount || estimated), 3, 20, Math.min(8, availableCount || 8));
}

function getQuickStudyCandidateGroup(groups, key) {
  return groups[key] || groups.due;
}

function buildQuickStudyPlans(groups) {
  const recommendedPlan = groups.due.cards.length
    ? { key: "recommended", title: "5分だけ回す", mode: "review", sourceKey: "due", cards: groups.due.cards, description: "期限切れを優先して、最短で今日の復習を進めます。" }
    : groups.again.cards.length
      ? { key: "recommended", title: "おすすめの弱点補強", mode: "test", sourceKey: "again", cards: groups.again.cards, description: "直近で間違えたカードから、短い小テストを作ります。" }
      : groups.hard.cards.length
        ? { key: "recommended", title: "あいまいを固める", mode: "test", sourceKey: "hard", cards: groups.hard.cards, description: "惜しかったカードをもう一度だけ回して、理解を安定させます。" }
        : { key: "recommended", title: "4択で流す", mode: "choice", sourceKey: "weak", cards: groups.weak.cards, description: "4択でテンポよく確認して、弱点を洗い出します。" };

  return [
    recommendedPlan,
    {
      key: "mistakes",
      title: "ミスだけ潰す",
      mode: "test",
      sourceKey: groups.again.cards.length ? "again" : "hard",
      cards: groups.again.cards.length ? groups.again.cards : groups.hard.cards,
      description: "直近ミスやあいまいカードを、小テストで短く回します。",
    },
    {
      key: "choice",
      title: "4択で流す",
      mode: "choice",
      sourceKey: groups.weak.cards.length ? "weak" : "all",
      cards: groups.weak.cards.length ? groups.weak.cards : groups.all.cards,
      description: "選択式でテンポよく確認したいときの高速モードです。",
    },
  ];
}

function renderStudyQuickPanel(groups) {
  if (!studyMinuteButtons.length || !studyQuickActionGrid || !studyQuickSummary) {
    return;
  }

  const preferredMinutes = state.settings?.studyPreferences?.defaultSessionMinutes || 5;
  if (![5, 10, 20].includes(studyQuickMinutes)) {
    studyQuickMinutes = preferredMinutes;
  }

  studyMinuteButtons.forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.studyMinutes || 5) === studyQuickMinutes);
  });

  const plans = buildQuickStudyPlans(groups);
  const recommended = plans[0];
  const recommendedCount = recommended.mode === "choice"
    ? recommended.cards.filter((card) => canBuildChoiceOptions(card, recommended.cards)).length
    : recommended.cards.length;
  studyQuickSummary.textContent = recommendedCount
    ? `${studyQuickMinutes}分なら ${recommended.title} で約${estimateStudySessionSize(recommended.mode, studyQuickMinutes, recommendedCount)}問回せます。`
    : "いまは復習待ちが少ないので、カードを追加するか、対象デッキを切り替えると始めやすくなります。";

  studyQuickActionGrid.innerHTML = plans
    .map((plan) => {
      const availableCount = plan.mode === "choice"
        ? plan.cards.filter((card) => canBuildChoiceOptions(card, plan.cards)).length
        : plan.cards.length;
      const estimatedSize = estimateStudySessionSize(plan.mode, studyQuickMinutes, availableCount);
      const canStart = availableCount >= 1;
      return `
        <article class="study-quick-action-card">
          <div>
            <p class="eyebrow">${escapeHtml(plan.mode === "review" ? "高速復習" : plan.mode === "choice" ? "4択" : "小テスト")}</p>
            <h4>${escapeHtml(plan.title)}</h4>
            <p class="muted">${escapeHtml(plan.description)}</p>
          </div>
          <div class="card-row-meta">
            <span class="meta-pill">${availableCount}枚対象</span>
            <span class="meta-pill">${estimatedSize}問想定</span>
          </div>
          <div class="button-row">
            <button
              class="${canStart ? "primary-button" : "ghost-button"}"
              data-start-quick-study="${escapeHtml(plan.key)}"
              type="button"
              ${canStart ? "" : "disabled"}
            >
              ${canStart ? "この内容で開始" : "対象不足"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function handleStudyQuickActions(event) {
  const button = event.target.closest("[data-start-quick-study]");
  if (!button) {
    return;
  }
  startQuickStudy(button.dataset.startQuickStudy);
}

function buildReviewStudySession(cards, size, sourceKey) {
  const selectedCards = shuffleList([...cards]).slice(0, Math.min(size, cards.length));
  return {
    id: crypto.randomUUID(),
    mode: "review",
    sourceKey,
    quickKind: "review",
    items: selectedCards.map((card) => ({
      cardId: card.id,
      answered: false,
      revealed: false,
      rating: "",
      repeatQueued: false,
      isRepeat: false,
    })),
    index: 0,
  };
}

function startQuickStudy(kind) {
  const groups = buildStudySourceGroups();
  const plan = buildQuickStudyPlans(groups).find((item) => item.key === kind)
    || buildQuickStudyPlans(groups).find((item) => item.key === state.settings?.studyPreferences?.defaultSpeedMode)
    || buildQuickStudyPlans(groups)[0];

  if (!plan) {
    showToast("始められる学習セットがありません");
    return;
  }

  studySourceKey = plan.sourceKey;
  studyMode = plan.mode;
  currentCardId = null;
  isAnswerVisible = false;
  clearAiStudyDraft({ silent: true });
  clearStudyAdvanceTimer();

  if (plan.mode === "review") {
    const size = estimateStudySessionSize("review", studyQuickMinutes, plan.cards.length);
    studySession = buildReviewStudySession(plan.cards, size, plan.sourceKey);
    studySessionSize = size;
    studySessionSizeInput.value = String(size);
    renderStudy();
    showToast(`${studyQuickMinutes}分の高速復習を始めます`);
    return;
  }

  const availableCards = plan.mode === "choice"
    ? plan.cards.filter((card) => canBuildChoiceOptions(card, plan.cards))
    : plan.cards;
  if (!availableCards.length) {
    showToast("この条件で使えるカードがまだありません");
    renderStudy();
    return;
  }

  const size = estimateStudySessionSize(plan.mode, studyQuickMinutes, availableCards.length);
  studySessionSize = size;
  studySessionSizeInput.value = String(size);
  studySession = buildStudySession(plan.mode, availableCards, size, { sourceKey: plan.sourceKey, quickKind: kind });
  renderStudy();
  showToast(`${plan.title} を始めます`);
}

function queueStudySessionRepeat(item) {
  if (!studySession || !item || item.repeatQueued || item.isRepeat) {
    return;
  }
  item.repeatQueued = true;
  const repeatItem = {
    ...clone(item),
    id: crypto.randomUUID(),
    answered: false,
    revealed: false,
    rating: "",
    selectedOptionId: "",
    typedAnswer: "",
    isRepeat: true,
    repeatQueued: true,
  };
  studySession.items.push(repeatItem);
}

function scheduleStudyAdvance(delayMs = 900) {
  clearStudyAdvanceTimer();
  studyAdvanceTimer = window.setTimeout(() => {
    studyAdvanceTimer = null;
    advanceStudySession();
  }, delayMs);
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

  if (createMode === "edit") {
    const editableDecks = getEditableDecks();
    return editableDecks.length
      ? {
          title: "1つのデッキをまとめて編集する",
          summary: "デッキ名の変更、カードの検索、削除までをこのワークスペースで完結できます。ホームの各デッキから直接入るのが最短です。",
          steps: [
            { title: "まず対象デッキを選ぶ", text: "ローカルデッキか、owner / editor 権限の共有デッキを選びます。" },
            { title: "デッキ情報を整える", text: "名前・分野・説明を更新したいときは「デッキ情報」を使います。" },
            { title: "カード一覧で探して直す", text: "問題、答え、タグで絞り込んで、そのまま同じ画面でカードを編集できます。" },
          ],
          actions: [
            { label: "カード一覧へ", action: "create-mode", mode: "edit" },
            { label: "新規カード追加へ", action: "create-mode", mode: "card", kind: "ghost" },
          ],
        }
      : {
          title: "編集できるデッキを用意する",
          summary: "編集ワークスペースはローカルデッキ、または owner / editor 権限の共有デッキで使えます。",
          steps: [
            { title: "新しいデッキを作る", text: "まだデッキがない場合は、先に科目デッキを1つ作ります。" },
            { title: "共有なら権限を確認する", text: "閲覧のみの共有デッキは、この画面からは編集できません。" },
          ],
          actions: [
            { label: "デッキ作成へ", action: "create-mode", mode: "deck" },
            { label: "共有へ", action: "create-mode", mode: "share", kind: "ghost" },
          ],
        };
  }

  if (createMode === "quick") {
    return {
      title: "短時間で連続追加する",
      summary: "1枚ずつじっくり書くよりも、講義中や復習中に気づいた内容をすぐ足したいときの最短導線です。",
      steps: [
        { title: "保存先デッキを選ぶ", text: "今の科目デッキを選ぶと、タグやテンプレもその文脈に寄ります。" },
        { title: "問題と答えだけ入れる", text: "画像やタグは必要なときだけ足せば十分です。空欄でもあとから編集できます。" },
        { title: "保存して次へを繰り返す", text: "入力欄を保ったまま連続で増やせるので、講義メモの整理が速くなります。" },
      ],
      actions: [
        { label: "一括入力へ", action: "create-mode", mode: "bulk" },
        { label: "詳細カードへ", action: "create-mode", mode: "card", kind: "ghost" },
      ],
    };
  }

  if (createMode === "bulk") {
    return {
      title: "貼り付けメモをまとめて候補化する",
      summary: "Q/A、箇条書き、番号付きメモを一気にカード候補へ変えるので、講義直後の整理時間を減らせます。",
      steps: [
        { title: "保存先を決める", text: "既存デッキへ追記するか、新しいデッキ名を入れてまとめて作るか選びます。" },
        { title: "メモをそのまま貼る", text: "Q: / A: 形式でも、箇条書きでも、番号付きでも大丈夫です。" },
        { title: "候補レビューで整える", text: "不要候補を外してから保存できるので、あとから見返しやすい形に整えられます。" },
      ],
      actions: [
        { label: "クイック追加へ", action: "create-mode", mode: "quick" },
        { label: "PDF取り込みへ", action: "create-mode", mode: "import", kind: "ghost" },
      ],
    };
  }

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
        { title: "共同編集ならクラウド共有", text: "Google / メールでログインすると、viewer / editor を分けて運用できます。" },
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
  const mediaCount = state.cards.reduce((sum, card) => sum + (card.frontMedia || []).length + (card.backMedia || []).length, 0);
  return `${state.decks.length}デッキ / ${state.cards.length}枚 / 画像${mediaCount}枚 / 学習履歴${state.reviewLog.length}件`;
}

function getLatestAutoBackupSnapshot() {
  return cloudState.backupSnapshots.find((snapshot) => snapshot.isLatest) || null;
}

function getMostRecentBackupSnapshot() {
  return [...cloudState.backupSnapshots].sort((left, right) => (right.createdAt || right.updatedAt) - (left.createdAt || left.updatedAt))[0] || null;
}

function getRestorePointSnapshots() {
  return cloudState.backupSnapshots.filter((snapshot) => !snapshot.isLatest).slice(0, BACKUP_RESTORE_POINT_LIMIT);
}

function getAccountBackupStatusCode() {
  if (!isCloudConfigured()) {
    return "unconfigured";
  }
  if (!isCloudSignedIn()) {
    return "signed-out";
  }
  if (cloudState.backupReadinessIssue?.blocking) {
    return "not-ready";
  }
  if (cloudState.backupBusy || cloudState.backupStatus === "syncing") {
    return "syncing";
  }
  if (cloudState.backupStatus === "error") {
    return "error";
  }
  if (cloudState.backupDirty) {
    return "dirty";
  }
  if (getMostRecentBackupSnapshot()) {
    return "synced";
  }
  return "dirty";
}

function formatAccountBackupStatusLabel() {
  const status = getAccountBackupStatusCode();
  if (status === "syncing") {
    return "保存中";
  }
  if (status === "not-ready") {
    return "バックアップ未準備";
  }
  if (status === "synced") {
    return "バックアップ済み";
  }
  if (status === "dirty") {
    return "未保存の変更あり";
  }
  if (status === "error") {
    return "保存失敗";
  }
  return "未設定";
}

function formatAccountBackupStatusClassName() {
  const status = getAccountBackupStatusCode();
  if (status === "synced") {
    return "success";
  }
  if (status === "dirty" || status === "syncing") {
    return "caution";
  }
  if (status === "not-ready" || status === "error") {
    return "danger";
  }
  return "";
}

function formatBackupDateTime(timestamp) {
  if (!timestamp) {
    return "まだありません";
  }
  return new Date(timestamp).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildBackupSummaryText(summary = {}) {
  return `${summary.deckCount || 0}デッキ / ${summary.cardCount || 0}枚 / 画像${summary.imageCount || 0}枚 / 履歴${summary.reviewLogCount || 0}件`;
}

function buildBackupSnapshotMarkup(snapshot) {
  const summary = snapshot.summary || {};
  const kindLabel =
    snapshot.kind === "auto" ? "最新の自動バックアップ" : snapshot.kind === "pre_restore" ? "復元前の安全退避" : "手動バックアップ";
  const pillClassName = snapshot.isLatest ? "success" : snapshot.kind === "pre_restore" ? "caution" : "";
  return `
    <article class="library-card backup-snapshot-card">
      <div class="card-row-header">
        <div>
          <h4>${escapeHtml(kindLabel)}</h4>
          <p class="muted">${escapeHtml(buildBackupSummaryText(summary))}</p>
        </div>
        <span class="meta-pill ${escapeHtml(pillClassName)}">${snapshot.isLatest ? "最新" : escapeHtml(snapshot.kind === "pre_restore" ? "退避" : "保存済み")}</span>
      </div>
      <p class="muted">
        保存日時: ${escapeHtml(formatBackupDateTime(snapshot.createdAt || snapshot.updatedAt))}
        ${snapshot.sourceDevice ? ` / 端末: ${escapeHtml(snapshot.sourceDevice)}` : ""}
      </p>
      <div class="button-row">
        <button class="ghost-button" data-restore-backup-id="${escapeHtml(snapshot.id)}" type="button">この端末に復元</button>
      </div>
    </article>
  `;
}

function renderHomeBackupPanel() {
  if (!homeBackupStatus || !homeBackupActions) {
    return;
  }

  const latestAuto = getLatestAutoBackupSnapshot();
  const latestSnapshot = latestAuto || getMostRecentBackupSnapshot();
  const statusLabel = formatAccountBackupStatusLabel();
  const canBackUpNow = isCloudConfigured() && isCloudSignedIn() && !cloudState.backupReadinessIssue?.blocking;
  const authDiagnostics = buildAuthDiagnosticItems();
  const primaryAuthIssue = authDiagnostics.find((item) => item.level === "danger") || authDiagnostics[0];
  const backupIssueText = cloudState.backupReadinessIssue?.text || cloudState.backupError;

  homeBackupStatus.textContent = !isCloudConfigured()
    ? primaryAuthIssue?.text || "Supabase を設定すると、ログイン後にこの端末のデッキ・カード・画像・履歴を自分のアカウントへ保存できます。"
    : !isCloudSignedIn()
      ? "Google / メールでアカウントを作ると、自動バックアップが有効になり、別端末でも最新の保存状態から復元できます。"
      : backupIssueText
        ? `${statusLabel}。${backupIssueText}`
      : latestSnapshot
        ? `${statusLabel}。最新は ${formatBackupDateTime(latestSnapshot.createdAt || latestSnapshot.updatedAt)} に ${buildBackupSummaryText(latestSnapshot.summary)} を保存しました。`
        : `${statusLabel}。まだクラウド保存はありません。必要なら今すぐバックアップできます。`;

  homeBackupActions.innerHTML = canBackUpNow
    ? `
        <button class="primary-button" data-trigger-backup-now="true" type="button" ${cloudState.backupBusy ? "disabled" : ""}>今すぐバックアップ</button>
        <button class="ghost-button" data-open-account-backup="true" type="button">復元ポイントを見る</button>
      `
    : isCloudConfigured() && isCloudSignedIn()
      ? `
        <button class="primary-button" data-open-account-backup="true" type="button">接続状態を開く</button>
      `
    : `
        <button class="primary-button" data-open-account-backup="true" type="button">アカウントを作成 / ログイン</button>
      `;
}

function renderSettingsAccountBackupPanel() {
  if (!settingsAccountBackupSummary) {
    return;
  }

  const hasClientConfig = isCloudConfigured();
  const isSignedIn = isCloudSignedIn();
  const googleEnabled = isOAuthProviderEnabled("google");
  const magicLinkEnabled = isMagicLinkEnabled();
  const latestAuto = getLatestAutoBackupSnapshot();
  const latestSnapshot = latestAuto || getMostRecentBackupSnapshot();
  const restorePoints = getRestorePointSnapshots();
  const statusLabel = formatAccountBackupStatusLabel();
  const statusClassName = formatAccountBackupStatusClassName();
  const authDiagnostics = buildAuthDiagnosticItems();
  const primaryAuthIssue = authDiagnostics.find((item) => item.level === "danger") || authDiagnostics[0];
  const loginStatusLabel = !hasClientConfig ? "ローカル専用" : isSignedIn ? "ログイン中" : "未ログイン";
  const loginStatusClassName = !hasClientConfig ? "caution" : isSignedIn ? "success" : "";
  const backupIssueText = cloudState.backupReadinessIssue?.text || cloudState.backupError;

  if (settingsAutoBackupCheckbox) {
    settingsAutoBackupCheckbox.checked = state.settings?.autoBackupEnabled !== false;
  }

  settingsAccountBackupSummary.textContent = !hasClientConfig
    ? "Supabase を設定すると、ログイン後にこの端末のデッキ・カード・画像・学習履歴・設定を自分のアカウントへ自動バックアップできます。"
    : isSignedIn
      ? "共有と同じアカウントで使えます。ローカル優先のまま、変更を自分のクラウドバックアップへ安全に保存します。"
      : "普段の学習はログイン不要です。バックアップを有効にしたいときだけ、ここからアカウントを作成またはログインできます。";

  settingsAccountBackupStatus.innerHTML = `
    <span class="meta-pill ${escapeHtml(loginStatusClassName)}">${escapeHtml(loginStatusLabel)}</span>
    <span class="meta-pill ${escapeHtml(statusClassName)}">${escapeHtml(statusLabel)}</span>
    <span>${escapeHtml(
      !hasClientConfig
        ? "現在はローカル専用です。"
        : isSignedIn
          ? `${cloudState.session.user.email || "ログイン中"} でログイン中です。`
          : "Google かメールのどちらかで続けると、そのままアカウントが作成されます。"
    )}</span>
    ${backupIssueText ? `<span class="muted">${escapeHtml(backupIssueText)}</span>` : ""}
  `;
  if (settingsAuthReadinessSummary) {
    settingsAuthReadinessSummary.textContent = primaryAuthIssue?.text
      || "Auth 接続とバックアップ保存先の準備状態をここで確認できます。";
  }
  if (settingsAuthReadinessList) {
    settingsAuthReadinessList.innerHTML = renderAuthDiagnosticMarkup(authDiagnostics);
  }

  settingsBackupLastSaved.textContent = backupIssueText
    ? backupIssueText
    : latestSnapshot
      ? `最後の保存: ${formatBackupDateTime(latestSnapshot.createdAt || latestSnapshot.updatedAt)} / ${buildBackupSummaryText(latestSnapshot.summary)}`
      : "まだクラウド保存はありません。初回バックアップを作ると、別端末から復元できるようになります。";

  toggleEmailAuthPanel(settingsEmailAuthPanel, settingsEmailAuthVisible && !isSignedIn && magicLinkEnabled);
  if (settingsSignInGoogleButton) {
    settingsSignInGoogleButton.hidden = !googleEnabled || isSignedIn;
    settingsSignInGoogleButton.disabled = !googleEnabled || isSignedIn;
  }
  if (settingsToggleEmailAuthButton) {
    settingsToggleEmailAuthButton.hidden = !magicLinkEnabled || isSignedIn;
    settingsToggleEmailAuthButton.disabled = !magicLinkEnabled || isSignedIn;
    settingsToggleEmailAuthButton.textContent = settingsEmailAuthVisible ? "メール入力を閉じる" : "メールで続ける";
  }
  if (settingsSendMagicLinkButton) {
    settingsSendMagicLinkButton.disabled = !magicLinkEnabled || !String(settingsAuthEmailInput?.value || authEmailInput?.value || "").trim();
  }
  if (settingsSignOutButton) {
    settingsSignOutButton.disabled = !isSignedIn;
  }
  if (settingsBackupNowButton) {
    settingsBackupNowButton.disabled = !hasClientConfig || !isSignedIn || cloudState.backupBusy || Boolean(cloudState.backupReadinessIssue?.blocking);
  }
  if (settingsRefreshBackupButton) {
    settingsRefreshBackupButton.disabled = !hasClientConfig;
  }
  if (settingsProfilePromptPanel) {
    const needsProfile = shouldPromptProfileCompletion();
    settingsProfilePromptPanel.hidden = !needsProfile;
    if (needsProfile && settingsProfileDisplayNameInput && !String(settingsProfileDisplayNameInput.value || "").trim()) {
      settingsProfileDisplayNameInput.value = String(cloudState.profile?.email || cloudState.session?.user?.email || "")
        .split("@")[0]
        .trim();
    }
    if (settingsProfilePromptStatus) {
      settingsProfilePromptStatus.textContent = needsProfile
        ? "Google から名前が十分に届かないことがあります。共同編集で見分けやすい表示名を保存できます。"
        : "";
    }
  }
  if (settingsSaveProfileButton) {
    settingsSaveProfileButton.disabled = !isSignedIn || !String(settingsProfileDisplayNameInput?.value || "").trim();
  }

  settingsBackupSnapshotList.innerHTML = latestAuto || restorePoints.length
    ? [latestAuto, ...restorePoints].filter(Boolean).map((snapshot) => buildBackupSnapshotMarkup(snapshot)).join("")
    : `
        <article class="library-card">
          <h4>復元ポイントはまだありません</h4>
          <p class="muted">ログインしてバックアップを作ると、ここからこの端末へ戻せます。</p>
        </article>
      `;
}

function renderSettingsPanel() {
  const sharedDeckCount = state.decks.filter((deck) => deck.storageMode === "shared").length;
  const localDeckCount = state.decks.length - sharedDeckCount;
  const latestDeck = [...state.decks].sort((left, right) => right.updatedAt - left.updatedAt)[0] || null;
  const latestSnapshot = getLatestAutoBackupSnapshot() || getMostRecentBackupSnapshot();

  settingsOverviewSummary.textContent =
    "アカウント保存、JSONバックアップ、ガイドの再表示、初期化のようなデータ保護まわりの項目をここへまとめています。初期化は必ず確認を挟む安全な導線にしています。";
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
      title: "アカウント保存の状態",
      text: latestSnapshot
        ? `${formatAccountBackupStatusLabel()}。最後の保存は ${formatBackupDateTime(latestSnapshot.createdAt || latestSnapshot.updatedAt)} です。`
        : `${formatAccountBackupStatusLabel()}。まだクラウド保存はありません。`,
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

  renderSettingsAccountBackupPanel();

  if (settingsQuickKeepDeckCheckbox) {
    settingsQuickKeepDeckCheckbox.checked = state.settings?.quickCapture?.keepDeckContext !== false;
  }
  if (settingsQuickKeepTemplateCheckbox) {
    settingsQuickKeepTemplateCheckbox.checked = state.settings?.quickCapture?.keepTemplate !== false;
  }
  if (settingsStudyDefaultMinutes) {
    settingsStudyDefaultMinutes.value = String(state.settings?.studyPreferences?.defaultSessionMinutes || 5);
  }
  if (settingsStudyDefaultSpeedMode) {
    settingsStudyDefaultSpeedMode.value = state.settings?.studyPreferences?.defaultSpeedMode || "recommended";
  }
  if (settingsStudyAutoRepeatCheckbox) {
    settingsStudyAutoRepeatCheckbox.checked = state.settings?.studyPreferences?.autoRepeatMistakes !== false;
  }
  if (settingsStudyAutoAdvanceCheckbox) {
    settingsStudyAutoAdvanceCheckbox.checked = state.settings?.studyPreferences?.autoAdvance !== false;
  }
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

function getRolePermissionPreset(role = "viewer") {
  const safeRole = ["owner", "editor", "viewer"].includes(String(role || "")) ? String(role) : "viewer";
  return clone(SHARE_ROLE_PERMISSION_PRESETS[safeRole] || SHARE_ROLE_PERMISSION_PRESETS.viewer);
}

function normalizePermissionMap(input = {}, role = "viewer") {
  const preset = getRolePermissionPreset(role);
  const source = input && typeof input === "object" ? input : {};
  return SHARE_PERMISSION_KEYS.reduce((collection, key) => {
    collection[key] = typeof source[key] === "boolean" ? source[key] : Boolean(preset[key]);
    return collection;
  }, {});
}

function getDeckPermissionMap(deck) {
  if (!deck) {
    return normalizePermissionMap({}, "viewer");
  }
  if (deck.storageMode !== "shared") {
    return normalizePermissionMap({}, "owner");
  }
  return normalizePermissionMap(deck.permissions, deck.role);
}

function getMemberPermissionMap(member) {
  if (!member) {
    return normalizePermissionMap({}, "viewer");
  }
  return normalizePermissionMap(member.permissions, member.role);
}

function hasDeckPermission(deck, permissionKey = "") {
  if (!deck) {
    return false;
  }
  if (deck.storageMode !== "shared") {
    return true;
  }
  return Boolean(getDeckPermissionMap(deck)[permissionKey]);
}

function hasMemberPermission(member, permissionKey = "") {
  return Boolean(getMemberPermissionMap(member)[permissionKey]);
}

function canEditDeckMeta(deck) {
  return hasDeckPermission(deck, "edit_deck_meta");
}

function canAddCardsToDeck(deck) {
  return hasDeckPermission(deck, "add_cards");
}

function canEditCardsInDeck(deck) {
  return hasDeckPermission(deck, "edit_cards");
}

function canDeleteCardsFromDeck(deck) {
  return hasDeckPermission(deck, "delete_cards");
}

function canUploadMediaForDeck(deck) {
  return hasDeckPermission(deck, "upload_media");
}

function canApproveDeckRequests(deck) {
  return hasDeckPermission(deck, "approve_requests");
}

function canManageMembers(deck) {
  return hasDeckPermission(deck, "manage_members");
}

function canRegenerateDeckShareLink(deck) {
  return hasDeckPermission(deck, "regenerate_share_link");
}

function canPublishDeckCopyLink(deck) {
  return hasDeckPermission(deck, "publish_copy_link");
}

function canEditDeckContent(deck) {
  return Boolean(
    canEditDeckMeta(deck) ||
      canAddCardsToDeck(deck) ||
      canEditCardsInDeck(deck) ||
      canDeleteCardsFromDeck(deck) ||
      canUploadMediaForDeck(deck),
  );
}

function canManageDeckShare(deck) {
  return Boolean(deck && deck.storageMode === "shared" && (canManageMembers(deck) || canApproveDeckRequests(deck) || canRegenerateDeckShareLink(deck)));
}

function getShareLockKey(targetType, targetId) {
  return `${targetType}:${targetId}`;
}

function getCloudLockState(deckId = "", targetType = "deck", targetId = "") {
  const key = getShareLockKey(targetType, targetId);
  const row = cloudState.editLocksByDeck[key];
  if (!row) {
    return null;
  }
  if (row.expiresAt && row.expiresAt <= Date.now()) {
    return null;
  }
  if (deckId && row.deckId && row.deckId !== deckId) {
    return null;
  }
  return row;
}

function isBlockedByOtherEditor(lockState) {
  return Boolean(lockState && !lockState.isCurrentUser && lockState.expiresAt > Date.now());
}

function formatPermissionLabel(permissionKey) {
  const labels = {
    edit_deck_meta: "デッキ情報",
    add_cards: "カード追加",
    edit_cards: "カード編集",
    delete_cards: "カード削除",
    upload_media: "画像追加",
    manage_members: "メンバー管理",
    approve_requests: "申請承認",
    regenerate_share_link: "共有リンク再発行",
    publish_copy_link: "コピーリンク発行",
  };
  return labels[permissionKey] || permissionKey;
}

function buildMemberPermissionSummary(member) {
  const permissionMap = getMemberPermissionMap(member);
  return SHARE_PERMISSION_KEYS.filter((key) => permissionMap[key]).map((key) => formatPermissionLabel(key));
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
  if (cloudState.joinMode === "copy") {
    clearCopyShareQuery();
  }
  cloudState.joinMode = "";
  cloudState.localSharePayload = null;
  cloudState.copySharePayload = null;
  cloudState.copyToken = "";
  setShareJoinRoleVisibility(false);
  requestShareAccessButton.textContent = "参加を申請する";
}

function getDeckShareMembers(deck) {
  if (!deck?.sharedDeckId) {
    return [];
  }
  return Array.isArray(cloudState.membersByDeck[deck.sharedDeckId]) ? cloudState.membersByDeck[deck.sharedDeckId] : [];
}

function getDeckShareEvents(deck) {
  if (!deck?.sharedDeckId) {
    return [];
  }
  return Array.isArray(cloudState.deckEventsByDeck[deck.sharedDeckId]) ? cloudState.deckEventsByDeck[deck.sharedDeckId] : [];
}

function getDeckNotifications(deck) {
  if (!deck?.sharedDeckId) {
    return cloudState.notifications.slice(0, SHARE_NOTIFICATION_LIMIT);
  }
  return cloudState.notifications.filter((notification) => notification.deckId === deck.sharedDeckId);
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

function renderShareRequestsMarkup(deck, canApprove) {
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
              ${canApprove ? "" : "disabled"}
            >
              閲覧で承認
            </button>
            <button
              class="ghost-button"
              data-approve-request="${request.id}"
              data-approved-role="editor"
              type="button"
              ${canApprove ? "" : "disabled"}
            >
              編集で承認
            </button>
            <button class="ghost-button danger-button" data-reject-request="${request.id}" type="button" ${canApprove ? "" : "disabled"}>拒否</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderMemberPermissionEditor(deck, member, canManage) {
  if (!canManage || member.role === "owner") {
    return "";
  }

  const permissionMap = getMemberPermissionMap(member);
  return `
    <div class="share-permission-editor">
      <p class="muted">詳細権限</p>
      <div class="share-permission-grid">
        ${SHARE_PERMISSION_KEYS.map(
          (permissionKey) => `
            <label class="share-permission-toggle">
              <input
                data-toggle-member-permission="${member.id}"
                data-deck-id="${deck.id}"
                data-permission-key="${permissionKey}"
                type="checkbox"
                ${permissionMap[permissionKey] ? "checked" : ""}
              />
              <span>${escapeHtml(formatPermissionLabel(permissionKey))}</span>
            </label>
          `,
        ).join("")}
      </div>
    </div>
  `;
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
      const permissionSummary = buildMemberPermissionSummary(member);
      return `
        <article class="library-card">
          <h4>${escapeHtml(formatShareMemberName(member))}</h4>
          <div class="card-row-meta">
            <span class="meta-pill">${escapeHtml(formatRoleLabel(member.role))}</span>
            ${member.isCurrentUser ? '<span class="meta-pill">この端末</span>' : ""}
            ${permissionSummary
              .slice(0, 4)
              .map((permission) => `<span class="meta-pill">${escapeHtml(permission)}</span>`)
              .join("")}
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
          ${renderMemberPermissionEditor(deck, member, canManage)}
        </article>
      `;
    })
    .join("");
}

function renderShareNotificationsMarkup(deck) {
  const notifications = getDeckNotifications(deck).slice(0, SHARE_NOTIFICATION_LIMIT);
  if (!notifications.length) {
    return `
      <article class="library-card">
        <h4>未読の共有通知はありません</h4>
        <p class="muted">承認待ち、権限変更、共有デッキの更新があるとここに表示されます。</p>
      </article>
    `;
  }

  return notifications
    .map(
      (notification) => `
        <article class="library-card ${notification.readAt ? "" : "is-unread-notification"}">
          <div class="card-row-header">
            <div>
              <h4>${escapeHtml(notification.title || "共有通知")}</h4>
              <p class="muted">${escapeHtml(notification.body || "")}</p>
            </div>
            ${notification.readAt ? '<span class="meta-pill">既読</span>' : '<span class="meta-pill">未読</span>'}
          </div>
          <div class="card-row-meta">
            ${notification.deckName ? `<span class="meta-pill">${escapeHtml(notification.deckName)}</span>` : ""}
            <span class="meta-pill">${escapeHtml(formatMessageTime(notification.createdAt))}</span>
          </div>
          ${
            notification.readAt
              ? ""
              : `
                <div class="button-row">
                  <button class="ghost-button" data-mark-notification-read="${notification.id}" type="button">既読にする</button>
                </div>
              `
          }
        </article>
      `,
    )
    .join("");
}

function renderShareEventsMarkup(deck) {
  const events = getDeckShareEvents(deck).slice(0, SHARE_EVENT_LIMIT);
  if (!events.length) {
    return `
      <article class="library-card">
        <h4>共有履歴はまだありません</h4>
        <p class="muted">カード追加やロール変更などの共有操作があると、ここへ時系列で残ります。</p>
      </article>
    `;
  }

  return events
    .map(
      (event) => `
        <article class="library-card">
          <h4>${escapeHtml(event.summary || "共有更新")}</h4>
          <p class="muted">${escapeHtml(event.actorEmail || "共有メンバー")} / ${escapeHtml(formatMessageTime(event.createdAt))}</p>
          <div class="card-row-meta">
            ${event.eventLabel ? `<span class="meta-pill">${escapeHtml(event.eventLabel)}</span>` : ""}
            ${event.entityLabel ? `<span class="meta-pill">${escapeHtml(event.entityLabel)}</span>` : ""}
          </div>
        </article>
      `,
    )
    .join("");
}

function getCurrentShareUrl(deck) {
  if (!deck) {
    return "";
  }
  if (deck.storageMode === "shared" && deck.shareToken) {
    return buildShareUrl(deck.shareToken);
  }
  if (!canUseLocalShare(deck)) {
    return "";
  }
  if (cloudState.lastLocalShareDeckId === deck.id) {
    return shareLinkCache;
  }
  return "";
}

function renderShareGuidePanel(deck) {
  const hasClientConfig = Boolean(cloudState.config?.supabaseUrl && cloudState.config?.supabaseAnonKey);
  const isSignedIn = Boolean(cloudState.session?.user);
  const supportsLocalShare = deck ? canUseLocalShare(deck) : false;
  const currentStateText = !deck
    ? "まだ対象デッキがないので、まずはデッキ作成かスターター追加から始めるのがおすすめです。"
    : deck.storageMode === "shared"
      ? `今選んでいる「${deck.name}」は共同編集モードです。${canManageDeckShare(deck) ? "owner としてメンバー管理まで行えます。" : "あなたの学習進捗は個別に保持されます。"}`
      : !supportsLocalShare
        ? `今選んでいる「${deck.name}」には画像付きカードがあります。共有するときは Supabase 共有か JSON バックアップを使うのが安全です。`
      : hasClientConfig
        ? isSignedIn
          ? `今選んでいる「${deck.name}」はローカルデッキです。共有リンクを作ると、複製共有か共同編集に進めます。`
          : `今選んでいる「${deck.name}」はローカルデッキです。まずは複製共有を使い、共同編集したい時だけログインすると迷いにくいです。`
        : `今選んでいる「${deck.name}」はローカルデッキです。現状でも複製共有は使えます。共同編集が必要になった時だけ Supabase を足せば十分です。`;

  shareGuideSummary.textContent = currentStateText;
  shareGuideList.innerHTML = `
    <article class="library-card">
      <h4>1. まずはローカル複製で共有</h4>
      <p class="muted">${
        supportsLocalShare
          ? "ログイン不要です。相手はリンクを開いて、自分の端末にローカルデッキとして追加できます。"
          : "画像付きデッキでは通常のURL複製ではなく、コピー専用リンクか Supabase 共有を使うと安全です。"
      }</p>
    </article>
    <article class="library-card">
      <h4>2. 共同編集が必要ならクラウド共有</h4>
      <p class="muted">${
        hasClientConfig
          ? "Google / メールでログインすると、owner 承認制の editor / viewer 共有が使えます。"
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
  const magicLinkEnabled = isMagicLinkEnabled();
  const supportsLocalShare = deck ? canUseLocalShare(deck) : false;
  const authDiagnostics = buildAuthDiagnosticItems();
  const primaryAuthIssue = authDiagnostics.find((item) => item.level === "danger") || authDiagnostics[0];

  renderShareGuidePanel(deck);

  authStatus.textContent = !hasClientConfig
    ? primaryAuthIssue?.text || "Supabase 未設定ならローカル専用のまま使えます。共有やアカウント保存を使う時だけ接続してください。"
    : isSignedIn
      ? `${cloudState.session.user.email || "ログイン中"} で共有機能を使えます。Google / メールのログイン状態は設定の「アカウント保存」から管理できます。`
      : "共有機能を使う時だけログインします。Google / メールは設定の「アカウント保存」から選べます。";
  if (shareOpenAccountBackupButton) {
    shareOpenAccountBackupButton.disabled = false;
    shareOpenAccountBackupButton.textContent = isSignedIn ? "設定で確認する" : "設定でログイン";
  }
  if (shareToggleEmailAuthButton) {
    shareToggleEmailAuthButton.hidden = !magicLinkEnabled || isSignedIn;
    shareToggleEmailAuthButton.disabled = !magicLinkEnabled || isSignedIn;
    shareToggleEmailAuthButton.textContent = shareEmailAuthVisible ? "メール入力を閉じる" : "メールで続ける";
  }
  toggleEmailAuthPanel(shareEmailAuthPanel, shareEmailAuthVisible && !isSignedIn && magicLinkEnabled);
  if (shareAuthReadinessList) {
    shareAuthReadinessList.innerHTML = renderAuthDiagnosticMarkup(authDiagnostics.slice(0, 2));
  }
  if (signOutButton) {
    signOutButton.disabled = !isSignedIn;
  }
  if (signInMagicLinkButton) {
    signInMagicLinkButton.disabled = !magicLinkEnabled || !String(authEmailInput?.value || "").trim();
  }
  refreshCloudButton.disabled = !hasClientConfig;

  if (!deck) {
    shareDeckButton.disabled = true;
    copyShareLinkButton.disabled = true;
    copyPackageLinkButton.disabled = true;
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
    shareNotificationStatus.textContent = "共有通知はここに表示されます。";
    shareNotificationList.innerHTML = renderShareNotificationsMarkup(null);
    shareEventStatus.textContent = "共有デッキを選ぶと、更新履歴がここに表示されます。";
    shareEventList.innerHTML = renderShareEventsMarkup(null);
    markAllNotificationsReadButton.disabled = true;
    return;
  }

  const shareUrl = getCurrentShareUrl(deck);
  const canEdit = canEditDeckContent(deck);
  const canManage = canManageMembers(deck);
  const canApprove = canApproveDeckRequests(deck);
  const canRegenerate = canRegenerateDeckShareLink(deck);
  const canPublishCopy = canPublishDeckCopyLink(deck);
  const deckNotifications = getDeckNotifications(deck);
  const unreadNotifications = deckNotifications.filter((notification) => !notification.readAt).length;
  const deckEvents = getDeckShareEvents(deck);

  shareDeckButton.disabled = !canEdit || (deck.storageMode !== "shared" && (!supportsLocalShare && !(hasClientConfig && isSignedIn)));
  copyShareLinkButton.disabled = !shareUrl;
  copyPackageLinkButton.disabled = !hasClientConfig || !isSignedIn || (!canPublishCopy && !(deck.storageMode === "shared" && deck.role === "owner"));
  syncSharedDeckButton.disabled = !hasClientConfig || !isSignedIn || deck.storageMode !== "shared";
  duplicateSharedDeckButton.disabled = false;
  refreshShareLinkButton.disabled = !canRegenerate;
  leaveSharedDeckButton.hidden = deck.storageMode !== "shared";
  leaveSharedDeckButton.disabled = deck.storageMode !== "shared" || !isSignedIn;
  leaveSharedDeckButton.textContent = deck.role === "owner" ? "共有をやめる" : "共有から抜ける";

  shareStatus.textContent =
    deck.storageMode === "shared"
      ? `このデッキは共有中です。権限: ${formatRoleLabel(deck.role)} / 状態: ${formatSyncState(deck.syncState)}${
          shareUrl ? ` / リンク: ${shareUrl}` : ""
        }`
      : !supportsLocalShare && !(hasClientConfig && isSignedIn)
        ? "このデッキには画像付きカードがあります。通常の複製リンクではなく、画像込みコピーリンクか Supabase 共有を使ってください。"
      : !supportsLocalShare && hasClientConfig && isSignedIn
        ? "このデッキには画像付きカードがあるため、共有するときは Supabase 共有か画像込みコピーリンクを使います。"
        : hasClientConfig
          ? shareUrl
            ? `このローカルデッキの複製用リンクを作成済みです。共同編集にしたい場合はログイン後にもう一度「共有リンクを作る」を押してください。 / リンク: ${shareUrl}`
            : "まだローカルデッキです。今は複製用の共有リンクを作れます。共同編集にしたい場合は Supabase にログインするとクラウド共有へ切り替わります。"
          : shareUrl
            ? `このローカルデッキの複製用リンクを作成済みです。 / リンク: ${shareUrl}`
            : "Supabase 未設定でも、まずは複製用の共有リンクを作れます。共同編集を使いたい時だけ Supabase を接続してください。";

  shareRequestList.innerHTML = renderShareRequestsMarkup(deck, canApprove);
  shareMemberList.innerHTML =
    deck.storageMode === "shared"
      ? renderShareMembersMarkup(deck, canManage)
      : `
          <article class="library-card">
            <h4>共有後のメンバー管理</h4>
            <p class="muted">クラウド共有を有効にすると、ここで editor / viewer の切り替えやメンバー管理ができます。</p>
          </article>
        `;
  shareNotificationStatus.textContent = unreadNotifications
    ? `未読 ${unreadNotifications} 件の共有通知があります。`
    : "未読の共有通知はありません。";
  shareNotificationList.innerHTML = renderShareNotificationsMarkup(deck);
  markAllNotificationsReadButton.disabled = !deckNotifications.some((notification) => !notification.readAt);
  shareEventStatus.textContent = deckEvents.length
    ? `${Math.min(deckEvents.length, SHARE_EVENT_LIMIT)}件の共有履歴を表示しています。`
    : "共有デッキの更新履歴はまだありません。";
  shareEventList.innerHTML = renderShareEventsMarkup(deck);
}

function syncDeckForm() {
  const deck = getDeckById(editingDeckId);
  const defaults = getDeckDefaults(deck || { focus: deck?.focus || deckFocusInput.value || "medical" });
  deckFormTitle.textContent = deck ? "デッキを編集" : "デッキを作る";
  deckSubmitButton.textContent = deck ? "デッキを更新" : "デッキを追加";
  cancelDeckEditButton.hidden = !deck;
  deckIdInput.value = deck?.id || "";
  deckNameInput.value = deck?.name || "";
  deckFocusInput.value = deck?.focus || "medical";
  deckSubjectInput.value = deck?.subject || "";
  deckDescriptionInput.value = deck?.description || "";
  if (deckDefaultTopicInput) {
    deckDefaultTopicInput.value = defaults.defaultTopic || "";
  }
  if (deckDefaultTagsInput) {
    deckDefaultTagsInput.value = defaults.defaultTags || "";
  }
  if (deckFrontTemplateInput) {
    deckFrontTemplateInput.value = defaults.frontPromptTemplate || "";
  }
  if (deckBackTemplateInput) {
    deckBackTemplateInput.value = defaults.backPromptTemplate || "";
  }
  if (deckPreferredCardStyleInput) {
    deckPreferredCardStyleInput.value = defaults.preferredCardStyle || "balanced";
  }
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
  cardMediaDraft = {
    front: normalizeCardMediaList(card?.frontMedia || []),
    back: normalizeCardMediaList(card?.backMedia || []),
  };

  if (card && optionExists(cardDeckId, card.deckId)) {
    cardDeckId.value = card.deckId;
  }

  applyCardContextPlaceholders();
}

function applyEditDeckFocusPreset() {
  const focus = normalizeDeckFocus(editDeckFocusInput.value);

  if (focus === "medical") {
    editDeckSubjectInput.placeholder = "解剖 / 生理 / 病理 / 薬理 / 内科";
    editDeckDescriptionInput.placeholder = "例: 症候から病態を引けるようにする復習デッキ";
    if (editDeckDefaultTopicInput) editDeckDefaultTopicInput.placeholder = "解剖 / 病理 / 鑑別 / 症候";
    if (editDeckDefaultTagsInput) editDeckDefaultTagsInput.placeholder = "医学, 循環, 腎, 必修";
    if (editDeckFrontTemplateInput) editDeckFrontTemplateInput.placeholder = "例: ○○とは？ / 画像の部位名は？";
    if (editDeckBackTemplateInput) editDeckBackTemplateInput.placeholder = "例: 定義を短く / 鑑別の要点を一言で";
    return;
  }

  if (focus === "english") {
    editDeckSubjectInput.placeholder = "医学英語 / 語彙 / 読解 / リスニング";
    editDeckDescriptionInput.placeholder = "例: 医学英語と長文読解を分けて反復する";
    if (editDeckDefaultTopicInput) editDeckDefaultTopicInput.placeholder = "語彙 / 読解 / 医学英語";
    if (editDeckDefaultTagsInput) editDeckDefaultTagsInput.placeholder = "english, vocabulary, medical english";
    if (editDeckFrontTemplateInput) editDeckFrontTemplateInput.placeholder = "例: 単語・表現 / この文の要点は？";
    if (editDeckBackTemplateInput) editDeckBackTemplateInput.placeholder = "例: 意味と使い方 / 要点を短く";
    return;
  }

  editDeckSubjectInput.placeholder = "テーマ / 分野";
  editDeckDescriptionInput.placeholder = "用途やテーマを短く書く";
  if (editDeckDefaultTopicInput) editDeckDefaultTopicInput.placeholder = "テーマ";
  if (editDeckDefaultTagsInput) editDeckDefaultTagsInput.placeholder = "タグをカンマ区切りで入力";
  if (editDeckFrontTemplateInput) editDeckFrontTemplateInput.placeholder = "例: ○○とは？";
  if (editDeckBackTemplateInput) editDeckBackTemplateInput.placeholder = "例: 要点を短く";
}

function applyEditCardContextPlaceholders(focus) {
  if (focus === "medical") {
    editCardHintInput.placeholder = "病態の流れや鑑別のヒント";
    editCardTopicInput.placeholder = "解剖 / 生理 / 病理 / 薬理 / 症候";
    editCardTagsInput.placeholder = "循環, 腎, 呼吸, 必修";
    editCardNoteInput.placeholder = "臨床ポイント、鑑別、関連知識を残す";
    editCardExampleInput.placeholder = "症例ベースの覚え方や所見のつなぎ方";
  } else if (focus === "english") {
    editCardHintInput.placeholder = "語源、言い換え、読み方のヒント";
    editCardTopicInput.placeholder = "医学英語 / 語彙 / 読解 / 構文";
    editCardTagsInput.placeholder = "vocabulary, reading, phrase, medical english";
    editCardNoteInput.placeholder = "語法メモ、似た表現、論文での使い分け";
    editCardExampleInput.placeholder = "例文や英文のまま覚えたいフレーズ";
  } else {
    editCardHintInput.placeholder = "例文や覚え方のヒント";
    editCardTopicInput.placeholder = "テーマ";
    editCardTagsInput.placeholder = "タグをカンマ区切りで入力";
    editCardNoteInput.placeholder = "重要な関連知識や使い分けを記録";
    editCardExampleInput.placeholder = "例文や症例ベースの覚え方";
  }
}

function getEditableDecks() {
  return sortDashboardDecks(state.decks.filter((deck) => canEditDeckContent(deck)));
}

function getSelectedEditDeck() {
  const editableDecks = getEditableDecks();
  if (!editableDecks.length) {
    selectedEditDeckId = "";
    editWorkspaceCardId = "";
    return null;
  }

  if (!editableDecks.some((deck) => deck.id === selectedEditDeckId)) {
    selectedEditDeckId = editableDecks[0].id;
    editWorkspaceCardId = "";
  }

  return getDeckById(selectedEditDeckId) || editableDecks[0];
}

function buildEditCardSearchText(card) {
  const deck = getDeckById(card.deckId);
  return [
    card.front,
    card.back,
    card.topic,
    card.hint,
    card.note,
    card.example,
    ...(card.frontMedia || []).map((media) => media.name || ""),
    ...(card.backMedia || []).map((media) => media.name || ""),
    (card.tags || []).join(" "),
    deck?.name || "",
    deck?.subject || "",
  ]
    .join(" ")
    .toLowerCase();
}

function clearEditWorkspaceCardEditing({ silent = false } = {}) {
  editWorkspaceCardId = "";
  resetMediaDraft("edit");
  if (!silent) {
    renderEditWorkspace();
    syncEditWorkspaceLocks().catch((error) => {
      console.warn("Failed to sync edit locks:", error);
    });
  }
}

function focusEditCardForm() {
  window.requestAnimationFrame(() => {
    editCardFrontInput.focus();
  });
}

function renderEditWorkspace() {
  if (!editDeckSelect) {
    return;
  }

  const editableDecks = getEditableDecks();
  editDeckSelect.innerHTML = editableDecks.length
    ? editableDecks
        .map((deck) => `<option value="${deck.id}">${escapeHtml(deck.subject ? `${deck.subject} / ${deck.name}` : deck.name)}</option>`)
        .join("")
    : '<option value="">編集できるデッキがありません</option>';
  editDeckSelect.disabled = !editableDecks.length;

  const deck = getSelectedEditDeck();
  if (deck && optionExists(editDeckSelect, deck.id)) {
    editDeckSelect.value = deck.id;
  }

  editSubviewButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.editSubview === editSubview);
    button.disabled = !deck;
  });

  if (!deck) {
    editWorkspaceTitle.textContent = "デッキを編集する";
    editWorkspaceStatus.textContent = "ローカルデッキか、owner / editor 権限の共有デッキを選ぶと編集できます。";
    editWorkspaceSummary.innerHTML = "";
    editWorkspaceEmpty.hidden = false;
    editDeckSubview.hidden = true;
    editCardsSubview.hidden = true;
    editDeckForm.reset();
    editCardForm.reset();
    resetMediaDraft("edit");
    deleteEditDeckButton.disabled = true;
    editCardCreateButton.disabled = true;
    cancelEditWorkspaceCardButton.hidden = true;
    editCardSubmitButton.textContent = "カードを保存";
    return;
  }

  const deckCards = state.cards
    .filter((card) => card.deckId === deck.id)
    .slice()
    .sort((left, right) => right.updatedAt - left.updatedAt);
  const canManageShare = canManageDeckShare(deck);
  const deckLockState =
    deck.storageMode === "shared" ? getCloudLockState(deck.sharedDeckId, "deck", deck.sharedDeckId) : null;
  const deckLockedByOther = editSubview === "deck" && isBlockedByOtherEditor(deckLockState);

  editWorkspaceTitle.textContent = `「${deck.name}」を編集`;
  editWorkspaceStatus.textContent =
    deck.storageMode === "shared"
      ? canManageShare
        ? "共同編集デッキの内容、カード一覧、共有前の整備をこの画面でまとめて行えます。"
        : "共有デッキの内容を更新できます。メンバー管理は owner のみが共有画面から行えます。"
      : "名前変更、説明更新、カード編集、削除をこの画面でまとめて行えます。";
  if (deckLockedByOther) {
    editWorkspaceStatus.textContent += ` いまは ${deckLockState.holderEmail || "他のメンバー"} がデッキ情報を編集中です。ロック解除後に更新できます。`;
  }
  editWorkspaceSummary.innerHTML = [
    { label: "デッキ名", value: deck.name },
    { label: "分野", value: deck.subject || "未設定" },
    { label: "カード枚数", value: `${deckCards.length}枚` },
    {
      label: "保存先",
      value: `${formatStorageMode(deck.storageMode)}${deck.storageMode === "shared" ? ` / ${formatRoleLabel(deck.role)}` : ""}`,
    },
  ]
    .map(
      (item) => `
        <article class="stat-card edit-summary-card">
          <p class="eyebrow">${escapeHtml(item.label)}</p>
          <strong>${escapeHtml(item.value)}</strong>
        </article>
      `,
    )
    .join("");

  editWorkspaceEmpty.hidden = true;
  editDeckSubview.hidden = editSubview !== "deck";
  editCardsSubview.hidden = editSubview !== "cards";

  editDeckIdInput.value = deck.id;
  editDeckNameInput.value = deck.name;
  editDeckFocusInput.value = deck.focus || "medical";
  editDeckSubjectInput.value = deck.subject || "";
  editDeckDescriptionInput.value = deck.description || "";
  if (editDeckDefaultTopicInput) {
    editDeckDefaultTopicInput.value = deck.defaults?.defaultTopic || "";
  }
  if (editDeckDefaultTagsInput) {
    editDeckDefaultTagsInput.value = deck.defaults?.defaultTags || "";
  }
  if (editDeckFrontTemplateInput) {
    editDeckFrontTemplateInput.value = deck.defaults?.frontPromptTemplate || "";
  }
  if (editDeckBackTemplateInput) {
    editDeckBackTemplateInput.value = deck.defaults?.backPromptTemplate || "";
  }
  if (editDeckPreferredCardStyleInput) {
    editDeckPreferredCardStyleInput.value = deck.defaults?.preferredCardStyle || "balanced";
  }
  const canSubmitDeckChanges = canEditDeckMeta(deck) && !deckLockedByOther;
  editDeckNameInput.disabled = !canSubmitDeckChanges;
  editDeckFocusInput.disabled = !canSubmitDeckChanges;
  editDeckSubjectInput.disabled = !canSubmitDeckChanges;
  editDeckDescriptionInput.disabled = !canSubmitDeckChanges;
  if (editDeckDefaultTopicInput) {
    editDeckDefaultTopicInput.disabled = !canSubmitDeckChanges;
  }
  if (editDeckDefaultTagsInput) {
    editDeckDefaultTagsInput.disabled = !canSubmitDeckChanges;
  }
  if (editDeckFrontTemplateInput) {
    editDeckFrontTemplateInput.disabled = !canSubmitDeckChanges;
  }
  if (editDeckBackTemplateInput) {
    editDeckBackTemplateInput.disabled = !canSubmitDeckChanges;
  }
  if (editDeckPreferredCardStyleInput) {
    editDeckPreferredCardStyleInput.disabled = !canSubmitDeckChanges;
  }
  editDeckSubmitButton.disabled = !canSubmitDeckChanges;
  resetEditDeckButton.disabled = !canSubmitDeckChanges;
  deleteEditDeckButton.disabled = deck.storageMode === "shared";
  applyEditDeckFocusPreset();

  const safeQuery = String(editCardQuery || "").trim().toLowerCase();
  const filteredCards = safeQuery
    ? deckCards.filter((card) => buildEditCardSearchText(card).includes(safeQuery))
    : deckCards;
  const editingCard = editWorkspaceCardId ? getCardById(editWorkspaceCardId) : null;
  const validEditingCard = editingCard?.deckId === deck.id ? editingCard : null;
  if (editWorkspaceCardId && !validEditingCard) {
    editWorkspaceCardId = "";
  }
  const cardLockTarget = validEditingCard ? validEditingCard.sharedCardId || validEditingCard.id : "";
  const cardLockState =
    deck.storageMode === "shared" && cardLockTarget ? getCloudLockState(deck.sharedDeckId, "card", cardLockTarget) : null;
  const cardLockedByOther = Boolean(validEditingCard && isBlockedByOtherEditor(cardLockState));

  editCardsTitle.textContent = `「${deck.name}」のカードを探して編集する`;
  editCardSearchInput.value = editCardQuery;
  editCardEditorTitle.textContent = validEditingCard ? `「${formatCardFrontLabel(validEditingCard)}」を編集中` : "このデッキにカードを追加";
  editCardEditorStatus.textContent = validEditingCard
    ? "保存すると一覧へ反映されます。不要なら「編集をやめる」で追加モードに戻れます。"
    : "必要なカードを手入力で追加したり、一覧から選んで同じ場所で修正できます。";
  if (cardLockedByOther) {
    editCardEditorStatus.textContent = `${cardLockState.holderEmail || "他のメンバー"} がこのカードを編集中です。ロック解除後に更新できます。`;
  }
  editCardIdInput.value = validEditingCard?.id || "";
  editCardFrontInput.value = validEditingCard?.front || "";
  editCardBackInput.value = validEditingCard?.back || "";
  editCardHintInput.value = validEditingCard?.hint || "";
  editCardTopicInput.value = validEditingCard?.topic || "";
  editCardTagsInput.value = Array.isArray(validEditingCard?.tags) ? validEditingCard.tags.join(", ") : "";
  editCardNoteInput.value = validEditingCard?.note || "";
  editCardExampleInput.value = validEditingCard?.example || "";
  editCardMediaDraft = {
    front: normalizeCardMediaList(validEditingCard?.frontMedia || []),
    back: normalizeCardMediaList(validEditingCard?.backMedia || []),
  };
  const canCreateCard = canAddCardsToDeck(deck);
  const canUpdateCard = validEditingCard ? canEditCardsInDeck(deck) && !cardLockedByOther : canCreateCard;
  const canEditMedia = canUploadMediaForDeck(deck);
  editCardCreateButton.disabled = !canCreateCard;
  if (editCardQuickAddButton) {
    editCardQuickAddButton.disabled = !canCreateCard;
  }
  editCardFrontInput.disabled = !canUpdateCard;
  editCardBackInput.disabled = !canUpdateCard;
  editCardHintInput.disabled = !canUpdateCard;
  editCardTopicInput.disabled = !canUpdateCard;
  editCardTagsInput.disabled = !canUpdateCard;
  editCardNoteInput.disabled = !canUpdateCard;
  editCardExampleInput.disabled = !canUpdateCard;
  editCardFrontMediaInput.disabled = !canUpdateCard || !canEditMedia;
  editCardBackMediaInput.disabled = !canUpdateCard || !canEditMedia;
  editCardSubmitButton.disabled = !canUpdateCard;
  editCardSubmitButton.textContent = validEditingCard ? "カードを更新" : "カードを保存";
  cancelEditWorkspaceCardButton.hidden = !validEditingCard;
  applyEditCardContextPlaceholders(deck.focus);
  if (!validEditingCard) {
    applyDeckDefaultsToCardFields(
      deck,
      {
        frontInput: editCardFrontInput,
        backInput: editCardBackInput,
        topicInput: editCardTopicInput,
        tagsInput: editCardTagsInput,
      },
      { force: false },
    );
  }

  editCardList.innerHTML = filteredCards.length
    ? filteredCards
        .map(
          (card) => {
            const rowLockState =
              deck.storageMode === "shared"
                ? getCloudLockState(deck.sharedDeckId, "card", card.sharedCardId || card.id)
                : null;
            const rowLockedByOther = isBlockedByOtherEditor(rowLockState);
            return `
            <article class="library-card edit-card-row ${rowLockedByOther ? "is-locking-card" : ""}">
              <div class="card-row-header">
                <div>
                  <h4>${escapeHtml(formatCardFrontLabel(card))}</h4>
                  <p class="muted">${escapeHtml(formatCardBackLabel(card))}</p>
                </div>
                <div class="button-row">
                  <button class="ghost-button" data-edit-workspace-card="${card.id}" type="button" ${
                    canEditCardsInDeck(deck) && !rowLockedByOther ? "" : "disabled"
                  }>編集</button>
                  <button class="ghost-button danger-button" data-delete-edit-workspace-card="${card.id}" type="button" ${
                    canDeleteCardsFromDeck(deck) && !rowLockedByOther ? "" : "disabled"
                  }>削除</button>
                </div>
              </div>
              <div class="card-row-meta">
                ${card.topic ? `<span class="meta-pill">${escapeHtml(card.topic)}</span>` : ""}
                ${hasCardMedia(card) ? `<span class="meta-pill">画像 ${(card.frontMedia || []).length + (card.backMedia || []).length}枚</span>` : ""}
                <span class="meta-pill">${escapeHtml(formatStudyMode(card.study))}</span>
                ${rowLockedByOther ? `<span class="meta-pill">編集中: ${escapeHtml(rowLockState.holderEmail || "他のメンバー")}</span>` : ""}
                ${(card.tags || []).slice(0, 4).map((tag) => `<span class="meta-pill">${escapeHtml(tag)}</span>`).join("")}
              </div>
            </article>
          `;
          },
        )
        .join("")
    : `
        <article class="library-card">
          <h4>${deckCards.length ? "条件に合うカードがありません" : "このデッキにはカードがありません"}</h4>
          <p class="muted">${
            deckCards.length
              ? "問題、答え、テーマ、タグを短く変えて探すと見つけやすいです。"
              : "上のフォームから最初のカードを追加できます。"
          }</p>
        </article>
      `;
}

function renderImportPanel() {
  applyImportFocusPreset();
  clearImportDraftButton.hidden = !importDraft;
  saveImportButton.hidden = !importDraft;
  saveImportButton.disabled = !importDraft || isImportLoading;
  clearImportDraftButton.disabled = isImportLoading;
  selectAllImportButton.disabled = !importDraft || isImportLoading;
  clearImportSelectionButton.disabled = !importDraft || isImportLoading;
  removeSelectedImportButton.disabled = !importDraft || isImportLoading;
  dedupeImportButton.disabled = !importDraft || isImportLoading;
  applyImportTagsButton.disabled = !importDraft || isImportLoading;
  importFileInput.disabled = isImportLoading;
  importTextInput.disabled = isImportLoading;
  importFocusInput.disabled = isImportLoading;
  importDeckNameInput.disabled = isImportLoading;
  importSubjectInput.disabled = isImportLoading;
  importInstructionsInput.disabled = isImportLoading;
  importLimitInput.disabled = isImportLoading;
  analyzeImportButton.disabled = isImportLoading;
  analyzeImportAiButton.disabled = isImportLoading;
  analyzeImportButton.textContent = isImportLoading ? "分析中..." : "資料を分析する";
  analyzeImportAiButton.textContent = isImportLoading ? "AIで分析中..." : "AIで高精度生成";

  if (!importDraft) {
    const contextDeck = getDeckById(importContextDeckId);
    if (!isImportLoading) {
      importStatus.textContent = contextDeck
        ? `「${contextDeck.name}」へ追加する資料を選ぶと、自動でカード候補を作成します。AIボタンを押すと、Geminiの無料枠で高精度生成を試し、失敗時はローカル解析へ戻ります。`
        : "PDF または本文を入れると、自動でカード候補を作成します。どのデッキにも保存前レビューでき、AIボタンを押すと Gemini の無料枠で高精度生成を試し、失敗時はローカル解析へ戻ります。";
    }
    saveImportButton.textContent = "この候補でデッキ作成";
    importPreview.innerHTML = `
      <article class="library-card">
        <h4>まだ自動生成の候補はありません</h4>
        <p class="muted">${
          contextDeck
            ? `講義PDF、英語の資料、配布ノートを読み込むと、「${escapeHtml(contextDeck.name)}」へ追加する候補がここに並びます。`
            : "講義PDF、英語の資料、配布ノートを読み込むとここに候補が並びます。あとから保存先デッキを選べます。"
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
              <h4>${index + 1}. ${escapeHtml(formatCardFrontLabel(card))}</h4>
              <p class="muted">${escapeHtml(formatCardBackLabel(card))}</p>
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
            ${card.confidence ? `<span class="meta-pill">${escapeHtml(formatAiConfidence(card.confidence))}</span>` : ""}
            ${(card.tags || []).slice(0, 4).map((tag) => `<span class="meta-pill">${escapeHtml(tag)}</span>`).join("")}
          </div>
          ${card.evidenceSnippet ? `<p class="flashcard-note">${escapeHtml(card.evidenceSnippet)}</p>` : ""}
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
  clearQuestionMapButton.disabled = isQuestionMapLoading;
  analyzeQuestionMapButton.disabled = isQuestionMapLoading;
  analyzeQuestionMapAiButton.disabled = isQuestionMapLoading;
  questionMapQuestionFileInput.disabled = isQuestionMapLoading;
  questionMapQuestionTextInput.disabled = isQuestionMapLoading;
  questionMapSlideFileInput.disabled = isQuestionMapLoading;
  questionMapSlideTextInput.disabled = isQuestionMapLoading;
  questionMapTopMatchesInput.disabled = isQuestionMapLoading;
  analyzeQuestionMapButton.textContent = isQuestionMapLoading ? "解析中..." : "問題とスライドを対応づける";
  analyzeQuestionMapAiButton.textContent = isQuestionMapLoading ? "AIで補強中..." : "AIで高精度補強";

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
        ? `「${contextDeck.name}」向けに、過去問と講義スライドを入れると設問ごとの関連候補を表示します。AIボタンを使うと根拠説明も補強できます。`
        : "過去問と講義スライドを入れると、設問ごとに関連スライド候補、ページ番号、該当箇所の抜粋を表示します。どのデッキにも紐づけず先に参照候補を確認でき、AIボタンを使うと根拠説明も補強できます。";
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
            <p class="muted">${
              contextDeck
                ? `過去問 PDF と講義スライド PDF を入れて解析すると、「${escapeHtml(contextDeck.name)}」向けの設問参照候補がここに並びます。`
                : "過去問 PDF と講義スライド PDF を入れて解析すると、ここに設問ごとの参照候補が並びます。"
            }</p>
          </article>
        `;
    return;
  }

  questionMapErrorMessage = "";
  questionMapStatus.textContent = `${questionMapDraft.questionSourceName} と ${questionMapDraft.slideSourceLabel} から、${questionMapDraft.questions.length} 問の対応候補を作成しました。${
    questionMapDraft.aiEnhanced ? " AIで根拠説明を補強済みです。" : ""
  }`;
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
                              ${
                                match.matchedTokens?.length
                                  ? `<span class="meta-pill">${escapeHtml(match.matchedTokens.length)}語一致</span>`
                                  : ""
                              }
                              ${match.coverageLabel ? `<span class="meta-pill">${escapeHtml(match.coverageLabel)}</span>` : ""}
                              ${match.confidence ? `<span class="meta-pill">${escapeHtml(formatAiConfidence(match.confidence))}</span>` : ""}
                            </div>
                          </div>
                          <p class="flashcard-note">${escapeHtml(match.evidenceSnippet || match.snippet)}</p>
                          ${match.reason ? `<p class="muted">${escapeHtml(match.reason)}</p>` : ""}
                          ${
                            match.matchedTokens?.length
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

  renderHomeShareNotificationPanel();
  renderHomeBackupPanel();
  renderHistoryPanel();
}

function renderHomeShareNotificationPanel() {
  const unreadNotifications = cloudState.notifications.filter((notification) => !notification.readAt);
  homeShareNotificationStatus.textContent = unreadNotifications.length
    ? `未読 ${unreadNotifications.length} 件の共有通知があります。更新や承認待ちをここから確認できます。`
    : "未読の共有通知はありません。共有デッキの更新や承認待ちがあるとここに表示されます。";

  homeShareNotificationList.innerHTML = unreadNotifications.length
    ? unreadNotifications
        .slice(0, 4)
        .map(
          (notification) => `
            <article class="library-card">
              <div class="card-row-header">
                <div>
                  <h4>${escapeHtml(notification.title || "共有通知")}</h4>
                  <p class="muted">${escapeHtml(notification.body || "")}</p>
                </div>
                <button class="ghost-button" data-mark-notification-read="${notification.id}" type="button">既読</button>
              </div>
              <div class="card-row-meta">
                ${notification.deckName ? `<span class="meta-pill">${escapeHtml(notification.deckName)}</span>` : ""}
                <span class="meta-pill">${escapeHtml(formatMessageTime(notification.createdAt))}</span>
              </div>
            </article>
          `,
        )
        .join("")
    : `
        <article class="library-card">
          <h4>共有通知は落ち着いています</h4>
          <p class="muted">共有デッキの更新、参加申請、権限変更があるとここに並びます。</p>
        </article>
      `;
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
  const canAddContent = canAddCardsToDeck(deck) || canUploadMediaForDeck(deck);
  const mediaCount = state.cards
    .filter((card) => card.deckId === deck.id)
    .reduce((sum, card) => sum + (card.frontMedia || []).length + (card.backMedia || []).length, 0);

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
            ${mediaCount ? `<span class="meta-pill">画像 ${mediaCount}枚</span>` : ""}
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
          class="ghost-button board-action-button"
          data-open-deck-edit="${deck.id}"
          type="button"
          ${canEdit ? "" : "disabled"}
        >
          編集
        </button>
        <button
          class="secondary-button board-action-button"
          data-open-deck-sheet="${deck.id}"
          type="button"
          ${canAddContent ? "" : "disabled"}
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

function renderAiStudyPanel(source, sourceCards, choiceReadyCards) {
  if (!aiStudyPanel || !generateAiStudyButton || !aiStudyStatus || !aiStudyPreview) {
    return;
  }

  const canUseAi = studyMode !== "review";
  aiStudyPanel.hidden = !canUseAi;
  if (!canUseAi) {
    return;
  }

  const readyCards = studyMode === "choice" ? choiceReadyCards : sourceCards;
  const currentFilter = studyDeckFilter.value || "all";
  const displayDraft =
    aiStudyDraft &&
    aiStudyDraft.mode === studyMode &&
    aiStudyDraft.sourceKey === studySourceKey &&
    aiStudyDraft.filter === currentFilter
      ? aiStudyDraft
      : null;

  generateAiStudyButton.disabled = isAiStudyLoading || !readyCards.length;
  startAiStudyButton.hidden = !displayDraft;
  startAiStudyButton.disabled = !displayDraft || isAiStudyLoading;
  saveAiStudyCardsButton.hidden = !displayDraft;
  saveAiStudyCardsButton.disabled = !displayDraft || isAiStudyLoading;
  clearAiStudyButton.hidden = !displayDraft;
  clearAiStudyButton.disabled = !displayDraft || isAiStudyLoading;

  if (isAiStudyLoading) {
    aiStudyStatus.textContent =
      studyMode === "choice"
        ? "AIが4択クイズを作っています。材料カードから問い・選択肢・根拠を整理しています。"
        : "AIが小テストを作っています。材料カードから問い・答え・解説を整理しています。";
  } else if (displayDraft) {
    aiStudyStatus.textContent = `${displayDraft.items.length}問のAI問題案ができました。内容を確認してから開始するか、カード候補として保存できます。`;
  } else if (aiStudyErrorMessage) {
    aiStudyStatus.textContent = aiStudyErrorMessage;
  } else if (!readyCards.length) {
    aiStudyStatus.textContent =
      studyMode === "choice"
        ? "今の出題元ではAIに渡せる材料が足りません。別のリストへ切り替えるか、通常復習でカードを増やしてください。"
        : "今の出題元にカードがないため、AI問題を作れません。別のリストへ切り替えてください。";
  } else {
    aiStudyStatus.textContent = `${source.title} と「${getAssistantFilterLabel(currentFilter)}」の範囲から、AIで ${Math.min(
      studySessionSize,
      readyCards.length,
    )} 問の${studyMode === "choice" ? "4択クイズ" : "小テスト"}案を作れます。`;
  }

  if (!displayDraft) {
    aiStudyPreview.innerHTML = `
      <article class="library-card">
        <h4>まだAI問題案はありません</h4>
        <p class="muted">${
          readyCards.length
            ? `「AIで高精度生成」を押すと、${source.title} のカードから ${studyMode === "choice" ? "4択クイズ" : "小テスト"}案がここに並びます。`
            : "まずは別の出題元を選ぶか、カードやPDFを追加して材料を増やしてください。"
        }</p>
      </article>
    `;
    return;
  }

  aiStudyPreview.innerHTML = displayDraft.items
    .map(
      (item, index) => `
        <article class="library-card ai-preview-card">
          <div class="card-row-header">
            <div>
              <p class="eyebrow">${escapeHtml(studyMode === "choice" ? "AI 4択" : "AI 小テスト")} ${index + 1}</p>
              <h4>${escapeHtml(item.prompt)}</h4>
            </div>
            <span class="meta-pill">${escapeHtml(formatAiConfidence(item.confidence))}</span>
          </div>
          ${
            item.choiceOptions?.length
              ? `<div class="card-row-meta">${item.choiceOptions
                  .map((option) => `<span class="meta-pill">${escapeHtml(option.label)}</span>`)
                  .join("")}</div>`
              : ""
          }
          <p class="muted">${escapeHtml(item.answer)}</p>
          ${item.explanation ? `<p class="flashcard-note">${escapeHtml(item.explanation)}</p>` : ""}
          ${
            item.evidenceSnippet
              ? `<p class="import-source">根拠: ${escapeHtml(item.evidenceSnippet)}</p>`
              : item.sourceLabel
                ? `<p class="import-source">出典: ${escapeHtml(buildAiSourceLabel(item))}</p>`
                : ""
          }
          <div class="card-row-meta">
            ${item.topic ? `<span class="meta-pill">${escapeHtml(item.topic)}</span>` : ""}
            ${item.sourceLabel ? `<span class="meta-pill">${escapeHtml(buildAiSourceLabel(item))}</span>` : ""}
            ${(item.tags || []).slice(0, 4).map((tag) => `<span class="meta-pill">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function formatAiConfidence(confidence) {
  const safeConfidence = clampNumber(Number(confidence || 0), 0, 1, 0);
  return safeConfidence > 0 ? `AI ${Math.round(safeConfidence * 100)}%` : "AI案";
}

function buildAiSourceLabel(item) {
  const label = String(item.sourceLabel || "").trim();
  if (!label) {
    return "出典なし";
  }
  return item.sourcePage ? `${label} / p.${item.sourcePage}` : label;
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
  renderStudyQuickPanel(groups);
  renderAiStudyPanel(source, sourceCards, choiceReadyCards);
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
    if (studySession && studySession.mode === "review" && studySession.index >= studySession.items.length) {
      renderStudySessionComplete(source);
      return;
    }
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
  const sessionItem = studySession?.mode === "review" ? getCurrentStudySessionItem() : null;
  const currentCard = sessionItem ? getCardById(sessionItem.cardId) : pickCurrentCard(queue);
  const deck = currentCard ? getDeckById(currentCard.deckId) : null;
  flashcard.classList.toggle("image-first-card", getPreferredCardStyle(currentCard, deck) === "image-first");

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
    renderCardMediaGallery(cardFrontMedia, [], "問題画像");
    renderCardMediaGallery(cardBackMedia, [], "答え画像");
    renderRatingHints(null);
    return;
  }

  emptyState.classList.add("is-hidden");
  toggleAnswerButton.disabled = false;
  cardFront.textContent = currentCard.front || "画像を見て答える";
  renderCardMediaGallery(cardFrontMedia, currentCard.frontMedia || [], "問題画像");
  cardBack.textContent = currentCard.back || "画像で答えを確認する";
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
  renderCardMediaGallery(cardBackMedia, currentCard.backMedia || [], "答え画像");
  answerArea.classList.toggle("is-hidden", !isAnswerVisible);
  toggleAnswerButton.textContent = isAnswerVisible ? "答えを隠す" : "答えを見る";
  studyProgress.textContent = `${queue.length}枚の対象カードがあります。現在は${formatStudyMode(currentCard.study)}フェーズです。`;
  if (sessionItem && studySession) {
    studyProgress.textContent = `高速復習 ${studySession.index + 1}/${studySession.items.length}問。${studySession.items.length}枚を短く回しています。`;
  }
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
  reviewFeedbackPanel.hidden = true;
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
    title:
      studyMode === "review"
        ? `${source.title} の高速復習が終わりました`
        : `${source.title} の${studyMode === "choice" ? "4択クイズ" : "小テスト"}が終わりました`,
    text:
      studyMode === "review"
        ? `覚えた ${summary.good} / あいまい ${summary.hard} / 再確認 ${summary.again} でした。短時間で弱点をもう一度回せます。`
        : studyMode === "choice"
        ? `正解 ${summary.good} / ${summary.total} 問でした。間違えた問題は復習待ちへ戻しています。`
        : `正解 ${summary.good}、惜しい ${summary.hard}、不正解 ${summary.again} でした。弱点リストへ戻して再挑戦できます。`,
  });
  if (studyMode === "review") {
    studyProgress.textContent = `覚えた ${summary.good} / あいまい ${summary.hard} / 再確認 ${summary.again}`;
  } else if (studyMode === "test") {
    shortQuizProgress.textContent = `正解 ${summary.good} / 惜しい ${summary.hard} / 不正解 ${summary.again}`;
  } else {
    choiceQuizStatus.textContent = "4択クイズを完了しました。";
    choiceQuizScore.textContent = `正解 ${summary.good} / ${summary.total} 問`;
  }
}

function renderShortQuizStudy(source) {
  const item = getCurrentStudySessionItem();
  const itemData = resolveStudySessionItem(item);
  const card = itemData?.linkedCard || null;
  const deck = itemData?.deck || null;
  shortQuizCard.classList.toggle("image-first-card", getPreferredCardStyle(card, deck) === "image-first");

  reviewFeedbackPanel.hidden = true;
  shortQuizFeedbackPanel.hidden = false;
  choiceQuizFeedbackPanel.hidden = true;
  flashcard.classList.add("is-hidden");
  shortQuizCard.classList.toggle("is-hidden", !itemData);
  choiceQuizCard.classList.add("is-hidden");
  toggleAnswerButton.hidden = true;
  shortQuizRevealButton.hidden = !itemData || item.revealed;
  shortQuizNextButton.hidden = true;
  choiceQuizNextButton.hidden = true;

  if (!itemData || !item) {
    renderStudySessionPending(source, studySessionSize);
    return;
  }

  emptyState.classList.add("is-hidden");
  shortQuizFront.textContent = itemData.prompt || "画像を見て答える";
  renderCardMediaGallery(shortQuizFrontMedia, itemData.frontMedia || [], "小テスト画像");
  setElementCopy(
    shortQuizMeta,
    `${itemData.isAi ? "AI生成" : getDeckName(card?.deckId)} · ${item.index + 1}/${studySession.items.length}${
      itemData.sourceLabel ? ` · ${buildAiSourceLabel(itemData)}` : ""
    }`,
  );
  setElementCopy(shortQuizTopic, itemData.topic ? `テーマ: ${itemData.topic}` : deck?.subject ? `テーマ: ${deck.subject}` : "");
  shortQuizTags.innerHTML = renderPillRow(itemData.tags || [], deck?.focus || "general");
  shortQuizTags.hidden = !(itemData.tags || []).length;
  shortQuizAnswerInput.value = item.typedAnswer || "";
  shortQuizAnswerInput.disabled = item.revealed;
  shortQuizAnswerArea.classList.toggle("is-hidden", !item.revealed);
  shortQuizBack.textContent = itemData.answer || "画像で答えを確認する";
  setElementCopy(shortQuizHint, itemData.hint);
  setElementCopy(shortQuizNote, itemData.note);
  setElementCopy(shortQuizExample, itemData.example ? `${itemData.isAi ? "根拠" : "例"}: ${itemData.example}` : "");
  renderCardMediaGallery(shortQuizBackMedia, itemData.backMedia || [], "解答画像");

  const summary = buildStudySessionSummary(studySession);
  shortQuizProgress.textContent = item.revealed
    ? `第${item.index + 1}問を採点してください。現在の集計: 正解 ${summary.good} / 惜しい ${summary.hard} / 不正解 ${summary.again}`
    : `第${item.index + 1}問 / ${studySession.items.length}問。${source.title} から出題しています。`;
}

function renderChoiceQuizStudy(source) {
  const item = getCurrentStudySessionItem();
  const itemData = resolveStudySessionItem(item);
  const card = itemData?.linkedCard || null;
  const deck = itemData?.deck || null;
  choiceQuizCard.classList.toggle("image-first-card", getPreferredCardStyle(card, deck) === "image-first");

  reviewFeedbackPanel.hidden = true;
  shortQuizFeedbackPanel.hidden = true;
  choiceQuizFeedbackPanel.hidden = false;
  flashcard.classList.add("is-hidden");
  shortQuizCard.classList.add("is-hidden");
  choiceQuizCard.classList.toggle("is-hidden", !itemData);
  toggleAnswerButton.hidden = true;
  shortQuizRevealButton.hidden = true;
  shortQuizNextButton.hidden = true;
  choiceQuizNextButton.hidden = !item || !item.answered;

  if (!itemData || !item) {
    renderStudySessionPending(source, studySessionSize);
    return;
  }

  emptyState.classList.add("is-hidden");
  choiceQuizFront.textContent = itemData.prompt || "画像を見て選ぶ";
  renderCardMediaGallery(choiceQuizFrontMedia, itemData.frontMedia || [], "4択画像");
  setElementCopy(
    choiceQuizMeta,
    `${itemData.isAi ? "AI生成" : getDeckName(card?.deckId)} · ${item.index + 1}/${studySession.items.length}${
      itemData.sourceLabel ? ` · ${buildAiSourceLabel(itemData)}` : ""
    }`,
  );
  setElementCopy(choiceQuizTopic, itemData.topic ? `テーマ: ${itemData.topic}` : deck?.subject ? `テーマ: ${deck.subject}` : "");
  choiceQuizTags.innerHTML = renderPillRow(itemData.tags || [], deck?.focus || "general");
  choiceQuizTags.hidden = !(itemData.tags || []).length;
  choiceQuizOptions.innerHTML = (item.choiceOptions || [])
    .map((option, index) => {
      const isSelected = item.selectedOptionId === option.id;
      const isCorrect = item.answered && Boolean(option.isCorrect);
      const isWrong = item.answered && isSelected && !option.isCorrect;
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
  choiceQuizBack.textContent = itemData.answer || "画像で答えを確認する";
  setElementCopy(choiceQuizHint, itemData.hint);
  setElementCopy(choiceQuizNote, itemData.note);
  setElementCopy(choiceQuizExample, itemData.example ? `${itemData.isAi ? "根拠" : "例"}: ${itemData.example}` : "");
  renderCardMediaGallery(choiceQuizBackMedia, itemData.backMedia || [], "解答画像");
  const summary = buildStudySessionSummary(studySession);
  choiceQuizStatus.textContent = item.answered
    ? item.choiceOptions.some((option) => option.id === item.selectedOptionId && option.isCorrect)
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

  studySession = buildStudySession(studyMode, cards, size, { sourceKey: studySourceKey });
  currentCardId = null;
  isAnswerVisible = false;
  renderStudy();
  showToast(studyMode === "choice" ? "4択クイズを作成しました" : "小テストを作成しました");
}

function buildStudySession(mode, cards, size, options = {}) {
  const selectedCards = shuffleList([...cards]).slice(0, Math.min(size, cards.length));

  return {
    id: crypto.randomUUID(),
    mode,
    sourceKey: options.sourceKey || studySourceKey,
    quickKind: options.quickKind || "",
    items: selectedCards.map((card) => ({
      cardId: card.id,
      typedAnswer: "",
      revealed: false,
      answered: false,
      rating: "",
      repeatQueued: false,
      isRepeat: false,
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

function resolveStudySessionItem(item) {
  if (!item) {
    return null;
  }

  if (item.kind === "ai") {
    const linkedCard = item.linkedCardId ? getCardById(item.linkedCardId) : null;
    const deck = linkedCard ? getDeckById(linkedCard.deckId) : item.sourceDeckId ? getDeckById(item.sourceDeckId) : null;
    return {
      linkedCard,
      deck,
      prompt: item.prompt,
      answer: item.answer,
      hint: item.sourceLabel ? `出典: ${buildAiSourceLabel(item)}` : linkedCard?.hint || "",
      topic: item.topic || linkedCard?.topic || deck?.subject || "",
      tags: (item.tags || []).length ? item.tags : linkedCard?.tags || [],
      frontMedia: linkedCard?.frontMedia || [],
      backMedia: linkedCard?.backMedia || [],
      note: item.explanation || linkedCard?.note || "",
      example: item.evidenceSnippet || linkedCard?.example || "",
      choiceOptions: item.choiceOptions || [],
      isAi: true,
      sourceLabel: item.sourceLabel || "",
      sourcePage: item.sourcePage || null,
    };
  }

  const card = getCardById(item.cardId);
  if (!card) {
    return null;
  }
  const deck = getDeckById(card.deckId);
  return {
    linkedCard: card,
    deck,
    prompt: card.front,
    answer: card.back,
    hint: card.hint,
    topic: card.topic || deck?.subject || "",
    tags: card.tags || [],
    frontMedia: card.frontMedia || [],
    backMedia: card.backMedia || [],
    note: card.note,
    example: card.example,
    choiceOptions: item.choiceOptions || [],
    isAi: false,
    sourceLabel: "",
    sourcePage: null,
  };
}

function recordStudySessionResult(item, rating, sessionType) {
  const linkedCard =
    item?.kind === "ai" ? (item.linkedCardId ? getCardById(item.linkedCardId) : null) : item?.cardId ? getCardById(item.cardId) : null;
  if (!linkedCard) {
    return;
  }
  recordPracticeResult(linkedCard, rating, sessionType);
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
  const itemData = resolveStudySessionItem(item);
  if (!item || !itemData) {
    return;
  }

  if (!item.revealed) {
    showToast("先に答えを確認してください");
    return;
  }

  item.typedAnswer = String(shortQuizAnswerInput.value || "").trim();
  item.answered = true;
  item.rating = rating;
  if (rating === "again" && state.settings?.studyPreferences?.autoRepeatMistakes !== false) {
    queueStudySessionRepeat(item);
  }
  recordStudySessionResult(item, rating, "quiz-test");
  advanceStudySession();
}

function handleChoiceQuizActions(event) {
  const optionButton = event.target.closest("[data-choice-option-id]");
  if (!optionButton || studyMode !== "choice") {
    return;
  }

  const item = getCurrentStudySessionItem();
  const itemData = resolveStudySessionItem(item);
  if (!item || !itemData || item.answered) {
    return;
  }

  item.selectedOptionId = optionButton.dataset.choiceOptionId;
  item.answered = true;
  item.rating = item.choiceOptions.some((option) => option.id === item.selectedOptionId && option.isCorrect) ? "good" : "again";
  if (item.rating === "again" && state.settings?.studyPreferences?.autoRepeatMistakes !== false) {
    queueStudySessionRepeat(item);
  }
  recordStudySessionResult(item, item.rating, "quiz-choice");
  render();
  if (state.settings?.studyPreferences?.autoAdvance !== false && studySession?.quickKind) {
    scheduleStudyAdvance();
  }
}

function advanceStudySession() {
  const item = getCurrentStudySessionItem();
  if (!item || !item.answered) {
    return;
  }

  clearStudyAdvanceTimer();
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
    { id: card.id, label: correctLabel, isCorrect: true },
    ...distractors.map((candidate) => ({ id: candidate.id, label: buildChoiceLabel(candidate.back), isCorrect: false })),
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
        .concat((card.frontMedia || []).map((media) => media.name || ""))
        .concat((card.backMedia || []).map((media) => media.name || ""))
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
      const canEdit = canEditCardsInDeck(deck);
      const canDelete = canDeleteCardsFromDeck(deck);

      return `
        <article class="library-card">
          <div class="card-row-header">
            <div>
              <h4>${escapeHtml(formatCardFrontLabel(card))}</h4>
              <p class="muted">${escapeHtml(formatCardBackLabel(card))}</p>
            </div>
            <div class="button-row">
              <button class="ghost-button" data-open-deck-detail="${card.deckId}" type="button">デッキ詳細</button>
              <button class="ghost-button" data-edit-card="${card.id}" type="button" ${canEdit ? "" : "disabled"}>編集</button>
              <button class="ghost-button danger-button" data-delete-card="${card.id}" type="button" ${canDelete ? "" : "disabled"}>削除</button>
            </div>
          </div>
          ${buildMediaSummaryMarkup(card)}
          ${card.note ? `<p class="flashcard-note">${escapeHtml(card.note)}</p>` : ""}
          ${card.example ? `<p class="flashcard-example">${escapeHtml(card.example)}</p>` : ""}
          <div class="card-row-meta">
            <span class="meta-pill">${escapeHtml(getDeckName(card.deckId))}</span>
            <span class="meta-pill ${escapeHtml(deck?.focus || "general")}">${escapeHtml(
              formatDeckFocus(deck?.focus),
            )}</span>
            ${card.topic ? `<span class="meta-pill">${escapeHtml(card.topic)}</span>` : deck?.subject ? `<span class="meta-pill">${escapeHtml(deck.subject)}</span>` : ""}
            ${hasCardMedia(card) ? `<span class="meta-pill">画像 ${(card.frontMedia || []).length + (card.backMedia || []).length}枚</span>` : ""}
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
                    <h4>${escapeHtml(formatCardFrontLabel(card))}</h4>
                    <p class="muted">${escapeHtml(formatCardBackLabel(card))}</p>
                  </div>
                  <button class="ghost-button" data-edit-card="${card.id}" type="button" ${canEditCardsInDeck(deck) ? "" : "disabled"}>編集</button>
                </div>
                ${buildMediaSummaryMarkup(card)}
                <div class="card-row-meta">
                  ${card.topic ? `<span class="meta-pill">${escapeHtml(card.topic)}</span>` : ""}
                  ${hasCardMedia(card) ? `<span class="meta-pill">画像 ${(card.frontMedia || []).length + (card.backMedia || []).length}枚</span>` : ""}
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
    const canManage = canManageMembers(deck);
    const canApprove = canApproveDeckRequests(deck);
    const canRegenerate = canRegenerateDeckShareLink(deck);
    const canPublishCopy = canPublishDeckCopyLink(deck);
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
          <button class="ghost-button" data-copy-package-link="${deck.id}" type="button" ${canPublishCopy ? "" : "disabled"}>画像込みコピーリンク</button>
          <button class="ghost-button" data-regenerate-share="${deck.id}" type="button" ${canRegenerate ? "" : "disabled"}>リンク再発行</button>
          <button
            class="ghost-button danger-button"
            data-stop-share="${deck.id}"
            type="button"
            ${deck.storageMode === "shared" && cloudState.session?.user ? "" : "disabled"}
          >
            ${deck.role === "owner" ? "共有をやめる" : "共有から抜ける"}
          </button>
        </div>
      </article>
      ${renderShareRequestsMarkup(deck, canApprove)}
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
      <article class="library-card">
        <h4>共有通知</h4>
        <p class="muted">承認待ちや共有更新はここからも確認できます。</p>
        <div class="stack-list">${renderShareNotificationsMarkup(deck)}</div>
      </article>
      <article class="library-card">
        <h4>更新履歴</h4>
        <p class="muted">誰がいつ何をしたかを時系列で確認できます。</p>
        <div class="stack-list">${renderShareEventsMarkup(deck)}</div>
      </article>
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

function saveDeckRecord({ deckId, name, focus, subject, description, defaults = {} }) {
  const safeName = String(name || "").trim();
  if (!safeName) {
    throw new Error("デッキ名を入力してください");
  }
  const normalizedDefaults = normalizeDeckDefaults(defaults, normalizeDeckFocus(focus));

  const now = Date.now();
  if (deckId) {
    const deck = getDeckById(deckId);
    if (!deck) {
      throw new Error("編集中のデッキが見つかりません");
    }

    if (!canEditDeckMeta(deck)) {
      throw new Error("この共有デッキは編集できません");
    }

    deck.name = safeName;
    deck.focus = normalizeDeckFocus(focus);
    deck.subject = String(subject || "").trim();
    deck.description = String(description || "").trim();
    deck.defaults = normalizedDefaults;
    deck.updatedAt = now;
    markDeckDirty(deck.id);
    return { deck, isNew: false };
  }

  const deck = normalizeDeck({
    id: crypto.randomUUID(),
    name: safeName,
    focus,
    subject,
    description,
    createdAt: now,
    updatedAt: now,
    storageMode: "local",
    role: "owner",
    syncState: "local-only",
    defaults: normalizedDefaults,
  });

  state.decks.unshift(deck);
  return { deck, isNew: true };
}

async function saveCardRecord({ cardId, deckId, front, back, hint, topic, tags, note, example, frontMedia = [], backMedia = [] }) {
  const safeDeckId = String(deckId || "").trim();
  const safeFront = String(front || "").trim();
  const safeBack = String(back || "").trim();
  const safeFrontMedia = normalizeCardMediaList(frontMedia);
  const safeBackMedia = normalizeCardMediaList(backMedia);

  if (!safeDeckId || (!safeFront && !safeFrontMedia.length) || (!safeBack && !safeBackMedia.length)) {
    throw new Error("カードの表と裏は、文字か画像のどちらかを入れてください");
  }

  const targetDeck = getDeckById(safeDeckId);
  if (!targetDeck) {
    throw new Error("保存先デッキが見つかりません");
  }

  if (targetDeck.storageMode === "shared" && !canAddCardsToDeck(targetDeck) && !canEditCardsInDeck(targetDeck)) {
    throw new Error("この共有デッキにはカードを追加できません");
  }
  if ((safeFrontMedia.length || safeBackMedia.length) && !canUploadMediaForDeck(targetDeck)) {
    throw new Error("この共有デッキには画像を追加できません");
  }

  const now = Date.now();
  const safeTags = Array.isArray(tags) ? tags : parseTags(String(tags || ""));
  const persistedFrontMedia = await persistDraftMediaItems(safeFrontMedia);
  const persistedBackMedia = await persistDraftMediaItems(safeBackMedia);

  if (cardId) {
    const card = getCardById(cardId);
    if (!card) {
      throw new Error("編集中のカードが見つかりません");
    }

    const previousDeck = getDeckById(card.deckId);
    if (!canEditCardsInDeck(previousDeck)) {
      throw new Error("この共有デッキのカードは編集できません");
    }
    if (previousDeck?.id !== safeDeckId && previousDeck?.storageMode === "shared" && !canDeleteCardsFromDeck(previousDeck)) {
      throw new Error("元の共有デッキからカードを外す権限がありません");
    }
    if (previousDeck?.id !== safeDeckId && targetDeck.storageMode === "shared" && !canAddCardsToDeck(targetDeck)) {
      throw new Error("移動先の共有デッキへカードを追加できません");
    }

    const previousDeckId = card.deckId;
    card.deckId = safeDeckId;
    card.front = safeFront;
    card.back = safeBack;
    card.hint = String(hint || "").trim();
    card.topic = String(topic || "").trim();
    card.tags = safeTags;
    card.note = String(note || "").trim();
    card.example = String(example || "").trim();
    card.frontMedia = persistedFrontMedia;
    card.backMedia = persistedBackMedia;
    card.updatedAt = now;
    targetDeck.updatedAt = now;
    if (previousDeckId && previousDeckId !== safeDeckId) {
      const previousDeck = getDeckById(previousDeckId);
      if (previousDeck) {
        previousDeck.updatedAt = now;
      }
    }
    markDeckDirty(previousDeckId);
    markDeckDirty(safeDeckId);
    return { card, isNew: false, deck: targetDeck };
  }

  const card = makeCard({
    id: crypto.randomUUID(),
    deckId: safeDeckId,
    front: safeFront,
    back: safeBack,
    hint: String(hint || "").trim(),
    topic: String(topic || "").trim(),
    tags: safeTags,
    note: String(note || "").trim(),
    example: String(example || "").trim(),
    frontMedia: persistedFrontMedia,
    backMedia: persistedBackMedia,
    createdAt: now,
    dueAt: now,
    intervalDays: 0,
    sharedCardId: "",
  });

  state.cards.unshift(card);
  targetDeck.updatedAt = now;
  markDeckDirty(safeDeckId);
  return { card, isNew: true, deck: targetDeck };
}

function handleDeckSubmit(event) {
  event.preventDefault();
  const formData = new FormData(deckForm);
  const deckId = String(formData.get("deckId") || "").trim();
  const name = String(formData.get("deckName") || "").trim();
  const focus = String(formData.get("deckFocus") || "medical").trim();
  const subject = String(formData.get("deckSubject") || "").trim();
  const description = String(formData.get("deckDescription") || "").trim();
  const defaults = {
    defaultTopic: String(formData.get("deckDefaultTopic") || "").trim(),
    defaultTags: String(formData.get("deckDefaultTags") || "").trim(),
    frontPromptTemplate: String(formData.get("deckFrontTemplate") || "").trim(),
    backPromptTemplate: String(formData.get("deckBackTemplate") || "").trim(),
    preferredCardStyle: String(formData.get("deckPreferredCardStyle") || "balanced").trim(),
  };

  (async () => {
    try {
    const { deck, isNew } = saveDeckRecord({ deckId, name, focus, subject, description, defaults });
    clearDeckEditing();
    persist();
    render();
    cardDeckId.value = deck.id;
      let syncError = null;
      if (deck.storageMode === "shared") {
        try {
          deck.syncState = "syncing";
          render();
          await syncSharedDeckMeta(deck, {
            summary: isNew ? `共有デッキ「${deck.name}」を作成しました` : `共有デッキ「${deck.name}」の情報を更新しました`,
          });
          await refreshCloudData({ silent: true });
          persist();
          render();
        } catch (error) {
          deck.syncState = "dirty";
          persist();
          render();
          syncError = error;
        }
      }
      showToast(
        syncError
          ? `${isNew ? "デッキを追加" : "デッキを更新"}しました。共有同期は保留です`
          : isNew
            ? "デッキを追加しました"
            : "デッキを更新しました",
      );
    } catch (error) {
      showToast(error.message || "デッキ保存に失敗しました");
    }
  })();
}

async function handleCardSubmit(event) {
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

  try {
    const { card, isNew } = await saveCardRecord({
      cardId,
      deckId,
      front,
      back,
      hint,
      topic,
      tags,
      note,
      example,
      frontMedia: cardMediaDraft.front,
      backMedia: cardMediaDraft.back,
    });
    clearCardEditing();
    persist();
    cleanupOrphanedMediaAssets();
    render();
    cardDeckId.value = card.deckId;
    let syncError = null;
    const deck = getDeckById(card.deckId);
    if (deck?.storageMode === "shared") {
      try {
        deck.syncState = "syncing";
        render();
        await upsertSharedCardForDeck(deck, card, {
          eventType: isNew ? "card_added" : "card_updated",
          summary: isNew ? `カード「${formatCardFrontLabel(card)}」を追加しました` : `カード「${formatCardFrontLabel(card)}」を更新しました`,
        });
        await refreshCloudData({ silent: true });
        persist();
        render();
      } catch (error) {
        deck.syncState = "dirty";
        persist();
        render();
        syncError = error;
      }
    }
    showToast(syncError ? `${isNew ? "カードを保存" : "カードを更新"}しました。共有同期は保留です` : isNew ? "カードを保存しました" : "カードを更新しました");
  } catch (error) {
    cleanupOrphanedMediaAssets();
    showToast(error.message || "カード保存に失敗しました");
  }
}

async function handleEditDeckSubmit(event) {
  event.preventDefault();
  const formData = new FormData(editDeckForm);

  try {
    const { deck } = saveDeckRecord({
      deckId: String(formData.get("editDeckId") || "").trim(),
      name: String(formData.get("editDeckName") || "").trim(),
      focus: String(formData.get("editDeckFocus") || "medical").trim(),
      subject: String(formData.get("editDeckSubject") || "").trim(),
      description: String(formData.get("editDeckDescription") || "").trim(),
      defaults: {
        defaultTopic: String(formData.get("editDeckDefaultTopic") || "").trim(),
        defaultTags: String(formData.get("editDeckDefaultTags") || "").trim(),
        frontPromptTemplate: String(formData.get("editDeckFrontTemplate") || "").trim(),
        backPromptTemplate: String(formData.get("editDeckBackTemplate") || "").trim(),
        preferredCardStyle: String(formData.get("editDeckPreferredCardStyle") || "balanced").trim(),
      },
    });
    selectedEditDeckId = deck.id;
    persist();
    render();
    let syncError = null;
    if (deck.storageMode === "shared") {
      try {
        deck.syncState = "syncing";
        render();
        await syncSharedDeckMeta(deck, {
          summary: `共有デッキ「${deck.name}」の情報を更新しました`,
        });
        await refreshCloudData({ silent: true });
        persist();
        render();
      } catch (error) {
        deck.syncState = "dirty";
        persist();
        render();
        syncError = error;
      }
    }
    showToast(syncError ? "デッキを更新しました。共有同期は保留です" : "デッキを更新しました");
  } catch (error) {
    showToast(error.message || "デッキ更新に失敗しました");
  }
}

async function handleEditCardSubmit(event) {
  event.preventDefault();
  const formData = new FormData(editCardForm);

  try {
    const { card, isNew } = await saveCardRecord({
      cardId: String(formData.get("editCardId") || "").trim(),
      deckId: selectedEditDeckId,
      front: String(formData.get("editCardFront") || "").trim(),
      back: String(formData.get("editCardBack") || "").trim(),
      hint: String(formData.get("editCardHint") || "").trim(),
      topic: String(formData.get("editCardTopic") || "").trim(),
      tags: parseTags(String(formData.get("editCardTags") || "")),
      note: String(formData.get("editCardNote") || "").trim(),
      example: String(formData.get("editCardExample") || "").trim(),
      frontMedia: editCardMediaDraft.front,
      backMedia: editCardMediaDraft.back,
    });
    selectedEditDeckId = card.deckId;
    editSubview = "cards";
    editWorkspaceCardId = "";
    persist();
    cleanupOrphanedMediaAssets();
    render();
    focusEditCardForm();
    let syncError = null;
    const deck = getDeckById(card.deckId);
    if (deck?.storageMode === "shared") {
      try {
        deck.syncState = "syncing";
        render();
        await upsertSharedCardForDeck(deck, card, {
          eventType: isNew ? "card_added" : "card_updated",
          summary: isNew ? `カード「${formatCardFrontLabel(card)}」を追加しました` : `カード「${formatCardFrontLabel(card)}」を更新しました`,
        });
        await refreshCloudData({ silent: true });
        persist();
        render();
      } catch (error) {
        deck.syncState = "dirty";
        persist();
        render();
        syncError = error;
      }
    }
    showToast(syncError ? `${isNew ? "カードを追加" : "カードを更新"}しました。共有同期は保留です` : isNew ? "カードを追加しました" : "カードを更新しました");
  } catch (error) {
    cleanupOrphanedMediaAssets();
    showToast(error.message || "カード更新に失敗しました");
  }
}

function handleEditCardListActions(event) {
  const editButton = event.target.closest("[data-edit-workspace-card]");
  if (editButton) {
    editWorkspaceCardId = editButton.dataset.editWorkspaceCard;
    editSubview = "cards";
    renderEditWorkspace();
    syncEditWorkspaceLocks().catch((error) => {
      console.warn("Failed to sync edit locks:", error);
    });
    focusEditCardForm();
    return;
  }

  const deleteButton = event.target.closest("[data-delete-edit-workspace-card]");
  if (deleteButton) {
    deleteCard(deleteButton.dataset.deleteEditWorkspaceCard);
  }
}

async function handleImportSubmit(event) {
  event.preventDefault();
  if (isImportLoading) {
    return;
  }

  const requestedEngine = event.submitter?.dataset.importEngine === "ai" ? "ai" : "local";
  isImportLoading = true;
  importStatus.textContent =
    requestedEngine === "ai"
      ? "AIで資料を読んでいます。無料枠を使って高精度生成を試しています。"
      : "資料を分析しています。少し待つと候補が表示されます。";
  renderImportPanel();

  try {
    const focus = normalizeDeckFocus(importFocusInput.value);
    const limit = clampNumber(Number.parseInt(importLimitInput.value, 10), 4, 30, 12);
    importLimitInput.value = String(limit);
    const subject = String(importSubjectInput.value || "").trim();
    const instructions = String(importInstructionsInput.value || "").trim();
    const sourceName =
      importFileInput.files?.[0]?.name || String(importDeckNameInput.value || "").trim() || "AI資料";
    const deckName = (importDeckNameInput.value || "").trim() || buildDeckNameFromSource(sourceName);
    importDeckNameInput.value = deckName;

    if (requestedEngine === "ai") {
      try {
        importDraft = await generateAiImportDraft({
          deckName,
          focus,
          subject,
          instructions,
          limit,
        });
        importDraft.targetDeckId = importContextDeckId || "";
        importStatus.textContent = `AIが ${importDraft.cards.length} 枚の候補を作成しました。内容を確認してから保存できます。`;
        renderImportPanel();
        showToast(`${importDraft.cards.length}枚のAI候補を作成しました`);
        return;
      } catch (error) {
        const fallbackLabel = getAiFallbackMessage(error);
        const source = await loadImportSource();
        importDraft = buildImportDraft({
          text: source.text,
          sourceName: source.sourceName,
          deckName,
          focus,
          subject,
          instructions,
          limit,
        });
        importDraft.targetDeckId = importContextDeckId || "";
        importStatus.textContent = `${fallbackLabel} ローカル解析へ切り替えました。`;
        renderImportPanel();
        showToast(`${fallbackLabel} ローカル解析へ切り替えました`);
        return;
      }
    }

    const source = await loadImportSource();
    importDraft = buildImportDraft({
      text: source.text,
      sourceName: source.sourceName,
      deckName,
      focus,
      subject,
      instructions,
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
  } finally {
    isImportLoading = false;
    renderImportPanel();
  }
}

async function handleQuestionMapSubmit(event) {
  event.preventDefault();
  if (isQuestionMapLoading) {
    return;
  }

  const requestedEngine = event.submitter?.dataset.questionMapEngine === "ai" ? "ai" : "local";

  questionMapDraft = null;
  questionMapErrorMessage = "";
  isQuestionMapLoading = true;
  renderQuestionMapPanel();

  try {
    const topMatches = clampNumber(Number.parseInt(questionMapTopMatchesInput.value, 10), 1, 5, 3);
    questionMapTopMatchesInput.value = String(topMatches);
    const sources = await loadQuestionMapSources();
    questionMapErrorMessage = "";
    const localDraft = buildQuestionMapDraft({
      questionSource: sources.questionSource,
      slidePages: sources.slidePages,
      topMatches,
    });
    questionMapDraft = localDraft;
    if (requestedEngine === "ai") {
      renderQuestionMapPanel();
      questionMapStatus.textContent = "ローカル候補を作成したあと、AIで根拠と一致度を補強しています。";
      try {
        const aiRefined = await generateAiQuestionMapDraft(localDraft, sources.slidePages);
        questionMapDraft = aiRefined;
      } catch (error) {
        questionMapDraft = localDraft;
        showToast(`${getAiFallbackMessage(error)} ローカル候補を表示します`);
      }
    }
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

async function generateAiImportDraft({ deckName, focus, subject, instructions, limit }) {
  const response = await requestAiGeneration({
    task: "deck_from_pdf",
    payload: {
      deckName,
      focus,
      subject,
      instructions,
      limit,
      pastedText: String(importTextInput.value || "").trim(),
      sourceName: importFileInput.files?.[0]?.name || "貼り付けテキスト",
    },
    files: [...(importFileInput.files || [])].slice(0, 1),
  });

  const cards = normalizeAiImportCards(response.cards, {
    focus,
    subject,
    sourceName: response.sourceLabel || importFileInput.files?.[0]?.name || "AI資料",
  });
  if (!cards.length) {
    throw createAiClientError("AI_IMPORT_EMPTY", "AIがカード候補を返せませんでした。");
  }

  return {
    id: crypto.randomUUID(),
    sourceName: response.sourceLabel || importFileInput.files?.[0]?.name || "AI資料",
    deckName,
    targetDeckId: "",
    focus,
    subject,
    instructions,
    cards,
  };
}

async function generateAiQuestionMapDraft(localDraft, slidePages) {
  const response = await requestAiGeneration({
    task: "question_slide_refine",
    payload: buildAiQuestionMapPayload(localDraft, slidePages),
  });

  return mergeAiQuestionMapDraft(localDraft, response.questionMatches || []);
}

async function generateAiStudyDraft() {
  if (studyMode === "review" || isAiStudyLoading) {
    return;
  }

  const groups = buildStudySourceGroups();
  const source = groups[studySourceKey] || groups.due;
  const sourceCards = studyMode === "choice" ? source.cards.filter((card) => canBuildChoiceOptions(card, source.cards)) : source.cards;
  const size = clampNumber(Number.parseInt(studySessionSizeInput.value, 10), 3, 20, 8);
  const filter = studyDeckFilter.value || "all";

  if (!sourceCards.length) {
    aiStudyErrorMessage =
      studyMode === "choice"
        ? "AIに渡せる4択用の材料カードがまだありません。"
        : "AIに渡せる小テスト用の材料カードがまだありません。";
    renderStudy();
    showToast(aiStudyErrorMessage);
    return;
  }

  isAiStudyLoading = true;
  aiStudyErrorMessage = "";
  aiStudyDraft = null;
  renderStudy();

  let shouldFallbackToLocal = false;

  try {
    const payload = buildAiStudyPayload({
      mode: studyMode,
      source,
      sourceCards,
      filter,
      size,
    });
    const response = await requestAiGeneration({
      task: "quiz_from_selection",
      payload,
    });
    aiStudyDraft = buildAiStudyDraft(response.quizItems, {
      mode: studyMode,
      sourceKey: studySourceKey,
      filter,
      sourceTitle: source.title,
      sourceCards: payload.cards,
    });
    aiStudyErrorMessage = "";
    showToast(`AIが ${aiStudyDraft.items.length} 問の問題案を作成しました`);
  } catch (error) {
    aiStudyDraft = null;
    aiStudyErrorMessage = `${getAiFallbackMessage(error)} ローカルの${studyMode === "choice" ? "4択クイズ" : "小テスト"}へ切り替えます。`;
    shouldFallbackToLocal = true;
    showToast(aiStudyErrorMessage);
  } finally {
    isAiStudyLoading = false;
    renderStudy();
  }

  if (shouldFallbackToLocal) {
    startStudySession();
  }
}

function startAiStudySession() {
  if (!aiStudyDraft?.items?.length) {
    showToast("開始できるAI問題案がありません");
    return;
  }

  studySession = buildAiStudySession(aiStudyDraft);
  currentCardId = null;
  isAnswerVisible = false;
  renderStudy();
  showToast(studyMode === "choice" ? "AI 4択クイズを開始しました" : "AI 小テストを開始しました");
}

function saveAiStudyDraftAsCards() {
  if (!aiStudyDraft?.items?.length) {
    showToast("カード候補化できるAI問題案がありません");
    return;
  }

  const selectedFilter = studyDeckFilter.value || "all";
  let targetDeck = selectedFilter.startsWith("focus:") || selectedFilter === "all" ? null : getDeckById(selectedFilter);
  if (targetDeck && !canEditDeckContent(targetDeck)) {
    targetDeck = null;
  }

  const focus = targetDeck ? normalizeDeckFocus(targetDeck.focus) : inferAssistantFocus(selectedFilter);
  const subject =
    targetDeck?.subject ||
    aiStudyDraft.items.find((item) => item.topic)?.topic ||
    (focus === "medical" ? "AI小テスト" : focus === "english" ? "AI quiz" : "AI notes");
  const deckName =
    targetDeck?.name || buildDeckNameFromSource(`AI ${studyMode === "choice" ? "4択" : "小テスト"} ${formatDateKey(new Date())}`);

  importDraft = {
    id: crypto.randomUUID(),
    sourceName: `AI ${studyMode === "choice" ? "4択クイズ" : "小テスト"}`,
    deckName,
    targetDeckId: targetDeck?.id || "",
    focus,
    subject,
    instructions: `${aiStudyDraft.sourceTitle} から AI で生成した問題案`,
    cards: aiStudyDraft.items.map((item) => ({
      id: crypto.randomUUID(),
      front: item.prompt,
      back: item.answer,
      hint: item.sourceLabel ? `出典: ${buildAiSourceLabel(item)}` : "AIで高精度生成",
      topic: item.topic || subject,
      tags: dedupeTags([...(item.tags || []), "AI問題"]),
      note: [item.explanation, item.sourceLabel ? `参照: ${buildAiSourceLabel(item)}` : ""].filter(Boolean).join(" / "),
      example:
        item.choiceOptions?.length > 0
          ? `選択肢: ${item.choiceOptions.map((option) => option.label).join(" / ")}`
          : item.evidenceSnippet || "",
      sourceLine: item.evidenceSnippet || buildAiSourceLabel(item),
      sourceLabel: item.sourceLabel || "",
      sourcePage: item.sourcePage || null,
      evidenceSnippet: item.evidenceSnippet || "",
      confidence: item.confidence || 0,
    })),
  };
  importSelection.clear();
  importFocusInput.value = focus;
  importDeckNameInput.value = deckName;
  importSubjectInput.value = subject;
  importInstructionsInput.value = importDraft.instructions;
  switchSection("manage");
  setCreateMode("import");
  render();
  showToast(targetDeck ? "AI問題案を既存デッキへ追加する候補にしました" : "AI問題案をカード候補化しました");
}

function clearAiStudyDraft({ silent = false, withToast = false } = {}) {
  aiStudyDraft = null;
  aiStudyErrorMessage = "";
  if (!silent) {
    renderStudy();
  }
  if (withToast) {
    showToast("AI問題案を破棄しました");
  }
}

function buildAiStudyPayload({ mode, source, sourceCards, filter, size }) {
  const maxCards = Math.min(Math.max(size * 3, 12), 36, sourceCards.length);
  return {
    mode,
    size,
    filter,
    filterLabel: getAssistantFilterLabel(filter),
    sourceTitle: source.title,
    sourceDescription: source.description,
    focus: inferAssistantFocus(filter),
    cards: sourceCards.slice(0, maxCards).map((card, index) => {
      const deck = getDeckById(card.deckId);
      return {
        id: card.id,
        sourceIndex: index + 1,
        deckId: card.deckId,
        deckName: deck?.name || "未分類",
        subject: deck?.subject || "",
        front: card.front,
        back: card.back,
        hint: card.hint || "",
        topic: card.topic || deck?.subject || "",
        tags: card.tags || [],
        note: card.note || "",
        example: card.example || "",
      };
    }),
  };
}

function buildAiStudyDraft(items, { mode, sourceKey, filter, sourceTitle, sourceCards }) {
  const normalizedItems = normalizeAiQuizItems(items, { mode, sourceCards });
  if (!normalizedItems.length) {
    throw createAiClientError("AI_QUIZ_EMPTY", "AIが問題案を返せませんでした。");
  }

  return {
    id: crypto.randomUUID(),
    mode,
    sourceKey,
    filter,
    sourceTitle,
    items: normalizedItems,
  };
}

function buildAiStudySession(draft) {
  return {
    id: crypto.randomUUID(),
    mode: draft.mode,
    sourceKey: draft.sourceKey,
    engine: "ai",
    items: draft.items.map((item) => ({
      ...clone(item),
      answered: false,
      revealed: false,
      rating: "",
      selectedOptionId: "",
      typedAnswer: "",
    })),
    index: 0,
  };
}

function normalizeAiImportCards(cards, { focus, subject, sourceName }) {
  return (Array.isArray(cards) ? cards : [])
    .map((card, index) => {
      const front = cleanImportedSegment(card?.front || card?.question || "");
      const back = cleanImportedSegment(card?.back || card?.answer || "");
      if (!isViableCardPair(front, back)) {
        return null;
      }

      const sourceLabel = cleanImportedSegment(card?.sourceLabel || sourceName);
      const sourcePage = Number.isFinite(Number(card?.sourcePage)) ? Number(card.sourcePage) : null;
      const evidenceSnippet = cleanImportedSegment(card?.evidenceSnippet || card?.evidence || "");
      const tags = dedupeTags([formatDeckFocus(focus), ...splitSubjectTags(subject), ...parseTags(card?.tags)]);

      return {
        id: crypto.randomUUID(),
        front,
        back,
        hint: cleanImportedSegment(card?.hint || (focus === "english" ? "AIが資料から生成" : "AIが講義資料から生成")),
        topic: cleanImportedSegment(card?.topic || subject),
        tags,
        note: [cleanImportedSegment(card?.note || ""), sourceLabel ? `参照: ${sourcePage ? `${sourceLabel} p.${sourcePage}` : sourceLabel}` : ""]
          .filter(Boolean)
          .join(" / "),
        example: cleanImportedSegment(card?.example || ""),
        sourceLine: sourceLabel ? (sourcePage ? `${sourceLabel} / p.${sourcePage}` : sourceLabel) : sourceName,
        sourceLabel,
        sourcePage,
        evidenceSnippet,
        confidence: clampNumber(Number(card?.confidence || 0), 0, 1, 0),
        sourceIndex: index + 1,
      };
    })
    .filter(Boolean);
}

function buildAiQuestionMapPayload(localDraft, slidePages) {
  const pageMap = new Map(
    slidePages.map((page) => [`${page.sourceName}::${page.pageNumber}`, page]),
  );
  const candidatePages = [];
  const seen = new Set();

  localDraft.questions.forEach((question) => {
    question.matches.slice(0, 4).forEach((match) => {
      const key = `${match.sourceName}::${match.pageNumber}`;
      const page = pageMap.get(key);
      if (!page || seen.has(key)) {
        return;
      }
      seen.add(key);
      candidatePages.push({
        sourceName: page.sourceName,
        pageNumber: page.pageNumber,
        text: cleanImportedSegment(page.text).slice(0, 1200),
      });
    });
  });

  slidePages.slice(0, 12).forEach((page) => {
    const key = `${page.sourceName}::${page.pageNumber}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    candidatePages.push({
      sourceName: page.sourceName,
      pageNumber: page.pageNumber,
      text: cleanImportedSegment(page.text).slice(0, 1200),
    });
  });

  return {
    questionSourceName: localDraft.questionSourceName,
    slideSourceLabel: localDraft.slideSourceLabel,
    topMatches: 3,
    candidatePages: candidatePages.slice(0, 18),
    questions: localDraft.questions.slice(0, 24).map((question) => ({
      label: question.label,
      prompt: question.prompt,
      options: question.options || [],
    })),
  };
}

function mergeAiQuestionMapDraft(localDraft, questionMatches) {
  const matchMap = new Map(
    (Array.isArray(questionMatches) ? questionMatches : [])
      .map((entry) => [String(entry.label || entry.questionLabel || "").trim(), entry])
      .filter(([label]) => label),
  );

  const questions = localDraft.questions.map((question) => {
    const next = matchMap.get(question.label);
    if (!next) {
      return question;
    }

    const matches = (Array.isArray(next.matches) ? next.matches : [])
      .map((match) => ({
        sourceName: cleanImportedSegment(match.sourceName || match.sourceLabel || "スライド"),
        pageNumber: Number.isFinite(Number(match.pageNumber || match.sourcePage)) ? Number(match.pageNumber || match.sourcePage) : 1,
        snippet: cleanImportedSegment(match.evidenceSnippet || match.snippet || ""),
        evidenceSnippet: cleanImportedSegment(match.evidenceSnippet || match.snippet || ""),
        matchedTokens: parseTags(match.matchedTokens || []),
        coverage: clampNumber(Number(match.coverage || match.confidence || 0), 0, 1, 0),
        coverageLabel: buildAiCoverageLabel(match.confidence || match.coverage || 0),
        confidence: clampNumber(Number(match.confidence || 0), 0, 1, 0),
        reason: cleanImportedSegment(match.reason || ""),
        score: Number(match.score || 0),
      }))
      .filter((match) => match.sourceName && match.evidenceSnippet);

    if (!matches.length) {
      return question;
    }

    return {
      ...question,
      matches,
      aiEnhanced: true,
    };
  });

  return {
    ...localDraft,
    questions,
    matchedQuestionCount: questions.filter((question) => question.matches.length > 0).length,
    aiEnhanced: true,
  };
}

function buildAiCoverageLabel(confidence) {
  const safeConfidence = clampNumber(Number(confidence || 0), 0, 1, 0);
  if (safeConfidence >= 0.75) {
    return "AI一致度 高め";
  }
  if (safeConfidence >= 0.45) {
    return "AI一致度 中くらい";
  }
  return "AI一致度 参考";
}

function normalizeAiQuizItems(items, { mode, sourceCards }) {
  const safeItems = Array.isArray(items) ? items : [];
  return safeItems
    .map((item, index) => normalizeAiQuizItem(item, { mode, sourceCards, index }))
    .filter(Boolean);
}

function normalizeAiQuizItem(item, { mode, sourceCards, index }) {
  const prompt = cleanImportedSegment(item?.prompt || item?.question || "");
  const answer = cleanImportedSegment(item?.answer || item?.back || "");
  if (!prompt || !answer) {
    return null;
  }

  const sourceIndex = Number.isFinite(Number(item?.sourceIndex)) ? Number(item.sourceIndex) : Number.isFinite(Number(item?.sourceCardIndex)) ? Number(item.sourceCardIndex) : index + 1;
  const linkedSource = sourceCards.find((card) => card.sourceIndex === sourceIndex) || sourceCards[index] || null;
  const confidence = clampNumber(Number(item?.confidence || 0), 0, 1, 0);
  const topic = cleanImportedSegment(item?.topic || linkedSource?.topic || linkedSource?.subject || "");
  const tags = dedupeTags([...(linkedSource?.tags || []), ...parseTags(item?.tags), "AI問題"]);
  const sourceLabel = cleanImportedSegment(item?.sourceLabel || linkedSource?.deckName || "");
  const sourcePage = Number.isFinite(Number(item?.sourcePage)) ? Number(item.sourcePage) : null;
  const evidenceSnippet = cleanImportedSegment(item?.evidenceSnippet || item?.evidence || "");
  const explanation = cleanImportedSegment(item?.explanation || item?.note || "");

  const normalized = {
    id: crypto.randomUUID(),
    kind: "ai",
    linkedCardId: linkedSource?.id || "",
    sourceDeckId: linkedSource?.deckId || "",
    prompt,
    answer,
    explanation,
    topic,
    tags,
    sourceLabel,
    sourcePage,
    evidenceSnippet,
    confidence,
    choiceOptions: [],
  };

  if (mode === "choice") {
    const choiceOptions = normalizeAiChoiceOptions(item?.options, answer);
    if (!choiceOptions.length) {
      return null;
    }
    normalized.choiceOptions = choiceOptions;
  }

  return normalized;
}

function normalizeAiChoiceOptions(options, answer) {
  const safeOptions = Array.isArray(options) ? options : [];
  const normalizedAnswer = cleanImportedSegment(answer);
  const cleaned = safeOptions
    .map((option, index) => {
      const label = cleanImportedSegment(option?.label || option?.text || option || "");
      if (!label) {
        return null;
      }
      return {
        id: crypto.randomUUID(),
        label,
        isCorrect:
          Boolean(option?.isCorrect) ||
          index === Number(option?.correctOptionIndex) ||
          label === normalizedAnswer,
      };
    })
    .filter(Boolean);

  if (cleaned.length < 4) {
    return [];
  }

  let correctOption =
    cleaned.find((option) => option.isCorrect) ||
    (normalizedAnswer
      ? {
          id: crypto.randomUUID(),
          label: normalizedAnswer,
          isCorrect: true,
        }
      : null);
  if (!correctOption) {
    return [];
  }

  correctOption = {
    ...correctOption,
    isCorrect: true,
  };
  const distractors = cleaned
    .filter((option) => option.id !== correctOption.id && option.label !== correctOption.label)
    .slice(0, 3)
    .map((option) => ({
      ...option,
      isCorrect: false,
    }));
  if (distractors.length < 3) {
    return [];
  }

  return shuffleList(
    [correctOption, ...distractors].slice(0, 4),
  );
}

async function requestAiGeneration({ task, payload, files = [] }) {
  const formData = new FormData();
  formData.append("task", task);
  formData.append("payload", JSON.stringify(payload || {}));
  files.forEach((file) => {
    if (file) {
      formData.append("files", file, file.name || "upload");
    }
  });

  let response;
  try {
    response = await fetch(AI_GENERATE_ENDPOINT, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    throw createAiClientError("AI_ENDPOINT_UNAVAILABLE", "AI機能に接続できませんでした。", error);
  }

  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    if (!response.ok) {
      data = {};
    } else {
      throw createAiClientError("AI_BAD_RESPONSE", "AI応答を読み取れませんでした。", error);
    }
  }

  if (!response.ok) {
    const code =
      String(data.code || "").trim() ||
      (response.status === 429 ? "AI_RATE_LIMITED" : response.status === 404 ? "AI_ENDPOINT_UNAVAILABLE" : "AI_REQUEST_FAILED");
    const message = String(data.error || data.message || "").trim() || "AI生成に失敗しました。";
    const error = createAiClientError(code, message);
    error.status = response.status;
    throw error;
  }

  return data;
}

function createAiClientError(code, message, cause) {
  const error = new Error(message);
  error.code = code;
  if (cause) {
    error.cause = cause;
  }
  return error;
}

function getAiFallbackMessage(error) {
  const code = String(error?.code || "").trim();
  if (AI_FALLBACK_ERROR_CODES.has(code)) {
    if (code === "AI_NOT_CONFIGURED" || code === "AI_DISABLED") {
      return "AI設定がまだないため、";
    }
    if (code === "AI_RATE_LIMITED" || code === "FREE_TIER_EXCEEDED") {
      return "AIの無料枠が上限に達したため、";
    }
    if (code === "AI_ENDPOINT_UNAVAILABLE") {
      return "AI機能に接続できなかったため、";
    }
    if (code === "AI_FILE_TOO_LARGE") {
      return "PDFが大きすぎて無料AIへ直接送れなかったため、";
    }
    return "AI生成が使えなかったため、";
  }
  return "AI生成に失敗したため、";
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

  const accountBackupButton = event.target.closest("[data-open-account-backup]");
  if (accountBackupButton) {
    openAccountBackupSettings();
    return;
  }

  const backupNowButton = event.target.closest("[data-trigger-backup-now]");
  if (backupNowButton) {
    if (cloudState.backupReadinessIssue?.blocking) {
      showToast(cloudState.backupReadinessIssue.text);
      openAccountBackupSettings({ intent: "settings-backup" });
      return;
    }
    createCloudBackupSnapshot({ kind: "manual" }).catch((error) => {
      console.warn("Failed to create manual backup:", error);
    });
    return;
  }

  const sharePanelButton = event.target.closest("[data-open-share-panel]");
  if (sharePanelButton) {
    openShareManager();
    return;
  }

  const markNotificationButton = event.target.closest("[data-mark-notification-read]");
  if (markNotificationButton) {
    markNotificationsRead(markNotificationButton.dataset.markNotificationRead).catch((error) => {
      console.warn("Failed to mark dashboard notification read:", error);
      showToast(error.message || "通知の既読化に失敗しました");
    });
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

  const openEditButton = event.target.closest("[data-open-deck-edit]");
  if (openEditButton) {
    openEditWorkspace(openEditButton.dataset.openDeckEdit, { subview: "deck" });
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

  const copyPackageButton = event.target.closest("[data-copy-package-link]");
  if (copyPackageButton) {
    shareDeckSelect.value = copyPackageButton.dataset.copyPackageLink;
    copyDeckPackageLink();
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

  const notificationButton = event.target.closest("[data-mark-notification-read]");
  if (notificationButton) {
    markNotificationsRead(notificationButton.dataset.markNotificationRead).catch((error) => {
      console.warn("Failed to mark notification read:", error);
      showToast(error.message || "通知の既読化に失敗しました");
    });
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
    state.decks.unshift(
      normalizeDeck({
      id: deckId,
      name: deckName,
      focus: importDraft.focus,
      subject: importDraft.subject,
      description: importDraft.instructions ? `${descriptionBase} / ${importDraft.instructions}` : descriptionBase,
      createdAt: now,
      updatedAt: now,
      storageMode: "local",
      role: "owner",
      syncState: "local-only",
      }),
    );
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
  openEditWorkspace(deckId, { subview: "deck" });
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

  openEditWorkspace(card.deckId, { subview: "cards", cardId: card.id });
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

  if (selectedEditDeckId === deckId) {
    selectedEditDeckId = "";
    editWorkspaceCardId = "";
    editCardQuery = "";
    editSubview = "deck";
    releaseAllEditLocks().catch((error) => {
      console.warn("Failed to release edit locks:", error);
    });
  }

  if (editingCardId && !getCardById(editingCardId)) {
    clearCardEditing();
  }

  if (currentCardId && !getCardById(currentCardId)) {
    currentCardId = null;
    isAnswerVisible = false;
  }

  persist();
  cleanupOrphanedMediaAssets();
  render();
  showToast("デッキを削除しました");
}

async function deleteCard(cardId) {
  const card = getCardById(cardId);
  if (!card) {
    showToast("カードが見つかりません");
    return;
  }

  const approved = window.confirm(`「${card.front}」を削除します。続けますか？`);
  if (!approved) {
    return;
  }

  const sourceDeck = getDeckById(card.deckId);
  if (!canDeleteCardsFromDeck(sourceDeck)) {
    showToast("この共有デッキのカードは削除できません");
    return;
  }

  const removedCard = clone(card);
  state.cards = state.cards.filter((item) => item.id !== cardId);
  state.reviewLog = state.reviewLog.filter((entry) => entry.cardId !== cardId);
  markDeckDirty(card.deckId);

  if (editingCardId === cardId) {
    clearCardEditing();
  }

  if (editWorkspaceCardId === cardId) {
    clearEditWorkspaceCardEditing({ silent: true });
  }

  if (currentCardId === cardId) {
    currentCardId = null;
    isAnswerVisible = false;
  }

  persist();
  cleanupOrphanedMediaAssets();
  render();
  let syncError = null;
  if (sourceDeck?.storageMode === "shared") {
    try {
      sourceDeck.syncState = "syncing";
      render();
      await deleteSharedCardFromCloud(sourceDeck, removedCard, {
        summary: `カード「${formatCardFrontLabel(removedCard)}」を削除しました`,
      });
      await refreshCloudData({ silent: true });
      persist();
      render();
    } catch (error) {
      sourceDeck.syncState = "dirty";
      persist();
      render();
      syncError = error;
    }
  }
  showToast(syncError ? "カードを削除しました。共有同期は保留です" : "カードを削除しました");
}

function reviewCurrentCard(rating) {
  const sessionItem = studySession?.mode === "review" ? getCurrentStudySessionItem() : null;
  const card = sessionItem ? getCardById(sessionItem.cardId) : getCardById(currentCardId);
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
  if (sessionItem) {
    sessionItem.answered = true;
    sessionItem.rating = rating;
    if (rating === "again" && state.settings?.studyPreferences?.autoRepeatMistakes !== false) {
      queueStudySessionRepeat(sessionItem);
    }
  } else {
    currentCardId = null;
  }
  isAnswerVisible = false;
  persist();
  if (sessionItem) {
    advanceStudySession();
  } else {
    render();
  }
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
  resetMediaDraft("card");
  applyCardContextPlaceholders();
}

function resetQuickCaptureForm({ preserveDeck = state.settings?.quickCapture?.keepDeckContext !== false, preserveTags = true, withToast = false } = {}) {
  const currentDeckId = quickCaptureDeckId?.value || state.settings?.quickCapture?.lastDeckId || "";
  const currentTags = quickCaptureTagsInput?.value || "";
  quickCaptureForm?.reset();
  resetMediaDraft("quick");
  syncQuickCaptureDeckOptions();
  if (preserveDeck && currentDeckId && optionExists(quickCaptureDeckId, currentDeckId)) {
    quickCaptureDeckId.value = currentDeckId;
  }
  renderQuickCapturePanel();
  if (preserveTags && quickCaptureTagsInput) {
    const deck = getDeckById(quickCaptureDeckId?.value || "");
    const rememberedTags = state.settings?.quickCapture?.keepTemplate !== false ? currentTags || state.settings?.quickCapture?.lastTags || "" : currentTags;
    quickCaptureTagsInput.value = mergeTagString(rememberedTags, deck?.defaults?.defaultTags || "");
  }
  if (withToast) {
    showToast("クイック追加の入力をクリアしました");
  }
}

async function handleQuickCaptureSubmit(event) {
  event.preventDefault();
  const deckId = String(quickCaptureDeckId?.value || "").trim();
  const deck = getDeckById(deckId);
  if (!deck) {
    showToast("保存先デッキを選んでください");
    return;
  }

  const submitMode = event.submitter?.dataset.quickSubmit === "save" ? "save" : "next";
  const front = String(quickCaptureFrontInput?.value || "").trim();
  const back = String(quickCaptureBackInput?.value || "").trim();
  const tags = parseTags(String(quickCaptureTagsInput?.value || ""));

  try {
    const { card, isNew } = await saveCardRecord({
      deckId,
      front,
      back,
      topic: deck.defaults?.defaultTopic || deck.subject || "",
      tags,
      frontMedia: quickCaptureMediaDraft.front,
      backMedia: quickCaptureMediaDraft.back,
    });
    state.settings.quickCapture.lastDeckId = deckId;
    state.settings.quickCapture.lastTags = buildTagString(tags);
    persist();
    cleanupOrphanedMediaAssets();
    render();
    resetQuickCaptureForm({ preserveDeck: true, preserveTags: true });
    if (submitMode === "next") {
      window.requestAnimationFrame(() => quickCaptureFrontInput?.focus());
    }
    showToast(isNew ? `「${deck.name}」にカードを追加しました` : `「${deck.name}」のカードを更新しました`);
    if (deck.storageMode === "shared") {
      try {
        deck.syncState = "syncing";
        render();
        await upsertSharedCardForDeck(deck, card, {
          eventType: isNew ? "card_added" : "card_updated",
          summary: isNew ? `カード「${formatCardFrontLabel(card)}」を追加しました` : `カード「${formatCardFrontLabel(card)}」を更新しました`,
        });
        await refreshCloudData({ silent: true });
        persist();
        render();
      } catch (error) {
        deck.syncState = "dirty";
        persist();
        render();
        console.warn("Failed to sync quick capture card:", error);
      }
    }
  } catch (error) {
    cleanupOrphanedMediaAssets();
    showToast(error.message || "クイック追加に失敗しました");
  }
}

function normalizeBulkInputSourceText(text) {
  const normalized = normalizeImportedText(text);
  const lines = normalized.split("\n");
  const blocks = [];
  let currentQuestion = "";
  let currentAnswer = [];

  const flush = () => {
    if (!currentQuestion || !currentAnswer.length) {
      return;
    }
    blocks.push(`Q: ${currentQuestion}\nA: ${currentAnswer.join(" ")}`);
    currentQuestion = "";
    currentAnswer = [];
  };

  lines.forEach((line) => {
    const safeLine = cleanImportedSegment(line);
    if (!safeLine) {
      flush();
      return;
    }
    const questionMatch = safeLine.match(/^q[:：]\s*(.+)$/i);
    if (questionMatch) {
      flush();
      currentQuestion = cleanImportedSegment(questionMatch[1] || "");
      return;
    }
    const answerMatch = safeLine.match(/^a[:：]\s*(.+)$/i);
    if (answerMatch) {
      currentAnswer.push(cleanImportedSegment(answerMatch[1] || ""));
      return;
    }
    if (currentQuestion && !currentAnswer.length) {
      currentAnswer.push(safeLine);
      return;
    }
    blocks.push(safeLine);
  });
  flush();

  return blocks.join("\n\n") || normalized;
}

function handleBulkInputSubmit(event) {
  event.preventDefault();
  const sourceText = String(bulkInputText?.value || "").trim();
  if (!sourceText) {
    showToast("まずは講義メモやQ/Aを貼り付けてください");
    return;
  }

  const targetDeck = getDeckById(String(bulkTargetDeckId?.value || "").trim());
  const focus = normalizeDeckFocus(targetDeck?.focus || bulkFocusInput?.value || "medical");
  const subject = String(targetDeck?.subject || bulkSubjectInput?.value || "").trim();
  const deckName = String(targetDeck?.name || bulkDeckNameInput?.value || "").trim() || buildDeckNameFromSource(`一括入力 ${formatDateKey(new Date())}`);

  try {
    importDraft = buildImportDraft({
      text: normalizeBulkInputSourceText(sourceText),
      sourceName: "一括入力メモ",
      deckName,
      focus,
      subject,
      instructions: "一括入力からカード候補化",
      limit: 24,
    });
    importDraft.targetDeckId = targetDeck?.id || "";
    importFocusInput.value = focus;
    importDeckNameInput.value = deckName;
    importSubjectInput.value = subject;
    setCreateMode("import");
    render();
    showToast(targetDeck ? `「${targetDeck.name}」へ追加する候補を作成しました` : "一括入力からカード候補を作成しました");
  } catch (error) {
    showToast(error.message || "一括入力の解析に失敗しました");
  }
}

function handleQuickCapturePreferenceChange() {
  state.settings.quickCapture.keepDeckContext = Boolean(settingsQuickKeepDeckCheckbox?.checked);
  state.settings.quickCapture.keepTemplate = Boolean(settingsQuickKeepTemplateCheckbox?.checked);
  persist();
  renderQuickCapturePanel();
  applyCardContextPlaceholders();
  const editDeck = getSelectedEditDeck();
  if (editDeck && !editWorkspaceCardId) {
    renderEditWorkspace();
  }
}

function handleStudyPreferenceChange() {
  state.settings.studyPreferences.defaultSessionMinutes = [5, 10, 20].includes(Number(settingsStudyDefaultMinutes?.value))
    ? Number(settingsStudyDefaultMinutes.value)
    : 5;
  state.settings.studyPreferences.defaultSpeedMode = ["recommended", "mistakes", "choice"].includes(String(settingsStudyDefaultSpeedMode?.value || ""))
    ? String(settingsStudyDefaultSpeedMode.value)
    : "recommended";
  state.settings.studyPreferences.autoRepeatMistakes = Boolean(settingsStudyAutoRepeatCheckbox?.checked);
  state.settings.studyPreferences.autoAdvance = Boolean(settingsStudyAutoAdvanceCheckbox?.checked);
  persist();
  studyQuickMinutes = state.settings.studyPreferences.defaultSessionMinutes;
  renderStudy();
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

function clearQuestionMapDraft({ silent = false } = {}) {
  questionMapDraft = null;
  isQuestionMapLoading = false;
  questionMapErrorMessage = "";
  questionMapForm.reset();
  questionMapTopMatchesInput.value = "3";
  renderQuestionMapPanel();
  if (!silent) {
    showToast("過去問参照の結果を消しました");
  }
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
    if (deckDefaultTopicInput) deckDefaultTopicInput.placeholder = "解剖 / 病理 / 鑑別 / 症候";
    if (deckDefaultTagsInput) deckDefaultTagsInput.placeholder = "医学, 循環, 腎, 必修";
    if (deckFrontTemplateInput) deckFrontTemplateInput.placeholder = "例: ○○とは？ / 画像の部位名は？";
    if (deckBackTemplateInput) deckBackTemplateInput.placeholder = "例: 定義を短く / 鑑別の要点を一言で";
    return;
  }

  if (focus === "english") {
    deckSubjectInput.placeholder = "医学英語 / 語彙 / 読解 / リスニング";
    deckDescriptionInput.placeholder = "例: 医学英語と長文読解を分けて反復する";
    if (deckDefaultTopicInput) deckDefaultTopicInput.placeholder = "語彙 / 読解 / 医学英語";
    if (deckDefaultTagsInput) deckDefaultTagsInput.placeholder = "english, vocabulary, medical english";
    if (deckFrontTemplateInput) deckFrontTemplateInput.placeholder = "例: 単語・表現 / この文の要点は？";
    if (deckBackTemplateInput) deckBackTemplateInput.placeholder = "例: 意味と使い方 / 要点を短く";
    return;
  }

  deckSubjectInput.placeholder = "テーマ / 分野";
  deckDescriptionInput.placeholder = "用途やテーマを短く書く";
  if (deckDefaultTopicInput) deckDefaultTopicInput.placeholder = "テーマ";
  if (deckDefaultTagsInput) deckDefaultTagsInput.placeholder = "タグをカンマ区切りで入力";
  if (deckFrontTemplateInput) deckFrontTemplateInput.placeholder = "例: ○○とは？";
  if (deckBackTemplateInput) deckBackTemplateInput.placeholder = "例: 要点を短く";
}

function applyCardContextPlaceholders() {
  const deck = getDeckById(cardDeckId.value);
  const focus = deck?.focus || getDeckFocus(cardDeckId.value);

  if (focus === "medical") {
    cardHintInput.placeholder = "病態の流れや鑑別のヒント";
    cardTopicInput.placeholder = "解剖 / 生理 / 病理 / 薬理 / 症候";
    cardTagsInput.placeholder = "循環, 腎, 呼吸, 必修";
    cardNoteInput.placeholder = "臨床ポイント、鑑別、関連知識を残す";
    cardExampleInput.placeholder = "症例ベースの覚え方や所見のつなぎ方";
  } else if (focus === "english") {
    cardHintInput.placeholder = "語源、言い換え、読み方のヒント";
    cardTopicInput.placeholder = "医学英語 / 語彙 / 読解 / 構文";
    cardTagsInput.placeholder = "vocabulary, reading, phrase, medical english";
    cardNoteInput.placeholder = "語法メモ、似た表現、論文での使い分け";
    cardExampleInput.placeholder = "例文や英文のまま覚えたいフレーズ";
  } else {
    cardHintInput.placeholder = "例文や覚え方のヒント";
    cardTopicInput.placeholder = "テーマ";
    cardTagsInput.placeholder = "タグをカンマ区切りで入力";
    cardNoteInput.placeholder = "重要な関連知識や使い分けを記録";
    cardExampleInput.placeholder = "例文や症例ベースの覚え方";
  }

  if (!editingCardId && deck) {
    applyDeckDefaultsToCardFields(
      deck,
      {
        frontInput: cardFrontInput,
        backInput: cardBackInput,
        topicInput: cardTopicInput,
        tagsInput: cardTagsInput,
      },
      { force: false },
    );
  }
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
  if (Number.isFinite(Number(match?.confidence))) {
    const safeConfidence = clampNumber(Number(match.confidence || 0), 0, 1, 0);
    if (safeConfidence >= 0.75) {
      return "AIがかなり近い候補だと判断しました";
    }
    if (safeConfidence >= 0.45) {
      return "AIが関連候補として妥当だと判断しました";
    }
    return "AIの補助候補です。必ず元のスライドも確認してください";
  }
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

function persist({ skipCloudBackup = false } = {}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (!skipCloudBackup) {
    markCloudBackupDirty();
  }
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

function isCloudConfigured() {
  return Boolean(cloudState.config?.supabaseUrl && cloudState.config?.supabaseAnonKey);
}

function isCloudSignedIn() {
  return Boolean(cloudState.session?.user);
}

function isOAuthProviderEnabled(provider) {
  if (!isCloudConfigured()) {
    return false;
  }

  if (provider === "google") {
    return cloudState.config?.authGoogleEnabled !== false;
  }
  return false;
}

function isMagicLinkEnabled() {
  return isCloudConfigured() && cloudState.config?.authMagicLinkEnabled !== false;
}

function getAuthProviderLabel(provider) {
  return provider === "google" ? "Google" : "メール";
}

function setBackupReadinessIssue(issue = null) {
  if (!issue || !String(issue.text || "").trim()) {
    cloudState.backupReadinessIssue = null;
    return;
  }

  cloudState.backupReadinessIssue = {
    key: String(issue.key || "").trim(),
    title: String(issue.title || "バックアップ保存先を確認").trim(),
    text: String(issue.text || "").trim(),
    blocking: issue.blocking !== false,
    updatedAt: Date.now(),
  };
}

function clearBackupReadinessIssue() {
  cloudState.backupReadinessIssue = null;
}

function clearBackupReadinessIssueUnless(keyToKeep = "") {
  if (cloudState.backupReadinessIssue?.key === keyToKeep) {
    return;
  }
  clearBackupReadinessIssue();
}

function classifyBackupError(error) {
  const rawMessage = String(error?.message || error || "").trim();
  const normalized = rawMessage.toLowerCase();

  if (
    (normalized.includes("user_backup_snapshots") && normalized.includes("schema cache"))
    || (normalized.includes("user_backup_snapshots") && normalized.includes("could not find the table"))
  ) {
    return {
      key: "missing-backup-table",
      title: "バックアップ保存先: schema 未反映",
      text: "Supabase の SQL Editor で最新版の supabase-schema.sql を再実行してください。user_backup_snapshots テーブルが見つかっていません。",
      blocking: true,
    };
  }

  if (
    (normalized.includes("profiles") && normalized.includes("schema cache"))
    || (normalized.includes("profiles") && normalized.includes("could not find the table"))
  ) {
    return {
      key: "missing-profiles-table",
      title: "バックアップ保存先: profiles 未作成",
      text: "Supabase の SQL Editor で最新版の supabase-schema.sql を再実行してください。profiles テーブルが見つかっていません。",
      blocking: true,
    };
  }

  if (
    (normalized.includes("bucket") && normalized.includes("user-backup-snapshots"))
    || normalized.includes("bucket not found")
    || normalized.includes("storage bucket")
  ) {
    return {
      key: "missing-backup-bucket",
      title: "バックアップ保存先: Storage 未作成",
      text: "Supabase の SQL Editor で最新版の supabase-schema.sql を再実行してください。user-backup-snapshots bucket か storage policy が未作成です。",
      blocking: true,
    };
  }

  if (
    normalized.includes("row-level security")
    || normalized.includes("permission denied")
    || normalized.includes("not allowed")
    || normalized.includes("policy")
  ) {
    return {
      key: "backup-policy-denied",
      title: "バックアップ保存先: 権限設定を確認",
      text: "Supabase の RLS または storage policy に拒否されています。最新版の supabase-schema.sql を再実行したあと、ログイン状態のまま再試行してください。",
      blocking: true,
    };
  }

  return {
    key: "backup-generic",
    title: "バックアップ保存先: 保存に失敗",
    text: rawMessage || "バックアップ保存先の確認に失敗しました。Supabase 設定と supabase-schema.sql の反映を見直してください。",
    blocking: false,
  };
}

function setCloudAuthIssue(kind = "", message = "", provider = "") {
  const safeKind = String(kind || "").trim();
  const safeMessage = String(message || "").trim();
  if (!safeKind || !safeMessage) {
    cloudState.authIssue = null;
    return;
  }
  cloudState.authIssue = {
    kind: safeKind,
    message: safeMessage,
    provider: String(provider || "").trim(),
    updatedAt: Date.now(),
  };
}

function clearCloudAuthIssue() {
  cloudState.authIssue = null;
}

function buildAuthDiagnosticItems() {
  const items = [];
  const hasConfig = isCloudConfigured();
  const googleEnabled = cloudState.config?.authGoogleEnabled !== false;
  const magicLinkEnabled = cloudState.config?.authMagicLinkEnabled !== false;
  const isSignedIn = isCloudSignedIn();
  const backupIssue = cloudState.backupReadinessIssue;

  if (cloudState.configError) {
    items.push({
      level: "danger",
      title: "Auth 接続: 設定読み込みに失敗",
      text: `Vercel の client-config を読めませんでした。${cloudState.configError}`,
    });
  }

  if (!hasConfig) {
    items.push({
      level: "danger",
      title: "Auth 接続: Supabase URL / anon key 未設定",
      text: "この本番では SUPABASE_URL と SUPABASE_ANON_KEY が返っておらず、ログインは local-only に固定されています。Vercel に追加して再デプロイしてください。",
    });
  } else {
    items.push({
      level: isSignedIn ? "success" : "caution",
      title: "Auth 接続",
      text: isSignedIn
        ? `${cloudState.session?.user?.email || "現在のアカウント"} でログイン中です。`
        : "Supabase 接続情報は読めています。次は Google かメールでログインできます。",
    });
  }

  if (hasConfig && !googleEnabled) {
    items.push({
      level: "caution",
      title: "Google ログインはオフ",
      text: "AUTH_GOOGLE_ENABLED か Supabase Auth の Google provider を見直してください。",
    });
  }
  if (hasConfig && !magicLinkEnabled) {
    items.push({
      level: "caution",
      title: "メールログインはオフ",
      text: "AUTH_MAGIC_LINK_ENABLED が false です。fallback に残すなら true に戻してください。",
    });
  }

  if (cloudState.authIssue) {
    const issueTitle =
      cloudState.authIssue.kind === "redirect-misconfigured"
        ? "認証の戻り先URLを確認"
        : cloudState.authIssue.kind === "provider-disabled"
          ? `${getAuthProviderLabel(cloudState.authIssue.provider)} provider 未有効化`
          : "ログイン設定を確認";
    items.push({
      level: "danger",
      title: issueTitle,
      text: cloudState.authIssue.message,
    });
  }

  if (hasConfig && !isSignedIn) {
    items.push({
      level: "caution",
      title: "バックアップ保存先",
      text: "ログイン後に profiles / user_backup_snapshots / storage bucket の準備状態を確認します。",
    });
  } else if (!hasConfig) {
    items.push({
      level: "caution",
      title: "バックアップ保存先",
      text: "Supabase 未接続のため、クラウドバックアップの準備状態はまだ確認できません。",
    });
  } else if (backupIssue) {
    items.push({
      level: backupIssue.blocking ? "danger" : "caution",
      title: backupIssue.title,
      text: backupIssue.text,
    });
  } else {
    items.push({
      level: "success",
      title: "バックアップ保存先",
      text: "profiles / user_backup_snapshots / storage bucket の基本確認は通っています。",
    });
  }

  return items;
}

function renderAuthDiagnosticMarkup(items = []) {
  if (!items.length) {
    return `
      <article class="library-card">
        <h4>診断情報はまだありません</h4>
        <p class="muted">ログイン設定やエラーがあると、ここに原因と次の手順が表示されます。</p>
      </article>
    `;
  }

  return items
    .map(
      (item) => `
        <article class="library-card">
          <div class="card-row-header">
            <h4>${escapeHtml(item.title)}</h4>
            <span class="meta-pill ${escapeHtml(item.level === "success" ? "success" : item.level === "caution" ? "caution" : "danger")}">
              ${escapeHtml(item.level === "success" ? "OK" : item.level === "caution" ? "確認" : "要対応")}
            </span>
          </div>
          <p class="muted">${escapeHtml(item.text)}</p>
        </article>
      `,
    )
    .join("");
}

function setStoredAuthIntent(intent = "") {
  cloudState.authIntent = String(intent || "").trim();
  if (!cloudState.authIntent) {
    localStorage.removeItem(AUTH_INTENT_STORAGE_KEY);
    return;
  }

  localStorage.setItem(
    AUTH_INTENT_STORAGE_KEY,
    JSON.stringify({
      intent: cloudState.authIntent,
      updatedAt: Date.now(),
    }),
  );
}

function getStoredAuthIntent() {
  if (cloudState.authIntent) {
    return cloudState.authIntent;
  }

  try {
    const raw = localStorage.getItem(AUTH_INTENT_STORAGE_KEY);
    if (!raw) {
      return "";
    }
    const parsed = JSON.parse(raw);
    const intent = String(parsed?.intent || "").trim();
    cloudState.authIntent = intent;
    return intent;
  } catch (error) {
    console.warn("Failed to read auth intent:", error);
    return "";
  }
}

function clearStoredAuthIntent() {
  cloudState.authIntent = "";
  localStorage.removeItem(AUTH_INTENT_STORAGE_KEY);
}

function buildAuthRedirectUrl() {
  const url = new URL(window.location.href);
  ["code", "type"].forEach((key) => {
    url.searchParams.delete(key);
  });
  url.hash = "";
  return `${url.origin}${url.pathname}${url.search}`;
}

function toggleEmailAuthPanel(panel, isVisible) {
  if (!panel) {
    return;
  }
  panel.hidden = !isVisible;
}

function getPreferredAuthFocusTargetId() {
  if (isOAuthProviderEnabled("google")) {
    return "settingsSignInGoogleButton";
  }
  if (isMagicLinkEnabled()) {
    settingsEmailAuthVisible = true;
    return "settingsAuthEmailInput";
  }
  return "settingsAccountBackupPanel";
}

function hasLocalLearningData() {
  return Boolean(state.decks.length || state.cards.length || state.reviewLog.length);
}

function shouldPromptProfileCompletion() {
  return isCloudSignedIn() && !String(cloudState.profile?.display_name || "").trim();
}

function classifyAuthError(error, provider = "") {
  const message = String(error?.message || "").trim();
  const normalized = message.toLowerCase();
  if (normalized.includes("provider") && (normalized.includes("disabled") || normalized.includes("not enabled"))) {
    return {
      kind: "provider-disabled",
      provider,
      message: `${getAuthProviderLabel(provider)} ログインはまだ Supabase 側で有効化されていません。`,
    };
  }
  if (
    normalized.includes("redirect") ||
    normalized.includes("callback") ||
    normalized.includes("redirect_uri") ||
    normalized.includes("site url")
  ) {
    return {
      kind: "redirect-misconfigured",
      provider,
      message: `${getAuthProviderLabel(provider)} ログインの戻り先URL設定を確認してください。Supabase Auth の Site URL / Redirect URLs に本番URLを入れ直してください。`,
    };
  }
  return {
    kind: "request-failed",
    provider,
    message: message || `${getAuthProviderLabel(provider)} でのログインに失敗しました。`,
  };
}

function translateAuthErrorMessage(error, provider = "") {
  return classifyAuthError(error, provider).message;
}

function buildBackupFingerprint(snapshotState = state) {
  return JSON.stringify({
    decks: snapshotState.decks || [],
    cards: snapshotState.cards || [],
    reviewLog: snapshotState.reviewLog || [],
    assistant: snapshotState.assistant || {},
    settings: snapshotState.settings || {},
  });
}

function buildBackupSummary(snapshotState = state, assets = []) {
  const decks = Array.isArray(snapshotState.decks) ? snapshotState.decks : [];
  const cards = Array.isArray(snapshotState.cards) ? snapshotState.cards : [];
  const reviewLog = Array.isArray(snapshotState.reviewLog) ? snapshotState.reviewLog : [];
  const imageCount = cards.reduce((sum, card) => sum + (card.frontMedia || []).length + (card.backMedia || []).length, 0);
  const sharedDeckCount = decks.filter((deck) => deck.storageMode === "shared").length;
  const lastDeckUpdate = decks.reduce((max, deck) => Math.max(max, Number(deck.updatedAt || deck.createdAt || 0)), 0);
  const lastCardUpdate = cards.reduce((max, card) => Math.max(max, Number(card.updatedAt || card.createdAt || 0)), 0);
  const lastReviewUpdate = reviewLog.reduce((max, entry) => Math.max(max, Number(entry.timestamp || 0)), 0);
  const lastActivityAt = Math.max(lastDeckUpdate, lastCardUpdate, lastReviewUpdate, Date.now());

  return {
    deckCount: decks.length,
    cardCount: cards.length,
    reviewLogCount: reviewLog.length,
    imageCount,
    assetCount: Array.isArray(assets) ? assets.length : 0,
    sharedDeckCount,
    lastActivityAt,
    fingerprint: buildBackupFingerprint(snapshotState),
  };
}

function normalizeBackupSnapshotRow(row = {}) {
  const summary = row.summary_json && typeof row.summary_json === "object" ? row.summary_json : {};
  return {
    id: String(row.id || "").trim(),
    kind: ["auto", "manual", "pre_restore"].includes(String(row.kind || "")) ? String(row.kind) : "manual",
    snapshotVersion: Number(row.snapshot_version || BACKUP_SNAPSHOT_VERSION),
    storagePath: String(row.storage_path || "").trim(),
    isLatest: Boolean(row.is_latest),
    summary: {
      deckCount: Number(summary.deckCount || 0),
      cardCount: Number(summary.cardCount || 0),
      reviewLogCount: Number(summary.reviewLogCount || 0),
      imageCount: Number(summary.imageCount || 0),
      assetCount: Number(summary.assetCount || 0),
      sharedDeckCount: Number(summary.sharedDeckCount || 0),
      lastActivityAt: Number(summary.lastActivityAt || 0),
      fingerprint: String(summary.fingerprint || "").trim(),
    },
    sourceDevice: String(row.source_device || "").trim(),
    createdAt: parseCloudTimestamp(row.created_at),
    updatedAt: parseCloudTimestamp(row.updated_at),
  };
}

function getSourceDeviceLabel() {
  const pieces = [];
  const platform = String(navigator.platform || "").trim();
  if (platform) {
    pieces.push(platform);
  }
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
    pieces.push("iPhone/iPad");
  } else if (/mac/i.test(navigator.userAgent)) {
    pieces.push("Mac");
  }
  if (/safari/i.test(navigator.userAgent) && !/chrome|crios|android/i.test(navigator.userAgent)) {
    pieces.push("Safari");
  }
  return [...new Set(pieces)].join(" / ") || "この端末";
}

async function buildBackupSnapshotPayload() {
  const snapshotState = normalizeState(clone(state));
  const assets = await collectBackupAssets();
  const summary = buildBackupSummary(snapshotState, assets);
  return {
    exportedAt: new Date().toISOString(),
    version: BACKUP_SNAPSHOT_VERSION,
    state: snapshotState,
    assets,
    backupMeta: {
      summary,
      sourceDevice: getSourceDeviceLabel(),
      includesSharedDecks: true,
    },
  };
}

async function fetchCloudConfig() {
  if (cloudState.config) {
    return cloudState.config;
  }

  try {
    const response = await fetch(CLOUD_CONFIG_ENDPOINT, { cache: "no-store" });
    if (!response.ok) {
      cloudState.configError = `/api/client-config が HTTP ${response.status} を返しました`;
      cloudState.config = {};
      return cloudState.config;
    }

    const config = await response.json();
    cloudState.configError = "";
    cloudState.config = {
      supabaseUrl: config && config.supabaseUrl ? String(config.supabaseUrl) : "",
      supabaseAnonKey: config && config.supabaseAnonKey ? String(config.supabaseAnonKey) : "",
      authGoogleEnabled: config?.authGoogleEnabled !== false,
      authMagicLinkEnabled: config?.authMagicLinkEnabled !== false,
      aiEnabled: Boolean(config?.aiEnabled),
      aiProvider: String(config?.aiProvider || "gemini"),
      aiModel: String(config?.aiModel || "gemini-2.5-flash-lite"),
    };
    return cloudState.config;
  } catch (error) {
    console.warn("Failed to load cloud config:", error);
    cloudState.configError = error.message || "client-config を取得できませんでした";
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

  cloudState.client.auth.onAuthStateChange((event, session) => {
    cloudState.session = session;
    cloudState.lastSessionUserId = session?.user?.id || "";
    if (session?.user?.email) {
      syncAuthEmailInputs(session.user.email, "cloud");
    }
    if (session?.user) {
      ensureCloudProfile().catch((error) => {
        console.warn("Failed to ensure profile:", error);
      });
    }
    refreshCloudData({ silent: true }).catch((error) => {
      console.warn("Failed to refresh cloud data:", error);
    });
    refreshCloudBackups({ silent: true }).catch((error) => {
      console.warn("Failed to refresh cloud backups:", error);
    });
    if (session?.user && (event === "SIGNED_IN" || Boolean(getStoredAuthIntent()))) {
      handleSuccessfulCloudSignIn(event).catch((error) => {
        console.warn("Failed to handle post-login flow:", error);
      });
    }
    renderSharePanel();
    renderSettingsPanel();
  });

  return cloudState.client;
}

async function initializeCloud() {
  const url = new URL(window.location.href);
  cloudState.shareToken = String(url.searchParams.get(CLOUD_SHARE_PARAM) || "").trim();
  const localShareParam = String(url.searchParams.get(LOCAL_SHARE_PARAM) || "").trim();
  cloudState.copyToken = String(url.searchParams.get(COPY_SHARE_PARAM) || "").trim();
  renderSharePanel();

  if (localShareParam) {
    await previewLocalShare(localShareParam);
  }
  if (cloudState.copyToken) {
    await previewCopyPackage(cloudState.copyToken);
  }

  const client = await getSupabaseClient();
  if (!client) {
    cloudState.status = "local-only";
    if (cloudState.shareToken) {
      shareJoinTitle.textContent = "共有デッキに参加";
      shareJoinStatus.textContent =
        "この共有リンクを使うには、まず Vercel に SUPABASE_URL / SUPABASE_ANON_KEY を設定し、そのあと設定の「アカウント保存」でログインしてください。";
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
  cloudState.lastSessionUserId = session?.user?.id || "";
  if (session?.user) {
    await ensureCloudProfile();
    if (session.user.email) {
      syncAuthEmailInputs(session.user.email, "cloud");
    }
  }

  await refreshCloudData({ silent: true });
  await refreshCloudBackups({ silent: true });
  if (session?.user && getStoredAuthIntent()) {
    await handleSuccessfulCloudSignIn("SIGNED_IN");
  }
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
    setBackupReadinessIssue(classifyBackupError(error));
    cloudState.profile = payload;
    return payload;
  }

  clearBackupReadinessIssueUnless("missing-profiles-table");
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
      permissions: normalizePermissionMap(row.permissions, row.role),
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

function buildCloudEventMap(eventRows = []) {
  return eventRows.reduce((collection, row) => {
    const deckId = String(row.deck_id || "").trim();
    if (!deckId) {
      return collection;
    }
    if (!Array.isArray(collection[deckId])) {
      collection[deckId] = [];
    }
    collection[deckId].push({
      id: String(row.id || "").trim(),
      deckId,
      actorUserId: String(row.actor_user_id || "").trim(),
      actorEmail: String(row.actor_email || "").trim(),
      eventType: String(row.event_type || "").trim(),
      eventLabel: formatShareEventLabel(row.event_type),
      entityType: String(row.entity_type || "").trim(),
      entityLabel: formatShareEntityLabel(row.entity_type),
      entityId: String(row.entity_id || "").trim(),
      summary: String(row.summary || "").trim(),
      meta: row.meta_json && typeof row.meta_json === "object" ? row.meta_json : {},
      createdAt: parseCloudTimestamp(row.created_at),
    });
    return collection;
  }, {});
}

function normalizeNotificationRow(row = {}) {
  const meta = row.meta_json && typeof row.meta_json === "object" ? row.meta_json : {};
  return {
    id: String(row.id || "").trim(),
    userId: String(row.user_id || "").trim(),
    deckId: String(row.deck_id || "").trim(),
    deckName: String(meta.deckName || "").trim(),
    type: String(row.notification_type || "").trim(),
    title: String(row.title || "").trim(),
    body: String(row.body || "").trim(),
    meta,
    readAt: parseCloudTimestamp(row.read_at),
    createdAt: parseCloudTimestamp(row.created_at),
  };
}

function buildCloudLockMap(rows = []) {
  return rows.reduce((collection, row) => {
    const targetType = String(row.target_type || "").trim();
    const targetId = String(row.target_id || "").trim();
    if (!targetType || !targetId) {
      return collection;
    }
    const key = getShareLockKey(targetType, targetId);
    collection[key] = {
      id: String(row.id || "").trim(),
      deckId: String(row.deck_id || "").trim(),
      targetType,
      targetId,
      holderUserId: String(row.holder_user_id || "").trim(),
      holderEmail: String(row.holder_email || "").trim(),
      expiresAt: parseCloudTimestamp(row.expires_at),
      updatedAt: parseCloudTimestamp(row.updated_at),
      isCurrentUser: row.holder_user_id === cloudState.session?.user?.id,
    };
    return collection;
  }, {});
}

function formatShareEventLabel(eventType = "") {
  const labels = {
    deck_created: "デッキ共有開始",
    deck_updated: "デッキ更新",
    card_added: "カード追加",
    card_updated: "カード更新",
    card_deleted: "カード削除",
    media_updated: "画像更新",
    share_link_regenerated: "共有リンク再発行",
    request_created: "参加申請",
    request_approved: "参加承認",
    request_rejected: "参加拒否",
    role_changed: "ロール変更",
    permissions_changed: "権限変更",
    member_removed: "メンバー除外",
    member_left: "共有から退出",
    copy_link_refreshed: "コピーリンク更新",
  };
  return labels[String(eventType || "").trim()] || "共有更新";
}

function formatShareEntityLabel(entityType = "") {
  const labels = {
    deck: "デッキ",
    card: "カード",
    media: "画像",
    member: "メンバー",
    request: "申請",
    share: "共有",
    copy_package: "コピーリンク",
  };
  return labels[String(entityType || "").trim()] || "";
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
  deck.permissions = normalizePermissionMap({}, "owner");
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
    cloudState.notifications = [];
    cloudState.deckEventsByDeck = {};
    cloudState.editLocksByDeck = {};
    renderSharePanel();
    return;
  }

  if (!cloudState.session?.user) {
    cloudState.status = "signed-out";
    cloudState.pendingRequests = [];
    cloudState.membersByDeck = {};
    cloudState.notifications = [];
    cloudState.deckEventsByDeck = {};
    cloudState.editLocksByDeck = {};
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
      .select("role, permissions, deck_id, shared_decks(id, name, focus, subject, description, share_token, owner_id, created_at, updated_at)")
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
              permissions: normalizePermissionMap(row.permissions, row.role),
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

    const mediaResponse = sharedDeckIds.length
      ? await client.from("shared_card_media").select("*").in("deck_id", sharedDeckIds).order("sort_index", { ascending: true })
      : { data: [], error: null };
    if (mediaResponse.error) {
      throw mediaResponse.error;
    }

    const progressResponse = sharedDeckIds.length
      ? await client.from("user_card_progress").select("*").eq("user_id", userId).in("deck_id", sharedDeckIds)
      : { data: [], error: null };
    if (progressResponse.error) {
      throw progressResponse.error;
    }

    const memberResponse = sharedDeckIds.length
      ? await client.from("deck_members").select("id, deck_id, user_id, role, permissions, created_at").in("deck_id", sharedDeckIds)
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

    const eventResponse = sharedDeckIds.length
      ? await client.from("shared_deck_events").select("*").in("deck_id", sharedDeckIds).order("created_at", { ascending: false }).limit(240)
      : { data: [], error: null };
    if (eventResponse.error) {
      throw eventResponse.error;
    }

    const notificationResponse = await client
      .from("user_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(SHARE_NOTIFICATION_LIMIT);
    if (notificationResponse.error) {
      throw notificationResponse.error;
    }

    const lockResponse = sharedDeckIds.length
      ? await client.from("shared_edit_locks").select("*").in("deck_id", sharedDeckIds).gt("expires_at", new Date().toISOString())
      : { data: [], error: null };
    if (lockResponse.error) {
      throw lockResponse.error;
    }

    detachUnavailableSharedDecks(sharedDeckIds);
    mergeCloudDecks(memberships, cardsResponse.data || [], mediaResponse.data || [], progressResponse.data || []);
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
    cloudState.deckEventsByDeck = buildCloudEventMap(eventResponse.data || []);
    cloudState.notifications = (notificationResponse.data || []).map((row) => normalizeNotificationRow(row));
    cloudState.editLocksByDeck = buildCloudLockMap(lockResponse.data || []);
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

function mergeCloudDecks(sharedDecks, sharedCards, sharedCardMedia, progressRows) {
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
      permissions: normalizePermissionMap(sharedDeck.permissions, sharedDeck.role || existingDeck?.role || "viewer"),
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
      const mediaRows = (sharedCardMedia || [])
        .filter((row) => row.shared_card_id === cardRow.id)
        .sort((left, right) => left.side.localeCompare(right.side) || Number(left.sort_index || 0) - Number(right.sort_index || 0));
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
        frontMedia: mediaRows
          .filter((row) => row.side === "front")
          .map((row) => ({
            assetId: row.asset_id || crypto.randomUUID(),
            name: row.name || "画像",
            mimeType: row.mime_type || "",
            size: Number(row.size || 0),
            width: Number(row.width || 0),
            height: Number(row.height || 0),
            source: "shared",
            sharedPath: row.storage_path || "",
            sharedMediaId: row.id,
            publicUrl: getSharedMediaPublicUrl(row.storage_path || ""),
          })),
        backMedia: mediaRows
          .filter((row) => row.side === "back")
          .map((row) => ({
            assetId: row.asset_id || crypto.randomUUID(),
            name: row.name || "画像",
            mimeType: row.mime_type || "",
            size: Number(row.size || 0),
            width: Number(row.width || 0),
            height: Number(row.height || 0),
            source: "shared",
            sharedPath: row.storage_path || "",
            sharedMediaId: row.id,
            publicUrl: getSharedMediaPublicUrl(row.storage_path || ""),
          })),
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

function buildSharedMediaStoragePath(deck, card, media, side, index) {
  const safeName = String(media.name || "image")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || "image";
  return `${deck.sharedDeckId}/${card.sharedCardId}/${side}/${index + 1}-${media.assetId}-${safeName}`;
}

async function buildSharedCardMediaRows(client, deck) {
  const rows = [];
  for (const card of state.cards.filter((item) => item.deckId === deck.id)) {
    const sideEntries = [
      ["front", normalizeCardMediaList(card.frontMedia || [])],
      ["back", normalizeCardMediaList(card.backMedia || [])],
    ];

    for (const [side, mediaItems] of sideEntries) {
      for (const [index, media] of mediaItems.entries()) {
        const nextMedia = normalizeCardMediaItem(media);
        if (!nextMedia.sharedMediaId) {
          nextMedia.sharedMediaId = crypto.randomUUID();
        }
        if (!nextMedia.sharedPath) {
          nextMedia.sharedPath = buildSharedMediaStoragePath(deck, card, nextMedia, side, index);
        }
        let blob = await getMediaBlob(nextMedia.assetId);
        if (!blob && (nextMedia.publicUrl || nextMedia.sharedPath)) {
          const remoteUrl = getSharedMediaPublicUrl(nextMedia.sharedPath, nextMedia.publicUrl);
          if (remoteUrl) {
            const response = await fetch(remoteUrl);
            if (response.ok) {
              blob = await response.blob();
              await putMediaBlob(nextMedia.assetId, blob);
            }
          }
        }
        if (blob) {
          const { error: uploadError } = await client.storage.from(SHARED_MEDIA_BUCKET).upload(nextMedia.sharedPath, blob, {
            upsert: true,
            contentType: nextMedia.mimeType || blob.type || "image/*",
          });
          if (uploadError) {
            throw uploadError;
          }
        }
        nextMedia.source = "shared";
        nextMedia.publicUrl = getSharedMediaPublicUrl(nextMedia.sharedPath);
        rows.push({
          id: nextMedia.sharedMediaId,
          shared_card_id: card.sharedCardId,
          deck_id: deck.sharedDeckId,
          side,
          asset_id: nextMedia.assetId,
          name: nextMedia.name || "画像",
          mime_type: nextMedia.mimeType || "",
          size: Number(nextMedia.size || 0),
          width: Number(nextMedia.width || 0),
          height: Number(nextMedia.height || 0),
          storage_path: nextMedia.sharedPath,
          sort_index: index,
          updated_at: new Date(card.updatedAt || Date.now()).toISOString(),
        });
        if (side === "front") {
          card.frontMedia[index] = nextMedia;
        } else {
          card.backMedia[index] = nextMedia;
        }
      }
    }
  }
  return rows;
}

function buildSharedCardPayload(deck, card, orderIndex) {
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
    order_index: Number.isFinite(orderIndex) ? orderIndex : 0,
    updated_at: new Date(card.updatedAt || Date.now()).toISOString(),
  };
}

async function buildSharedCardMediaRowsForCard(client, deck, card) {
  const rows = [];
  const sideEntries = [
    ["front", normalizeCardMediaList(card.frontMedia || [])],
    ["back", normalizeCardMediaList(card.backMedia || [])],
  ];

  for (const [side, mediaItems] of sideEntries) {
    for (const [index, media] of mediaItems.entries()) {
      const nextMedia = normalizeCardMediaItem(media);
      if (!nextMedia.sharedMediaId) {
        nextMedia.sharedMediaId = crypto.randomUUID();
      }
      if (!nextMedia.sharedPath) {
        nextMedia.sharedPath = buildSharedMediaStoragePath(deck, card, nextMedia, side, index);
      }
      let blob = await getMediaBlob(nextMedia.assetId);
      if (!blob && (nextMedia.publicUrl || nextMedia.sharedPath)) {
        const remoteUrl = getSharedMediaPublicUrl(nextMedia.sharedPath, nextMedia.publicUrl);
        if (remoteUrl) {
          const response = await fetch(remoteUrl);
          if (response.ok) {
            blob = await response.blob();
            await putMediaBlob(nextMedia.assetId, blob);
          }
        }
      }
      if (blob) {
        const { error: uploadError } = await client.storage.from(SHARED_MEDIA_BUCKET).upload(nextMedia.sharedPath, blob, {
          upsert: true,
          contentType: nextMedia.mimeType || blob.type || "image/*",
        });
        if (uploadError) {
          throw uploadError;
        }
      }
      nextMedia.source = "shared";
      nextMedia.publicUrl = getSharedMediaPublicUrl(nextMedia.sharedPath);
      rows.push({
        id: nextMedia.sharedMediaId,
        shared_card_id: card.sharedCardId,
        deck_id: deck.sharedDeckId,
        side,
        asset_id: nextMedia.assetId,
        name: nextMedia.name || "画像",
        mime_type: nextMedia.mimeType || "",
        size: Number(nextMedia.size || 0),
        width: Number(nextMedia.width || 0),
        height: Number(nextMedia.height || 0),
        storage_path: nextMedia.sharedPath,
        sort_index: index,
        updated_at: new Date(card.updatedAt || Date.now()).toISOString(),
      });
      if (side === "front") {
        card.frontMedia[index] = nextMedia;
      } else {
        card.backMedia[index] = nextMedia;
      }
    }
  }

  return rows;
}

async function syncSharedCardMediaForCard(client, deck, card) {
  const existingMediaResponse = await client
    .from("shared_card_media")
    .select("id, storage_path")
    .eq("deck_id", deck.sharedDeckId)
    .eq("shared_card_id", card.sharedCardId);
  if (existingMediaResponse.error) {
    throw existingMediaResponse.error;
  }

  const mediaRows = await buildSharedCardMediaRowsForCard(client, deck, card);
  const nextMediaIds = new Set(mediaRows.map((row) => row.id));
  const staleMediaRows = (existingMediaResponse.data || []).filter((row) => !nextMediaIds.has(row.id));
  if (staleMediaRows.length) {
    const stalePaths = staleMediaRows.map((row) => row.storage_path).filter(Boolean);
    const { error: deleteMediaRowError } = await client
      .from("shared_card_media")
      .delete()
      .in("id", staleMediaRows.map((row) => row.id));
    if (deleteMediaRowError) {
      throw deleteMediaRowError;
    }
    if (stalePaths.length) {
      await client.storage.from(SHARED_MEDIA_BUCKET).remove(stalePaths);
    }
  }

  if (mediaRows.length) {
    const { error: upsertMediaError } = await client.from("shared_card_media").upsert(mediaRows);
    if (upsertMediaError) {
      throw upsertMediaError;
    }
  }
}

async function syncSharedDeckMeta(deck, { eventType = "deck_updated", summary = "" } = {}) {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client || !cloudState.session?.user) {
    throw new Error("共有機能を使うにはログインが必要です");
  }
  if (!deck?.sharedDeckId) {
    throw new Error("共有デッキIDがありません");
  }
  if (!canEditDeckMeta(deck)) {
    throw new Error("この共有デッキの情報は更新できません");
  }

  const { error } = await client
    .from("shared_decks")
    .update({
      name: deck.name,
      focus: deck.focus,
      subject: deck.subject,
      description: deck.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", deck.sharedDeckId);
  if (error) {
    throw error;
  }

  deck.syncState = "synced";
  await appendSharedDeckEvent(deck, eventType, summary || `「${deck.name}」のデッキ情報を更新しました`, {
    entityType: "deck",
    entityId: deck.sharedDeckId,
  });
}

async function syncSharedDeckCardOrder(client, deck) {
  const rows = state.cards
    .filter((card) => card.deckId === deck.id && card.sharedCardId)
    .sort((left, right) => left.createdAt - right.createdAt)
    .map((card, index) => ({
      id: card.sharedCardId,
      deck_id: deck.sharedDeckId,
      order_index: index,
      updated_at: new Date(card.updatedAt || Date.now()).toISOString(),
    }));

  if (!rows.length) {
    return;
  }

  const { error } = await client.from("shared_cards").upsert(rows);
  if (error) {
    throw error;
  }
}

async function upsertSharedCardForDeck(deck, card, { eventType = "card_updated", summary = "" } = {}) {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client || !cloudState.session?.user) {
    throw new Error("共有機能を使うにはログインが必要です");
  }
  if (!deck?.sharedDeckId) {
    throw new Error("共有デッキIDがありません");
  }
  if (card.sharedCardId && !canEditCardsInDeck(deck) && !canAddCardsToDeck(deck)) {
    throw new Error("この共有デッキのカードは更新できません");
  }
  if (!card.sharedCardId && !canAddCardsToDeck(deck)) {
    throw new Error("この共有デッキにはカードを追加できません");
  }

  const orderIndex = state.cards
    .filter((item) => item.deckId === deck.id)
    .sort((left, right) => left.createdAt - right.createdAt)
    .findIndex((item) => item.id === card.id);
  const payload = buildSharedCardPayload(deck, card, orderIndex);
  const { error } = await client.from("shared_cards").upsert(payload);
  if (error) {
    throw error;
  }
  await syncSharedCardMediaForCard(client, deck, card);
  await syncSharedDeckCardOrder(client, deck);
  deck.syncState = "synced";
  await syncSharedDeckProgress(deck.id);
  await appendSharedDeckEvent(deck, eventType, summary || `カード「${formatCardFrontLabel(card)}」を更新しました`, {
    entityType: "card",
    entityId: card.sharedCardId,
  });
}

async function deleteSharedCardFromCloud(deck, card, { summary = "" } = {}) {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client || !cloudState.session?.user) {
    throw new Error("共有機能を使うにはログインが必要です");
  }
  if (!deck?.sharedDeckId || !card?.sharedCardId) {
    return;
  }
  if (!canDeleteCardsFromDeck(deck)) {
    throw new Error("この共有デッキのカードは削除できません");
  }

  const { error } = await client.from("shared_cards").delete().eq("id", card.sharedCardId);
  if (error) {
    throw error;
  }

  await syncSharedDeckCardOrder(client, deck);
  deck.syncState = "synced";
  await appendSharedDeckEvent(deck, "card_deleted", summary || `カード「${formatCardFrontLabel(card)}」を削除しました`, {
    entityType: "card",
    entityId: card.sharedCardId,
  });
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

  const existingMediaResponse = await client.from("shared_card_media").select("id, storage_path").eq("deck_id", deck.sharedDeckId);
  if (existingMediaResponse.error) {
    deck.syncState = "dirty";
    throw existingMediaResponse.error;
  }

  const mediaRows = await buildSharedCardMediaRows(client, deck);
  const nextMediaIds = new Set(mediaRows.map((row) => row.id));
  const staleMediaRows = (existingMediaResponse.data || []).filter((row) => !nextMediaIds.has(row.id));
  if (staleMediaRows.length) {
    const stalePaths = staleMediaRows.map((row) => row.storage_path).filter(Boolean);
    const { error: deleteMediaRowError } = await client.from("shared_card_media").delete().in("id", staleMediaRows.map((row) => row.id));
    if (deleteMediaRowError) {
      deck.syncState = "dirty";
      throw deleteMediaRowError;
    }
    if (stalePaths.length) {
      await client.storage.from(SHARED_MEDIA_BUCKET).remove(stalePaths);
    }
  }

  if (mediaRows.length) {
    const { error: upsertMediaError } = await client.from("shared_card_media").upsert(mediaRows);
    if (upsertMediaError) {
      deck.syncState = "dirty";
      throw upsertMediaError;
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
  if (hasDeckMedia(deck.id)) {
    throw new Error("画像付きデッキはリンク共有できません。Supabase共有かJSONバックアップを使ってください");
  }
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
  if (!canUseLocalShare(deck)) {
    throw new Error("画像付きデッキはリンク共有できません。Supabase共有かJSONバックアップを使ってください");
  }
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

async function importLocalSharedDeck(payload) {
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

  const assets = Array.isArray(payload.assets) ? payload.assets : [];
  for (const asset of assets) {
    if (!asset?.assetId || !asset?.dataUrl) {
      continue;
    }
    await putMediaBlob(String(asset.assetId), dataUrlToBlob(String(asset.dataUrl)));
  }

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
        frontMedia: normalizeCardMediaList(card.frontMedia || []).map((media) => ({
          ...normalizeCardMediaItem(media),
          sharedMediaId: "",
          sharedPath: "",
          publicUrl: "",
          source: "local",
        })),
        backMedia: normalizeCardMediaList(card.backMedia || []).map((media) => ({
          ...normalizeCardMediaItem(media),
          sharedMediaId: "",
          sharedPath: "",
          publicUrl: "",
          source: "local",
        })),
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

function buildCopyShareUrl(token) {
  return `${window.location.origin}${window.location.pathname}?${COPY_SHARE_PARAM}=${encodeURIComponent(token)}`;
}

function clearCopyShareQuery() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(COPY_SHARE_PARAM)) {
    return;
  }
  url.searchParams.delete(COPY_SHARE_PARAM);
  history.replaceState({}, "", `${url.pathname}${url.search}`);
}

async function buildDeckCopyPackagePayload(deck) {
  const cards = [];
  const assets = [];
  const seenAssets = new Set();
  const deckCards = state.cards
    .filter((card) => card.deckId === deck.id)
    .slice()
    .sort((left, right) => left.createdAt - right.createdAt);

  for (const card of deckCards) {
    const serializeMedia = async (items = []) => {
      const safeItems = [];
      for (const media of normalizeCardMediaList(items)) {
        const safeMedia = normalizeCardMediaItem(media);
        safeItems.push({
          assetId: safeMedia.assetId,
          name: safeMedia.name || "画像",
          mimeType: safeMedia.mimeType || "",
          size: Number(safeMedia.size || 0),
          width: Number(safeMedia.width || 0),
          height: Number(safeMedia.height || 0),
          source: "local",
          sharedPath: "",
          sharedMediaId: "",
        });

        if (safeMedia.assetId && !seenAssets.has(safeMedia.assetId)) {
          const blob = await getExportableMediaBlob(safeMedia);
          if (blob) {
            assets.push({
              assetId: safeMedia.assetId,
              name: safeMedia.name || "画像",
              mimeType: safeMedia.mimeType || blob.type || "image/*",
              size: safeMedia.size || blob.size,
              dataUrl: await blobToDataUrl(blob),
            });
            seenAssets.add(safeMedia.assetId);
          }
        }
      }
      return safeItems;
    };

    cards.push({
      front: card.front,
      back: card.back,
      hint: card.hint || "",
      topic: card.topic || "",
      tags: card.tags || [],
      note: card.note || "",
      example: card.example || "",
      frontMedia: await serializeMedia(card.frontMedia || []),
      backMedia: await serializeMedia(card.backMedia || []),
    });
  }

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    mode: "cloud-copy-package",
    deck: {
      name: deck.name,
      focus: deck.focus,
      subject: deck.subject,
      description: deck.description,
    },
    cards,
    assets,
  };
}

async function createOrRefreshCopyPackage(deck) {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client || !cloudState.session?.user) {
    throw new Error("画像込みコピーリンクにはログインが必要です");
  }
  if (!deck?.sharedDeckId) {
    throw new Error("共有デッキを選んでください");
  }
  if (!canPublishDeckCopyLink(deck)) {
    throw new Error("この共有デッキのコピーリンクは発行できません");
  }

  const payload = await buildDeckCopyPackagePayload(deck);
  const summary = buildBackupSummary(
    {
      decks: [deck],
      cards: state.cards.filter((card) => card.deckId === deck.id),
      reviewLog: [],
    },
    payload.assets,
  );
  const existingResponse = await client
    .from("shared_copy_packages")
    .select("id, storage_path")
    .eq("deck_id", deck.sharedDeckId)
    .eq("is_active", true);
  if (existingResponse.error) {
    throw existingResponse.error;
  }

  const existingRows = existingResponse.data || [];
  if (existingRows.length) {
    const stalePaths = existingRows.map((row) => String(row.storage_path || "").trim()).filter(Boolean);
    if (stalePaths.length) {
      await client.storage.from(COPY_PACKAGE_BUCKET).remove(stalePaths);
    }
    const { error: deleteError } = await client.from("shared_copy_packages").delete().in("id", existingRows.map((row) => row.id));
    if (deleteError) {
      throw deleteError;
    }
  }

  const token = crypto.randomUUID();
  const storagePath = `${deck.sharedDeckId}/${token}.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const { error: uploadError } = await client.storage.from(COPY_PACKAGE_BUCKET).upload(storagePath, blob, {
    upsert: false,
    contentType: "application/json",
  });
  if (uploadError) {
    throw uploadError;
  }

  const { error: insertError } = await client.from("shared_copy_packages").insert({
    deck_id: deck.sharedDeckId,
    created_by: cloudState.session.user.id,
    token,
    storage_path: storagePath,
    summary_json: {
      ...summary,
      deckName: deck.name,
      focus: deck.focus,
      subject: deck.subject,
    },
    is_active: true,
  });
  if (insertError) {
    throw insertError;
  }

  await appendSharedDeckEvent(deck, "copy_link_refreshed", `画像込みコピーリンクを更新しました`, {
    entityType: "copy_package",
    entityId: token,
  });
  return buildCopyShareUrl(token);
}

async function readCopyPackagePayload(token) {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client) {
    throw new Error("コピーリンクを開くには Supabase 設定が必要です");
  }

  const { data, error } = await client.rpc("get_copy_package_preview", {
    target_token: token,
  });
  if (error) {
    throw error;
  }

  const preview = Array.isArray(data) ? data[0] : data;
  if (!preview?.storage_path) {
    throw new Error("コピーリンクが見つかりません");
  }

  const publicUrl = client.storage.from(COPY_PACKAGE_BUCKET).getPublicUrl(preview.storage_path).data.publicUrl;
  if (!publicUrl) {
    throw new Error("コピーリンクのファイルを取得できません");
  }

  const response = await fetch(publicUrl);
  if (!response.ok) {
    throw new Error("コピーリンクの内容を読み込めませんでした");
  }

  return {
    preview,
    payload: await response.json(),
  };
}

async function previewCopyPackage(token) {
  try {
    const { preview, payload } = await readCopyPackagePayload(token);
    cloudState.joinMode = "copy";
    cloudState.copySharePayload = payload;
    setShareJoinRoleVisibility(false);
    shareJoinTitle.textContent = `${preview.deck_name || payload.deck?.name || "共有デッキ"} を追加`;
    shareJoinStatus.textContent = `${payload.cards?.length || 0}枚のカードと ${payload.assets?.length || 0} 件の画像を、この端末のローカルデッキへ追加できます。`;
    requestShareAccessButton.disabled = false;
    requestShareAccessButton.textContent = "自分のアプリに追加する";
    shareJoinModal.hidden = false;
  } catch (error) {
    cloudState.joinMode = "copy";
    cloudState.copySharePayload = null;
    setShareJoinRoleVisibility(false);
    shareJoinTitle.textContent = "コピーリンクを開けませんでした";
    shareJoinStatus.textContent = error.message || "コピーリンクの読み込みに失敗しました。";
    requestShareAccessButton.disabled = true;
    requestShareAccessButton.textContent = "自分のアプリに追加する";
    shareJoinModal.hidden = false;
  }
}

async function copyDeckPackageLink() {
  let deck = getSelectedShareDeck();
  if (!deck) {
    showToast("コピーリンクを作るデッキを選んでください");
    return;
  }

  if (deck.storageMode !== "shared") {
    await shareDeck();
    deck = getSelectedShareDeck();
  }

  if (!deck || deck.storageMode !== "shared") {
    showToast("先に共有デッキ化してください");
    return;
  }

  try {
    const link = await createOrRefreshCopyPackage(deck);
    try {
      await navigator.clipboard.writeText(link);
      showToast("画像込みコピーリンクをコピーしました");
    } catch (error) {
      window.prompt("このリンクをコピーしてください", link);
    }
    await refreshCloudData({ silent: true });
  } catch (error) {
    showToast(error.message || "画像込みコピーリンクの作成に失敗しました");
  }
}

async function appendSharedDeckEvent(deck, eventType, summary, { entityType = "deck", entityId = "", meta = {} } = {}) {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client || !cloudState.session?.user || !deck?.sharedDeckId) {
    return;
  }

  const payload = {
    deck_id: deck.sharedDeckId,
    actor_user_id: cloudState.session.user.id,
    actor_email: String(cloudState.session.user.email || cloudState.profile?.email || "").trim(),
    event_type: eventType,
    entity_type: entityType,
    entity_id: String(entityId || deck.sharedDeckId),
    summary: String(summary || "").trim(),
    meta_json: {
      ...meta,
      deckName: deck.name,
    },
  };

  const { error } = await client.from("shared_deck_events").insert(payload);
  if (error) {
    console.warn("Failed to append shared deck event:", error);
  }
}

async function markNotificationsRead(notificationId = "") {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client || !cloudState.session?.user) {
    return;
  }

  let query = client
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", cloudState.session.user.id)
    .is("read_at", null);
  if (notificationId) {
    query = query.eq("id", notificationId);
  }
  const { error } = await query;
  if (error) {
    throw error;
  }
  await refreshCloudData({ silent: true });
}

async function updateDeckMemberPermissions(deckId, memberId, permissionKey, enabled) {
  const deck = getDeckById(deckId);
  const client = cloudState.client || (await getSupabaseClient());
  if (!deck || !canManageMembers(deck) || !client) {
    throw new Error("この共有デッキの権限は変更できません");
  }

  const member = getDeckShareMembers(deck).find((entry) => entry.id === memberId);
  if (!member || member.role === "owner") {
    return;
  }

  const nextPermissions = normalizePermissionMap(
    {
      ...getMemberPermissionMap(member),
      [permissionKey]: Boolean(enabled),
    },
    member.role,
  );
  const { error } = await client.from("deck_members").update({ permissions: nextPermissions }).eq("id", memberId);
  if (error) {
    throw error;
  }

  await appendSharedDeckEvent(deck, "permissions_changed", `${formatShareMemberName(member)} の権限を更新しました`, {
    entityType: "member",
    entityId: memberId,
    meta: {
      permissionKey,
      enabled: Boolean(enabled),
      targetUserId: member.userId,
      targetEmail: member.email,
    },
  });
  await refreshCloudData({ silent: true });
}

function handleShareMemberPermissionChanges(event) {
  const toggle = event.target.closest("[data-toggle-member-permission]");
  if (!toggle) {
    return;
  }

  updateDeckMemberPermissions(
    toggle.dataset.deckId,
    toggle.dataset.toggleMemberPermission,
    toggle.dataset.permissionKey,
    toggle.checked,
  ).catch((error) => {
    console.warn("Failed to update member permissions:", error);
    showToast(error.message || "権限の更新に失敗しました");
  });
}

function syncAuthEmailInputs(value, source = "") {
  const nextValue = String(value || "").trim();
  if (source !== "share" && authEmailInput && authEmailInput.value !== nextValue) {
    authEmailInput.value = nextValue;
  }
  if (source !== "settings" && settingsAuthEmailInput && settingsAuthEmailInput.value !== nextValue) {
    settingsAuthEmailInput.value = nextValue;
  }
}

async function applyStoredAuthIntent() {
  const intent = getStoredAuthIntent();
  if (!intent || !isCloudSignedIn()) {
    return;
  }

  if (intent === "share" || intent === "share-join") {
    setCreateMode("share");
    switchSection("manage");
    if (cloudState.shareToken) {
      await refreshShareJoinPreview();
    }
  } else {
    switchSection("settings");
  }

  if (intent === "restore") {
    focusFeatureTarget("settingsBackupSnapshotList");
  } else if (intent === "onboarding") {
    focusFeatureTarget(getPreferredAuthFocusTargetId());
  } else if (intent === "share-join") {
    focusFeatureTarget("requestShareAccessButton");
  } else {
    focusFeatureTarget(getPreferredAuthFocusTargetId());
  }

  clearStoredAuthIntent();
}

async function maybeCreateInitialCloudBackup({ isFreshSignIn = false } = {}) {
  if (!isCloudSignedIn() || !hasLocalLearningData()) {
    return;
  }
  if (getMostRecentBackupSnapshot()) {
    return;
  }
  if (!isFreshSignIn && state.settings?.autoBackupEnabled === false) {
    return;
  }

  await createCloudBackupSnapshot({ kind: "auto", showToast: false });
  showToast("この端末の内容を最初のクラウドバックアップとして保存しました");
}

async function handleSuccessfulCloudSignIn(event = "SIGNED_IN") {
  if (!isCloudSignedIn()) {
    return;
  }

  clearCloudAuthIssue();

  if (shouldPromptProfileCompletion() && settingsProfileDisplayNameInput && !settingsProfileDisplayNameInput.value) {
    settingsProfileDisplayNameInput.value = String(cloudState.profile?.email || cloudState.session?.user?.email || "")
      .split("@")[0]
      .trim();
  }

  await applyStoredAuthIntent();

  if (event === "SIGNED_IN") {
    await maybeCreateInitialCloudBackup({ isFreshSignIn: true }).catch((error) => {
      console.warn("Failed to create initial cloud backup:", error);
    });
    const provider = String(cloudState.session?.user?.app_metadata?.provider || "").trim();
    if (provider) {
      showToast(`${getAuthProviderLabel(provider)} でログインしました`);
    }
  }

  renderSharePanel();
  renderSettingsPanel();
}

async function signInWithProvider(provider, intent = "settings-backup") {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client) {
    showToast("先に Supabase の設定を追加してください");
    return;
  }
  if (!isOAuthProviderEnabled(provider)) {
    showToast(`${getAuthProviderLabel(provider)} ログインはまだ有効化されていません`);
    return;
  }

  setStoredAuthIntent(intent);
  const redirectTo = buildAuthRedirectUrl();
  const options = {
    redirectTo,
  };
  if (provider === "google") {
    options.queryParams = {
      prompt: "select_account",
    };
  }

  const { data, error } = await client.auth.signInWithOAuth({
    provider,
    options,
  });

  if (error) {
    const issue = classifyAuthError(error, provider);
    setCloudAuthIssue(issue.kind, issue.message, issue.provider);
    renderSharePanel();
    renderSettingsPanel();
    showToast(issue.message);
    return;
  }

  clearCloudAuthIssue();
  if (data?.url) {
    window.location.assign(data.url);
  }
}

async function sendMagicLink(emailValue = "") {
  const email = String(emailValue || settingsAuthEmailInput?.value || authEmailInput?.value || "").trim();
  const client = cloudState.client || (await getSupabaseClient());

  if (!client) {
    showToast("先に Supabase の設定を追加してください");
    return;
  }
  if (!isMagicLinkEnabled()) {
    showToast("メールログインは現在オフになっています");
    return;
  }
  if (!email) {
    showToast("メールアドレスを入力してください");
    return;
  }

  syncAuthEmailInputs(email, "cloud");
  setStoredAuthIntent(cloudState.shareToken ? "share-join" : activeSection === "manage" ? "share" : "settings-backup");
  const redirectUrl = buildAuthRedirectUrl();
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    const issue = classifyAuthError(error, "email");
    setCloudAuthIssue(issue.kind, issue.message, issue.provider);
    renderSharePanel();
    renderSettingsPanel();
    showToast(issue.message || "マジックリンク送信に失敗しました");
    return;
  }

  clearCloudAuthIssue();
  showToast("メールを送信しました。初回でもそのままアカウントが作成され、リンクからこのアプリへ戻れます");
  settingsEmailAuthVisible = true;
  shareEmailAuthVisible = true;
  renderSharePanel();
  renderSettingsPanel();
}

async function saveProfileDisplayName() {
  const client = cloudState.client || (await getSupabaseClient());
  const displayName = String(settingsProfileDisplayNameInput?.value || "").trim();
  if (!client || !isCloudSignedIn()) {
    showToast("表示名を保存するにはログインが必要です");
    return;
  }
  if (!displayName) {
    showToast("表示名を入力してください");
    return;
  }

  const { data, error } = await client
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", cloudState.session.user.id)
    .select("*")
    .single();

  if (error) {
    showToast(error.message || "表示名の保存に失敗しました");
    return;
  }

  cloudState.profile = data || {
    ...(cloudState.profile || {}),
    display_name: displayName,
  };
  renderSharePanel();
  renderSettingsPanel();
  showToast("表示名を保存しました");
}

async function signOutCloud() {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client) {
    return;
  }

  await releaseAllEditLocks().catch((error) => {
    console.warn("Failed to release edit locks on sign out:", error);
  });
  await client.auth.signOut();
  cloudState.session = null;
  cloudState.profile = null;
  cloudState.pendingRequests = [];
  cloudState.membersByDeck = {};
  cloudState.notifications = [];
  cloudState.deckEventsByDeck = {};
  cloudState.editLocksByDeck = {};
  cloudState.backupSnapshots = [];
  cloudState.backupStatus = "signed-out";
  cloudState.backupError = "";
  clearBackupReadinessIssue();
  cloudState.latestBackupAt = 0;
  cloudState.lastBackupFingerprint = "";
  cloudState.backupDirty = false;
  cloudState.lastSessionUserId = "";
  shareEmailAuthVisible = false;
  settingsEmailAuthVisible = false;
  clearCloudAuthIssue();
  clearStoredAuthIntent();
  if (cloudState.backupTimer) {
    window.clearTimeout(cloudState.backupTimer);
    cloudState.backupTimer = null;
  }
  render();
  showToast("アカウントからログアウトしました");
}

function clearCloudBackupTimer() {
  if (cloudState.backupTimer) {
    window.clearTimeout(cloudState.backupTimer);
    cloudState.backupTimer = null;
  }
}

function handleAutoBackupToggle() {
  state.settings.autoBackupEnabled = Boolean(settingsAutoBackupCheckbox?.checked);
  persist({ skipCloudBackup: !state.settings.autoBackupEnabled });
  if (!state.settings.autoBackupEnabled) {
    clearCloudBackupTimer();
  } else {
    markCloudBackupDirty({ immediate: true });
  }
  render();
  showToast(state.settings.autoBackupEnabled ? "自動バックアップを有効にしました" : "自動バックアップをオフにしました");
}

function handleBackupSnapshotActions(event) {
  const restoreButton = event.target.closest("[data-restore-backup-id]");
  if (!restoreButton) {
    return;
  }

  restoreCloudBackupSnapshot(restoreButton.dataset.restoreBackupId).catch((error) => {
    console.warn("Failed to restore cloud backup:", error);
    showToast(error.message || "バックアップの復元に失敗しました");
  });
}

function handleDocumentVisibilityChange() {
  if (state.settings?.autoBackupEnabled === false) {
    return;
  }
  if (document.visibilityState === "hidden") {
    flushPendingCloudBackup({ showToast: false }).catch((error) => {
      console.warn("Failed to flush backup on visibility change:", error);
    });
  }
}

function handlePageHide() {
  if (state.settings?.autoBackupEnabled === false) {
    releaseAllEditLocks().catch((error) => {
      console.warn("Failed to release edit locks on page hide:", error);
    });
    return;
  }
  releaseAllEditLocks().catch((error) => {
    console.warn("Failed to release edit locks on page hide:", error);
  });
  flushPendingCloudBackup({ showToast: false }).catch((error) => {
    console.warn("Failed to flush backup on page hide:", error);
  });
}

function markCloudBackupDirty({ immediate = false } = {}) {
  const fingerprint = buildBackupFingerprint();
  const isFresh = Boolean(fingerprint && fingerprint === cloudState.lastBackupFingerprint);
  cloudState.backupDirty = !isFresh;

  if (!isCloudConfigured()) {
    cloudState.backupStatus = "unconfigured";
    render();
    return;
  }
  if (!isCloudSignedIn()) {
    cloudState.backupStatus = "signed-out";
    render();
    return;
  }
  if (isFresh) {
    cloudState.backupStatus = getLatestAutoBackupSnapshot() ? "synced" : "dirty";
    render();
    return;
  }

  cloudState.backupStatus = "dirty";
  render();

  if (state.settings?.autoBackupEnabled === false) {
    return;
  }

  clearCloudBackupTimer();
  if (immediate) {
    flushPendingCloudBackup({ showToast: false }).catch((error) => {
      console.warn("Failed to run auto backup:", error);
    });
    return;
  }

  cloudState.backupTimer = window.setTimeout(() => {
    flushPendingCloudBackup({ showToast: false }).catch((error) => {
      console.warn("Failed to run debounced backup:", error);
    });
  }, BACKUP_AUTO_DEBOUNCE_MS);
}

async function refreshCloudBackups({ silent = false } = {}) {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client) {
    cloudState.backupSnapshots = [];
    cloudState.backupStatus = "unconfigured";
    cloudState.backupError = "";
    clearBackupReadinessIssue();
    cloudState.latestBackupAt = 0;
    cloudState.lastBackupFingerprint = "";
    render();
    return;
  }

  if (!cloudState.session?.user) {
    cloudState.backupSnapshots = [];
    cloudState.backupStatus = "signed-out";
    cloudState.backupError = "";
    clearBackupReadinessIssue();
    cloudState.latestBackupAt = 0;
    cloudState.lastBackupFingerprint = "";
    render();
    return;
  }

  try {
    const { data, error } = await client
      .from("user_backup_snapshots")
      .select("*")
      .eq("user_id", cloudState.session.user.id)
      .order("is_latest", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(BACKUP_RESTORE_POINT_LIMIT + 3);

    if (error) {
      throw error;
    }

    cloudState.backupSnapshots = (data || []).map((row) => normalizeBackupSnapshotRow(row));
    const latestAuto = getLatestAutoBackupSnapshot();
    const latestSnapshot = latestAuto || getMostRecentBackupSnapshot();
    cloudState.latestBackupAt = latestSnapshot ? latestSnapshot.createdAt || latestSnapshot.updatedAt : 0;
    cloudState.lastBackupFingerprint =
      latestAuto?.summary?.fingerprint || latestSnapshot?.summary?.fingerprint || cloudState.lastBackupFingerprint || "";
    cloudState.backupError = "";
    clearBackupReadinessIssueUnless("missing-profiles-table");

    if (cloudState.backupDirty) {
      cloudState.backupStatus = "dirty";
    } else {
      cloudState.backupStatus = latestSnapshot ? "synced" : "dirty";
    }

    render();

    if (state.settings?.autoBackupEnabled !== false && buildBackupFingerprint() !== cloudState.lastBackupFingerprint) {
      markCloudBackupDirty();
    }
  } catch (error) {
    const issue = classifyBackupError(error);
    cloudState.backupStatus = "error";
    cloudState.backupError = issue.text;
    setBackupReadinessIssue(issue);
    render();
    if (!silent) {
      showToast(cloudState.backupError);
    }
  }
}

async function trimRestorePointSnapshots(client, userId) {
  const { data, error } = await client
    .from("user_backup_snapshots")
    .select("id, storage_path")
    .eq("user_id", userId)
    .eq("is_latest", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const staleRows = (data || []).slice(BACKUP_RESTORE_POINT_LIMIT);
  if (!staleRows.length) {
    return;
  }

  const stalePaths = staleRows.map((row) => String(row.storage_path || "").trim()).filter(Boolean);
  if (stalePaths.length) {
    await client.storage.from(BACKUP_SNAPSHOT_BUCKET).remove(stalePaths);
  }

  const { error: deleteError } = await client.from("user_backup_snapshots").delete().in("id", staleRows.map((row) => row.id));
  if (deleteError) {
    throw deleteError;
  }
}

async function createCloudBackupSnapshot({ kind = "manual", showToast = true } = {}) {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client || !cloudState.session?.user) {
    throw new Error("アカウント保存を使うにはログインが必要です");
  }
  if (cloudState.backupReadinessIssue?.blocking) {
    throw new Error(cloudState.backupReadinessIssue.text);
  }
  if (cloudState.backupBusy) {
    return;
  }

  const isAuto = kind === "auto";
  const fingerprint = buildBackupFingerprint();
  if (isAuto && !cloudState.backupDirty && fingerprint === cloudState.lastBackupFingerprint) {
    cloudState.backupStatus = getLatestAutoBackupSnapshot() ? "synced" : "dirty";
    render();
    return;
  }

  clearCloudBackupTimer();
  cloudState.backupBusy = true;
  cloudState.backupStatus = "syncing";
  cloudState.backupError = "";
  clearBackupReadinessIssueUnless("missing-profiles-table");
  render();

  try {
    const snapshot = await buildBackupSnapshotPayload();
    const summary = snapshot.backupMeta?.summary || buildBackupSummary(snapshot.state, snapshot.assets || []);
    const userId = cloudState.session.user.id;
    let storagePath = `${userId}/${kind}/${Date.now()}-${crypto.randomUUID()}.json`;
    let targetId = crypto.randomUUID();

    if (isAuto) {
      const latestResponse = await client
        .from("user_backup_snapshots")
        .select("id, storage_path")
        .eq("user_id", userId)
        .eq("is_latest", true)
        .limit(1);
      if (latestResponse.error) {
        throw latestResponse.error;
      }
      const latestRow = latestResponse.data?.[0] || null;
      if (latestRow) {
        targetId = String(latestRow.id || targetId);
        storagePath = String(latestRow.storage_path || `${userId}/auto/latest.json`);
      } else {
        storagePath = `${userId}/auto/latest.json`;
      }
    }

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const { error: uploadError } = await client.storage.from(BACKUP_SNAPSHOT_BUCKET).upload(storagePath, blob, {
      upsert: isAuto,
      contentType: "application/json",
    });
    if (uploadError) {
      throw uploadError;
    }

    const rowPayload = {
      user_id: userId,
      kind,
      snapshot_version: snapshot.version || BACKUP_SNAPSHOT_VERSION,
      storage_path: storagePath,
      summary_json: summary,
      is_latest: isAuto,
      source_device: getSourceDeviceLabel(),
      updated_at: new Date().toISOString(),
    };

    if (isAuto) {
      const { error: clearLatestError } = await client
        .from("user_backup_snapshots")
        .update({ is_latest: false })
        .eq("user_id", userId)
        .eq("is_latest", true)
        .neq("id", targetId);
      if (clearLatestError) {
        throw clearLatestError;
      }

      const latestResponse = await client.from("user_backup_snapshots").select("id").eq("id", targetId).limit(1);
      if (latestResponse.error) {
        throw latestResponse.error;
      }

      if (latestResponse.data?.length) {
        const { error: updateError } = await client.from("user_backup_snapshots").update(rowPayload).eq("id", targetId);
        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } = await client.from("user_backup_snapshots").insert({
          id: targetId,
          created_at: new Date().toISOString(),
          ...rowPayload,
        });
        if (insertError) {
          throw insertError;
        }
      }
    } else {
      const { error: insertError } = await client.from("user_backup_snapshots").insert({
        id: targetId,
        created_at: new Date().toISOString(),
        ...rowPayload,
      });
      if (insertError) {
        throw insertError;
      }
      await trimRestorePointSnapshots(client, userId);
    }

    cloudState.backupDirty = false;
    cloudState.lastBackupFingerprint = summary.fingerprint || fingerprint;
    cloudState.latestBackupAt = Date.now();
    cloudState.backupStatus = "synced";
    cloudState.backupError = "";
    clearBackupReadinessIssueUnless("missing-profiles-table");
    await refreshCloudBackups({ silent: true });
    render();
    if (showToast) {
      showToast(kind === "manual" ? "アカウントへ手動バックアップしました" : "アカウントへバックアップしました");
    }
  } catch (error) {
    const issue = classifyBackupError(error);
    cloudState.backupStatus = "error";
    cloudState.backupError = issue.text;
    setBackupReadinessIssue(issue);
    render();
    if (showToast || !isAuto) {
      showToast(cloudState.backupError);
    }
    throw error;
  } finally {
    cloudState.backupBusy = false;
    render();
  }
}

async function flushPendingCloudBackup({ showToast = false } = {}) {
  if (!isCloudConfigured() || !isCloudSignedIn()) {
    return;
  }
  if (cloudState.backupReadinessIssue?.blocking) {
    return;
  }
  const fingerprint = buildBackupFingerprint();
  if (!cloudState.backupDirty && fingerprint === cloudState.lastBackupFingerprint) {
    return;
  }
  await createCloudBackupSnapshot({ kind: "auto", showToast });
}

async function readCloudBackupSnapshot(snapshot) {
  const client = cloudState.client || (await getSupabaseClient());
  if (!client || !snapshot?.storagePath) {
    throw new Error("バックアップファイルを読み込めません");
  }
  const { data, error } = await client.storage.from(BACKUP_SNAPSHOT_BUCKET).download(snapshot.storagePath);
  if (error) {
    throw error;
  }
  const text = await data.text();
  return JSON.parse(text);
}

async function applyStateSnapshot(snapshotPayload, { skipCloudBackup = false } = {}) {
  const nextState = normalizeState(snapshotPayload.state || snapshotPayload);
  if (!Array.isArray(nextState.decks) || !Array.isArray(nextState.cards)) {
    throw new Error("バックアップ形式が正しくありません");
  }

  const assets = Array.isArray(snapshotPayload.assets) ? snapshotPayload.assets : [];
  if (assets.length || state.cards.some((card) => hasCardMedia(card))) {
    await clearAllMediaAssets();
  }
  for (const asset of assets) {
    if (!asset?.assetId || !asset?.dataUrl) {
      continue;
    }
    await putMediaBlob(String(asset.assetId), dataUrlToBlob(String(asset.dataUrl)));
  }

  state = nextState;
  clearDeckEditing();
  clearCardEditing();
  clearEditWorkspaceCardEditing({ silent: true });
  currentCardId = null;
  isAnswerVisible = false;
  assistantErrorMessage = "";
  selectedDeckDetailId = "";
  deckDetailTab = "overview";
  shareLinkCache = "";
  clearImportDraft();
  clearQuestionMapDraft({ silent: true });
  clearAiStudyDraft({ silent: true });
  resetStudySession();
  persist({ skipCloudBackup });
  render();
}

async function restoreCloudBackupSnapshot(snapshotId) {
  const snapshot = cloudState.backupSnapshots.find((item) => item.id === snapshotId);
  if (!snapshot) {
    throw new Error("復元対象のバックアップが見つかりません");
  }

  const approved = window.confirm(
    `この端末の現在データを、${buildBackupSummaryText(snapshot.summary)} の保存状態へ置き換えます。\n保存日時: ${formatBackupDateTime(
      snapshot.createdAt || snapshot.updatedAt,
    )}\n復元前には現在データを安全退避します。続けますか？`,
  );
  if (!approved) {
    return;
  }

  await createCloudBackupSnapshot({ kind: "pre_restore", showToast: false });
  const payload = await readCloudBackupSnapshot(snapshot);
  await applyStateSnapshot(payload, { skipCloudBackup: true });
  cloudState.backupDirty = false;
  cloudState.backupStatus = "synced";
  cloudState.backupError = "";
  cloudState.lastBackupFingerprint = snapshot.summary?.fingerprint || buildBackupFingerprint();
  cloudState.latestBackupAt = snapshot.createdAt || snapshot.updatedAt || Date.now();
  await refreshCloudData({ silent: true });
  await refreshCloudBackups({ silent: true });
  showToast("クラウドバックアップからこの端末へ復元しました");
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
    let isNewSharedDeck = false;

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
          permissions: normalizePermissionMap({}, "owner"),
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
      deck.permissions = normalizePermissionMap({}, "owner");
      deck.syncState = "dirty";
      isNewSharedDeck = true;
    }

    await syncDeckToCloud(deck);
    if (isNewSharedDeck) {
      await appendSharedDeckEvent(deck, "deck_created", `共有デッキ「${deck.name}」を作成しました`, {
        entityType: "deck",
        entityId: deck.sharedDeckId,
      });
    }
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

  if (deck && !canUseLocalShare(deck)) {
    await copyDeckPackageLink();
    return;
  }

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
      const frontMedia = normalizeCardMediaList(card.frontMedia || []).map((media) => ({
        ...media,
        sharedMediaId: "",
        sharedPath: "",
        publicUrl: media.publicUrl || getSharedMediaPublicUrl(media.sharedPath || "", media.publicUrl || ""),
        source: "local",
      }));
      const backMedia = normalizeCardMediaList(card.backMedia || []).map((media) => ({
        ...media,
        sharedMediaId: "",
        sharedPath: "",
        publicUrl: media.publicUrl || getSharedMediaPublicUrl(media.sharedPath || "", media.publicUrl || ""),
        source: "local",
      }));
      state.cards.unshift(
        normalizeCard({
          ...clone(card),
          id: crypto.randomUUID(),
          deckId: newDeckId,
          createdAt: now + index,
          updatedAt: now + index,
          sharedCardId: "",
          frontMedia,
          backMedia,
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
      "このリンクを使うには Supabase の共有設定が必要です。まず Vercel に SUPABASE_URL / SUPABASE_ANON_KEY を入れ、そのあと設定の「アカウント保存」でログインしてください。";
    requestShareAccessButton.disabled = true;
    shareJoinModal.hidden = false;
    return;
  }

  if (!cloudState.session?.user) {
    shareJoinTitle.textContent = "共有デッキに参加";
    shareJoinStatus.textContent = "ログインすると、この共有リンクへの参加申請を送れます。設定で Google かメールから続けたあと、この画面に戻ります。";
    requestShareAccessButton.disabled = false;
    requestShareAccessButton.textContent = "ログインして参加";
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
    await importLocalSharedDeck(cloudState.localSharePayload);
    return;
  }

  if (cloudState.joinMode === "copy") {
    if (!cloudState.copySharePayload) {
      showToast("コピーリンクの内容を読み取れませんでした");
      return;
    }
    await importLocalSharedDeck(cloudState.copySharePayload);
    return;
  }

  if (!cloudState.shareToken) {
    showToast("共有リンクが見つかりません");
    return;
  }

  const client = cloudState.client || (await getSupabaseClient());
  if (!client || !cloudState.session?.user) {
    closeShareJoinModal();
    openAccountBackupSettings({ intent: "share-join" });
    showToast("先にログインすると、この共有リンクへの参加申請に戻れます");
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

  if (!deck || !canManageMembers(deck) || !client) {
    showToast("この共有デッキのロールは変更できません");
    return;
  }

  const member = getDeckShareMembers(deck).find((entry) => entry.id === memberId);
  if (!member || member.role === "owner" || member.role === safeRole) {
    return;
  }

  const { error } = await client
    .from("deck_members")
    .update({ role: safeRole, permissions: normalizePermissionMap({}, safeRole) })
    .eq("id", memberId);
  if (error) {
    showToast(error.message || "ロール変更に失敗しました");
    return;
  }

  await appendSharedDeckEvent(deck, "role_changed", `${formatShareMemberName(member)} を ${formatRoleLabel(safeRole)} に変更しました`, {
    entityType: "member",
    entityId: memberId,
    meta: {
      targetUserId: member.userId,
      targetEmail: member.email,
      nextRole: safeRole,
    },
  });
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
  const allowed = canManageMembers(deck) || removingSelf;
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

  await appendSharedDeckEvent(
    deck,
    removingSelf ? "member_left" : "member_removed",
    removingSelf ? "共有から抜けました" : `${formatShareMemberName(member)} を共有から外しました`,
    {
      entityType: "member",
      entityId: memberId,
      meta: {
        targetUserId: member.userId,
        targetEmail: member.email,
      },
    },
  );
  if (removingSelf) {
    detachDeckFromCloud(deck, "共有から抜けたためローカルコピーへ切り替え");
  }

  await refreshCloudData({ silent: true });
  showToast(removingSelf ? "共有から抜けてローカルコピーへ切り替えました" : "メンバーを共有から外しました");
}

async function regenerateShareLinkForDeck(deckId = "") {
  const deck = deckId ? getDeckById(deckId) : getSelectedShareDeck();
  const client = cloudState.client || (await getSupabaseClient());

  if (!deck || !canRegenerateDeckShareLink(deck) || !client || !cloudState.session?.user) {
    showToast("リンクを再発行する権限がありません");
    return;
  }

  const { data, error } = await client.rpc("regenerate_deck_share_link", {
    target_deck_id: deck.sharedDeckId,
  });
  if (error) {
    showToast(error.message || "リンク再発行に失敗しました");
    return;
  }

  deck.shareToken = String(data || "").trim();
  shareLinkCache = buildShareUrl(deck.shareToken);
  await appendSharedDeckEvent(deck, "share_link_regenerated", "共有リンクを再発行しました", {
    entityType: "share",
    entityId: deck.sharedDeckId,
  });
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

  if (deck.role === "owner") {
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

async function exportJsonBackup() {
  try {
    const snapshot = await buildBackupSnapshotPayload();
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
  } catch (error) {
    showToast(error.message || "JSON バックアップの書き出しに失敗しました");
  }
}

async function importJsonBackup(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    const approved = window.confirm("現在のローカルデータを、この JSON バックアップで置き換えます。続けますか？");
    if (!approved) {
      importJsonFileInput.value = "";
      return;
    }
    await applyStateSnapshot(parsed);
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
      autoBackupEnabled: true,
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
  frontMedia = [],
  backMedia = [],
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
    frontMedia: normalizeCardMediaList(frontMedia),
    backMedia: normalizeCardMediaList(backMedia),
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
    autoBackupEnabled: safeSettings.autoBackupEnabled !== false,
    quickCapture: {
      lastDeckId: String(safeSettings.quickCapture?.lastDeckId || "").trim(),
      lastTags: String(safeSettings.quickCapture?.lastTags || "").trim(),
      keepDeckContext: safeSettings.quickCapture?.keepDeckContext !== false,
      keepTemplate: safeSettings.quickCapture?.keepTemplate !== false,
    },
    studyPreferences: {
      defaultSpeedMode: ["recommended", "mistakes", "choice"].includes(String(safeSettings.studyPreferences?.defaultSpeedMode || ""))
        ? String(safeSettings.studyPreferences.defaultSpeedMode)
        : "recommended",
      defaultSessionMinutes: [5, 10, 20].includes(Number(safeSettings.studyPreferences?.defaultSessionMinutes))
        ? Number(safeSettings.studyPreferences.defaultSessionMinutes)
        : 5,
      autoRepeatMistakes: safeSettings.studyPreferences?.autoRepeatMistakes !== false,
      autoAdvance: safeSettings.studyPreferences?.autoAdvance !== false,
    },
  };
}

function normalizeDeckDefaults(defaults, focus) {
  const builtIn = buildFocusDeckDefaults(focus);
  const safeDefaults = defaults || {};
  const preferredCardStyle = ["balanced", "text-first", "image-first"].includes(String(safeDefaults.preferredCardStyle || ""))
    ? String(safeDefaults.preferredCardStyle)
    : builtIn.preferredCardStyle;
  return {
    defaultTopic: String(safeDefaults.defaultTopic || builtIn.defaultTopic || "").trim(),
    defaultTags: String(safeDefaults.defaultTags || builtIn.defaultTags || "").trim(),
    frontPromptTemplate: String(safeDefaults.frontPromptTemplate || builtIn.frontPromptTemplate || "").trim(),
    backPromptTemplate: String(safeDefaults.backPromptTemplate || builtIn.backPromptTemplate || "").trim(),
    preferredCardStyle,
  };
}

function buildFocusDeckDefaults(focus) {
  if (focus === "medical") {
    return {
      defaultTopic: "",
      defaultTags: "医学",
      frontPromptTemplate: "○○とは？",
      backPromptTemplate: "定義や要点を短く",
      preferredCardStyle: "balanced",
    };
  }

  if (focus === "english") {
    return {
      defaultTopic: "医学英語 / 語彙",
      defaultTags: "english, medical english",
      frontPromptTemplate: "単語・表現",
      backPromptTemplate: "意味と使い方",
      preferredCardStyle: "text-first",
    };
  }

  return {
    defaultTopic: "",
    defaultTags: "",
    frontPromptTemplate: "",
    backPromptTemplate: "",
    preferredCardStyle: "balanced",
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
  const focus = normalizeDeckFocus(safeDeck.focus);

  return {
    id: String(safeDeck.id || crypto.randomUUID()),
    name: String(safeDeck.name || "無題デッキ"),
    focus,
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
    defaults: normalizeDeckDefaults(safeDeck.defaults, focus),
    permissions: normalizePermissionMap(safeDeck.permissions, safeDeck.role),
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
    frontMedia: normalizeCardMediaList(card.frontMedia),
    backMedia: normalizeCardMediaList(card.backMedia),
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
