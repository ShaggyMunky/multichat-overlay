import { options } from "./config/config.js";
import { startStreamerbotClient } from "./config/streamerBotClient.js";
import { runTwitchOptions } from "./platforms/twitch.js";
import { setBaseMarkup } from "./helpers/domManager.js";

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
