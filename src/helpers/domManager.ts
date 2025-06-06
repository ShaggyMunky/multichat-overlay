import { options } from "../config/config.js";
import {
  CardInstance,
  MessageInstance,
  StickerInstance,
} from "../types/templateTypes.js";

export const messageList = document.getElementById("messageList");

export function cloneFromTemplate(name): DocumentFragment {
  const template = document.getElementById(name) as HTMLTemplateElement;
  return template.content.cloneNode(true) as DocumentFragment;
}

export function getMessageInstanceElements(
  instance: DocumentFragment
): MessageInstance {
  return {
    messageContainer: instance.querySelector(
      "#messageContainer"
    ) as HTMLElement,
    firstMessage: instance.querySelector("#firstMessage") as HTMLElement,
    sharedChat: instance.querySelector("#sharedChat") as HTMLElement,
    sharedChatChannel: instance.querySelector(
      "#sharedChatChannel"
    ) as HTMLElement,
    userInfo: instance.querySelector("#userInfo") as HTMLElement,
    avatar: instance.querySelector("#avatar") as HTMLElement,
    timestamp: instance.querySelector("#timestamp") as HTMLElement,
    platform: instance.querySelector("#platform") as HTMLElement,
    badgeList: instance.querySelector("#badgeList") as HTMLElement,
    pronouns: instance.querySelector("#pronouns") as HTMLElement,
    username: instance.querySelector("#username") as HTMLElement,
    colonSeparator: instance.querySelector("#colonSeparator") as HTMLElement,
    lineSpace: instance.querySelector("#lineSpace") as HTMLElement,
    reply: instance.querySelector("#reply") as HTMLElement,
    replyUser: instance.querySelector("#replyUser") as HTMLElement,
    replyMsg: instance.querySelector("#replyMsg") as HTMLElement,
    message: instance.querySelector("#message") as HTMLElement,
  };
}

export function getCardInstanceElements(
  instance: DocumentFragment
): CardInstance {
  return {
    card: instance.querySelector("#card") as HTMLElement,
    header: instance.querySelector("#header") as HTMLElement,
    avatar: instance.querySelector("#avatar") as HTMLElement,
    icon: instance.querySelector("#icon") as HTMLElement,
    title: instance.querySelector("#title") as HTMLElement,
    content: instance.querySelector("#content") as HTMLElement,
  };
}

export function getStickerInstanceElements(
  instance: DocumentFragment
): StickerInstance {
  return {
    sticker: instance.querySelector("#sticker") as HTMLElement,
    youtubeSuperSticker: instance.querySelector(
      "#youtubeSuperSticker"
    ) as HTMLElement,
    stickerImg: instance.querySelector("#stickerImg") as HTMLElement,
    stickerLabel: instance.querySelector("#stickerLabel") as HTMLElement,
  };
}

export function addMessageItem(
  element: DocumentFragment,
  elementID: string,
  platform?: string,
  userId?: string
): void {
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
        lineItem.style.opacity = "0";
        setTimeout(function () {
          messageList.removeChild(lineItem);
        }, 1000);
      }, options.hideAfter * 1000);
    }
  }, 200);
}
