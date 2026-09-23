import { meaningsFor } from "./meanings.js";

const PHRASES = {
  "der erste": ["the first", "the first one"],
  "würde ich sagen": ["I would say", "I'd say"],
  "erst mal": ["first of all", "to begin with"],
  "die zeit": ["the time", "time"],
  "mal die zeit": ["first the time", "time, for one"],
  "eine sprache": ["a language", "one language"],
  "eine sprache gut": ["a language well", "one language properly"],
  "gut zu lernen": ["to learn well", "to learn properly"],
  "eine ganze menge": ["a whole lot", "quite a lot"],
  "eine ganze menge zeit": ["a whole lot of time", "quite a lot of time"],
  "menge zeit": ["a lot of time", "quite some time"],
  "dein wochenplan": ["your weekly schedule", "your week plan"],
  "wie voll": ["how full", "how busy"],
  "die zeit da": ["the time for it", "time available"],
  "mehrere sprachen": ["several languages", "multiple languages"],
  "mehreren sprachen": ["several languages", "multiple languages"],
  "gleichzeitig zu lernen": ["to learn at the same time", "to learn simultaneously"],
  "sprachen gleichzeitig": ["languages at the same time", "languages simultaneously"],
  "sprachen gleichzeitig zu lernen": ["to learn languages at the same time", "to study languages simultaneously"],
  "mehrere sprachen gleichzeitig": ["several languages at once", "multiple languages at the same time"],
  "mehrere sprachen gleichzeitig zu lernen": ["to learn several languages at once", "to study multiple languages at the same time"],
  "jetzt mehrere sprachen": ["several languages now", "multiple languages at this point"],
  "muss man natürlich beachten": ["you of course have to keep in mind", "one must of course pay attention"],
  "natürlich beachten": ["of course keep in mind", "keep in mind, of course"],
  "jeden tag": ["every day", "each day"],
  "15 minuten": ["15 minutes", "fifteen minutes"],
  "tag 15 minuten": ["15 minutes a day", "fifteen minutes each day"],
  "jeden tag 15 minuten": ["15 minutes every day", "fifteen minutes each day"],
  "maximal jeden tag": ["at most every day", "a maximum each day"],
  "maximal jeden tag 15 minuten": ["at most 15 minutes a day", "a maximum of 15 minutes every day"],
  "zur verfügung": ["available", "at your disposal"],
  "zur verfügung hast": ["you have available", "you have at your disposal"],
  "minuten zur verfügung": ["minutes available", "minutes at your disposal"],
  "nicht weit kommen": ["not get far", "not make much progress"],
  "weit kommen": ["get far", "make progress"],
  "wahrscheinlich nicht": ["probably not", "likely not"],
  "wirst du wahrscheinlich": ["you will probably", "you'll likely"],
  "den fall": ["the case", "the event"],
  "für den fall": ["in case", "in the event"],
  "gute levels": ["good levels", "solid levels"],
  "levels erreichen": ["reach levels", "achieve levels"],
  "gute levels erreichen": ["reach good levels", "achieve solid levels"],
  "davon aus": ["assume", "take it as given"],
  "gehen davon aus": ["we assume", "we take it that"],
  "zehn sprachen": ["ten languages", "10 languages"],
  "sprachen gleichzeitig lernst": ["you learn languages at the same time", "you study languages simultaneously"],
  "zehn sprachen gleichzeitig": ["ten languages at once", "10 languages at the same time"],
  "keiner sprache": ["no language", "not one language"],
  "in keiner sprache": ["in no language", "in not a single language"],
  "gute fortschritte": ["good progress", "solid progress"],
  "fortschritte machst": ["you make progress", "you progress"],
  "gute fortschritte machst": ["you make good progress", "you make solid progress"],
  "wirklich gute fortschritte": ["really good progress", "genuinely solid progress"],
  "es ist auch möglich": ["it is also possible", "it's also possible"],
  "spaß macht": ["is fun", "is enjoyable"],
  "irgendwie spaß": ["somehow fun", "kind of enjoyable"],
  "ein paar sätze": ["a few sentences", "a couple of sentences"],
  "paar sätze lernen": ["learn a few sentences", "study a couple of sentences"],
  "ein paar sätze lernen": ["learn a few sentences", "study a couple of sentences"],
  "meine tipps": ["my tips", "my advice"],
  "tipps sind": ["tips are", "advice is"],
  "kannst du das": ["you can do that", "you're able to do that"],
  "natürlich machen": ["of course do", "do, of course"],
  "das natürlich machen": ["of course do that", "do that, naturally"],
  "wirklich eine sprache": ["really a language", "actually a language"],
  "wirklich eine sprache gut zu lernen": ["to really learn a language well", "to actually learn a language properly"],
  "sowieso maximal": ["at most anyway", "a maximum in any case"],
  "sowieso maximal jeden tag 15 minuten": ["at most 15 minutes a day anyway", "no more than 15 minutes each day as it is"],
  "maximal jeden tag 15 minuten zur verfügung": ["at most 15 minutes a day available", "a maximum of 15 minutes each day at your disposal"],
  "maximal jeden tag 15 minuten zur verfügung hast": ["you have at most 15 minutes a day available", "you have a maximum of 15 minutes each day at your disposal"],
  "jeden tag 15 minuten zur verfügung": ["15 minutes available every day", "15 minutes a day at your disposal"],
  "jeden tag 15 minuten zur verfügung hast": ["you have 15 minutes available every day", "you have 15 minutes a day at your disposal"],
  "15 minuten zur verfügung hast": ["you have 15 minutes available", "you have 15 minutes at your disposal"],
  "zur verfügung hast dann": ["you have available, then", "then, with what you have available"],
  "hast dann": ["have, then", "then you have"],
  "dann wirst du": ["then you will", "then you'll"],
  "wirst du wahrscheinlich nicht": ["you probably won't", "you likely will not"],
  "wahrscheinlich nicht weit kommen": ["probably not get far", "likely not make much progress"],
  "maximal jeden tag 15 minuten zur verfügung hast dann": ["then you have at most 15 minutes a day available", "then, with at most 15 minutes a day at your disposal"],
  "nicht weit kommen mit mehreren sprachen": ["not get far with several languages", "not make much progress with multiple languages"],
};

