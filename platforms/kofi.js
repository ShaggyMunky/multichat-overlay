/////////////////////////
// STREAMER.BOT CLIENT //
/////////////////////////

if (options.showKofiDonations) {
  client.on("Kofi.Donation", (response) => {
    console.debug(response.data);
    kofiDonation(response.data);
  });

  client.on("Kofi.Subscription", (response) => {
    console.debug(response.data);
    kofiSubscription(response.data);
  });

  client.on("Kofi.Resubscription", (response) => {
    console.debug(response.data);
    kofiResubscription(response.data);
  });

  client.on("Kofi.ShopOrder", (response) => {
    console.debug(response.data);
    kofiShopOrder(response.data);
  });
}

///////////////////////
// MULTICHAT OVERLAY //
///////////////////////

function kofiDonation(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("kofi");

  // Set the text
  const user = data.from;
  const amount = data.amount;
  const currency = data.currency;
  const message = data.message;
  const kofiIcon = `<img src="icons/platforms/kofi.png" class="platform"/>`;

  if (currency == "USD")
    elements.title.innerHTML = `${kofiIcon} ${user} donated $${amount}`;
  else
    elements.title.innerHTML = `${kofiIcon} ${user} donated ${currency} ${amount}`;

  if (message != null) elements.content.innerHTML = `${message}`;

  addMessageItem(instance, data.id);
}

function kofiSubscription(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("kofi");

  // Set the text
  const user = data.from;
  const amount = data.amount;
  const currency = data.currency;
  const message = data.message;
  const kofiIcon = `<img src="icons/platforms/kofi.png" class="platform"/>`;

  if (currency == "USD")
    elements.title.innerHTML = `${kofiIcon} ${user} subscribed ($${amount})`;
  else
    elements.title.innerHTML = `${kofiIcon} ${user} subscribed (${currency} ${amount})`;

  if (message != null) elements.content.innerHTML = `${message}`;

  addMessageItem(instance, data.id);
}

function kofiResubscription(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("kofi");

  // Set the text
  const user = data.from;
  const tier = data.tier;
  const message = data.message;
  const kofiIcon = `<img src="icons/platforms/kofi.png" class="platform"/>`;

  elements.title.innerHTML = `${kofiIcon} ${user} subscribed (${tier})`;
  if (message != null) elements.content.innerHTML = `${message}`;

  addMessageItem(instance, data.id);
}

function kofiShopOrder(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("kofi");

  // Set the text
  const user = data.from;
  const amount = data.amount;
  const currency = data.currency;
  const message = data.message;
  const itemTotal = data.items.length;
  const kofiIcon = `<img src="icons/platforms/kofi.png" class="platform"/>`;
  let formattedAmount = "";

  if (amount == 0) formattedAmount = "";
  else if (currency == "USD") formattedAmount = `($${amount})`;
  else formattedAmount = `(${currency} ${amount})`;

  elements.title.innerHTML = `${kofiIcon} ${user} ordered ${itemTotal} item(s) on Ko-fi ${formattedAmount}`;
  if (message != null) elements.content.innerHTML = `${message}`;

  addMessageItem(instance, data.id);
}
