import { ignoreUserList, options } from "../config/config.js";
import { client } from "../config/streamerBotClient.js";
import * as domManager from "../helpers/domManager.js";
import * as optionActions from "../helpers/optionActions.js";

import { MessageInstance } from "../types/templateTypes.js";
import { PLATFORMS } from "../config/constants.js";

export function runTwitchOptions(): void {
  if (options.showTwitchMessages) {
    client.on("Twitch.ChatMessage", (response) => {
      console.debug(response.data);
      console.log(response);
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

  const instance = domManager.cloneFromTemplate("messageTemplate");
  const elements = domManager.getMessageInstanceElements(instance);
  const message = data.message.message;

  // puts background per message instead of a universsal box
  if (!options.useSharedBg)
    optionActions.setBgAndOpacity(elements.messageContainer);

  if (options.showMessage) {
    if (data.message.firstMessage) optionActions.setFirstTimeChatter(elements);
    if (!continueAfterHandleSharedChat(elements, data)) return;
    optionActions.setReplyMessage(elements, data);
    elements.message.innerText = message;
  }

  optionActions.setTimestamp(elements.timestamp);
  optionActions.setUserName(elements.username, data);

  await optionActions.setPronouns(elements.pronouns, data.message.username);

  // Set the "action" color
  if (data.message.isMe) elements.message.style.color = data.message.color;

  optionActions.setLineBreak(elements);
  optionActions.renderPlatform(elements.platform, PLATFORMS.twitch);
  optionActions.renderBadges(elements.badgeList, data.message.badges);
  optionActions.renderEmotes(elements.message, data.emotes, PLATFORMS.twitch);
  optionActions.renderCheermotes(elements.message, data.message.cheerEmotes);

  await optionActions.renderAvatar(
    elements.avatar,
    data.message.username,
    PLATFORMS.twitch
  );

  optionActions.groupConsecutiveMessages(
    elements.userInfo,
    data.user.id,
    PLATFORMS.twitch
  );

  await optionActions.embedImage(
    elements.message,
    message,
    data,
    PLATFORMS.twitch
  );

  domManager.addMessageItem(
    instance,
    data.message.msgId,
    PLATFORMS.twitch,
    data.user.id
  );
}

async function twitchAutomaticRewardRedemption(data): Promise<void> {
  if (data.reward_type != "gigantify_an_emote") return;

  const instance = domManager.cloneFromTemplate("messageTemplate");
  const elements = domManager.getMessageInstanceElements(instance);

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

  domManager.addMessageItem(instance, data.id);
}

async function twitchAnnouncement(data): Promise<void> {
  const instance = domManager.cloneFromTemplate("cardTemplate");
  const cardElements = domManager.getCardInstanceElements(instance);

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

  const msgInstance = domManager.cloneFromTemplate("messageTemplate");
  const msgElements = domManager.getMessageInstanceElements(msgInstance);

  optionActions.setTimestamp(msgElements.timestamp);

  msgElements.username.innerText = data.user.name;
  msgElements.username.style.color = data.user.color;
  msgElements.message.innerText = data.text;

  optionActions.setLineBreak(msgElements);

  // hide platform
  msgElements.platform.style.display = `none`;

  optionActions.renderBadges(msgElements.badgeList, data.user.badges);

  await optionActions.setPronouns(msgElements.pronouns, data.user.login);

  optionActions.renderEmotes(
    msgElements.message,
    data.parts,
    PLATFORMS.twitch,
    "emote"
  );

  // Insert the modified template instance into the DOM
  cardElements.content.appendChild(msgInstance);

  domManager.addMessageItem(instance, data.messageId);
}

async function twitchSub(data): Promise<void> {
  const instance = domManager.cloneFromTemplate("cardTemplate");
  const elements = domManager.getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("twitch");

  // Set the card header
  setSubBadge(elements.icon, data.user.badges);

  // Set the text
  const username = data.user.name;
  const subTier = data.sub_tier;
  const isPrime = data.is_prime;

  if (!isPrime)
    elements.title.innerText = `${username} subscribed with Tier ${subTier.charAt(
      0
    )}`;
  else elements.title.innerText = `${username} used their Prime Sub`;

  domManager.addMessageItem(instance, data.messageId);
}

async function twitchResub(data): Promise<void> {
  const instance = domManager.cloneFromTemplate("cardTemplate");
  const elements = domManager.getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("twitch");

  // Set the card header
  setSubBadge(elements.icon, data.user.badges);

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

  domManager.addMessageItem(instance, data.messageId);
}

async function twitchGiftSub(data): Promise<void> {
  const instance = domManager.cloneFromTemplate("cardTemplate");
  const elements = domManager.getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("twitch");

  // Set the card header
  setSubBadge(elements.icon, data.user.badges);

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

  domManager.addMessageItem(instance, data.messageId);
}

async function twitchRewardRedemption(data): Promise<void> {
  const instance = domManager.cloneFromTemplate("cardTemplate");
  const elements = domManager.getCardInstanceElements(instance);
  const username = data.user_name;
  const rewardName = data.reward.title;
  const cost = data.reward.cost;
  const userInput = data.user_input;
  const channelPointIcon = `<img src="icons/badges/twitch-channel-point.png" class="platform"/>`;

  // Set the card background colors
  elements.card.classList.add("twitch");

  optionActions.renderAvatar(
    elements.avatar,
    data.user_login,
    PLATFORMS.twitch
  );

  elements.title.innerHTML = `${username} redeemed ${rewardName} ${channelPointIcon} ${cost}`;
  elements.content.innerText = `${userInput}`;

  domManager.addMessageItem(instance, data.messageId);
}

async function twitchRaid(data): Promise<void> {
  const instance = domManager.cloneFromTemplate("cardTemplate");
  const elements = domManager.getCardInstanceElements(instance);
  const username = data.from_broadcaster_user_login;
  const viewers = data.viewers;

  // Set the card background colors
  elements.card.classList.add("twitch");

  optionActions.renderAvatar(elements.avatar, username, PLATFORMS.twitch);

  // Set the text
  elements.title.innerText = `${username} is raiding`;
  elements.content.innerText = `with a party of ${viewers}`;

  domManager.addMessageItem(instance, data.messageId);
}

function twitchChatMessageDeleted(data): void {
  // Maintain a list of chat messages to delete
  const messagesToRemove = [];

  // ID of the message to remove
  const messageId = data.messageId;

  // Find the items to remove
  for (let i = 0; i < domManager.messageList.children.length; i++) {
    if (domManager.messageList.children[i].id === messageId) {
      messagesToRemove.push(domManager.messageList.children[i]);
    }
  }

  // Remove the items
  messagesToRemove.forEach((item) => {
    item.style.opacity = 0;
    item.style.height = 0;
    setTimeout(function () {
      domManager.messageList.removeChild(item);
    }, 1000);
  });
}

function twitchUserBanned(data): void {
  // Maintain a list of chat messages to delete
  const messagesToRemove = [];

  // ID of the message to remove
  const userId = data.user_id;

  // Find the items to remove
  for (let i = 0; i < domManager.messageList.children.length; i++) {
    const child = domManager.messageList.children[i] as HTMLElement;
    if (child.dataset.userId === userId) {
      messagesToRemove.push(child);
    }
  }

  // Remove the items
  messagesToRemove.forEach((item) => {
    domManager.messageList.removeChild(item);
  });
}

function twitchChatCleared(data): void {
  while (domManager.messageList.firstChild) {
    domManager.messageList.removeChild(domManager.messageList.firstChild);
  }
}

function continueAfterHandleSharedChat(
  elements: MessageInstance,
  data: any
): boolean {
  if (data.isSharedChat) {
    const isPrimary = data.sharedChat?.primarySource;
    const showLevel = options.showTwitchSharedChat;

    if (showLevel > 1 && !isPrimary) {
      const sharedChatChannel = data.sharedChat.sourceRoom.name;
      elements.sharedChat.style.display = "block";
      elements.sharedChatChannel.innerHTML = `💬 ${sharedChatChannel}`;
      elements.messageContainer.classList.add("highlightMessage");
    } else if (!isPrimary && showLevel === 0) {
      return false;
    }
  }

  return true;
}

function setSubBadge(element: HTMLElement, badges: any[]): void {
  for (const badgeData of badges) {
    if (badgeData.name == "subscriber") {
      const badge = new Image();
      badge.src = badgeData.imageUrl;
      badge.classList.add("badge");
      element.appendChild(badge);
    }
  }
}
