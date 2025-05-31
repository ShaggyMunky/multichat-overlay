/////////////////////////
// STREAMER.BOT CLIENT //
/////////////////////////

if (options.showStreamlabsDonations) {
  client.on("Streamlabs.Donation", (response) => {
    console.debug(response.data);
    streamlabsDonation(response.data);
  });
}

///////////////////////
// MULTICHAT OVERLAY //
///////////////////////

async function streamlabsDonation(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("streamlabs");

  // Set the text
  const donater = data.from;
  const formattedAmount = data.formattedAmount;
  const currency = data.currency;
  const message = data.message;

  elements.title.innerText = `🪙 ${donater} donated ${currency}${formattedAmount}`;
  elements.content.innerText = `${message}`;

  addMessageItem(instance);
}
