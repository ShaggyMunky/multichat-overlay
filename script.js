////////////////
// PARAMETERS //
////////////////
/*-- reduced the number of variables by combining  const queryString = window.location.search; --*/
const urlParams = new URLSearchParams(window.location.search);

const sbServerAddress = urlParams.get("address") || "127.0.0.1";
const sbServerPort = urlParams.get("port") || "8081";
const avatarMap = new Map();
const pronounMap = new Map();
const ytMembers = {};

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
const options = getOptions(paramConfig);
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
  setBgAndOpacity(document.body);
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
    setConnectionStatus(true);
  },

  onDisconnect: () => {
    console.error(
      `Streamer.bot disconnected from ${sbServerAddress}:${sbServerPort}`
    );
    setConnectionStatus(false);
  },
});

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

/*-- this function combines the GetBooleanParam, GetIntParam, and basic urlParams.get  --*/
function getParamValue(name, type, defaultValue) {
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
function getOptions(config) {
  const result = {};
  for (const [key, { type, default: def }] of Object.entries(config)) {
    result[key] = getParamValue(key, type, def);
  }
  return result;
}

/*-- this resusable function reduces the redundancy of the query methods for all of the elements in the card Instance  --*/
function getCardInstanceElements(instance) {
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
function getMessageInstanceElements(instance) {
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

function getStickerInstanceElements(instance) {
  return {
    sticker: instance.querySelector("#sticker"),
    youtubeSuperSticker: instance.querySelector("#youtubeSuperSticker"),
    stickerImg: instance.querySelector("#stickerImg"),
    stickerLabel: instance.querySelector("#stickerLabel"),
  };
}

function getCurrentTimeFormatted() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const formattedTime = `${hours}:${minutes} ${ampm}`;
  return formattedTime;
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

async function getPronouns(platform, username) {
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

function isImageUrl(url) {
  try {
    const { pathname } = new URL(url);
    // Only check the pathname since query parameters are not included in it.
    return /\.(png|jpe?g|webp|gif)$/i.test(pathname);
  } catch (error) {
    // Return false if the URL is invalid.
    return false;
  }
}

function cloneFromTemplate(name) {
  const template = document.getElementById(name);
  return template.content.cloneNode(true);
}

function addMessageItem(element, elementID, platform, userId) {
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

function setBgAndOpacity(element) {
  const opacity255 = Math.round(parseFloat(options.opacity) * 255);
  let hexOpacity = opacity255.toString(16);
  if (hexOpacity.length < 2) {
    hexOpacity = "0" + hexOpacity;
  }
  element.style.background = `${options.background}${hexOpacity}`;
}

function canPostImage(targetPermissions, data, platform) {
  return getPermissionLevel(data, platform) >= targetPermissions;
}

function getPermissionLevel(data, platform) {
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

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

///////////////////////////////////
// STREAMER.BOT WEBSOCKET STATUS //
///////////////////////////////////

// This function sets the visibility of the Streamer.bot status label on the overlay
function setConnectionStatus(connected) {
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
