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

export function isImageUrl(url) {
  try {
    const { pathname } = new URL(url);
    // Only check the pathname since query parameters are not included in it.
    return /\.(png|jpe?g|webp|gif)$/i.test(pathname);
  } catch (error) {
    return false;
  }
}

export function canPostImage(targetPermissions, data, platform) {
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
