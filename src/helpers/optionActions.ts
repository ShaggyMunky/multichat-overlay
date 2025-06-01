import { client } from "../config/streamerBotClient.js";
import { getCurrentTimeFormatted } from "./utils.js";

const pronounMap = new Map();

export function setTimestamp(element: HTMLElement, isVisible: boolean): void {
  if (isVisible) {
    element.classList.add("timestamp");
    element.innerText = getCurrentTimeFormatted();
  }
}

export function setUserName(
  element: HTMLElement,
  isVisible: boolean,
  data: any
): void {
  if (isVisible) {
    element.innerText = data.message.displayName;
    element.style.color = data.message.color;
  }
}

export async function setPronouns(element: HTMLElement, user: string) {
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
