import { PlatformType } from "../types/constantTypes.js";

export const SCROLL_DIRECTION = {
  1: "normalScrollDirection",
  2: "reverseScrollDirection",
} as const;

export const PLATFORMS: PlatformType = {
  twitch: "twitch",
  youTube: "youtube",
};

export const PERMISSION_LEVELS = {
  owner: 40,
  mod: 30,
  vip: 20,
  sub: 15,
  default: 10,
} as const;
