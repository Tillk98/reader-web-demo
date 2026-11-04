const TRANSLATIONS = [
  "So the first thing, I would say, is the time.",
  "Yes, of course, when you plan to really learn a language well, you have to invest a lot of time – and depending on how your schedule looks, you might find that the time isn’t there to invest in learning multiple languages at once.",
  "So of course you have to keep that in mind.",
  "If you only have a maximum of 15 minutes available each day anyway, then you probably won't get very far with several languages, right.",
  "So, and we're assuming that you want to reach good levels, yes.",
  "It's also possible that you learn ten languages at the same time and then don't make really good progress in any of them.",
  "But if it's somehow fun for you and you only want to learn a few sentences in every language, then you can of course do that, but my tips now are that you also really celebrate successes, yeah, let's say.",
  "And the second big factor in this, in this question is: which languages are you planning to learn?",
  "Yeah, because I wouldn't necessarily recommend, especially if you don't have much experience with language learning, I wouldn't recommend starting from scratch now, learning two very difficult languages, yeah, for example Arabic and Japanese.",
  "Yeah, so if you do that, in my eyes that's basically doomed to fail, because one of these languages is already more than enough and you can and have to spend more than enough time there to really reach a good level.",
  "That is, in a case like that I'd rather limit myself to one of these languages at first, and if at some point you've reached a good level or you don't feel like it anymore, let's say, then you can of course move on to the next language.",
  "A similar case, or a similar constellation, that I also wouldn't necessarily recommend, is if you start from scratch learning two very similar languages, yeah, let's say Spanish and Portuguese or something.",
  "Yeah, so you can do it, yeah, but if you really start from scratch now, then it will simply be very confusing, because the languages are just so similar and you can't even tell, oh, is that now, is it Spanish now or is that Portuguese or is that Italian now or Spanish.",
  "I wouldn't recommend that.",
  "I'd tell you, you can do that without any problems though, as soon as you've reached a good level in one of these languages, yeah, a good foundation, maybe an intermediate level, then you can also start learning another Romance language and still keep pushing the other one forward.",
  "Yeah, that's possible, but starting both of these from scratch can be a bit confusing.",
  "It is possible, yeah, but as I said, I wouldn't necessarily recommend it.",
];

function sentenceBounds(tokens, tokenIndex) {
  let start = 0;
  for (let index = tokenIndex - 1; index >= 0; index -= 1) {
    if (tokens[index].type === "text" && /[.!?]/.test(tokens[index].value)) {
      start = index + 1;
      break;
    }
  }

  let end = tokens.length - 1;
  for (let index = tokenIndex + 1; index < tokens.length; index += 1) {
    if (tokens[index].type === "text" && /[.!?]/.test(tokens[index].value)) {
      end = index;
      break;
    }
  }

  return { start, end };
}

function sentenceContext(tokens, tokenIndex) {
  const { start, end } = sentenceBounds(tokens, tokenIndex);
  return tokens.slice(start, end + 1).map((token) => token.value).join("").replace(/\s+/g, " ").trim();
}

export function sentenceWords(lesson, paragraphIndex, tokenIndex) {
  const tokens = lesson[paragraphIndex];
  const { start, end } = sentenceBounds(tokens, tokenIndex);
  return tokens.slice(start, end + 1).filter((token) => token.type === "word");
}

export function pastSentences(lesson, paragraphIndex, term) {
  const needle = term.trim().toLowerCase();
  if (!needle) return [];
  const found = [];
  lesson.forEach((tokens, index) => {
    if (index === paragraphIndex || found.length >= 3) return;
    const text = tokens.map((token) => token.value).join("");
    if (!text.toLowerCase().includes(needle)) return;
    const wordIndex = tokens.findIndex((token) => token.type === "word" && needle.split(/\s+/).includes(token.value.toLowerCase()));
    const at = wordIndex >= 0 ? wordIndex : tokens.findIndex((token) => token.type === "word");
    if (at < 0) return;
    found.push(sentenceFor(lesson, index, at));
  });
  return found;
}

export function sentenceFor(lesson, paragraphIndex, tokenIndex) {
  return {
    text: sentenceContext(lesson[paragraphIndex], tokenIndex),
    translation: TRANSLATIONS[paragraphIndex] || "",
  };
}

function joinedTokens(tokens, from, to) {
  if (from > to) return "";
  return tokens.slice(from, to + 1).map((token) => token.value).join("").replace(/\s+/g, " ");
}

function throughTrailing(tokens, wordIndex, sentenceEnd) {
  let endAt = wordIndex;
  for (let index = wordIndex + 1; index <= sentenceEnd; index += 1) {
    if (tokens[index].type === "word") break;
    endAt = index;
  }
  return endAt;
}

export function termSnippet(tokens, tokenIndex, endTokenIndex = tokenIndex) {
  const empty = { lead: false, before: "", term: "", after: "", trail: false };
  if (!tokens?.length || tokenIndex == null) return empty;
  const startIndex = Math.min(tokenIndex, endTokenIndex);
  const finishIndex = Math.max(tokenIndex, endTokenIndex);
  const { start, end } = sentenceBounds(tokens, startIndex);
  const words = [];
  for (let index = start; index <= end; index += 1) {
    if (tokens[index].type === "word") words.push(index);
  }
  const termWords = words.filter((index) => index >= startIndex && index <= finishIndex);
  const firstTerm = termWords[0] ?? words[0];
  const lastTerm = termWords[termWords.length - 1] ?? firstTerm;
  if (firstTerm == null) return empty;
  const termPos = Math.max(0, words.indexOf(firstTerm));
  const termEndPos = Math.max(termPos, words.indexOf(lastTerm));
  const beforeFrom = Math.max(0, termPos - 4);
  const afterTo = Math.min(words.length, termEndPos + 1 + 4);
  const beforeStart = words[beforeFrom];
  const afterWord = words[afterTo - 1];
  return {
    lead: beforeFrom > 0,
    before: joinedTokens(tokens, beforeStart, firstTerm - 1).replace(/^\s+/, ""),
    term: joinedTokens(tokens, firstTerm, lastTerm).trim(),
    after: joinedTokens(tokens, lastTerm + 1, throughTrailing(tokens, afterWord ?? lastTerm, end)).replace(/\s+$/, ""),
    trail: afterTo < words.length,
  };
}
