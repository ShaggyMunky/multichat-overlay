import { options } from "../config/config.js";

const scrollClasses = {
  1: "normalScrollDirection",
  2: "reverseScrollDirection",
};

export const messageList = document.getElementById("messageList");

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

  if (scrollClasses[options.scrollDirection]) {
    messageList.classList.add(scrollClasses[options.scrollDirection]);
  }
}

export function setBgAndOpacity(element: HTMLElement): void {
  const opacity255 = Math.round(parseFloat(options.opacity) * 255);
  let hexOpacity = opacity255.toString(16);
  if (hexOpacity.length < 2) {
    hexOpacity = "0" + hexOpacity;
  }
  element.style.background = `${options.background}${hexOpacity}`;
}

export function addMessageItem(
  element: DocumentFragment,
  elementID: string,
  platform?: string,
  userId?: string
) {
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
