const STORAGE_KEY = "pulse-recall-state-v1";

const dayMs = 24 * 60 * 60 * 1000;
const hourMs = 60 * 60 * 1000;
const minuteMs = 60 * 1000;
const learningStepsMinutes = [10, 180];
const relearningStepsMinutes = [10, 360];
const PDFJS_MODULE_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4/legacy/build/pdf.mjs";
const PDFJS_WORKER_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4/legacy/build/pdf.worker.mjs";
const TRACKS = [
  {
    id: "medical",
    eyebrow: "Medical Track",
    title: "医学部コア学習",
    description: "解剖・生理・病態・臨床推論をテーマ別に回して、知識をつなげて定着させます。",
    recommendation: "解剖、生理、病態、症候のように階層を分けると医学系の復習効率が安定します。",
  },
  {
    id: "english",
    eyebrow: "English Track",
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
let editingDeckId = null;
let editingCardId = null;
let toastTimer = null;
let importDraft = null;
let pdfjsModulePromise = null;
let isAssistantLoading = false;

const tabs = [...document.querySelectorAll(".tab")];
const sections = [...document.querySelectorAll(".content")];
const statsGrid = document.getElementById("statsGrid");
const dueCount = document.getElementById("dueCount");
const heroTitle = document.getElementById("heroTitle");
const heroText = document.getElementById("heroText");
const quickSummary = document.getElementById("quickSummary");
const trackGrid = document.getElementById("trackGrid");
const deckCountLabel = document.getElementById("deckCountLabel");
const deckList = document.getElementById("deckList");
const historyChart = document.getElementById("historyChart");
const historySummary = document.getElementById("historySummary");
const historyBreakdown = document.getElementById("historyBreakdown");
const studyDeckFilter = document.getElementById("studyDeckFilter");
const assistantDeckFilter = document.getElementById("assistantDeckFilter");
const libraryDeckFilter = document.getElementById("libraryDeckFilter");
const cardDeckId = document.getElementById("cardDeckId");
const emptyState = document.getElementById("emptyState");
const flashcard = document.getElementById("flashcard");
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
const ratingButtons = Object.fromEntries(
  [...document.querySelectorAll("[data-rating]")].map((button) => [button.dataset.rating, button]),
);
const libraryList = document.getElementById("libraryList");
const toast = document.getElementById("toast");
const startReviewButton = document.getElementById("startReviewButton");
const seedDemoButton = document.getElementById("seedDemoButton");
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
const assistantMessages = document.getElementById("assistantMessages");
const assistantStatus = document.getElementById("assistantStatus");
const assistantForm = document.getElementById("assistantForm");
const assistantInput = document.getElementById("assistantInput");
const assistantSubmitButton = document.getElementById("assistantSubmitButton");
const assistantUseDeckContext = document.getElementById("assistantUseDeckContext");
const assistantUseWebSearch = document.getElementById("assistantUseWebSearch");
const clearAssistantButton = document.getElementById("clearAssistantButton");

bootstrap();

function bootstrap() {
  render();
  bindEvents();
  registerServiceWorker();
}

function bindEvents() {
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchSection(tab.dataset.section));
  });

  toggleAnswerButton.addEventListener("click", toggleAnswer);
  startReviewButton.addEventListener("click", () => {
    switchSection("study");
  });
  seedDemoButton.addEventListener("click", () => {
    state = normalizeState(clone(demoState));
    clearDeckEditing();
    clearCardEditing();
    persist();
    render();
    showToast("サンプルデータを復元しました");
  });

  deckForm.addEventListener("submit", handleDeckSubmit);
  cardForm.addEventListener("submit", handleCardSubmit);
  importForm.addEventListener("submit", handleImportSubmit);
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
    currentCardId = null;
    isAnswerVisible = false;
    renderStudy();
  });
  libraryDeckFilter.addEventListener("change", renderLibrary);
  cardDeckId.addEventListener("change", applyCardContextPlaceholders);
  deckFocusInput.addEventListener("change", applyDeckFocusPreset);
  importFocusInput.addEventListener("change", applyImportFocusPreset);
  importFileInput.addEventListener("change", syncImportDeckNameFromFile);
  saveImportButton.addEventListener("click", saveImportDraftAsDeck);
  clearImportDraftButton.addEventListener("click", clearImportDraft);
  assistantDeckFilter.addEventListener("change", handleAssistantSettingsChange);
  assistantUseDeckContext.addEventListener("change", handleAssistantSettingsChange);
  assistantUseWebSearch.addEventListener("change", handleAssistantSettingsChange);
  clearAssistantButton.addEventListener("click", clearAssistantHistory);

  document.querySelectorAll("[data-rating]").forEach((button) => {
    button.addEventListener("click", () => reviewCurrentCard(button.dataset.rating));
  });

  deckList.addEventListener("click", handleDeckActions);
  libraryList.addEventListener("click", handleLibraryActions);
  trackGrid.addEventListener("click", handleTrackActions);
  importPreview.addEventListener("click", handleImportPreviewActions);
  assistantMessages.addEventListener("click", handleAssistantActions);
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
  }
}

