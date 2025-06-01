import { ignoreUserList, options } from "../config/config.js";
import { client } from "../config/streamerBotClient.js";
import {
  setPronouns,
  setTimestamp,
  setUserName,
} from "../helpers/optionActions.js";
import {
  addMessageItem,
  setBgAndOpacity,
  messageList,
} from "../helpers/domManager.js";
import {
  canPostImage,
  escapeRegExp,
  getCurrentTimeFormatted,
  isImageUrl,
} from "../helpers/utils.js";
import {
  cloneFromTemplate,
  getMessageInstanceElements,
  getCardInstanceElements,
} from "../helpers/templateHandler.js";

const avatarMap = new Map();

export function runTwitchOptions(): void {
  if (options.showTwitchMessages) {
    client.on("Twitch.ChatMessage", (response) => {
      console.debug(response.data);
      twitchChatMessage(response.data);
    });

    client.on("Twitch.Cheer", (response) => {
      console.debug(response.data);
      twitchChatMessage(response.data);
    });
  }

  if (options.showTwitchSubs) {
    client.on("Twitch.Sub", (response) => {
      console.debug(response.data);
      twitchSub(response.data);
    });

    client.on("Twitch.ReSub", (response) => {
      console.debug(response.data);
      twitchResub(response.data);
    });

    client.on("Twitch.GiftSub", (response) => {
      console.debug(response.data);
      twitchGiftSub(response.data);
    });
  }

  if (options.showTwitchAnnouncements) {
    client.on("Twitch.Announcement", (response) => {
      console.debug(response.data);
      twitchAnnouncement(response.data);
    });
  }

  if (options.showTwitchChannelPointRedemptions) {
    client.on("Twitch.RewardRedemption", (response) => {
      console.debug(response.data);
      twitchRewardRedemption(response.data);
    });
  }

  if (options.showTwitchRaids) {
    client.on("Twitch.Raid", (response) => {
      console.debug(response.data);
      twitchRaid(response.data);
    });
  }

  client.on("Twitch.AutomaticRewardRedemption", (response) => {
    console.debug(response.data);
    twitchAutomaticRewardRedemption(response.data);
  });

  client.on("Twitch.ChatMessageDeleted", (response) => {
    console.debug(response.data);
    twitchChatMessageDeleted(response.data);
  });

  client.on("Twitch.UserBanned", (response) => {
    console.debug(response.data);
    twitchUserBanned(response.data);
  });

  client.on("Twitch.UserTimedOut", (response) => {
    console.debug(response.data);
    twitchUserBanned(response.data);
  });

  client.on("Twitch.ChatCleared", (response) => {
    console.debug(response.data);
    twitchChatCleared(response.data);
  });
}

///////////////////////
// MULTICHAT OVERLAY //
///////////////////////

