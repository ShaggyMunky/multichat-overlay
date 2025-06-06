import { client } from "../config/streamerBotClient.js";
import { options } from "../config/config.js";
import * as utils from "./utils.js";
import * as domManager from "./domManager.js";
import { PLATFORMS, SCROLL_DIRECTION } from "../config/constants.js";
import { MessageInstance } from "../types/templateTypes.js";

const pronounMap = new Map();
const avatarMap = new Map();

export function setBaseMarkup(): void {
  document.body.style.fontFamily = options.font;
  document.body.style.fontSize = `${options.fontSize}px`;

  document.documentElement.style.setProperty(
    "--line-spacing",
    `${options.lineSpacing}em`
  );

  document.documentElement.style.setProperty(
    "--animation-speed",
    `${options.animationSpeed}s`
  );

  if (options.useSharedBg) {
    setBgAndOpacity(document.body);
  } else {
    document.getElementById("mainContainer").classList.add("per-msg-bg");
  }

  if (SCROLL_DIRECTION[options.scrollDirection]) {
    domManager.messageList.classList.add(
      SCROLL_DIRECTION[options.scrollDirection]
    );
  }
}

/**
 * Sets the opacity and background options to the referenced element
 */
export function setBgAndOpacity(element: HTMLElement): void {
  const opacity255 = Math.round(parseFloat(options.opacity) * 255);
  let hexOpacity = opacity255.toString(16);
  if (hexOpacity.length < 2) {
    hexOpacity = "0" + hexOpacity;
  }
  element.style.background = `${options.background}${hexOpacity}`;
}

/**
 * Applies style attributes to the message container
 */
export function setFirstTimeChatter(elements: MessageInstance): void {
  elements.firstMessage.style.display = "block";
  elements.messageContainer.classList.add("highlightMessage");
}

/**
 * Sets and enables the reply elements if isReply
 */
export function setReplyMessage(elements: MessageInstance, data: any): void {
  if (data.message.isReply) {
    const replyUser = data.message.reply.userName;
    const replyMsg = data.message.reply.msgBody;

    elements.reply.style.display = "block";
    elements.replyUser.innerText = replyUser;
    elements.replyMsg.innerText = replyMsg;
  }
}

/**
 * Enables the message timestamp if option is enabled
 */
export function setTimestamp(element: HTMLElement): void {
  if (options.showTimestamps) {
    element.classList.add("timestamp");
    element.innerText = utils.getCurrentTimeFormatted();
  }
}

/**
 * Displays the user name if option is enabled
 */
export function setUserName(
  element: HTMLElement,
  name: string,
  color: string
): void {
  if (options.showUsername) {
    element.innerText = name;
    element.style.color = color;
  }
}

/**
 * Displays the user pronouns if option is enabled (currently twitch only)
 */
export async function setPronouns(element: HTMLElement, user: string) {
  if (!options.showPronouns) return;

  const pronouns = await getPronouns("twitch", user);
  if (pronouns) {
    element.classList.add("pronouns");
    element.innerText = pronouns;
  }
}

async function getPronouns(platform, username) {
  if (pronounMap.has(username)) {
    console.debug(`Pronouns found for ${username}. Retrieving from hash map.`);
    return pronounMap.get(username);
  } else {
    console.debug(
      `No pronouns found for ${username}. Retrieving from alejo.io.`
    );
    //any type for now until proper type assertion
    const response = (await client.getUserPronouns(platform, username)) as any;
    const userFound = response.pronoun.userFound;
    const pronouns = userFound
      ? `${response.pronoun.pronounSubject}/${response.pronoun.pronounObject}`
      : "";

    pronounMap.set(username, pronouns);

    return pronouns;
  }
}

/**
 * Removes line break after username if option enabled
 */
export function setLineBreak(elements: MessageInstance): void {
  if (options.inlineChat) {
    elements.colonSeparator.style.display = `inline`;
    elements.lineSpace.style.display = `none`;
  }
}

/**
 * shows platform icon if option enabled
 */
export function renderPlatform(element: HTMLElement, platform: string): void {
  if (options.showPlatform)
    element.innerHTML = `<img src="icons/platforms/${platform.toLowerCase()}.png" class="platform"/>`;
}

/**
 * sets the user badges if option enabled
 */
