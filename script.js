////////////////
// PARAMETERS //
////////////////
/*-- reduced the number of variables by combining  const queryString = window.location.search; --*/
const urlParams = new URLSearchParams(window.location.search);

const sbServerAddress = urlParams.get("address") || "127.0.0.1";
const sbServerPort = urlParams.get("port") || "8081";
const avatarMap = new Map();
const pronounMap = new Map();

/////////////
// OPTIONS //
/////////////
const paramConfig = {
  showPlatform: { type: "bool", default: true },
  showAvatar: { type: "bool", default: false },
  showTimestamps: { type: "bool", default: false },
  showBadges: { type: "bool", default: true },
  showPronouns: { type: "bool", default: false },
  showUsername: { type: "bool", default: true },
  showMessage: { type: "bool", default: true },
  font: { type: "string", default: "" },
  fontSize: { type: "string", default: "22" },
  lineSpacing: { type: "string", default: "1.7" },
  background: { type: "string", default: "#000000" },
  opacity: { type: "string", default: "0.25" },
  useSharedBg: { type: "bool", default: false },
  hideAfter: { type: "int", default: 30 },
  excludeCommands: { type: "bool", default: true },
  ignoreChatters: { type: "string", default: "StreamElements,Streamlabs" },
  scrollDirection: { type: "int", default: 1 },
  groupConsecutiveMessages: { type: "bool", default: false },
  inlineChat: { type: "bool", default: true },
  imageEmbedPermissionLevel: { type: "int", default: 30 },
  showTwitchMessages: { type: "bool", default: true },
  showTwitchAnnouncements: { type: "bool", default: false },
  showTwitchSubs: { type: "bool", default: true },
  showTwitchChannelPointRedemptions: { type: "bool", default: false },
  showTwitchRaids: { type: "bool", default: false },
  showTwitchSharedChat: { type: "int", default: 2 },
  showYouTubeMessages: { type: "bool", default: true },
  showYouTubeSuperChats: { type: "bool", default: true },
  showYouTubeSuperStickers: { type: "bool", default: true },
  showYouTubeMemberships: { type: "bool", default: true },
  showStreamlabsDonations: { type: "bool", default: false },
  showStreamElementsTips: { type: "bool", default: true },
  showPatreonMemberships: { type: "bool", default: false },
  showKofiDonations: { type: "bool", default: false },
  showTipeeeStreamDonations: { type: "bool", default: false },
  showFourthwallAlerts: { type: "bool", default: false },
  furryMode: { type: "bool", default: false },
  animationSpeed: { type: "int", default: 0.1 },
};

/*-- converting the multitude of variables into an object improves scalability and maintainability and allowing for dynamic access and easier autocompletion  --*/
const options = GetOptions(paramConfig);
// Set fonts for the widget
document.body.style.fontFamily = options.font;
document.body.style.fontSize = `${options.fontSize}px`;

// Set line spacing
document.documentElement.style.setProperty(
  "--line-spacing",
  `${options.lineSpacing}em`
);

// Set the background color for entire bounding box
if (options.useSharedBg) {
  SetBgAndOpacity(document.body);
} else {
  document.getElementById("mainContainer").classList.add("per-msg-bg");
}

// Get a list of chatters to ignore
const ignoreUserList =
  options.ignoreChatters.split(",").map((item) => item.trim().toLowerCase()) ||
  [];

// Set the scroll direction
switch (options.scrollDirection) {
  case 1:
    document
      .getElementById("messageList")
      .classList.add("normalScrollDirection");
    break;
  case 2:
    document
      .getElementById("messageList")
      .classList.add("reverseScrollDirection");
    break;
}

// Set the animation speed
document.documentElement.style.setProperty(
  "--animation-speed",
  `${options.animationSpeed}s`
);

/////////////////////////
// STREAMER.BOT CLIENT //
/////////////////////////

const client = new StreamerbotClient({
  host: sbServerAddress,
  port: sbServerPort,

  onConnect: (data) => {
    console.log(
      `Streamer.bot successfully connected to ${sbServerAddress}:${sbServerPort}`
    );
    console.debug(data);
    SetConnectionStatus(true);
  },

  onDisconnect: () => {
    console.error(
      `Streamer.bot disconnected from ${sbServerAddress}:${sbServerPort}`
    );
    SetConnectionStatus(false);
  },
});

