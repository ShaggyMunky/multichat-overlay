import { client } from "../config/streamerBotClient.js";
import {
  addMessageItem,
  cloneFromTemplate,
  getCardInstanceElements,
} from "../helpers/domManager.js";

export function runPatreonOptions(): void {
  client.on("Patreon.PledgeCreated", (response) => {
    console.debug(response.data);
    patreonPledgeCreated(response.data);
  });
}

///////////////////////
// MULTICHAT OVERLAY //
///////////////////////

function patreonPledgeCreated(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("patreon");

  const user = data.attributes.full_name;
  const amount = (data.attributes.will_pay_amount_cents / 100).toFixed(2);
  const patreonIcon = `<img src="icons/platforms/patreon.png" class="platform"/>`;

  elements.title.innerHTML = `${patreonIcon} ${user} joined Patreon ($${amount})`;

  addMessageItem(instance, data.id);
}
