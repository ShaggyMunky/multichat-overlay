import { client } from "../config/streamerBotClient.js";
import {
  addMessageItem,
  cloneFromTemplate,
  getCardInstanceElements,
} from "../helpers/domManager.js";

export function runFourthWallOptions(): void {
  client.on("Fourthwall.OrderPlaced", (response) => {
    console.debug(response.data);
    fourthwallOrderPlaced(response.data);
  });

  client.on("Fourthwall.Donation", (response) => {
    console.debug(response.data);
    fourthwallDonation(response.data);
  });

  client.on("Fourthwall.SubscriptionPurchased", (response) => {
    console.debug(response.data);
    fourthwallSubscriptionPurchased(response.data);
  });

  client.on("Fourthwall.GiftPurchase", (response) => {
    console.debug(response.data);
    fourthwallGiftPurchase(response.data);
  });

  client.on("Fourthwall.GiftDrawStarted", (response) => {
    console.debug(response.data);
    fourthwallGiftDrawStarted(response.data);
  });

  client.on("Fourthwall.GiftDrawEnded", (response) => {
    console.debug(response.data);
    fourthwallGiftDrawEnded(response.data);
  });
}

///////////////////////
// MULTICHAT OVERLAY //
///////////////////////

function fourthwallOrderPlaced(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("blank");
  elements.title.classList.add("centerThatShitHomie");
  elements.content.classList.add("centerThatShitHomie");

  // Set the text
  let user = data.username;
  const orderTotal = data.total;
  const currency = data.currency;
  const item = data.variants[0].name;
  const itemsOrdered = data.variants.length;
  const message = decodeHTMLString(data.statmessageus);
  const itemImageUrl = data.variants[0].image;
  const fourthwallProductImage = `<img src="${itemImageUrl}" class="productImage"/>`;

  let contents = "";

  contents += fourthwallProductImage;

  contents += "<br><br>";

  // If there user did not provide a username, just say "Someone"
  if (user == undefined) user = "Someone";

  // If the user ordered more than one item, write how many items they ordered
  contents += `${user} ordered ${item}`;
  if (itemsOrdered > 1) contents += ` and ${itemsOrdered - 1} other item(s)!`;

  // If the user spent money, put the order total
  if (orderTotal == 0) contents += ``;
  else if (currency == "USD") contents += ` ($${orderTotal})`;
  else contents += ` (${orderTotal} ${currency})`;

  elements.title.innerHTML = contents;

  // Add the custom message from the user
  if (message.trim() != "") elements.content.innerHTML = `${message}`;
  else elements.content.style.display = "none";

  addMessageItem(instance, data.id);
}

function fourthwallDonation(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("fourthwall");

  // Set the text
  let user = data.username;
  const amount = data.amount;
  const currency = data.currency;
  const message = data.message;

  let contents = "";

  // If the user ordered more than one item, write how many items they ordered
  contents += `${user} donated`;

  // If the user spent money, put the order total
  if (currency == "USD") contents += ` $${amount}`;
  else contents += ` ${currency} ${amount}`;

  elements.title.innerHTML = contents;

  // Add the custom message from the user
  if (message.trim() != "") elements.content.innerHTML = `${message}`;
  else elements.content.style.display = "none";

  addMessageItem(instance, data.id);
}

function fourthwallSubscriptionPurchased(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("fourthwall");

  // Set the text
  let user = data.nickname;
  const amount = data.amount;
  const currency = data.currency;

  let contents = "";

  // If the user ordered more than one item, write how many items they ordered
  contents += `${user} subscribed`;

  // If the user spent money, put the order total
  if (currency == "USD") contents += ` ($${amount})`;
  else contents += ` (${currency} ${amount})`;

  elements.title.innerHTML = contents;
  elements.content.style.display = "none";

  addMessageItem(instance, data.id);
}

function fourthwallGiftPurchase(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("blank");
  elements.title.classList.add("centerThatShitHomie");
  elements.content.classList.add("centerThatShitHomie");

  // Set the text
  let user = data.username;
  const total = data.total;
  const currency = data.currency;
  const gifts = data.gifts.length;
  const itemName = data.offer.name;
  const itemImageUrl = data.offer.imageUrl;
  const fourthwallProductImage = `<img src="${itemImageUrl}" class="productImage"/>`;
  const message = decodeHTMLString(data.statmessageus);

  let contents = "";

  contents += fourthwallProductImage;

  contents += "<br><br>";

  // If the user ordered more than one item, write how many items they ordered
  contents += `${user} gifted`;

  // If there is more than one gifted item, display the number of gifts
  if (gifts > 1) contents += ` ${gifts} x `;

  // The name of the item to be given away
  contents += ` ${itemName}`;

  // If the user spent money, put the order total
  if (currency == "USD") contents += ` ($${total})`;
  else contents += ` (${currency}${total})`;

  elements.title.innerHTML = contents;

  // Add the custom message from the user
  if (message.trim().length) elements.content.innerHTML = `${message}`;
  else elements.content.style.display = "none";

  addMessageItem(instance, data.id);
}

function fourthwallGiftDrawStarted(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("fourthwall");
  elements.title.classList.add("centerThatShitHomie");
  elements.content.classList.add("centerThatShitHomie");

  let contents = "";

  // If the user ordered more than one item, write how many items they ordered
  contents += `<h3>🎁 ${data.offer.name} Giveaway!</h3>`;

  elements.title.innerHTML = contents;
  elements.content.innerHTML = `Type !join in the next ${data.durationSeconds} seconds for your chance to win!`;
  //elements.content.style.display = `none`;

  addMessageItem(instance, data.id);
}

function fourthwallGiftDrawEnded(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("fourthwall");
  elements.title.classList.add("centerThatShitHomie");
  elements.content.classList.add("centerThatShitHomie");

  let contents = "";

  // If the user ordered more than one item, write how many items they ordered
  contents += `<h3>🥳 GIVEAWAY ENDED 🥳</h3>`;
  //contents += `Congratulations ${getWinnersList(data.gifts)}!`

  elements.title.innerHTML = contents;
  elements.content.innerHTML = `Congratulations ${getWinnersList(data.gifts)}!`;
  //elements.content.style.display = `none`;

  addMessageItem(instance, data.id);
}

function getWinnersList(gifts) {
  const winners = gifts.map((gift) => gift.winner);
  const numWinners = winners.length;

  switch (numWinners) {
    case 0:
      return "";
    case 1:
      return winners[0];
    case 2:
      return `${winners[0]} and ${winners[1]}`;
    default:
      const lastWinner = winners.pop();
      const secondLastWinner = winners.pop();
      return `${winners.join(", ")}, ${secondLastWinner} and ${lastWinner}`;
  }
}

function decodeHTMLString(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