export function renderBadges(
  element: HTMLElement,
  badges: any[],
  platform: string,
  user?: any
): void {
  if (options.showBadges) {
    switch (platform) {
      case PLATFORMS.twitch:
        element.innerHTML = "";
        for (const badgeData of badges) {
          const badge = new Image();
          badge.src = badgeData.imageUrl;
          badge.classList.add("badge");
          element.appendChild(badge);
        }
        break;
      case PLATFORMS.youTube:
        for (const badgeType of badges) {
          const key = `is${badgeType}`;
          if (user[key]) {
            const badge = new Image();
            badge.src = `icons/badges/youtube-${badgeType.toLowerCase()}.svg`;
            badge.style.filter = `invert(100%)`;
            badge.style.opacity = "0.8";
            badge.classList.add("badge");
            element.appendChild(badge);
          }
        }
        break;
    }
  }
}

/**
 * converts and applies the emotes from the original message
 */
export function renderEmotes(
  element: HTMLElement,
  emotes: any[],
  platform: string,
  filterType: string = "default"
): void {
  for (const emoteData of emotes) {
    const emoteElement = `<img src="${emoteData.imageUrl}" class="emote"/>`;
    switch (platform) {
      case PLATFORMS.twitch:
        if (filterType === "default" || emoteData.type === filterType) {
          const regex = getEmoteRegex(emoteData.name);
          element.innerHTML = element.innerHTML.replace(regex, emoteElement);
        }
        break;
      case PLATFORMS.youTube:
        element.innerHTML = element.innerHTML.replace(
          emoteData.name,
          emoteElement
        );
        break;
    }
  }
}

function getEmoteRegex(name: string): RegExp {
  const emoteName = utils.escapeRegExp(name);
  let regexPattern = emoteName;

  // Check if the emote name consists only of word characters (alphanumeric and underscore)
  if (/^\w+$/.test(emoteName)) {
    regexPattern = `\\b${emoteName}\\b`;
  } else {
    // For non-word emotes, ensure they are surrounded by non-word characters or boundaries
    regexPattern = `(?:^|[^\\w])${emoteName}(?:$|[^\\w])`;
  }

  return new RegExp(regexPattern, "g");
}

/**
 * converts and applies the twitch cheers from the original message
 */
export function renderCheermotes(element: HTMLElement, cheers: any[]): void {
  for (const cheerData of cheers) {
    const bits = cheerData.bits;
    const imageUrl = cheerData.imageUrl;
    const name = cheerData.name;
    const cheerEmoteElement = `<img src="${imageUrl}" class="emote"/>`;
    const bitsElements = `<span class="bits">${bits}</span>`;
    element.innerHTML = element.innerHTML.replace(
      new RegExp(`\\b${name}${bits}\\b`, "i"),
      cheerEmoteElement + bitsElements
    );
  }
}

/**
 * Shows the user avater if option enabled
 */
export async function renderAvatar(
  element: HTMLElement,
  reference: string,
  platform: string
): Promise<void> {
  if (options.showAvatar) {
    const avatar = new Image();
    avatar.classList.add("avatar");

    switch (platform) {
      case PLATFORMS.twitch:
        const avatarURL = await getAvatar(reference);
        avatar.src = avatarURL;
        break;
      case PLATFORMS.youTube:
        avatar.src = reference;
        break;
    }
    element.appendChild(avatar);
  }
}

async function getAvatar(username: string): Promise<string> {
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

/**
 * If enabled, hide the header if the same username sends a message twice in a row
 * EXCEPT when the scroll direction is set to reverse (scrollDirection == 2)
 */
export function groupConsecutiveMessages(
  element: HTMLElement,
  userId: string,
  platform: string
): void {
  if (
    options.groupConsecutiveMessages &&
    domManager.messageList.children.length > 0 &&
    options.scrollDirection != 2
  ) {
    const msgItem = domManager.messageList.lastChild as HTMLElement;
    const lastPlatform = msgItem.dataset.platform;
    const lastUserId = msgItem.dataset.userId;
    if (lastPlatform == platform && lastUserId == userId)
      element.style.display = "none";
  }
}

/**
 * Displays image from URL if enabled and user has appropriate permission
 */
export function embedImage(
  element: HTMLElement,
  message: string,
  data: any,
  platform: string
): Promise<void> {
  return new Promise((resolve) => {
    if (
      utils.canPostImage(options.imageEmbedPermissionLevel, data, platform) &&
      utils.isImageUrl(message)
    ) {
      const image = new Image();
      const urlObj = new URL(message);
      image.onload = function () {
        image.style.padding = "20px 0px";
        image.style.width = "100%";
        element.innerHTML = "";
        element.appendChild(image);
        resolve();
      };

      image.onerror = function () {
        resolve();
      };

      urlObj.search = "";
      urlObj.hash = "";
      image.src =
        "https://external-content.duckduckgo.com/iu/?u=" + urlObj.toString();
    } else {
      resolve();
    }
  });
}
