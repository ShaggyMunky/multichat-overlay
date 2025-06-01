import { StreamerbotClient } from "@streamerbot/client";
import { serverAddress, serverPort } from "./config.js";

export let client: StreamerbotClient;

export function startStreamerbotClient(): void {
  client = new StreamerbotClient({
    host: serverAddress,
    port: parseInt(serverPort),

    onConnect: (data) => {
      console.log(
        `Streamer.bot successfully connected to ${serverAddress}:${serverPort}`
      );
      console.debug(data);
      setConnectionStatus(true);
    },

    onDisconnect: () => {
      console.error(
        `Streamer.bot disconnected from ${serverAddress}:${serverPort}`
      );
      setConnectionStatus(false);
    },
  });
}

///////////////////////////////////
// STREAMER.BOT WEBSOCKET STATUS //
///////////////////////////////////

function setConnectionStatus(connected): void {
  const statusContainer = document.getElementById("statusContainer");
  if (connected) {
    statusContainer.style.background = "#2FB774";
    statusContainer.innerText = "Connected!";
    statusContainer.style.opacity = "1";
    setTimeout(() => {
      statusContainer.style.transition = "all 2s ease";
      statusContainer.style.opacity = "0";
    }, 10);
  } else {
    statusContainer.style.background = "#D12025";
    statusContainer.innerText = "Connecting...";
    statusContainer.style.transition = "";
    statusContainer.style.opacity = "1";
  }
}
