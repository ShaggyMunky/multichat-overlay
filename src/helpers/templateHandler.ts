import {
  CardInstance,
  MessageInstance,
  StickerInstance,
} from "../types/templateTypes.js";

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
    stickerImg: instance.querySelector("#stickerImg") as HTMLImageElement,
    stickerLabel: instance.querySelector("#stickerLabel") as HTMLElement,
  };
}
