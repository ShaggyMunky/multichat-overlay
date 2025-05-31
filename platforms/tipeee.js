/////////////////////////
// STREAMER.BOT CLIENT //
/////////////////////////

if (options.showTipeeeStreamDonations) {
  client.on("TipeeeStream.Donation", (response) => {
    console.debug(response.data);
    tipeeeStreamDonation(response.data);
  });
}

///////////////////////
// MULTICHAT OVERLAY //
///////////////////////

function tipeeeStreamDonation(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("tipeeeStream");

  // Set the text
  const user = data.username;
  const amount = data.amount;
  const currency = data.currency;
  const message = data.message;
  const tipeeeStreamIcon = `<img src="icons/platforms/tipeeeStream.png" class="platform"/>`;

  if (currency == "USD")
    elements.title.innerHTML = `${tipeeeStreamIcon} ${user} donated $${amount}`;
  else
    elements.title.innerHTML = `${tipeeeStreamIcon} ${user} donated ${currency} ${amount}`;

  if (message != null) elements.content.innerHTML = `${message}`;

  addMessageItem(instance, data.id);
}