function render() {
  renderStats();
  renderDeckSelectors();
  renderForms();
  renderDashboard();
  renderTrackGrid();
  renderStudy();
  renderAssistant();
  renderLibrary();
}

function renderStats() {
  const stats = buildStats();
  dueCount.textContent = String(stats.dueCount);
  heroTitle.textContent = stats.dueCount > 0 ? "今日の復習が待っています" : "今日の復習は落ち着いています";
  heroText.textContent =
    stats.dueCount > 0
      ? `医学${stats.medicalDue}枚・英語${stats.englishDue}枚が復習待ちです。優先したいトラックから短く回しましょう。`
      : "復習待ちのカードはありません。医学と英語のデッキを整えて次の学習に備えられます。";
  quickSummary.textContent =
    stats.totalCards > 0
      ? `医学${stats.medicalCards}枚、英語${stats.englishCards}枚を管理中です。テーマ別に分けると復習の見通しが良くなります。`
      : "医学と英語のスターターを追加して、基礎の復習ルートから始めるのがおすすめです。";
  deckCountLabel.textContent = `${state.decks.length} decks`;

  statsGrid.innerHTML = stats.cards
    .map(
      (stat) => `
        <article class="stat-card">
          <span class="eyebrow">${escapeHtml(stat.label)}</span>
          <strong>${escapeHtml(String(stat.value))}</strong>
        </article>
      `,
    )
    .join("");
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
}

