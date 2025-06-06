import { options } from "./config/config.js";
import { startStreamerbotClient } from "./config/streamerBotClient.js";
import { setBaseMarkup } from "./helpers/optionActions.js";
import { runTwitchOptions } from "./platforms/twitch.js";
import { runYouTubeOptions } from "./platforms/youTube.js";
import { runStreamlabsOptions } from "./platforms/streamlabs.js";
import { runStreamElementsOptions } from "./platforms/streamElements.js";
import { runPatreonOptions } from "./platforms/patreon.js";
import { runKofiOptions } from "./platforms/kofi.js";
import { runTipeeeOptions } from "./platforms/tipeee.js";
import { runFourthWallOptions } from "./platforms/fourthWall.js";

startStreamerbotClient();
setBaseMarkup();

////////////////
// PLATFORMS //
///////////////
if (
  options.showTwitchMessages ||
  options.showTwitchSubs ||
  options.showTwitchAnnouncements ||
  options.showTwitchChannelPointRedemptions ||
  options.showTwitchRaids
) {
  runTwitchOptions();
}

if (
  options.showYouTubeMessages ||
  options.showYouTubeSuperChats ||
  options.showYouTubeSuperStickers ||
  options.showYouTubeMemberships
) {
  runYouTubeOptions();
}

if (options.showStreamlabsDonations) {
  runStreamlabsOptions();
}

if (options.showStreamElementsTips) {
  runStreamElementsOptions();
}

if (options.showPatreonMemberships) {
  runPatreonOptions();
}

if (options.showKofiDonations) {
  runKofiOptions();
}

if (options.showTipeeeStreamDonations) {
  runTipeeeOptions();
}

if (options.showFourthwallAlerts) {
  runFourthWallOptions();
}
