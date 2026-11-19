const MEANINGS = {
  15: "fifteen",
  Aber: "but",
  Also: "so",
  Es: "it",
  Fall: ["case", "fall"],
  Fortschritte: "progress",
  Ja: "yes",
  Levels: "levels",
  Menge: "amount",
  Minuten: "minutes",
  Sätze: "sentences",
  Spaß: ["fun", "enjoyment"],
  Sprache: ["language", "speech"],
  Sprachen: "languages",
  Tag: "day",
  Tipps: "tips",
  Verfügung: "disposal",
  Wenn: "if",
  Wochenplan: "weekly schedule",
  Zeit: ["time", "era", "period"],
  allen: "all",
  auch: "also",
  aufwenden: "spend",
  aus: "from",
  beachten: "keep in mind",
  aber: "but",
  da: "there",
  dann: "then",
  dahingehend: "in that regard",
  das: "that",
  dass: "that",
  davon: "of that",
  dein: "your",
  den: "the",
  der: "the",
  die: "the",
  dir: "you",
  du: "you",
  eine: "a",
  ein: "a",
  erst: "first",
  erste: "first",
  erreichen: "reach",
  es: "it",
  für: "for",
  ganze: "whole",
  gar: "at all",
  gehen: "go",
  gleichzeitig: "at the same time",
  gut: ["good", "well"],
  gute: "good",
  hast: "have",
  ich: "I",
  in: "in",
  irgendwie: "somehow",
  ist: "is",
  ja: "yes",
  je: "per",
  jeden: "every",
  jetzt: ["now", "currently"],
  keiner: "no",
  kommen: ["come", "arrive"],
  kannst: "can",
  lernen: ["learn", "study"],
  lernst: "learn",
  macht: "makes",
  machen: ["do", "make"],
  machst: "make",
  mal: "time",
  man: "one",
  maximal: "at most",
  mehrere: "several",
  mehreren: "several",
  meine: "my",
  mit: "with",
  möglich: "possible",
  muss: "must",
  musst: "have to",
  möchtest: "would like",
  nachdem: "after",
  natürlich: "of course",
  nicht: "not",
  nur: "only",
  paar: "a few",
  sagen: ["say", "tell", "mean"],
  sind: "are",
  sowieso: "anyway",
  um: "in order to",
  und: "and",
  vielleicht: "maybe",
  voll: ["full", "busy"],
  vorhast: "intend",
  wahrscheinlich: "probably",
  weit: ["far", "a long way"],
  wenn: "if",
  wie: "how",
  willst: "want",
  wirklich: "really",
  wir: "we",
  wirst: "will",
  zehn: "ten",
  zu: "to",
  zur: "to the",
  würde: "would",
};

const EXTRA_GLOSSES = [
  "also",
  "in fact",
  "that is",
  "for instance",
  "as well",
  "indeed",
  "in other words",
  "on the other hand",
  "in particular",
  "above all",
  "for one thing",
  "in short",
];

function normalized(value) {
  return String(value || "").trim().toLowerCase();
}

function hashWord(word) {
  let hash = 0;
  const value = String(word || "");
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function listedMeanings(word) {
  const entry = MEANINGS[word];
  if (!entry) return [];
  return (Array.isArray(entry) ? entry : [entry]).map((item) => String(item).trim()).filter(Boolean);
}

function pushGloss(list, text, term) {
  const value = String(text || "").trim();
  const key = normalized(value);
  if (!value || key === normalized(term)) return;
  if (list.some((item) => normalized(item) === key)) return;
  list.push(value);
}

export function meaningChoices(word) {
  const choices = [];
  listedMeanings(word).forEach((item) => pushGloss(choices, item, word));
  const start = hashWord(word);
  let offset = 0;
  while (choices.length < 4 && offset < EXTRA_GLOSSES.length) {
    pushGloss(choices, EXTRA_GLOSSES[(start + offset) % EXTRA_GLOSSES.length], word);
    offset += 1;
  }
  return choices;
}

export function distinctMeanings(items, term, count) {
  const list = [];
  items.forEach((item) => pushGloss(list, item, term));
  const start = hashWord(term);
  let offset = 0;
  while (list.length < count && offset < EXTRA_GLOSSES.length) {
    pushGloss(list, EXTRA_GLOSSES[(start + offset) % EXTRA_GLOSSES.length], term);
    offset += 1;
  }
  return list.slice(0, count);
}

export function meaningsFor(word) {
  const listed = [];
  listedMeanings(word).forEach((item) => pushGloss(listed, item, word));
  if (listed.length) return listed;
  return meaningChoices(word).slice(0, 1);
}

export function formatMeanings(word) {
  return meaningsFor(word).join(" ; ");
}
