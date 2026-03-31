//will handle alarms, scheduling, etc
import indexDB from "./indexDB";
import displayController from "./displayController";
import dateUtils from "./utils/dateUtils";
import type { Snapshot, Metadata } from "./data/types";

const minutesPerDay = 24*60;
async function init() {
  const allMetadata = await indexDB.getAllWork();
  console.log("%c All metadata: ", "color:purple;",allMetadata);
  const allSnapshots = await indexDB.getAllSnapshots();
  console.log("%c All snapshot: ", "color:purple;",allSnapshots);
}
init();
//scraperController.scrapeMultiWork(allMetadata);
async function openBackgroundDOM() {
  let hiddenDom = await chrome.offscreen.hasDocument();
  if (!hiddenDom) {
    await chrome.offscreen.createDocument({
      url: "hiddenDom.html",
      reasons: [chrome.offscreen.Reason.DOM_SCRAPING],
      justification: "Scrape data from every tracked work's DOM and store the results in indexDB"
    });
  }
}
async function handleTrackWork(metadata:Metadata, snapshot:Snapshot) {
  await displayController.addSnapshotMetadata(metadata, snapshot);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TRACK_WORK") {
    handleTrackWork(message.metadata, message.snapshot).then(()=>{
    });
  }
  if (message.type === "HIDDEN_DOM_LOADED") {
    indexDB.getAllWork().then((allMetadata)=> {
      console.log("BG METADATA: ", allMetadata);
      chrome.runtime.sendMessage({
        type: "START_SCRAPE",
        works: allMetadata
      });
    });
    
  }
  if (message.type === "FINISHED_SCRAPE") {
    chrome.offscreen.closeDocument();
  }
  return true;
});

//handling alarm
chrome.runtime.onInstalled.addListener(() => {
  //Remove previous instance so most recent code
  chrome.alarms.clear("dailyScrape", () => {
    chrome.alarms.create("dailyScrape", {
      when: dateUtils.getNextMidnight(),
      periodInMinutes: minutesPerDay   
    });
  });
});

chrome.alarms.onAlarm.addListener((message)=>{
  console.log('Alarm hit');
  if (message.name === "dailyScrape") {
    openBackgroundDOM();
  }
})