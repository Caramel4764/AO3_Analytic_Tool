/**
 * Intercepts scraping signal to start scraping
*/

import scraperController from "./scraperController";
import type { Snapshot, Metadata, TrackWorkMsgData } from "./data/types";
chrome.runtime.sendMessage({ type: "HIDDEN_DOM_LOADED" });

chrome.runtime.onMessage.addListener((message) => {
  let failedScrapes:Metadata[] = [];
  //schedules daily scraping
  if (message.type === "START_DAILY_SCRAPE")  {
    console.log('Trying to scrape: ', message.works);
    let workToUpdate = message.works;
    Promise.allSettled(
      workToUpdate.map((currWork:Metadata)=> {
        console.log("Fetching URL:", currWork.url);
        console.log("Fetching name:", currWork);
        return fetch(currWork.url)
          .then((response) => {
            return response.text()})
          .then((html)=>{
            const doc = new DOMParser().parseFromString(html, "text/html");
            return scraperController.scrapeByDOMAndSave(doc, currWork.url).then(()=>{
          })
        });
      })
    ).then((errorMsg)=>{
      errorMsg.forEach((result, i) => {
        if (result.status === "rejected") {
          failedScrapes.push(message.works[i]);
          console.warn(`❌ Failed to scrape ${message.works[i].title}:`, result.reason);
        } else {
          console.log(`✅ Scraped ${message.works[i].title}`);
        }
      });
        console.log("Scheduled Scraping Finished");
        chrome.runtime.sendMessage({
          type: "FINISHED_SCRAPE",
          failed: failedScrapes
        })

    }).catch((err) => {
      console.warn("Scraping Error:", err);
      chrome.runtime.sendMessage({
        type: "FINISHED_SCRAPE",
        failed: failedScrapes
      })
    });
    //return true;
  }
});
