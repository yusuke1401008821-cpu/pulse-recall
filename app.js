const STORAGE_KEY = "pulse-recall-state-v1";

const dayMs = 24 * 60 * 60 * 1000;
const hourMs = 60 * 60 * 1000;
const minuteMs = 60 * 1000;
const learningStepsMinutes = [10, 180];
const relearningStepsMinutes = [10, 360];

const demoState = createDemoState();
let state = loadState();
let activeSection = "dashboard";
let currentCardId = null;
let isAnswerVisible = false;
let editingDeckId = null;
let editingCardId = null;
let toastTimer = null;

const tabs = [...document.querySelectorAll(".tab")];
const sections = [...document.querySelectorAll(".content")];
const statsGrid = document.getElementById("statsGrid");
const dueCount = document.getElementById("dueCount");
const heroTitle = document.getElementById("heroTitle");
const heroText = document.getElementById("heroText");
const quickSummary = document.getElementById("quickSummary");
const deckCountLabel = document.getElementById("deckCountLabel");
const deckList = document.getElementById("deckList");
const historyChart = document.getElementById("historyChart");
const historySummary = document.getElementById("historySummary");
const historyBreakdown = document.getElementById("historyBreakdown");
const studyDeckFilter = document.getElementById("studyDeckFilter");
const libraryDeckFilter = document.getElementById("libraryDeckFilter");
const cardDeckId = document.getElementById("cardDeckId");
const emptyState = document.getElementById("emptyState");
const flashcard = document.getElementById("flashcard");
const cardFront = document.getElementById("cardFront");
const cardBack = document.getElementById("cardBack");
const cardHint = document.getElementById("cardHint");
const cardDeckName = document.getElementById("cardDeckName");
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
const deckDescriptionInput = document.getElementById("deckDescription");
const cardFrontInput = document.getElementById("cardFrontInput");
const cardBackInput = document.getElementById("cardBackInput");
const cardHintInput = document.getElementById("cardHintInput");

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

  document.querySelectorAll("[data-rating]").forEach((button) => {
    button.addEventListener("click", () => reviewCurrentCard(button.dataset.rating));
  });

  deckList.addEventListener("click", handleDeckActions);
  libraryList.addEventListener("click", handleLibraryActions);
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
}

function render() {
  renderStats();
  renderDeckSelectors();
  renderForms();
  renderDashboard();
  renderStudy();
  renderLibrary();
}

function renderStats() {
  const stats = buildStats();
  dueCount.textContent = String(stats.dueCount);
  heroTitle.textContent = stats.dueCount > 0 ? "今日の復習が待っています" : "今日の復習は落ち着いています";
  heroText.textContent =
    stats.dueCount > 0
      ? `${stats.dueCount}枚のカードが復習待ちです。短く回して記憶を定着させましょう。`
      : "復習待ちのカードはありません。新しいカードを足して次の学習に備えられます。";
  quickSummary.textContent =
    stats.todayReviewed > 0
      ? `今日はすでに${stats.todayReviewed}回の回答を記録しました。流れを切らさず続けましょう。`
      : "最初はサンプルカードで感触をつかみ、必要なデッキを自分用に増やすのがおすすめです。";
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

  return {
    dueCount: dueCards.length,
    todayReviewed,
    cards: [
      { label: "総デッキ数", value: state.decks.length },
      { label: "総カード数", value: cards },
      { label: "今日の回答数", value: todayReviewed },
      { label: "7日以上に伸びた枚数", value: mastered },
    ],
  };
}

