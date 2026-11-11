export const LESSON_ID = "youtube-de-3";
export const LANGUAGE_ID = "de";
export const TODAY_BASE = 10;
export const DAILY_GOAL = 50;
export const COINS_PER_KNOWN = 1;

const PASS_KEY = "lingq.accumulator.passed";
const PREFS_KEY = "lingq.accumulator.prefs";
const HINT_KEY = "lingq.accumulator.swipeSeen";

export const MOVE_STATUSES = [
  { id: "Ignored", label: "Ignored", menu: "Ignored", button: "Ignored" },
  { id: "New", label: "New", menu: "1 New", button: "New", numeral: "1" },
  { id: "Recognized", label: "Recognized", menu: "2 Recognized", button: "Recognized", numeral: "2" },
  { id: "Familiar", label: "Familiar", menu: "3 Familiar", button: "Familiar", numeral: "3" },
  { id: "Learned", label: "Learned", menu: "4 Learned", button: "Learned", numeral: "4" },
  { id: "Known", label: "Known", menu: "Known", button: "Known" },
];

export const LEAVE_BLUE = { id: "Leave Blue", label: "Leave Blue", menu: "Leave Blue", button: "Leave Blue" };

export function defaultPrefs() {
  return { autoMove: false, moveTo: "Known", splitDefault: "Known" };
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The prototype keeps working when storage is blocked.
  }
}

function clearStoredAccumulator() {
  try {
    localStorage.removeItem(PASS_KEY);
    localStorage.removeItem(PREFS_KEY);
    localStorage.removeItem(HINT_KEY);
  } catch {
    // The prototype keeps working when storage is blocked.
  }
}

clearStoredAccumulator();

export function loadPassed() {
  return [];
}

export function savePassed(keys, lessonId = LESSON_ID) {
  const stored = readJson(PASS_KEY) || {};
  stored[lessonId] = keys;
  writeJson(PASS_KEY, stored);
}

export function loadPrefs() {
  return defaultPrefs();
}

export function savePrefs(prefs, languageId = LANGUAGE_ID) {
  const stored = readJson(PREFS_KEY) || {};
  stored[languageId] = prefs;
  writeJson(PREFS_KEY, stored);
}

export function loadSwipeSeen() {
  return false;
}

export function saveSwipeSeen(seen) {
  writeJson(HINT_KEY, Boolean(seen));
}

export function clearAccumulatorDemo() {
  try {
    localStorage.removeItem(PASS_KEY);
    localStorage.removeItem(HINT_KEY);
  } catch {
    // Ignore a blocked storage write.
  }
}

export function coinsForStatus(status) {
  return status === "Known" ? COINS_PER_KNOWN : 0;
}

export function statusOption(id) {
  return MOVE_STATUSES.find((item) => item.id === id) || LEAVE_BLUE;
}

export function termsPassedLabel(count) {
  return `${count} blue ${count === 1 ? "term" : "terms"} passed`;
}

export function movedLabel(count, status) {
  const name = statusOption(status).button;
  return `${count} ${count === 1 ? "term" : "terms"} moved to ${name}`;
}

export function locateTerm(lesson, key, meaningsFor) {
  for (let paragraphIndex = 0; paragraphIndex < lesson.length; paragraphIndex += 1) {
    const paragraph = lesson[paragraphIndex];
    for (let tokenIndex = 0; tokenIndex < paragraph.length; tokenIndex += 1) {
      const token = paragraph[tokenIndex];
      if (token.type !== "word" || token.kind !== "new" || token.value.toLowerCase() !== key) continue;
      return {
        key,
        text: token.value,
        paragraphIndex,
        tokenIndex,
        meaning: (token.meanings || []).map((item) => String(item).trim()).filter(Boolean).join(" ; ")
          || token.meaning
          || meaningsFor(token.value).join(" ; "),
      };
    }
  }
  return null;
}

export function lessonWordStats(lesson) {
  const words = new Map();
  let read = 0;
  lesson.forEach((paragraph) => {
    paragraph.forEach((token) => {
      if (token.type !== "word") return;
      read += 1;
      const key = token.value.toLowerCase();
      if (!words.has(key)) words.set(key, token);
    });
  });
  let lingqs = 0;
  let known = 0;
  words.forEach((token) => {
    if (token.kind === "lingq") lingqs += 1;
    if (token.kind === "known") known += 1;
  });
  return { lingqs, known, read };
}
