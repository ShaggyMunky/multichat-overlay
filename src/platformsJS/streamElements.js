/////////////////////////
// STREAMER.BOT CLIENT //
/////////////////////////

if (options.showStreamElementsTips) {
  client.on("StreamElements.Tip", (response) => {
    console.debug(response.data);
    streamElementsTip(response.data);
  });
}

///////////////////////
// MULTICHAT OVERLAY //
///////////////////////

async function streamElementsTip(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("streamelements");

  // Set the text
  const donater = data.username;
  const formattedAmount = `$${data.amount}`;
  const currency = data.currency;
  const message = data.message;

  elements.title.innerText = `🪙 ${donater} donated ${currency}${formattedAmount}`;
  elements.content.innerText = `${message}`;

  addMessageItem(instance, data.id);
}
