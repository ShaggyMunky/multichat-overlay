import { ignoreUserList, options } from "../config/config.js";
import { PLATFORMS } from "../config/constants.js";
import { client } from "../config/streamerBotClient.js";
import * as domManager from "../helpers/domManager.js";
import { translateToFurry } from "../helpers/furry.js";
import * as optionActions from "../helpers/optionActions.js";

const membersMap = new Map();

/////////////////////////
// STREAMER.BOT CLIENT //
/////////////////////////

export function runYouTubeOptions(): void {
  if (options.showYouTubeMessages) {
    client.on("YouTube.Message", (response) => {
      console.debug(response.data);
      youTubeMessage(response.data);
    });
  }

  if (options.showYouTubeSuperChats) {
    client.on("YouTube.SuperChat", (response) => {
      console.debug(response.data);
      youTubeSuperChat(response.data);
    });
  }

  if (options.showYouTubeSuperStickers) {
    client.on("YouTube.SuperSticker", (response) => {
      console.debug(response.data);
      youTubeSuperSticker(response.data);
    });
  }

  if (options.showYouTubeMemberships) {
    client.on("YouTube.NewSponsor", (response) => {
      console.debug(response.data);
      youTubeNewSponsor(response.data);
    });

    client.on("YouTube.GiftMembershipReceived", (response) => {
      console.debug(response.data);
      youTubeGiftMembershipReceived(response.data);
    });
  }
}

///////////////////////
// MULTICHAT OVERLAY //
///////////////////////

async function youTubeMessage(data) {
  // Don't post messages starting with "!"
  if (data.message.startsWith("!") && options.excludeCommands) return;

  // Don't post messages from users from the ignore list
  if (ignoreUserList.includes(data.user.name.toLowerCase())) return;

  const instance = domManager.cloneFromTemplate("messageTemplate");
  const elements = domManager.getMessageInstanceElements(instance);

  // puts background per message instead of a universsal box
  if (!options.useSharedBg) {
    optionActions.setBgAndOpacity(elements.messageContainer);
  }

  optionActions.setTimestamp(elements.timestamp);

  // YouTube users do not have colors, the provided method
  // randomly assigns one for that session
  optionActions.setUserName(
    elements.username,
    data.user.name,
    getYouTubeUserColor(data.user.id)
  );

  if (options.showMessage) {
    elements.message.innerText = !options.furryMode
      ? data.message
      : translateToFurry(data.message);
  }

  optionActions.setLineBreak(elements);
  optionActions.renderPlatform(elements.platform, PLATFORMS.youTube);

  optionActions.renderBadges(
    elements.badgeList,
    ["Owner", "Moderator", "Sponsor", "Verified"],
    PLATFORMS.youTube,
    data.user
  );

  optionActions.renderEmotes(elements.message, data.emotes, PLATFORMS.youTube);
  optionActions.renderAvatar(
    elements.avatar,
    data.user.profileImageUrl,
    PLATFORMS.youTube
  );
  optionActions.groupConsecutiveMessages(
    elements.userInfo,
    data.user.id,
    PLATFORMS.youTube
  );

  await optionActions.embedImage(
    elements.message,
    data.message,
    data,
    PLATFORMS.youTube
  );

  domManager.addMessageItem(
    instance,
    data.message.msgId,
    PLATFORMS.youTube,
    data.user.id
  );
}

function youTubeSuperChat(data) {
  const instance = domManager.cloneFromTemplate("cardTemplate");
  const elements = domManager.getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("youtube");

  // Set message text
  elements.title.innerText = `🪙 ${data.user.name} sent a Super Chat (${data.amount})`;
  elements.content.innerText = `${data.message}!`;

  domManager.addMessageItem(instance, data.eventId);
}

function youTubeSuperSticker(data) {
  const instance = domManager.cloneFromTemplate("cardTemplate");
  const cardElements = domManager.getCardInstanceElements(instance);

  // Set the card background colors
  cardElements.card.classList.add("youtube");

  const stickerInstance = domManager.cloneFromTemplate("stickerTemplate");
  const stickerElements =
    domManager.getStickerInstanceElements(stickerInstance);

  // Render sticker
  stickerElements.stickerImg.src = findFirstImageUrl(data);
  stickerElements.stickerLabel.innerText = `${data.user.name} sent a Super Sticker (${data.amount})`;

  cardElements.content.appendChild(stickerInstance);

  domManager.addMessageItem(instance, data.eventId);
}

function youTubeNewSponsor(data) {
  const instance = domManager.cloneFromTemplate("cardTemplate");
  const elements = domManager.getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("youtube");

  // Set message text
  elements.title.innerText = `⭐ New ${data.levelName}`;
  elements.content.innerText = `Welcome ${data.user.name}!`;

  domManager.addMessageItem(instance, data.eventId);
}

function youTubeGiftMembershipReceived(data) {
  const instance = domManager.cloneFromTemplate("cardTemplate");
  const elements = domManager.getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("youtube");

  // Set message text
  elements.title.innerText = `🎁 ${data.gifter.name} gifted a membership`;
  elements.content.innerText = `to ${data.user.name} (${data.tier})!`;

  domManager.addMessageItem(instance, data.eventId);
}

function getYouTubeUserColor(userId) {
  if (!membersMap.has(userId)) {
    const colors = {
      red: "#ff4c4c",
      blue: "#4c6fff",
      green: "#2e8b57",
      purple: "#8a2be2",
      orange: "#d2691e",
      cyan: "#4cfff9",
      pink: "#ff69b4",
    };
    const values = Object.values(colors);
    const index = Math.floor(Math.random() * values.length);
    membersMap.set(userId, values[index]);
  }
  return membersMap.get(userId);
}

// I used Gemini for this shit so if it doesn't work, blame Google
function findFirstImageUrl(jsonObject) {
  if (typeof jsonObject !== "object" || jsonObject === null) {
    return null; // Handle invalid input
  }

  function iterate(obj) {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = iterate(item);
        if (result) {
          return result;
        }
      }
      return null;
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === "imageUrl") {
          return obj[key]; // Found it! Return the value.
        }

        if (typeof obj[key] === "object" && obj[key] !== null) {
          const result = iterate(obj[key]); // Recursive call for nested objects
          if (result) {
            return result; // Propagate the found value
          }
        }
      }
    }
    return null; // Key not found in this level
  }

  return iterate(jsonObject);
}