/*-- relocated all event checks to the root level to prevent event binding if not enabled --*/
if (options.showTwitchMessages) {
  client.on("Twitch.ChatMessage", (response) => {
    console.debug(response.data);
    TwitchChatMessage(response.data);
  });

  client.on("Twitch.Cheer", (response) => {
    console.debug(response.data);
    TwitchChatMessage(response.data);
  });
}

client.on("Twitch.AutomaticRewardRedemption", (response) => {
  console.debug(response.data);
  TwitchAutomaticRewardRedemption(response.data);
});

if (options.showTwitchAnnouncements) {
  client.on("Twitch.Announcement", (response) => {
    console.debug(response.data);
    TwitchAnnouncement(response.data);
  });
}

if (options.showTwitchSubs) {
  client.on("Twitch.Sub", (response) => {
    console.debug(response.data);
    TwitchSub(response.data);
  });

  client.on("Twitch.ReSub", (response) => {
    console.debug(response.data);
    TwitchResub(response.data);
  });

  client.on("Twitch.GiftSub", (response) => {
    console.debug(response.data);
    TwitchGiftSub(response.data);
  });
}

if (options.showTwitchChannelPointRedemptions) {
  client.on("Twitch.RewardRedemption", (response) => {
    console.debug(response.data);
    TwitchRewardRedemption(response.data);
  });
}

if (options.showTwitchRaids) {
  client.on("Twitch.Raid", (response) => {
    console.debug(response.data);
    TwitchRaid(response.data);
  });
}

client.on("Twitch.ChatMessageDeleted", (response) => {
  console.debug(response.data);
  TwitchChatMessageDeleted(response.data);
});

client.on("Twitch.UserBanned", (response) => {
  console.debug(response.data);
  TwitchUserBanned(response.data);
});

client.on("Twitch.UserTimedOut", (response) => {
  console.debug(response.data);
  TwitchUserBanned(response.data);
});

client.on("Twitch.ChatCleared", (response) => {
  console.debug(response.data);
  TwitchChatCleared(response.data);
});

if (options.showYouTubeMessages) {
  client.on("YouTube.Message", (response) => {
    console.debug(response.data);
    YouTubeMessage(response.data);
  });
}

if (options.showYouTubeSuperChats) {
  client.on("YouTube.SuperChat", (response) => {
    console.debug(response.data);
    YouTubeSuperChat(response.data);
  });
}

if (options.showYouTubeSuperStickers) {
  client.on("YouTube.SuperSticker", (response) => {
    console.debug(response.data);
    YouTubeSuperSticker(response.data);
  });
}

if (options.showYouTubeMemberships) {
  client.on("YouTube.NewSponsor", (response) => {
    console.debug(response.data);
    YouTubeNewSponsor(response.data);
  });

  client.on("YouTube.GiftMembershipReceived", (response) => {
    console.debug(response.data);
    YouTubeGiftMembershipReceived(response.data);
  });
}

if (options.showStreamlabsDonations) {
  client.on("Streamlabs.Donation", (response) => {
    console.debug(response.data);
    StreamlabsDonation(response.data);
  });
}

if (options.showStreamElementsTips) {
  client.on("StreamElements.Tip", (response) => {
    console.debug(response.data);
    StreamElementsTip(response.data);
  });
}

if (options.showPatreonMemberships) {
  client.on("Patreon.PledgeCreated", (response) => {
    console.debug(response.data);
    PatreonPledgeCreated(response.data);
  });
}

if (options.showKofiDonations) {
  client.on("Kofi.Donation", (response) => {
    console.debug(response.data);
    KofiDonation(response.data);
  });

  client.on("Kofi.Subscription", (response) => {
    console.debug(response.data);
    KofiSubscription(response.data);
  });

  client.on("Kofi.Resubscription", (response) => {
    console.debug(response.data);
    KofiResubscription(response.data);
  });

  client.on("Kofi.ShopOrder", (response) => {
    console.debug(response.data);
    KofiShopOrder(response.data);
  });
}

if (options.showTipeeeStreamDonations) {
  client.on("TipeeeStream.Donation", (response) => {
    console.debug(response.data);
    TipeeeStreamDonation(response.data);
  });
}