async function twitchChatMessage(data): Promise<void> {
  // Don't post messages starting with "!"
  if (data.message.message.startsWith("!") && options.excludeCommands) return;

  // Don't post messages from users from the ignore list
  if (ignoreUserList.includes(data.message.username.toLowerCase())) return;

  const instance = cloneFromTemplate("messageTemplate");
  const elements = getMessageInstanceElements(instance);

  // puts background per message instead of a universsal box
  if (!options.useSharedBg) {
    setBgAndOpacity(elements.messageContainer);
  }

  // Set First Time Chatter
  if (data.message.firstMessage && options.showMessage) {
    elements.firstMessage.style.display = "block";
    elements.messageContainer.classList.add("highlightMessage");
  }

  // Set Shared Chat
  if (data.isSharedChat) {
    if (options.showTwitchSharedChat > 1) {
      if (!data.sharedChat.primarySource) {
        const sharedChatChannel = data.sharedChat.sourceRoom.name;
        elements.sharedChat.style.display = "block";
        elements.sharedChatChannel.innerHTML = `💬 ${sharedChatChannel}`;
        elements.messageContainer.classList.add("highlightMessage");
      }
    } else if (
      !data.sharedChat.primarySource &&
      options.showTwitchSharedChat == 0
    )
      return;
  }

  // Set Reply Message
  if (data.message.isReply && options.showMessage) {
    const replyUser = data.message.reply.userName;
    const replyMsg = data.message.reply.msgBody;

    elements.reply.style.display = "block";
    elements.replyUser.innerText = replyUser;
    elements.replyMsg.innerText = replyMsg;
  }

  setTimestamp(elements.timestamp, options.showTimestamps);
  setUserName(elements.username, options.showUsername, data);

  if (options.showPronouns) {
    await setPronouns(elements.pronouns, data.message.username);
  }

  // Set the message data
  let message = data.message.message;
  const messageColor = data.message.color;

  // Set message text
  if (options.showMessage) {
    elements.message.innerText = message;
  }

  // Set the "action" color
  if (data.message.isMe) elements.message.style.color = messageColor;

  // Remove the line break
  if (options.inlineChat) {
    elements.colonSeparator.style.display = `inline`;
    elements.lineSpace.style.display = `none`;
  }

  // Render platform
  if (options.showPlatform) {
    const platformElements = `<img src="icons/platforms/twitch.png" class="platform"/>`;
    elements.platform.innerHTML = platformElements;
  }

  // Render badges
  if (options.showBadges) {
    elements.badgeList.innerHTML = "";
    for (const badgeData of data.message.badges) {
      const badge = new Image();
      badge.src = badgeData.imageUrl;
      badge.classList.add("badge");
      elements.badgeList.appendChild(badge);
    }
  }

  // Render emotes
  for (const emoteData of data.emotes) {
    const emoteElement = `<img src="${emoteData.imageUrl}" class="emote"/>`;
    const emoteName = escapeRegExp(emoteData.name);

    let regexPattern = emoteName;

    // Check if the emote name consists only of word characters (alphanumeric and underscore)
    if (/^\w+$/.test(emoteName)) {
      regexPattern = `\\b${emoteName}\\b`;
    } else {
      // For non-word emotes, ensure they are surrounded by non-word characters or boundaries
      regexPattern = `(?:^|[^\\w])${emoteName}(?:$|[^\\w])`;
    }

    const regex = new RegExp(regexPattern, "g");
    elements.message.innerHTML = elements.message.innerHTML.replace(
      regex,
      emoteElement
    );
  }

  // Render cheermotes
  for (const cheerData of data.message.cheerEmotes) {
    const bits = cheerData.bits;
    const imageUrl = cheerData.imageUrl;
    const name = cheerData.name;
    const cheerEmoteElement = `<img src="${imageUrl}" class="emote"/>`;
    const bitsElements = `<span class="bits">${bits}</span>`;
    elements.message.innerHTML = elements.message.innerHTML.replace(
      new RegExp(`\\b${name}${bits}\\b`, "i"),
      cheerEmoteElement + bitsElements
    );
  }

  // Render avatars
  if (options.showAvatar) {
    const username = data.message.username;
    const avatarURL = await getAvatar(username);
    const avatar = new Image();
    avatar.src = avatarURL;
    avatar.classList.add("avatar");
    elements.avatar.appendChild(avatar);
  }

  // Hide the header if the same username sends a message twice in a row
  // EXCEPT when the scroll direction is set to reverse (scrollDirection == 2)
  if (
    options.groupConsecutiveMessages &&
    messageList.children.length > 0 &&
    options.scrollDirection != 2
  ) {
    const msgItem = messageList.lastChild as HTMLElement;
    const lastPlatform = msgItem.dataset.platform;
    const lastUserId = msgItem.dataset.userId;
    if (lastPlatform == "twitch" && lastUserId == data.user.id)
      elements.userInfo.style.display = "none";
  }

  // Embed image
  if (
    canPostImage(options.imageEmbedPermissionLevel, data, "twitch") &&
    isImageUrl(message)
  ) {
    const image = new Image();

    image.onload = function () {
      image.style.padding = "20px 0px";
      image.style.width = "100%";
      elements.message.innerHTML = "";
      elements.message.appendChild(image);

      addMessageItem(instance, data.message.msgId, "twitch", data.user.id);
    };

    const urlObj = new URL(message);
    urlObj.search = "";
    urlObj.hash = "";

    image.src =
      "https://external-content.duckduckgo.com/iu/?u=" + urlObj.toString();
  } else {
    addMessageItem(instance, data.message.msgId, "twitch", data.user.id);
  }
}

