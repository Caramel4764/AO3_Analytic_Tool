/*
Handles scraping and generation of HTML data right after scraping
*/

import HTMLParserUtil from "./utils/HTMLParserUtil";
import CAo3WorkDom from "./class/CAo3WorkDom";
import indexDB from "./indexDB";
import dateUtils from "./utils/dateUtils";
import type { Snapshot, Metadata } from "./data/types";
import frontend from "./frontend";


/** Safely add a work. If unique, it adds it to the DB. If it already exist, it won't be added. Both send an console.log message
 * 
 * @param workID - Id of work to add
 * @param metadata - The metadata to add
 * @return {Boolean} - Was the work added to the DB?
 */
async function addNewWork(metadata:Metadata): Promise<Boolean> {
    let doesWorkExistAlr = await indexDB.doesWorkExist(metadata.workId);
    //indexDB.cleanSameDaySnapshot();
    if (!doesWorkExistAlr) {
        indexDB.addWork(metadata);
        console.log("%c Work successfully added: ", "color: green;", metadata);
        return true;
    } else {
        console.log("%c Work already exists: ", "color: red;",metadata);
        return false;
    }
}
/** Scrapes a website by link
 * 
 * @param link - Link of work to scrape
 * @returns {Boolean} - Is successful?
 */
async function scrapeByURL (link): Promise<boolean> {
    let workId = HTMLParserUtil.getIdFromLink(link);
    if (await isScrapeOnCD(workId)) return false;
    //fetch information
    let HTMLString = await HTMLParserUtil.fetchHTML(link)
    let HTMLDom = HTMLParserUtil.stringHTMLToDom(HTMLString);
    let newAo3WorkDom = new CAo3WorkDom(HTMLDom, link);
    //store info
    let currSnap = newAo3WorkDom.getSnapshot()
    await addNewWork(newAo3WorkDom.metadata);
    await indexDB.addSnapshot(currSnap);
    return true;
}

async function isScrapeOnCD(workId: number): Promise<Boolean> {
    let latestSnapshot = await indexDB.getMostRecentSnapshotFromWork(workId);
    if (latestSnapshot) {
        const lastScrapeTime = latestSnapshot.timeStamp;
        const currTime = new Date();
        const lastScrapeTimeReadable = dateUtils.timeStampToReadable(lastScrapeTime);
        const currTimeReadable = dateUtils.timeStampToReadable(currTime.getTime());
        
        if (lastScrapeTimeReadable == currTimeReadable) {
            console.warn(`(${workId}) A day hasn't passed. Wait until midnight before updating...`);
            return true
            //throw new Error(`(${workId}) A day hasn't passed. Wait until midnight before updating...`);
        }
    }
    return false;
}
/** Scrapes the dom and saves it the db
 * 
 * @param {Number} HTMLDom - The html dom
 * @param {string} link - The link of the web
 * 
 * @returns {Boolean} - Is scraping a success
 */
async function scrapeByDOMAndSave (HTMLDom:HTMLDocument, link:string): Promise<boolean> {
    let workId = HTMLParserUtil.getIdFromLink(link);
    if (await isScrapeOnCD(workId)) {
        return false;
    }
    //fetch information
    let HTMLString = await HTMLParserUtil.fetchHTML(link)
    HTMLDom = HTMLParserUtil.stringHTMLToDom(HTMLString);
    let newAo3WorkDom = new CAo3WorkDom(HTMLDom, link);
    //store info
    let currSnap = newAo3WorkDom.getSnapshot();
    await addNewWork(newAo3WorkDom.metadata);
    await indexDB.addSnapshot(currSnap);
    return true;
}

/** Stores metadata and snapshot into DB (Assumed data gotten from scraping)
 * 
 * @param metadata - Metadata to add
 * @param snapshot - Snapshot to add
 * @returns {Boolean} - Was it successful
 */
async function handleScrapedData(metadata: Metadata, snapshot: Snapshot): Promise<Boolean> {
    console.log("Testing: ", metadata);
    if (await isScrapeOnCD(metadata.workId)) return false;
    await addNewWork(metadata);
    await indexDB.addSnapshot(snapshot);
    console.log("Handling new metadata: ", metadata);
    console.log("Handling new snapshot: ", snapshot);
    return true;
}

let scraperController = {
    //scrapeByURLAndUpdate,
    scrapeByDOMAndSave,
    handleScrapedData
}
export default scraperController