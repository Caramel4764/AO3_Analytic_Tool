//will handle alarms, scheduling, etc
import indexDB from "./indexDB";
import scraperController from "./scraperController";
import stringUtils from "./utils/stringUtils";
import displayController from "./displayController"
import type { Snapshot, Metadata } from "./data/types";
async function init() {
  const allMetadata = await indexDB.getAllWork();
  console.log("%c All metadata: ", "color:purple;",allMetadata);
  const allSnapshots = await indexDB.getAllSnapshots();
  console.log("%c All snapshot: ", "color:purple;",allSnapshots);
}
init();
//scraperController.scrapeMultiWork(allMetadata);

async function handleTrackWork(metadata:Metadata, snapshot:Snapshot) {
  await displayController.addSnapshotMetadata(metadata, snapshot);
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "TRACK_WORK") {
    await handleTrackWork(message.metadata, message.snapshot);
  }
  return true;
});