async function twitchAutomaticRewardRedemption(data) {
  if (data.reward_type != "gigantify_an_emote") return;

  const instance = cloneFromTemplate("messageTemplate");
  const elements = getMessageInstanceElements(instance);

  elements.userInfo.style.display = "none";

  // Show the gigantified emote
  const gigaEmote = data.gigantified_emote.imageUrl;
  const image = new Image();
  image.src = gigaEmote;
  image.style.padding = "20px 0px";
  image.style.width = "50%";

  image.onload = function () {
    elements.message.innerHTML = "";
    elements.message.appendChild(image);
  };

  addMessageItem(instance, data.id);
}

async function twitchAnnouncement(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const cardElements = getCardInstanceElements(instance);

  // Set the card background colors
  switch (data.announcementColor) {
    case "BLUE":
      cardElements.card.classList.add("announcementBlue");
      break;
    case "GREEN":
      cardElements.card.classList.add("announcementGreen");
      break;
    case "ORANGE":
      cardElements.card.classList.add("announcementOrange");
      break;
    case "PURPLE":
      cardElements.card.classList.add("announcementPurple");
      break;
  }

  // Set the card header
  cardElements.icon.innerText = "📢";
  cardElements.title.innerText = "Announcement";

  const msgInstance = cloneFromTemplate("messageTemplate");
  const msgElements = getMessageInstanceElements(msgInstance);

  // Set timestamp
  if (options.showTimestamps) {
    msgElements.timestamp.classList.add("timestamp");
    msgElements.timestamp.innerText = getCurrentTimeFormatted();
  }
  msgElements.username.innerText = data.user.name;
  msgElements.username.style.color = data.user.color;
  msgElements.message.innerText = data.text;

  // Remove the line break
  msgElements.colonSeparator.style.display = `inline`;
  msgElements.lineSpace.style.display = `none`;

  // Render platform
  msgElements.platform.style.display = `none`;

  // Render badges
  msgElements.badgeList.innerHTML = "";
  for (const badgeData of data.user.badges) {
    const badge = new Image();
    badge.src = badgeData.imageUrl;
    badge.classList.add("badge");
    msgElements.badgeList.appendChild(badge);
  }

  if (options.showPronouns) {
    await setPronouns(msgElements.pronouns, data.user.login);
  }

  // Render emotes
  for (const partData of data.parts) {
    if (partData.type == `emote`) {
      const emoteElement = `<img src="${partData.imageUrl}" class="emote"/>`;
      const emoteName = escapeRegExp(partData.text);

      let regexPattern = emoteName;

      // Check if the emote name consists only of word characters (alphanumeric and underscore)
      if (/^\w+$/.test(emoteName)) {
        regexPattern = `\\b${emoteName}\\b`;
      } else {
        // For non-word emotes, ensure they are surrounded by non-word characters or boundaries
        regexPattern = `(?:^|[^\\w])${emoteName}(?:$|[^\\w])`;
      }

      const regex = new RegExp(regexPattern, "g");
      msgElements.message.innerHTML = msgElements.message.innerHTML.replace(
        regex,
        emoteElement
      );
    }
  }

  // Insert the modified template instance into the DOM
  cardElements.content.appendChild(msgInstance);

  addMessageItem(instance, data.messageId);
}

async function twitchSub(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("twitch");

  // Set the card header
  for (const badgeData of data.user.badges) {
    if (badgeData.name == "subscriber") {
      const badge = new Image();
      badge.src = badgeData.imageUrl;
      badge.classList.add("badge");
      elements.icon.appendChild(badge);
    }
  }

  // Set the text
  const username = data.user.name;
  const subTier = data.sub_tier;
  const isPrime = data.is_prime;

  if (!isPrime)
    elements.title.innerText = `${username} subscribed with Tier ${subTier.charAt(
      0
    )}`;
  else elements.title.innerText = `${username} used their Prime Sub`;

  addMessageItem(instance, data.messageId);
}

async function twitchResub(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("twitch");

  // Set the card header
  for (const badgeData of data.user.badges) {
    if (badgeData.name == "subscriber") {
      const badge = new Image();
      badge.src = badgeData.imageUrl;
      badge.classList.add("badge");
      elements.icon.appendChild(badge);
    }
  }

  // Set the text
  const username = data.user.name;
  const subTier = data.subTier;
  const isPrime = data.isPrime;
  const cumulativeMonths = data.cumulativeMonths;
  const message = data.text;

  if (!isPrime)
    elements.title.innerText = `${username} resubscribed with Tier ${subTier.charAt(
      0
    )} (${cumulativeMonths} months)`;
  else
    elements.title.innerText = `${username} used their Prime Sub (${cumulativeMonths} months)`;
  elements.content.innerText = `${message}`;

  addMessageItem(instance, data.messageId);
}

