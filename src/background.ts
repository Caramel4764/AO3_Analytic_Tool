//Serves as the centeral brain. Does stuff like handle alarms, scheduling, etc.
import indexDB from "./indexDB";
import scraperController from "./scraperController";
import dateUtils from "./utils/dateUtils";
import config from "./config";
import type { Snapshot, Metadata } from "./data/types";
const minutesPerDay = 24*60;
let rescrapeHourCD = 60* config.minHourBetweenScrap;
let isScrappingInProgress = false;
let allWorkAndSnapObj = {
  allMetadata: null,
  allSnapshot: null
}
async function init(allWorkAndSnapObj) {
  const allMetadata = await indexDB.getAllWork();
  console.log("%c All metadata: ", "color:purple;",allMetadata);
  const allSnapshots = await indexDB.getAllSnapshots();
  console.log("%c All snapshot: ", "color:purple;",allSnapshots);
  allWorkAndSnapObj.allMetadata = allMetadata;
  allWorkAndSnapObj.allSnapshot = allSnapshots;
}
init(allWorkAndSnapObj);
async function openBackgroundDOM(workToScrap: Metadata[] = allWorkAndSnapObj.allMetadata) {
  if (isScrappingInProgress) {
    console.log("Already scraping, please wait");
    return;
    //return false;
  }
  let res = await chrome.storage.local.get("scrapeTryCounts");
  let scrapeTryCounts:number = res.scrapeTryCounts as number ?? config.scrapeFailureAllowed;
  if (scrapeTryCounts >= config.scrapeFailureAllowed) {
    return;
  }
  scrapeTryCounts++;
  await chrome.storage.local.set({scrapeTryCounts});
  isScrappingInProgress = true;
  console.log("past scrape check");
  let hiddenDom = await chrome.offscreen.hasDocument();
  console.log('hidden dom: ', hiddenDom);
  if (!hiddenDom) {
    await chrome.offscreen.createDocument({
      url: "hiddenDom.html",
      reasons: [chrome.offscreen.Reason.DOM_SCRAPING],
      justification: "Scrape data from every tracked work's DOM and store the results in indexDB"
    });
  }
}
async function handleTrackWork(metadata:Metadata, snapshot:Snapshot) {
  await scraperController.handleScrapedData(metadata, snapshot);
}

//handling alarm
chrome.runtime.onInstalled.addListener(() => {
  //Remove previous instance so most recent code
  chrome.alarms.clear("dailyScrape", () => {
    //chrome.storage.local.set({hasDailyScrapeSucceeded: false});
    chrome.alarms.create("dailyScrape", {
      when: dateUtils.getNextMidnight(),
      periodInMinutes: rescrapeHourCD,
    });
  });
  checkForRescrape();
});

chrome.alarms.onAlarm.addListener((message)=>{
  console.log('Alarm hit');

  if (message.name === "dailyScrape") {
    chrome.storage.local.get("dailyUnscrapedWork").then((results: {
      dailyUnscrapedWork?: Metadata[]
    })=>{
      let unscrapedWorks:Metadata[] = results.dailyUnscrapedWork ?? [];
      if (!unscrapedWorks || unscrapedWorks.length==0) {
        openBackgroundDOM();
      } else {
        openBackgroundDOM(unscrapedWorks as unknown as Metadata[]);
      }
    });
  }
})

//handling signals
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // to track a work on offical ao3
  if (message.type === "TRACK_WORK") {
    handleTrackWork(message.metadata, message.snapshot).then(()=>{});
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
    isScrappingInProgress = false;
    console.log("SCRAPING DONE!")
    //don't close so developer can see error message
    let failedScrapes:Metadata[] = message.failed;
    if (failedScrapes.length==0) {
      chrome.storage.local.set({lastSuccessfulScrapeDate: new Date().toDateString()});
      chrome.storage.local.remove("dailyUnscrapedWork");
    } else {
      chrome.storage.local.set({dailyUnscrapedWork: failedScrapes}).then(()=>{
        console.warn("Failed works queued for retry:", failedScrapes);
      });
    }
    if (!config.isDeveloping) {
      chrome.offscreen.closeDocument();
    }
  }
});

function checkForRescrape() {
  //out of tries, abort
  chrome.storage.local.get("scrapeTryCounts").then((res)=>{
    let scrapeTryCounts: number = res.scrapeTryCounts as number ?? config.scrapeFailureAllowed;
    if (scrapeTryCounts >= config.scrapeFailureAllowed) {
      return;
    }
    chrome.storage.local.get("dailyUnscrapedWork").then((unscrappedWorks)=>{
      if (!unscrappedWorks || unscrappedWorks.length!=0) {
        chrome.alarms.create("dailyScrape", {
          periodInMinutes: 0.1,
        });
      }
      chrome.alarms.getAll().then((alarms) => {
        console.log(alarms);
      });
    })
  });
}
chrome.runtime.onStartup.addListener(()=>{
    //openBackgroundDOM();
    checkForRescrape();
    chrome.storage.local.get("lastSuccessfulScrapeDate").then((res)=>{
      if (res.lastSuccessfulScrapeDate && res.lastSuccessfulScrapeDate != new Date().toDateString()) {
        chrome.storage.local.set({scrapeTryCounts: 0});
      }

    });
  
})
