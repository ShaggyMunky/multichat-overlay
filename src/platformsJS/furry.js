async function twitchChatMessage(data) {
  // Set furry mode
  if (options.furryMode) message = translateToFurry(message);
}

function youTubeMessage(data) {
  // Set furry mode
  if (options.furryMode)
    elements.message.innerText = translateToFurry(data.message);
}

function translateToFurry(sentence) {
  const words = sentence.toLowerCase().split(/\b/);

  const furryWords = words.map((word) => {
    if (/\w+/.test(word)) {
      let newWord = word;

      // Common substitutions
      newWord = newWord.replace(/l/g, "w");
      newWord = newWord.replace(/r/g, "w");
      newWord = newWord.replace(/th/g, "f");
      newWord = newWord.replace(/you/g, "yous");
      newWord = newWord.replace(/my/g, "mah");
      newWord = newWord.replace(/me/g, "meh");
      newWord = newWord.replace(/am/g, "am");
      newWord = newWord.replace(/is/g, "is");
      newWord = newWord.replace(/are/g, "are");
      newWord = newWord.replace(/very/g, "vewy");
      newWord = newWord.replace(/pretty/g, "pwetty");
      newWord = newWord.replace(/little/g, "wittle");
      newWord = newWord.replace(/nice/g, "nyce");

      // Random additions
      if (Math.random() < 0.15) {
        newWord += " nya~";
      } else if (Math.random() < 0.1) {
        newWord += " >w<";
      } else if (Math.random() < 0.05) {
        newWord += " owo";
      }

      return newWord;
    }
    return word;
  });

  return furryWords.join("");
}
