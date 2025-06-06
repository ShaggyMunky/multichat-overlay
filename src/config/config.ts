import {
  ParamType,
  ParamTypeMap,
  ParamValues,
} from "../types/parameterTypes.js";

const urlParams = new URLSearchParams(window.location.search);

const paramConfig = {
  address: { type: "string", default: "127.0.0.1" },
  port: { type: "string", default: "8081" },
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
} as const;

function getParamValue<T extends ParamType>(
  name: string,
  type: T,
  defaultValue: ParamTypeMap[T]
): ParamTypeMap[T] {
  const rawValue = urlParams.get(name);
  if (rawValue === null) return defaultValue;

  switch (type) {
    case "bool":
      if (rawValue.toLowerCase() === "true") return true as ParamTypeMap[T];
      if (rawValue.toLowerCase() === "false") return false as ParamTypeMap[T];
      return defaultValue;
    case "int":
      const intVal = parseInt(rawValue, 10);
      return (isNaN(intVal) ? null : intVal) as ParamTypeMap[T];
    default:
      return rawValue as ParamTypeMap[T];
  }
}

function getOptions<
  T extends Record<string, { type: ParamType; default: any }>
>(config: T): ParamValues<T> {
  const result = {} as ParamValues<T>;

  for (const [key, entry] of Object.entries(config)) {
    result[key as keyof T] = getParamValue(
      key,
      entry.type,
      entry.default
    ) as any;
  }

  return result;
}

export const options = getOptions(paramConfig);
export const serverAddress = options.address;
export const serverPort = options.port;
export const ignoreUserList =
  options.ignoreChatters.split(",").map((item) => item.trim().toLowerCase()) ||
  [];
