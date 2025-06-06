import { PERMISSION_LEVELS, PLATFORMS } from "../config/constants.js";

export function getCurrentTimeFormatted(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const formattedTime = `${hours}:${minutes} ${ampm}`;
  return formattedTime;
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function isImageUrl(url: string): boolean {
  try {
    const { pathname } = new URL(url);
    // Only check the pathname since query parameters are not included in it.
    return /\.(png|jpe?g|webp|gif)$/i.test(pathname);
  } catch (error) {
    return false;
  }
}

export function canPostImage(targetPermissions, data, platform): boolean {
  return getPermissionLevel(data, platform) >= targetPermissions;
}

function getPermissionLevel(data, platform): number {
  switch (platform) {
    case PLATFORMS.twitch:
      const role = data.message.role ?? 0;
      const isSub = data.message.subscriber;

      if (role >= 4) return PERMISSION_LEVELS.owner;
      if (role >= 3) return PERMISSION_LEVELS.mod;
      if (role >= 2) return PERMISSION_LEVELS.vip;
      if (isSub) return PERMISSION_LEVELS.sub;
      return PERMISSION_LEVELS.default;
    case PLATFORMS.youTube:
      const { isOwner, isModerator, isSponsor } = data.user;

      if (isOwner) return PERMISSION_LEVELS.owner;
      if (isModerator) return PERMISSION_LEVELS.mod;
      if (isSponsor) return PERMISSION_LEVELS.sub;
      return PERMISSION_LEVELS.default;
  }
}
