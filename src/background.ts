//will handle alarms, scheduling, etc
import indexDB from "./indexDB";
import displayController from "./displayController";
import dateUtils from "./utils/dateUtils";
import config from "./config";
import type { Snapshot, Metadata } from "./data/types";

const minutesPerDay = 24*60;
let rescrapeHourCD = 60* config.minHourBetweenScrap;

async function init() {
  const allMetadata = await indexDB.getAllWork();
  console.log("%c All metadata: ", "color:purple;",allMetadata);
  const allSnapshots = await indexDB.getAllSnapshots();
  console.log("%c All snapshot: ", "color:purple;",allSnapshots);
}
init();
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

//handling alarm
chrome.runtime.onInstalled.addListener(() => {
  //Remove previous instance so most recent code
  chrome.alarms.clear("dailyScrape", () => {
    chrome.alarms.create("dailyScrape", {
      when: dateUtils.getNextMidnight(),
      periodInMinutes: rescrapeHourCD,
    });
  });
});

chrome.alarms.onAlarm.addListener((message)=>{
  console.log('Alarm hit');
  if (message.name === "dailyScrape") {
    openBackgroundDOM();
  }
})

//handling signals
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // to track a work on offical ao3
  if (message.type === "TRACK_WORK") {
    handleTrackWork(message.metadata, message.snapshot).then(()=>{
    });
  }
  //background dom has finished loaded
  if (message.type === "HIDDEN_DOM_LOADED") {
    indexDB.getAllWork().then((allMetadata)=> {
      chrome.runtime.sendMessage({
        type: "START_DAILY_SCRAPE",
        works: allMetadata
      });
    });
  }
  //schedule scraping complete
  if (message.type === "FINISHED_SCRAPE") {
    console.log("SCRAPING DONE!")
    //don't close so developer can see error message
    if (!config.isDeveloping) {
      //chrome.offscreen.closeDocument();
    }
  }
  return true;
});

