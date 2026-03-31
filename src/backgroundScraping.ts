import scraperController from "./scraperController";
import indexDB from "./indexDB";
import HTMLParserUtil from "./utils/HTMLParserUtil";
import Ao3WorkDom from "./Ao3WorkDom";
import numberUtils from "./utils/numberUtils";
import dateUtils from "./utils/dateUtils";
import type { Snapshot, Metadata, TrackWorkMsgData } from "./data/types";
chrome.runtime.sendMessage({ type: "HIDDEN_DOM_LOADED" });

chrome.runtime.onMessage.addListener(async(message) => {
  if (message.type === "START_SCRAPE") {
    let workToUpdate = message.works;
      const errorMsg = await Promise.allSettled(
        workToUpdate.map(async(currWork:Metadata)=> {
          let response = await fetch(currWork.url);
          let html = await response.text();

          const doc = new DOMParser().parseFromString(html, "text/html");
          await scraperController.scrapeDOMAndSave(doc, currWork.url);
        })
      );

      errorMsg.forEach((result, i) => {
        if (result.status === "rejected") {
          console.warn(`❌ Failed to scrape ${message.works[i].title}:`, result.reason);
        } else {
          console.log(`✅ Scraped ${message.works[i].title}`);
        }
      });
  }
  console.log("Scheduled Scraping Finished");
  chrome.runtime.sendMessage({
    type: "FINISHED_SCRAPE",
  })
});
