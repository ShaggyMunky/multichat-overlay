/////////////////////////
// STREAMER.BOT CLIENT //
/////////////////////////

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

///////////////////////
// MULTICHAT OVERLAY //
///////////////////////

function youTubeMessage(data) {
  // Don't post messages starting with "!"
  if (data.message.startsWith("!") && options.excludeCommands) return;

  // Don't post messages from users from the ignore list
  if (ignoreUserList.includes(data.user.name.toLowerCase())) return;

  const instance = cloneFromTemplate("messageTemplate");
  const elements = getMessageInstanceElements(instance);

  // puts background per message instead of a universsal box
  if (!options.useSharedBg) {
    setBgAndOpacity(elements.messageContainer);
  }

  // Set timestamp
  if (options.showTimestamps) {
    elements.timestamp.classList.add("timestamp");
    elements.timestamp.innerText = getCurrentTimeFormatted();
  }

  // Set the message data
  // YouTube users do not have colors, the provided method
  // randomly assigns one for that session
  if (options.showUsername) {
    elements.username.innerText = data.user.name;
    elements.username.style.color = getYouTubeUserColor(data.user.id);
  }

  if (options.showMessage) {
    elements.message.innerText = data.message;
  }

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
    canPostImage(options.imageEmbedPermissionLevel, data, "youtube") &&
    isImageUrl(message)
  ) {
    const image = new Image();

    image.onload = function () {
      image.style.padding = "20px 0px";
      image.style.width = "100%";
      elements.message.innerHTML = "";
      elements.message.appendChild(image);

      addMessageItem(instance, data.message.msgId, "youtube", data.user.id);
    };

    const urlObj = new URL(message);
    urlObj.search = "";
    urlObj.hash = "";

    image.src =
      "https://external-content.duckduckgo.com/iu/?u=" + urlObj.toString();
  } else {
    addMessageItem(instance, data.eventId, "youtube", data.user.id);
  }
}

function youTubeSuperChat(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("youtube");

  // Set message text
  elements.title.innerText = `🪙 ${data.user.name} sent a Super Chat (${data.amount})`;
  elements.content.innerText = `${data.message}!`;

  addMessageItem(instance, data.eventId);
}

function YouTubeSuperSticker(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const cardElements = getCardInstanceElements(instance);

  // Set the card background colors
  cardElements.card.classList.add("youtube");

  const stickerInstance = cloneFromTemplate("stickerTemplate");
  const stickerElements = getStickerInstanceElements(stickerInstance);

  // Render sticker
  stickerElements.stickerImg.src = findFirstImageUrl(data);
  stickerElements.stickerLabel.innerText = `${data.user.name} sent a Super Sticker (${data.amount})`;

  cardElements.content.appendChild(stickerInstance);

  addMessageItem(instance, data.eventId);
}

function youTubeNewSponsor(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("youtube");

  // Set message text
  elements.title.innerText = `⭐ New ${data.levelName}`;
  elements.content.innerText = `Welcome ${data.user.name}!`;

  addMessageItem(instance, data.eventId);
}

function youTubeGiftMembershipReceived(data) {
  const instance = cloneFromTemplate("cardTemplate");
  const elements = getCardInstanceElements(instance);

  // Set the card background colors
  elements.card.classList.add("youtube");

  // Set message text
  elements.title.innerText = `🎁 ${data.gifter.name} gifted a membership`;
  elements.content.innerText = `to ${data.user.name} (${data.tier})!`;

  addMessageItem(instance, data.eventId);
}

function getYouTubeUserColor(userId) {
  if (!ytMembers[userId]) {
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
    ytMembers[userId] = values[index];
  }
  return ytMembers[userId];
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