function renderForms() {
  syncDeckForm();
  syncCardForm();
  renderImportPanel();
  syncAssistantControls();
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

  if (!importDraft) {
    importStatus.textContent =
      "PDF または本文を入れると、自動でカード候補を作成します。スキャンPDFは文字抽出できないことがあります。";
    importPreview.innerHTML = `
      <article class="library-card">
        <h4>まだ自動生成の候補はありません</h4>
        <p class="muted">講義PDF、英語の資料、配布ノートを読み込むとここに候補が並びます。</p>
      </article>
    `;
    return;
  }

  importStatus.textContent = `${importDraft.sourceName} から ${importDraft.cards.length} 枚の候補を作成しました。内容を確認してから保存できます。`;
  importPreview.innerHTML = importDraft.cards
    .map(
      (card, index) => `
        <article class="library-card">
          <div class="card-row-header">
            <div>
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

function syncAssistantControls() {
  assistantUseDeckContext.checked = state.assistant.useDeckContext;
  assistantUseWebSearch.checked = state.assistant.useWebSearch;

  if (optionExists(assistantDeckFilter, state.assistant.deckFilter)) {
    assistantDeckFilter.value = state.assistant.deckFilter;
  }
}

function renderAssistant() {
  syncAssistantControls();
  assistantSubmitButton.disabled = isAssistantLoading;
  clearAssistantButton.disabled = isAssistantLoading;

  if (isAssistantLoading) {
    assistantStatus.textContent = "AIが回答を考えています。";
  }

  if (!state.assistant.messages.length) {
    if (!isAssistantLoading) {
      assistantStatus.textContent =
        "医学や英語の質問をすると、保存済みカードと必要ならWeb検索を使って回答します。";
    }
    assistantMessages.innerHTML = `
      <article class="assistant-message">
        <div class="assistant-message-header">
          <h4>AI検索の使い方</h4>
        </div>
        <p>例: 「ネフローゼ症候群の鑑別を3つに絞って」「administer と prescribe の違いを例文付きで」</p>
      </article>
    `;
    return;
  }

  const latestAssistant = [...state.assistant.messages].reverse().find((message) => message.role === "assistant");
  if (!isAssistantLoading) {
    assistantStatus.textContent = latestAssistant?.usedWebSearch
      ? "最新の回答ではWeb検索を使いました。リンク付きで確認できます。"
      : "最新の回答では、保存済みカードや会話履歴をもとに回答しています。";
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
                    `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(
                      source.title || source.url,
                    )}</a>`,
                )
                .join("")}
            </div>
          `
          : "";

      const actionMarkup =
        message.role === "assistant"
          ? `
            <div class="button-row">
              <button class="ghost-button" data-make-assistant-cards="${message.id}" type="button">回答からカード候補化</button>
            </div>
          `
          : "";

      return `
        <article class="assistant-message ${message.role}">
          <div class="assistant-message-header">
            <h4>${escapeHtml(message.role === "assistant" ? "AI" : "あなた")}</h4>
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
  const dueCounts = getDueCountByDeck();
  const canDeleteDeck = state.decks.length > 1;

  deckList.innerHTML = state.decks
    .map((deck) => {
      const cardCount = state.cards.filter((card) => card.deckId === deck.id).length;
      const due = dueCounts.get(deck.id) || 0;

      return `
        <article class="deck-card">
          <div class="deck-card-header">
            <div>
              <h4>${escapeHtml(deck.name)}</h4>
              <p class="muted">${escapeHtml(deck.description || "説明はまだありません")}</p>
            </div>
            <div class="button-row">
              <button class="chip-button" data-start-deck="${deck.id}" type="button">このデッキを学習</button>
              <button class="ghost-button" data-edit-deck="${deck.id}" type="button">編集</button>
              <button class="ghost-button danger-button" data-delete-deck="${deck.id}" type="button" ${canDeleteDeck ? "" : "disabled"}>
                削除
              </button>
            </div>
          </div>
          <div class="deck-card-meta">
            <span class="meta-pill ${escapeHtml(deck.focus)}">${escapeHtml(formatDeckFocus(deck.focus))}</span>
            ${deck.subject ? `<span class="meta-pill">${escapeHtml(deck.subject)}</span>` : ""}
            <span class="meta-pill">${cardCount} cards</span>
            <span class="meta-pill">${due} due</span>
          </div>
        </article>
      `;
    })
    .join("");

  renderHistoryPanel();
}

function renderTrackGrid() {
  trackGrid.innerHTML = TRACKS.map((track) => {
    const summary = buildTrackSummary(track.id);

    return `
      <article class="track-card ${track.id}">
        <div class="track-card-header">
          <div>
            <p class="eyebrow">${escapeHtml(track.eyebrow)}</p>
            <h3>${escapeHtml(track.title)}</h3>
          </div>
          <span class="meta-pill ${track.id}">${summary.deckCount} decks</span>
        </div>
        <p class="muted">${escapeHtml(track.description)}</p>
        <div class="track-stats">
          <div class="track-stat">
            <span class="eyebrow">Due</span>
            <strong>${summary.dueCount}</strong>
          </div>
          <div class="track-stat">
            <span class="eyebrow">Cards</span>
            <strong>${summary.cardCount}</strong>
          </div>
          <div class="track-stat">
            <span class="eyebrow">Focus</span>
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

function renderStudy() {
  const queue = getStudyQueue();
  const currentCard = pickCurrentCard(queue);
  const deck = currentCard ? getDeckById(currentCard.deckId) : null;

  emptyState.classList.toggle("is-hidden", Boolean(currentCard));
  flashcard.classList.toggle("is-hidden", !currentCard);

  if (!currentCard) {
    studyProgress.textContent = "復習待ちはありません。管理タブからカードを追加できます。";
    toggleAnswerButton.disabled = true;
    renderRatingHints(null);
    return;
  }

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
  studyProgress.textContent = `${queue.length}枚の復習待ちカードがあります。現在は${formatStudyMode(currentCard.study)}フェーズです。`;
  renderRatingHints(currentCard);
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

function renderLibrary() {
  const filter = libraryDeckFilter.value || "all";
  const items = state.cards.filter((card) => matchesCardFilter(card, filter));

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

      return `
        <article class="library-card">
          <div class="card-row-header">
            <div>
              <h4>${escapeHtml(card.front)}</h4>
              <p class="muted">${escapeHtml(card.back)}</p>
            </div>
            <div class="button-row">
              <button class="ghost-button" data-edit-card="${card.id}" type="button">編集</button>
              <button class="ghost-button danger-button" data-delete-card="${card.id}" type="button">削除</button>
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

    deck.name = name;
    deck.focus = normalizeDeckFocus(focus);
    deck.subject = subject;
    deck.description = description;
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

  const now = Date.now();

  if (cardId) {
    const card = getCardById(cardId);
    if (!card) {
      showToast("編集中のカードが見つかりません");
      clearCardEditing();
      render();
      return;
    }

    card.deckId = deckId;
    card.front = front;
    card.back = back;
    card.hint = hint;
    card.topic = topic;
    card.tags = tags;
    card.note = note;
    card.example = example;
    card.updatedAt = now;
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
  });

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

    renderImportPanel();
    showToast(`${importDraft.cards.length}枚の候補を作成しました`);
  } catch (error) {
    importDraft = null;
    renderImportPanel();
    importStatus.textContent = error.message || "資料の分析に失敗しました。";
    showToast(error.message || "資料の分析に失敗しました");
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
  assistantStatus.textContent = "AIが回答を考えています。";
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
      usedWebSearch: state.assistant.useWebSearch,
    });
    state.assistant.messages = state.assistant.messages.slice(-16);
    persist();
    renderAssistant();
    showToast("AIの回答を追加しました");
  } catch (error) {
    assistantStatus.textContent = error.message || "AI検索に失敗しました。";
    showToast(error.message || "AI検索に失敗しました");
  } finally {
    isAssistantLoading = false;
    renderAssistant();
  }
}

function handleDeckActions(event) {
  const startButton = event.target.closest("[data-start-deck]");
  if (startButton) {
    studyDeckFilter.value = startButton.dataset.startDeck;
    currentCardId = null;
    isAnswerVisible = false;
    switchSection("study");
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

function handleLibraryActions(event) {
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

function handleImportPreviewActions(event) {
  const removeButton = event.target.closest("[data-remove-import-card]");
  if (!removeButton || !importDraft) {
    return;
  }

  importDraft.cards = importDraft.cards.filter((card) => card.id !== removeButton.dataset.removeImportCard);

  if (!importDraft.cards.length) {
    clearImportDraft();
    showToast("候補がなくなったので下書きを消しました");
    return;
  }

  renderImportPanel();
  showToast("候補を1枚外しました");
}

function handleAssistantSettingsChange() {
  state.assistant.deckFilter = assistantDeckFilter.value || "all";
  state.assistant.useDeckContext = assistantUseDeckContext.checked;
  state.assistant.useWebSearch = assistantUseWebSearch.checked;
  persist();
  renderAssistant();
}

function clearAssistantHistory() {
  state.assistant.messages = [];
  persist();
  renderAssistant();
  showToast("AI検索の履歴を消しました");
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
    const deckName = buildDeckNameFromSource(`AI検索 ${formatDateKey(new Date())}`);
    importDraft = buildImportDraft({
      text: message.text,
      sourceName: "AI検索回答",
      deckName,
      focus,
      subject: focus === "medical" ? "AI要点整理" : focus === "english" ? "AI English Notes" : "AI要点整理",
      instructions: "AI検索の回答からカード候補化",
      limit: 12,
    });
    importFocusInput.value = focus;
    importDeckNameInput.value = deckName;
    switchSection("manage");
    render();
    showToast("AI回答からカード候補を作成しました");
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
  const deckId = crypto.randomUUID();
  const deckName = createUniqueDeckName(importDraft.deckName);
  const descriptionBase = importDraft.sourceName ? `${importDraft.sourceName} から自動生成` : "資料から自動生成";

  state.decks.unshift({
    id: deckId,
    name: deckName,
    focus: importDraft.focus,
    subject: importDraft.subject,
    description: importDraft.instructions ? `${descriptionBase} / ${importDraft.instructions}` : descriptionBase,
    createdAt: now,
  });

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
        }),
      );
    });

  const cardCount = importDraft.cards.length;
  clearImportDraft();
  persist();
  render();
  studyDeckFilter.value = deckId;
  libraryDeckFilter.value = deckId;
  cardDeckId.value = deckId;
  applyCardContextPlaceholders();
  showToast(`${deckName} を作成しました（${cardCount} cards）`);
}

async function requestAssistantAnswer(question) {
  const history = state.assistant.messages
    .slice(-9, -1)
    .map((message) => ({ role: message.role, text: message.text }));
  const deckContext = state.assistant.useDeckContext ? buildAssistantDeckContext(question, state.assistant.deckFilter) : "";
  const response = await fetch("/api/assistant-search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      history,
      useWebSearch: state.assistant.useWebSearch,
      deckContext,
      deckFilter: state.assistant.deckFilter,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "AI検索APIの呼び出しに失敗しました");
  }

  if (!payload.answer) {
    throw new Error("AIの回答が空でした");
  }

  return payload;
}

function buildAssistantDeckContext(question, filter) {
  const tokens = tokenizeSearchText(question);
  const cards = state.cards
    .filter((card) => matchesCardFilter(card, filter || "all"))
    .map((card) => ({ card, score: scoreCardAgainstTokens(card, tokens) }))
    .filter((item) => item.score > 0 || !tokens.length)
    .sort((a, b) => b.score - a.score || b.card.updatedAt - a.card.updatedAt)
    .slice(0, 12)
    .map(({ card }) => {
      const deck = getDeckById(card.deckId);
      return [
        `デッキ: ${deck?.name || "未分類"}`,
        deck?.subject ? `分野: ${deck.subject}` : "",
        card.topic ? `テーマ: ${card.topic}` : "",
        card.tags?.length ? `タグ: ${card.tags.join(", ")}` : "",
        `問題: ${card.front}`,
        `答え: ${card.back}`,
        card.note ? `補足: ${card.note}` : "",
        card.example ? `例: ${card.example}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    });

  return cards.join("\n\n---\n\n");
}