if (options.showFourthwallAlerts) {
  client.on("Fourthwall.OrderPlaced", (response) => {
    console.debug(response.data);
    FourthwallOrderPlaced(response.data);
  });

  client.on("Fourthwall.Donation", (response) => {
    console.debug(response.data);
    FourthwallDonation(response.data);
  });

  client.on("Fourthwall.SubscriptionPurchased", (response) => {
    console.debug(response.data);
    FourthwallSubscriptionPurchased(response.data);
  });

  client.on("Fourthwall.GiftPurchase", (response) => {
    console.debug(response.data);
    FourthwallGiftPurchase(response.data);
  });

  client.on("Fourthwall.GiftDrawStarted", (response) => {
    console.debug(response.data);
    FourthwallGiftDrawStarted(response.data);
  });

  client.on("Fourthwall.GiftDrawEnded", (response) => {
    console.debug(response.data);
    FourthwallGiftDrawEnded(response.data);
  });
}

///////////////////////
// MULTICHAT OVERLAY //
///////////////////////

async function TwitchChatMessage(data) {
  // Don't post messages starting with "!"
  if (data.message.message.startsWith("!") && options.excludeCommands) return;

  // Don't post messages from users from the ignore list
  if (ignoreUserList.includes(data.message.username.toLowerCase())) return;

  const instance = CloneFromTemplate("messageTemplate");
  const elements = GetMessageInstanceElements(instance);

  // puts background per message instead of a universsal box
  if (!options.useSharedBg) {
    SetBgAndOpacity(elements.messageContainer);
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

  // Set timestamp
  if (options.showTimestamps) {
    elements.timestamp.classList.add("timestamp");
    elements.timestamp.innerText = GetCurrentTimeFormatted();
  }

  // Set the username info
  if (options.showUsername) {
    elements.username.innerText = data.message.displayName;
    elements.username.style.color = data.message.color;
  }

  // Set pronouns
  const pronouns = await GetPronouns("twitch", data.message.username);
  if (pronouns && options.showPronouns) {
    elements.pronouns.classList.add("pronouns");
    elements.pronouns.innerText = pronouns;
  }

  // Set the message data
  let message = data.message.message;
  const messageColor = data.message.color;
  const role = data.message.role;

  // Set furry mode
  if (options.furryMode) message = TranslateToFurry(message);

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
    for (i in data.message.badges) {
      const badge = new Image();
      badge.src = data.message.badges[i].imageUrl;
      badge.classList.add("badge");
      elements.badgeList.appendChild(badge);
    }
  }

  // Render emotes
  for (i in data.emotes) {
    const emoteElement = `<img src="${data.emotes[i].imageUrl}" class="emote"/>`;
    const emoteName = EscapeRegExp(data.emotes[i].name);

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
  for (i in data.cheerEmotes) {
    const bits = data.cheerEmotes[i].bits;
    const imageUrl = data.cheerEmotes[i].imageUrl;
    const name = data.cheerEmotes[i].name;
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
    const avatarURL = await GetAvatar(username);
    const avatar = new Image();
    avatar.src = avatarURL;
    avatar.classList.add("avatar");
    elements.avatar.appendChild(avatar);
  }

  // Hide the header if the same username sends a message twice in a row
  // EXCEPT when the scroll direction is set to reverse (scrollDirection == 2)
  const messageList = document.getElementById("messageList");
  if (
    options.groupConsecutiveMessages &&
    messageList.children.length > 0 &&
    options.scrollDirection != 2
  ) {
    const lastPlatform = messageList.lastChild.dataset.platform;
    const lastUserId = messageList.lastChild.dataset.userId;
    if (lastPlatform == "twitch" && lastUserId == data.user.id)
      elements.userInfo.style.display = "none";
  }

  // Embed image
  if (
    CanPostImage(options.imageEmbedPermissionLevel, data, "twitch") &&
    IsImageUrl(message)
  ) {
    const image = new Image();

    image.onload = function () {
      image.style.padding = "20px 0px";
      image.style.width = "100%";
      elements.message.innerHTML = "";
      elements.message.appendChild(image);

      AddMessageItem(instance, data.message.msgId, "twitch", data.user.id);
    };

    const urlObj = new URL(message);
    urlObj.search = "";
    urlObj.hash = "";

    image.src =
      "https://external-content.duckduckgo.com/iu/?u=" + urlObj.toString();
  } else {
    AddMessageItem(instance, data.message.msgId, "twitch", data.user.id);
  }
}

async function TwitchAutomaticRewardRedemption(data) {
  const instance = CloneFromTemplate("messageTemplate");
  const elements = GetMessageInstanceElements(instance);

  if (data.reward_type != "gigantify_an_emote") return;

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

  AddMessageItem(instance, data.id);
}

async function TwitchAnnouncement(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const cardElements = GetCardInstanceElements(instance);

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

  const msgInstance = CloneFromTemplate("messageTemplate");
  const msgElements = GetMessageInstanceElements(msgInstance);

  // Set timestamp
  if (options.showTimestamps) {
    msgElements.timestamp.classList.add("timestamp");
    msgElements.timestamp.innerText = GetCurrentTimeFormatted();
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
  for (i in data.user.badges) {
    const badge = new Image();
    badge.src = data.user.badges[i].imageUrl;
    badge.classList.add("badge");
    msgElements.badgeList.appendChild(badge);
  }

  // Set pronouns
  const pronouns = await GetPronouns("twitch", data.user.login);
  if (pronouns) {
    msgElements.pronouns.classList.add("pronouns");
    msgElements.pronouns.innerText = pronouns;
  }

  // Render emotes
  for (i in data.parts) {
    if (data.parts[i].type == `emote`) {
      const emoteElement = `<img src="${data.parts[i].imageUrl}" class="emote"/>`;
      const emoteName = EscapeRegExp(data.parts[i].text);

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

  AddMessageItem(instance, data.messageId);
}

async function TwitchSub(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("twitch");

  // Set the card header
  for (i in data.user.badges) {
    if (data.user.badges[i].name == "subscriber") {
      const badge = new Image();
      badge.src = data.user.badges[i].imageUrl;
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

  AddMessageItem(instance, data.messageId);
}

async function TwitchResub(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("twitch");

  // Set the card header
  for (i in data.user.badges) {
    if (data.user.badges[i].name == "subscriber") {
      const badge = new Image();
      badge.src = data.user.badges[i].imageUrl;
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

  AddMessageItem(instance, data.messageId);
}

async function TwitchGiftSub(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("twitch");

  // Set the card header
  for (i in data.user.badges) {
    if (data.user.badges[i].name == "subscriber") {
      const badge = new Image();
      badge.src = data.user.badges[i].imageUrl;
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

  AddMessageItem(instance, data.messageId);
}

async function TwitchRewardRedemption(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("twitch");

  if (options.showAvatar) {
    // Render avatars
    const username = data.user_login;
    const avatarURL = await GetAvatar(username);
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

  AddMessageItem(instance, data.messageId);
}

async function TwitchRaid(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("twitch");

  if (options.showAvatar) {
    // Render avatars
    const username = data.from_broadcaster_user_login;
    const avatarURL = await GetAvatar(username);
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

  AddMessageItem(instance, data.messageId);
}

function TwitchChatMessageDeleted(data) {
  const messageList = document.getElementById("messageList");

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

function TwitchUserBanned(data) {
  const messageList = document.getElementById("messageList");

  // Maintain a list of chat messages to delete
  const messagesToRemove = [];

  // ID of the message to remove
  const userId = data.user_id;

  // Find the items to remove
  for (let i = 0; i < messageList.children.length; i++) {
    if (messageList.children[i].dataset.userId === userId) {
      messagesToRemove.push(messageList.children[i]);
    }
  }

  // Remove the items
  messagesToRemove.forEach((item) => {
    messageList.removeChild(item);
  });
}

function TwitchChatCleared(data) {
  const messageList = document.getElementById("messageList");

  while (messageList.firstChild) {
    messageList.removeChild(messageList.firstChild);
  }
}

function YouTubeMessage(data) {
  // Don't post messages starting with "!"
  if (data.message.startsWith("!") && options.excludeCommands) return;

  // Don't post messages from users from the ignore list
  if (ignoreUserList.includes(data.user.name.toLowerCase())) return;

  const instance = CloneFromTemplate("messageTemplate");
  const elements = GetMessageInstanceElements(instance);

  // puts background per message instead of a universsal box
  if (!options.useSharedBg) {
    SetBgAndOpacity(elements.messageContainer);
  }

  // Set timestamp
  if (options.showTimestamps) {
    elements.timestamp.classList.add("timestamp");
    elements.timestamp.innerText = GetCurrentTimeFormatted();
  }

  // Set the message data
  if (options.showUsername) {
    elements.username.innerText = data.user.name;
    elements.username.style.color = "#f70000"; // YouTube users do not have colors, so just set it to red
  }

  if (options.showMessage) {
    elements.message.innerText = data.message;
  }

  // Set furry mode
  if (options.furryMode)
    elements.message.innerText = TranslateToFurry(data.message);

  // Remove the line break
  if (options.inlineChat) {
    elements.colonSeparator.style.display = `inline`;
    elements.lineSpace.style.display = `none`;
  }

  // Render platform
  if (options.showPlatform) {
    const platformElements = `<img src="icons/platforms/youtube.png" class="platform"/>`;
    elements.platform.innerHTML = platformElements;
  }

  // Render badges
  if (data.user.isOwner && options.showBadges) {
    const badge = new Image();
    badge.src = `icons/badges/youtube-broadcaster.svg`;
    badge.style.filter = `invert(100%)`;
    badge.style.opacity = 0.8;
    badge.classList.add("badge");
    elements.badgeList.appendChild(badge);
  }

  if (data.user.isModerator && options.showBadges) {
    const badge = new Image();
    badge.src = `icons/badges/youtube-moderator.svg`;
    badge.style.filter = `invert(100%)`;
    badge.style.opacity = 0.8;
    badge.classList.add("badge");
    elements.badgeList.appendChild(badge);
  }

  if (data.user.isSponsor && options.showBadges) {
    const badge = new Image();
    badge.src = `icons/badges/youtube-member.svg`;
    badge.style.filter = `invert(100%)`;
    badge.style.opacity = 0.8;
    badge.classList.add("badge");
    elements.badgeList.appendChild(badge);
  }

  if (data.user.isVerified && options.showBadges) {
    const badge = new Image();
    badge.src = `icons/badges/youtube-verified.svg`;
    badge.style.filter = `invert(100%)`;
    badge.style.opacity = 0.8;
    badge.classList.add("badge");
    elements.badgeList.appendChild(badge);
  }

  // Render emotes
  for (i in data.emotes) {
    const emoteElement = `<img src="${data.emotes[i].imageUrl}" class="emote"/>`;
    // elements.message.innerHTML = elements.message.innerHTML.replace(new RegExp(`\\b${data.emotes[i].name}\\b`), emoteElement);
    elements.message.innerHTML = elements.message.innerHTML.replace(
      data.emotes[i].name,
      emoteElement
    );
  }

  // Render avatars
  if (options.showAvatar) {
    const avatar = new Image();
    avatar.src = data.user.profileImageUrl;
    avatar.classList.add("avatar");
    elements.avatar.appendChild(avatar);
  }

  // Hide the header if the same username sends a message twice in a row
  // EXCEPT when the scroll direction is set to reverse (scrollDirection == 2)
  const messageList = document.getElementById("messageList");
  if (
    options.groupConsecutiveMessages &&
    messageList.children.length > 0 &&
    options.scrollDirection != 2
  ) {
    const lastPlatform = messageList.lastChild.dataset.platform;
    const lastUserId = messageList.lastChild.dataset.userId;
    if (lastPlatform == "youtube" && lastUserId == data.user.id)
      elements.userInfo.style.display = "none";
  }

  // Embed image
  const message = data.message;
  if (
    CanPostImage(options.imageEmbedPermissionLevel, data, "youtube") &&
    IsImageUrl(message)
  ) {
    const image = new Image();

    image.onload = function () {
      image.style.padding = "20px 0px";
      image.style.width = "100%";
      elements.message.innerHTML = "";
      elements.message.appendChild(image);

      AddMessageItem(instance, data.message.msgId, "youtube", data.user.id);
    };

    const urlObj = new URL(message);
    urlObj.search = "";
    urlObj.hash = "";

    image.src =
      "https://external-content.duckduckgo.com/iu/?u=" + urlObj.toString();
  } else {
    AddMessageItem(instance, data.eventId, "youtube", data.user.id);
  }
}

function YouTubeSuperChat(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("youtube");

  // Set message text
  elements.title.innerText = `🪙 ${data.user.name} sent a Super Chat (${data.amount})`;
  elements.content.innerText = `${data.message}!`;

  AddMessageItem(instance, data.eventId);
}

function YouTubeSuperSticker(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const cardElements = GetCardInstanceElements(instance);

  // Set the card background colors
  cardElements.card.classList.add("youtube");

  const stickerInstance = CloneFromTemplate("stickerTemplate");
  const stickerElements = GetStickerInstanceElements(stickerInstance);

  // Render sticker
  stickerElements.stickerImg.src = FindFirstImageUrl(data);
  stickerElements.stickerLabel.innerText = `${data.user.name} sent a Super Sticker (${data.amount})`;

  cardElements.content.appendChild(stickerInstance);

  AddMessageItem(instance, data.eventId);
}

function YouTubeNewSponsor(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("youtube");

  // Set message text
  elements.title.innerText = `⭐ New ${data.levelName}`;
  elements.content.innerText = `Welcome ${data.user.name}!`;

  AddMessageItem(instance, data.eventId);
}

function YouTubeGiftMembershipReceived(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("youtube");

  // Set message text
  elements.title.innerText = `🎁 ${data.gifter.name} gifted a membership`;
  elements.content.innerText = `to ${data.user.name} (${data.tier})!`;

  AddMessageItem(instance, data.eventId);
}

async function StreamlabsDonation(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("streamlabs");

  // Set the text
  const donater = data.from;
  const formattedAmount = data.formattedAmount;
  const currency = data.currency;
  const message = data.message;

  elements.title.innerText = `🪙 ${donater} donated ${currency}${formattedAmount}`;
  elements.content.innerText = `${message}`;

  AddMessageItem(instance);
}

async function StreamElementsTip(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("streamelements");

  // Set the text
  const donater = data.username;
  const formattedAmount = `$${data.amount}`;
  const currency = data.currency;
  const message = data.message;

  elements.title.innerText = `🪙 ${donater} donated ${currency}${formattedAmount}`;
  elements.content.innerText = `${message}`;

  AddMessageItem(instance, data.id);
}

function PatreonPledgeCreated(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("patreon");

  const user = data.attributes.full_name;
  const amount = (data.attributes.will_pay_amount_cents / 100).toFixed(2);
  const patreonIcon = `<img src="icons/platforms/patreon.png" class="platform"/>`;

  elements.title.innerHTML = `${patreonIcon} ${user} joined Patreon ($${amount})`;

  AddMessageItem(instance, data.id);
}

function KofiDonation(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

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

  AddMessageItem(instance, data.id);
}

function KofiSubscription(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

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

  AddMessageItem(instance, data.id);
}

function KofiResubscription(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("kofi");

  // Set the text
  const user = data.from;
  const tier = data.tier;
  const message = data.message;
  const kofiIcon = `<img src="icons/platforms/kofi.png" class="platform"/>`;

  elements.title.innerHTML = `${kofiIcon} ${user} subscribed (${tier})`;
  if (message != null) elements.content.innerHTML = `${message}`;

  AddMessageItem(instance, data.id);
}

function KofiShopOrder(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

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

  AddMessageItem(instance, data.id);
}

function TipeeeStreamDonation(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

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

  AddMessageItem(instance, data.id);
}

function FourthwallOrderPlaced(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

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
  const message = DecodeHTMLString(data.statmessageus);
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

  AddMessageItem(instance, data.id);
}

function FourthwallDonation(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

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

  AddMessageItem(instance, data.id);
}

function FourthwallSubscriptionPurchased(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

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

  AddMessageItem(instance, data.id);
}

function FourthwallGiftPurchase(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

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
  const message = DecodeHTMLString(data.statmessageus);

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

  AddMessageItem(instance, data.id);
}

function FourthwallGiftDrawStarted(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

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

  AddMessageItem(instance, data.id);
}

function FourthwallGiftDrawEnded(data) {
  const instance = CloneFromTemplate("cardTemplate");
  const elements = GetCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("fourthwall");
  elements.title.classList.add("centerThatShitHomie");
  elements.content.classList.add("centerThatShitHomie");

  let contents = "";

  // If the user ordered more than one item, write how many items they ordered
  contents += `<h3>🥳 GIVEAWAY ENDED 🥳</h3>`;
  //contents += `Congratulations ${GetWinnersList(data.gifts)}!`

  elements.title.innerHTML = contents;
  elements.content.innerHTML = `Congratulations ${GetWinnersList(data.gifts)}!`;
  //elements.content.style.display = `none`;

  AddMessageItem(instance, data.id);
}

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

/*-- this function combines the GetBooleanParam, GetIntParam, and basic urlParams.get  --*/
function GetParamValue(name, type, defaultValue) {
  const rawValue = urlParams.get(name);
  if (rawValue === null) return defaultValue;

  switch (type) {
    case "bool":
      if (rawValue.toLowerCase() === "true") return true;
      if (rawValue.toLowerCase() === "false") return false;
      return rawValue;
    case "int":
      const intVal = parseInt(rawValue, 10);
      return isNaN(intVal) ? null : intVal;
    default:
      return rawValue;
  }
}

/*-- this function returns a single object that will be used throughout the code  --*/
function GetOptions(config) {
  const result = {};
  for (const [key, { type, default: def }] of Object.entries(config)) {
    result[key] = GetParamValue(key, type, def);
  }
  return result;
}

/*-- this resusable function reduces the redundancy of the query methods for all of the elements in the card Instance  --*/
function GetCardInstanceElements(instance) {
  return {
    card: instance.querySelector("#card"),
    header: instance.querySelector("#header"),
    avatar: instance.querySelector("#avatar"),
    icon: instance.querySelector("#icon"),
    title: instance.querySelector("#title"),
    content: instance.querySelector("#content"),
  };
}

/*-- this resusable function reduces the redundancy of the query methods for all of the elements in the message Instance  --*/
function GetMessageInstanceElements(instance) {
  return {
    messageContainer: instance.querySelector("#messageContainer"),
    firstMessage: instance.querySelector("#firstMessage"),
    sharedChat: instance.querySelector("#sharedChat"),
    sharedChatChannel: instance.querySelector("#sharedChatChannel"),
    userInfo: instance.querySelector("#userInfo"),
    avatar: instance.querySelector("#avatar"),
    timestamp: instance.querySelector("#timestamp"),
    platform: instance.querySelector("#platform"),
    badgeList: instance.querySelector("#badgeList"),
    pronouns: instance.querySelector("#pronouns"),
    username: instance.querySelector("#username"),
    colonSeparator: instance.querySelector("#colonSeparator"),
    lineSpace: instance.querySelector("#lineSpace"),
    reply: instance.querySelector("#reply"),
    replyUser: instance.querySelector("#replyUser"),
    replyMsg: instance.querySelector("#replyMsg"),
    message: instance.querySelector("#message"),
  };
}

function GetStickerInstanceElements(instance) {
  return {
    sticker: instance.querySelector("#sticker"),
    youtubeSuperSticker: instance.querySelector("#youtubeSuperSticker"),
    stickerImg: instance.querySelector("#stickerImg"),
    stickerLabel: instance.querySelector("#stickerLabel"),
  };
}

function GetCurrentTimeFormatted() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const formattedTime = `${hours}:${minutes} ${ampm}`;
  return formattedTime;
}

async function GetAvatar(username) {
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

async function GetPronouns(platform, username) {
  if (pronounMap.has(username)) {
    console.debug(`Pronouns found for ${username}. Retrieving from hash map.`);
    return pronounMap.get(username);
  } else {
    console.debug(
      `No pronouns found for ${username}. Retrieving from alejo.io.`
    );
    const response = await client.getUserPronouns(platform, username);
    const userFound = response.pronoun.userFound;
    const pronouns = userFound
      ? `${response.pronoun.pronounSubject}/${response.pronoun.pronounObject}`
      : "";

    pronounMap.set(username, pronouns);

    return pronouns;
  }
}

function IsImageUrl(url) {
  try {
    const { pathname } = new URL(url);
    // Only check the pathname since query parameters are not included in it.
    return /\.(png|jpe?g|webp|gif)$/i.test(pathname);
  } catch (error) {
    // Return false if the URL is invalid.
    return false;
  }
}

function CloneFromTemplate(name) {
  const template = document.getElementById(name);
  return template.content.cloneNode(true);
}

function AddMessageItem(element, elementID, platform, userId) {
  // Calculate the height of the div before inserting
  const tempDiv = document.getElementById(
    "IPutThisHereSoICanCalculateHowBigEachMessageIsSupposedToBeBeforeIAddItToTheMessageList"
  );
  const tempDivTwoElectricBoogaloo = document.createElement("div");
  tempDivTwoElectricBoogaloo.appendChild(element);
  tempDiv.appendChild(tempDivTwoElectricBoogaloo);

  setTimeout(function () {
    const calculatedHeight = tempDivTwoElectricBoogaloo.offsetHeight + "px";

    // Create a new line item to add to the message list later
    var lineItem = document.createElement("li");
    lineItem.id = elementID;
    lineItem.dataset.platform = platform;
    lineItem.dataset.userId = userId;

    // Set scroll direction
    if (options.scrollDirection == 2)
      lineItem.classList.add("reverseLineItemDirection");

    // Move the element from the temp div to the new line item
    lineItem.appendChild(tempDiv.firstElementChild);

    // Add the line item to the list and animate it
    // We need to manually set the height as straight CSS can't animate on "height: auto"
    messageList.appendChild(lineItem);
    setTimeout(function () {
      lineItem.className = lineItem.className + " show";
      lineItem.style.maxHeight = calculatedHeight;
      // After it's done animating, remove the height constraint in case the div needs to get bigger
      setTimeout(function () {
        lineItem.style.maxHeight = "none";
      }, 1000);
    }, 10);

    // Remove old messages that have gone off screen to save memory
    while (messageList.clientHeight > 5 * window.innerHeight) {
      messageList.removeChild(messageList.firstChild);
    }

    if (options.hideAfter > 0) {
      setTimeout(function () {
        lineItem.style.opacity = 0;
        setTimeout(function () {
          messageList.removeChild(lineItem);
        }, 1000);
      }, options.hideAfter * 1000);
    }
  }, 200);
}

function DecodeHTMLString(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function SetBgAndOpacity(element) {
  const opacity255 = Math.round(parseFloat(options.opacity) * 255);
  let hexOpacity = opacity255.toString(16);
  if (hexOpacity.length < 2) {
    hexOpacity = "0" + hexOpacity;
  }
  element.style.background = `${options.background}${hexOpacity}`;
}

// I used Gemini for this shit so if it doesn't work, blame Google
function FindFirstImageUrl(jsonObject) {
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

function CanPostImage(targetPermissions, data, platform) {
  return GetPermissionLevel(data, platform) >= targetPermissions;
}

function GetPermissionLevel(data, platform) {
  switch (platform) {
    case "twitch":
      const role = data.message.role ?? 0;
      const isSub = data.message.subscriber;

      if (role >= 4) return 40;
      if (role >= 3) return 30;
      if (role >= 2) return 20;
      if (isSub) return 15;
      return 10;
    case "youtube":
      const { isOwner, isModerator, isSponsor } = data.user;

      if (isOwner) return 40;
      if (isModerator) return 30;
      if (isSponsor) return 15;
      return 10;
  }
}

function GetWinnersList(gifts) {
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

function TranslateToFurry(sentence) {
  const words = sentence.toLowerCase().split(/\b/);

  const furryWords = words.map((word) => {
    if (/\w+/.test(word)) {
      let newWord = word;

      // Common substitutions
      newWord = newWord.replace(/l/g, "w");
      newWord = newWord.replace(/r/g, "w");
      newWord = newWord.replace(/th/g, "f");
      newWord = newWord.replace(/you/g, "yous");
      newWord = newWord.replace(/my/g, "mah");
      newWord = newWord.replace(/me/g, "meh");
      newWord = newWord.replace(/am/g, "am");
      newWord = newWord.replace(/is/g, "is");
      newWord = newWord.replace(/are/g, "are");
      newWord = newWord.replace(/very/g, "vewy");
      newWord = newWord.replace(/pretty/g, "pwetty");
      newWord = newWord.replace(/little/g, "wittle");
      newWord = newWord.replace(/nice/g, "nyce");

      // Random additions
      if (Math.random() < 0.15) {
        newWord += " nya~";
      } else if (Math.random() < 0.1) {
        newWord += " >w<";
      } else if (Math.random() < 0.05) {
        newWord += " owo";
      }

      return newWord;
    }
    return word;
  });

  return furryWords.join("");
}

function EscapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

///////////////////////////////////
// STREAMER.BOT WEBSOCKET STATUS //
///////////////////////////////////

// This function sets the visibility of the Streamer.bot status label on the overlay
function SetConnectionStatus(connected) {
  const statusContainer = document.getElementById("statusContainer");
  if (connected) {
    statusContainer.style.background = "#2FB774";
    statusContainer.innerText = "Connected!";
    statusContainer.style.opacity = 1;
    setTimeout(() => {
      statusContainer.style.transition = "all 2s ease";
      statusContainer.style.opacity = 0;
    }, 10);
  } else {
    statusContainer.style.background = "#D12025";
    statusContainer.innerText = "Connecting...";
    statusContainer.style.transition = "";
    statusContainer.style.opacity = 1;
  }
}