function renderDeckSelectors() {
  const previousStudy = studyDeckFilter.value || "all";
  const previousLibrary = libraryDeckFilter.value || "all";
  const previousCardDeck = cardDeckId.value;
  const allOption = '<option value="all">すべてのデッキ</option>';
  const deckOptions = state.decks
    .map((deck) => `<option value="${deck.id}">${escapeHtml(deck.name)}</option>`)
    .join("");

  studyDeckFilter.innerHTML = allOption + deckOptions;
  libraryDeckFilter.innerHTML = allOption + deckOptions;
  cardDeckId.innerHTML = deckOptions;

  if (optionExists(studyDeckFilter, previousStudy)) {
    studyDeckFilter.value = previousStudy;
  }

  if (optionExists(libraryDeckFilter, previousLibrary)) {
    libraryDeckFilter.value = previousLibrary;
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
}

function syncDeckForm() {
  const deck = getDeckById(editingDeckId);
  deckFormTitle.textContent = deck ? "デッキを編集" : "デッキを作る";
  deckSubmitButton.textContent = deck ? "デッキを更新" : "デッキを追加";
  cancelDeckEditButton.hidden = !deck;
  deckIdInput.value = deck?.id || "";
  deckNameInput.value = deck?.name || "";
  deckDescriptionInput.value = deck?.description || "";
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

  if (card && optionExists(cardDeckId, card.deckId)) {
    cardDeckId.value = card.deckId;
  }
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
            <span class="meta-pill">${cardCount} cards</span>
            <span class="meta-pill">${due} due</span>
          </div>
        </article>
      `;
    })
    .join("");

  renderHistoryPanel();
}

function renderStudy() {
  const queue = getStudyQueue();
  const currentCard = pickCurrentCard(queue);

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
  cardHint.textContent = currentCard.hint || "補足はありません";
  cardDeckName.textContent = `${getDeckName(currentCard.deckId)} · ${formatStudyMode(currentCard.study)}`;
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
  const items = state.cards.filter((card) => filter === "all" || card.deckId === filter);

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
          <div class="card-row-meta">
            <span class="meta-pill">${escapeHtml(getDeckName(card.deckId))}</span>
            <span class="meta-pill">${escapeHtml(formatStudyMode(card.study))}</span>
            <span class="meta-pill">次回 ${escapeHtml(nextReview)}</span>
            <span class="meta-pill">間隔 ${escapeHtml(formatInterval(card.study.intervalDays))}</span>
          </div>
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
}

function clearCardEditing() {
  editingCardId = null;
  cardForm.reset();
  cardIdInput.value = "";
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

function getStudyQueue() {
  const filter = studyDeckFilter.value || "all";
  const now = Date.now();

  return state.cards
    .filter((card) => (filter === "all" ? true : card.deckId === filter))
    .filter((card) => card.study.dueAt <= now)
    .sort((a, b) => a.study.dueAt - b.study.dueAt);
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
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  }
}

function createDemoState() {
  const now = Date.now();
  const englishDeckId = "deck-english";
  const historyDeckId = "deck-history";

  return {
    decks: [
      {
        id: englishDeckId,
        name: "英単語",
        description: "短い意味と例文で回す英語デッキ",
        createdAt: now - 6 * dayMs,
      },
      {
        id: historyDeckId,
        name: "日本史",
        description: "人物・年号・出来事を確認するデッキ",
        createdAt: now - 4 * dayMs,
      },
    ],
    cards: [
      makeCard({
        id: "card-1",
        deckId: englishDeckId,
        front: "abandon",
        back: "捨てる、断念する",
        hint: "ab = away のイメージ",
        createdAt: now - 5 * dayMs,
        dueAt: now - 2 * hourMs,
        intervalDays: 0,
      }),
      makeCard({
        id: "card-2",
        deckId: englishDeckId,
        front: "yield",
        back: "生み出す、屈する",
        hint: "文脈で意味が変わる動詞",
        createdAt: now - 3 * dayMs,
        dueAt: now - hourMs,
        intervalDays: 1,
      }),
      makeCard({
        id: "card-3",
        deckId: historyDeckId,
        front: "大化の改新は何年？",
        back: "645年",
        hint: "むしごろし",
        createdAt: now - 4 * dayMs,
        dueAt: now - 30 * 60 * 1000,
        intervalDays: 0,
      }),
      makeCard({
        id: "card-4",
        deckId: historyDeckId,
        front: "鎌倉幕府を開いた人物は？",
        back: "源頼朝",
        hint: "征夷大将軍に注目",
        createdAt: now - 2 * dayMs,
        dueAt: now + dayMs,
        intervalDays: 2,
      }),
    ],
    reviewLog: [],
  };
}

function makeCard({ id, deckId, front, back, hint, createdAt, dueAt, intervalDays }) {
  return {
    id,
    deckId,
    front,
    back,
    hint,
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
    decks: Array.isArray(rawState.decks) ? rawState.decks : [],
    cards: Array.isArray(rawState.cards) ? rawState.cards.map((card) => normalizeCard(card)) : [],
    reviewLog: Array.isArray(rawState.reviewLog) ? rawState.reviewLog : [],
  };
}

function normalizeCard(card) {
  return {
    ...card,
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function optionExists(select, value) {
  return [...select.options].some((option) => option.value === value);
}