function tokenizeSearchText(text) {
  const matches = String(text || "").match(/[A-Za-z0-9+\-]+|[ぁ-んァ-ヶー一-龠]{2,}/g) || [];
  return [...new Set(matches.map((token) => token.toLowerCase()).filter((token) => token.length >= 2))];
}

function scoreCardAgainstTokens(card, tokens) {
  const haystack = [
    card.front,
    card.back,
    card.topic,
    card.note,
    card.example,
    ...(card.tags || []),
    getDeckName(card.deckId),
    getDeckById(card.deckId)?.subject || "",
  ]
    .join(" ")
    .toLowerCase();

  if (!tokens.length) {
    return haystack.length > 0 ? 1 : 0;
  }

  return tokens.reduce((score, token) => (haystack.includes(token) ? score + 1 : score), 0);
}

function startDeckEditing(deckId) {
  const deck = getDeckById(deckId);
  if (!deck) {
    showToast("デッキが見つかりません");
    return;
  }

  clearCardEditing();
  editingDeckId = deck.id;
  switchSection("manage");
  renderForms();
}

function startCardEditing(cardId) {
  const card = getCardById(cardId);
  if (!card) {
    showToast("カードが見つかりません");
    return;
  }

  clearDeckEditing();
  editingCardId = card.id;
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

  const cardIds = state.cards.filter((card) => card.deckId === deckId).map((card) => card.id);
  const approved = window.confirm(
    `「${deck.name}」を削除します。関連する${cardIds.length}枚のカードも削除されます。続けますか？`,
  );

  if (!approved) {
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

  state.cards = state.cards.filter((item) => item.id !== cardId);
  state.reviewLog = state.reviewLog.filter((entry) => entry.cardId !== cardId);

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
  importForm.reset();
  importLimitInput.value = "12";
  importFocusInput.value = "medical";
  applyImportFocusPreset();
  renderImportPanel();
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

  showToast(`${formatDeckFocus(focus)}スターターを追加しました（${addedDecks} deck / ${addedCards} cards）`);
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

async function extractTextFromPdf(file) {
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
  const pageTexts = [];
  const maxPages = Math.min(pdf.numPages, 24);

  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items ? buildPageText(textContent.items) : "";
    if (pageText.trim()) {
      pageTexts.push(pageText.trim());
    }
  }

  const merged = pageTexts.join("\n\n");
  if (!merged.trim()) {
    throw new Error("PDFから文字を抽出できませんでした。画像PDFの可能性があります");
  }

  return merged;
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
      useDeckContext: true,
      useWebSearch: true,
    },
  };
}

function makeCard({ id, deckId, front, back, hint, topic = "", tags = [], note = "", example = "", createdAt, dueAt, intervalDays }) {
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
      ? `直近7日で${history.totalAnswers}件回答・連続${history.streakDays}日`
      : "まだ履歴がありません";

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

  state.reviewLog.forEach((entry) => {
    const date = new Date(entry.timestamp);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString().slice(0, 10);
    countsByDay.set(key, (countsByDay.get(key) || 0) + 1);
    if (entry.rating in ratings) {
      ratings[entry.rating] += 1;
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
    maxCount: Math.max(0, ...days.map((day) => day.count)),
    streakDays,
  };
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
                  .filter((source) => source.url)
              : [],
            usedWebSearch: Boolean(message.usedWebSearch),
          }))
          .slice(-16)
      : [],
    deckFilter: String(safeAssistant.deckFilter || "all"),
    useDeckContext: safeAssistant.useDeckContext !== false,
    useWebSearch: safeAssistant.useWebSearch !== false,
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