function orderPoints(a, b) {
  if (a.paragraphIndex !== b.paragraphIndex) {
    return a.paragraphIndex < b.paragraphIndex ? [a, b] : [b, a];
  }
  return a.tokenIndex <= b.tokenIndex ? [a, b] : [b, a];
}

export function phraseSuggestions(words) {
  const key = words.map((word) => word.toLowerCase()).join(" ");
  const known = PHRASES[key];
  if (known) return known;
  const primary = words.map((word) => meaningsFor(word)[0]).join(" ");
  const secondary = words.map((word) => meaningsFor(word).at(-1)).join(" ");
  if (secondary.toLowerCase() !== primary.toLowerCase()) return [primary, secondary];
  return [primary, primary];
}

export function describePhrase(lesson, from, to) {
  const [start, end] = orderPoints(from, to);
  const words = [];
  let sentenceBreak = start.paragraphIndex !== end.paragraphIndex;
  const parts = [];

  for (let paragraphIndex = start.paragraphIndex; paragraphIndex <= end.paragraphIndex; paragraphIndex += 1) {
    const tokens = lesson[paragraphIndex];
    const fromToken = paragraphIndex === start.paragraphIndex ? start.tokenIndex : 0;
    const toToken = paragraphIndex === end.paragraphIndex ? end.tokenIndex : tokens.length - 1;
    if (paragraphIndex > start.paragraphIndex) parts.push(" ");
    for (let tokenIndex = fromToken; tokenIndex <= toToken; tokenIndex += 1) {
      const token = tokens[tokenIndex];
      parts.push(token.value);
      if (token.type === "word") words.push(token.value);
      const between = paragraphIndex < end.paragraphIndex || tokenIndex < end.tokenIndex;
      if (between && token.type === "text" && /[.!?]/.test(token.value)) sentenceBreak = true;
    }
  }

  let text = parts.join("");
  const trailing = lesson[end.paragraphIndex][end.tokenIndex + 1];
  if (trailing?.type === "text") {
    const punct = trailing.value.match(/^\s*[.!?]+/);
    if (punct) text += punct[0].trimEnd();
  }

  return {
    start,
    end,
    words,
    text: text.replace(/\s+/g, " ").trim(),
    invalid: words.length > 9 || sentenceBreak || words.length < 2,
    suggestions: phraseSuggestions(words),
  };
}

export function phraseCovers(phrase, paragraphIndex, tokenIndex) {
  if (paragraphIndex < phrase.start.paragraphIndex || paragraphIndex > phrase.end.paragraphIndex) return false;
  if (paragraphIndex === phrase.start.paragraphIndex && tokenIndex < phrase.start.tokenIndex) return false;
  if (paragraphIndex === phrase.end.paragraphIndex && tokenIndex > phrase.end.tokenIndex) return false;
  return true;
}
