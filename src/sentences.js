const TRANSLATIONS = [
  "So the first thing, I would say, is the time.",
  "Yes, of course, if you plan to really learn a language well, you naturally have to spend a whole lot of time, and depending on how full your weekly schedule is, the time to learn several languages at once might not be there.",
  "So of course you have to keep that in mind.",
  "If you only have a maximum of 15 minutes available each day anyway, then you probably won't get very far with several languages, right.",
  "So, and we're assuming that you want to reach good levels, yes.",
  "It's also possible that you learn ten languages at the same time and then don't make really good progress in any of them.",
  "But if it's somehow fun for you and you only want to learn a few sentences in every language, then you can of course do that, but my tips now are that you also",
];

function sentenceContext(tokens, tokenIndex) {
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

  return tokens.slice(start, end + 1).map((token) => token.value).join("").replace(/\s+/g, " ").trim();
}

export function sentenceFor(lesson, paragraphIndex, tokenIndex) {
  return {
    text: sentenceContext(lesson[paragraphIndex], tokenIndex),
    translation: TRANSLATIONS[paragraphIndex] || "",
  };
}