async function twitchGiftSub(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("twitch");

  // Set the card header
  for (const badgeData of data.user.badges) {
    if (badgeData.name == "subscriber") {
      const badge = new Image();
      badge.src = badgeData.imageUrl;
      badge.classList.add("badge");
      elements.icon.appendChild(badge);
    }
  }

  // Set the text
  const username = data.user.name;
  const subTier = data.subTier;
  const recipient = data.recipient.name;
  const cumlativeTotal = data.cumlativeTotal;

  elements.title.innerText = `${username} gifted a Tier ${subTier.charAt(
    0
  )} subscription to ${recipient}`;
  if (cumlativeTotal > 0)
    elements.content.innerText = `They've gifted ${cumlativeTotal} subs in total!`;

  addMessageItem(instance, data.messageId);
}

async function twitchRewardRedemption(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("twitch");

  if (options.showAvatar) {
    // Render avatars
    const username = data.user_login;
    const avatarURL = await getAvatar(username);
    const avatar = new Image();
    avatar.src = avatarURL;
    avatar.classList.add("avatar");
    elements.avatar.appendChild(avatar);
  }

  // Set the text
  const username = data.user_name;
  const rewardName = data.reward.title;
  const cost = data.reward.cost;
  const userInput = data.user_input;
  const channelPointIcon = `<img src="icons/badges/twitch-channel-point.png" class="platform"/>`;

  elements.title.innerHTML = `${username} redeemed ${rewardName} ${channelPointIcon} ${cost}`;
  elements.content.innerText = `${userInput}`;

  addMessageItem(instance, data.messageId);
}

async function twitchRaid(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("twitch");

  if (options.showAvatar) {
    // Render avatars
    const username = data.from_broadcaster_user_login;
    const avatarURL = await getAvatar(username);
    const avatar = new Image();
    avatar.src = avatarURL;
    avatar.classList.add("avatar");
    elements.avatar.appendChild(avatar);
  }

  // Set the text
  const username = data.from_broadcaster_user_login;
  const viewers = data.viewers;

  elements.title.innerText = `${username} is raiding`;
  elements.content.innerText = `with a party of ${viewers}`;

  addMessageItem(instance, data.messageId);
}

function twitchChatMessageDeleted(data) {
  // Maintain a list of chat messages to delete
  const messagesToRemove = [];

  // ID of the message to remove
  const messageId = data.messageId;

  // Find the items to remove
  for (let i = 0; i < messageList.children.length; i++) {
    if (messageList.children[i].id === messageId) {
      messagesToRemove.push(messageList.children[i]);
    }
  }

  // Remove the items
  messagesToRemove.forEach((item) => {
    item.style.opacity = 0;
    item.style.height = 0;
    setTimeout(function () {
      messageList.removeChild(item);
    }, 1000);
  });
}

function twitchUserBanned(data) {
  // Maintain a list of chat messages to delete
  const messagesToRemove = [];

  // ID of the message to remove
  const userId = data.user_id;

  // Find the items to remove
  for (let i = 0; i < messageList.children.length; i++) {
    const child = messageList.children[i] as HTMLElement;
    if (child.dataset.userId === userId) {
      messagesToRemove.push(child);
    }
  }

  // Remove the items
  messagesToRemove.forEach((item) => {
    messageList.removeChild(item);
  });
}

function twitchChatCleared(data) {
  while (messageList.firstChild) {
    messageList.removeChild(messageList.firstChild);
  }
}

async function getAvatar(username) {
  if (avatarMap.has(username)) {
    console.debug(`Avatar found for ${username}. Retrieving from hash map.`);
    return avatarMap.get(username);
  } else {
    console.debug(`No avatar found for ${username}. Retrieving from Decapi.`);
    let response = await fetch("https://decapi.me/twitch/avatar/" + username);
    let data = await response.text();
    avatarMap.set(username, data);
    return data;
  }
}
