import HTMLParserUtil from "./utils/HTMLParserUtil";
import Ao3WorkDom from "./Ao3WorkDom";
import indexDB from "./indexDB";
import HTMLUpdate from "./HTMLUpdate"
import dateUtils from "./utils/dateUtils";
import type { Metadata } from "./data/types";
import config from "./config";
import asyncUtil from "./utils/asyncUtil";
//import dateUtils from "./utils/dateUtils"
async function scrapeWebsite (link): Promise<boolean> {
    //plan
    //1. get id
    //2. look up most recent snapshot date
    //3. is current date past most recent snapshot date?
        //4. Scrape if over most recent date
        //5. Does metadata exist? Include if not
        //6. Get snapshot

    let workId = HTMLParserUtil.getIdFromLink(link);
    let latestSnapshot = await indexDB.getMostRecentSnapshotFromWork(workId);
    if (latestSnapshot) {
        const lastScrapeTime = latestSnapshot.timeStamp;
        const currTime = new Date();
        const lastScrapeTimeReadable = dateUtils.timeStampToReadable(lastScrapeTime);
        const currTimeReadable = dateUtils.timeStampToReadable(currTime.getTime());
        
        if (lastScrapeTimeReadable == currTimeReadable) {
            alert("A day hasn't passed. Wait until midnight");
            return false;
        }
    }
    //fetch information
    let HTMLString = await HTMLParserUtil.fetchHTML(link)
    let HTMLDom = HTMLParserUtil.stringHTMLToDom(HTMLString);
    console.log("HTMLDom: ", HTMLDom)
    let newAo3WorkDom = new Ao3WorkDom(HTMLDom, link);
    //store info
    let allSnapshots = await indexDB.getAllSnapshots();
    let currSnap = newAo3WorkDom.getSnapshot()
    let doesWorkExistAlr = await indexDB.doesWorkExist(newAo3WorkDom.getWorkId());
    //indexDB.cleanSameDaySnapshot();
    //if work doesn't exist, add
    if (!doesWorkExistAlr) {
        //issue here
        indexDB.addWork(newAo3WorkDom.getMetadata());
        console.log("Work successfully added: ", newAo3WorkDom.getMetadata)
    } else {
        console.log("Work already exists: ", newAo3WorkDom.getMetadata);
    }
    await indexDB.addSnapshot(currSnap);
    console.log("Added Snapshot successfully: ", newAo3WorkDom.getSnapshot());
    console.log("AllSnapshots: ", allSnapshots);
    return true;
}
async function scrapeMultiWork(listOfWork: Metadata[]): Promise<void> {
    for (let i = 0; i < listOfWork.length; i++) {
        //scrape multiple work at once
        const batch = listOfWork.slice(i, i+config.scrapeBatchSize);
        await Promise.allSettled(batch.map(work => scrapeAndUpdate(work.url)));
        await asyncUtil.delay(config.scrapMSCD);
    }
}
async function scrapeAndUpdate(link) {
    await scrapeWebsite(link);
    let id = HTMLParserUtil.getIdFromLink(link);
    await displaySnapshot(id);
}

async function displaySnapshot(workId, index = -1): Promise<boolean> {
    let allSnapshots = await indexDB.getAllSnapshotsFromWork(workId);
    if (allSnapshots.length == 0) {
        throw new Error(`No snapshot found for given id (${workId})`);
    }
    console.log("TEST:", allSnapshots)
    let snapshotIndex;
    // if -1, find latest
    if (index == -1) {
        snapshotIndex = allSnapshots.length-1;
    }
    if (!allSnapshots) {
        return false;
    }
    console.log("ALL SNAP: ", allSnapshots)
    //console.log(allSnapshots[snapshotIndex]);
    let workMetadata = await indexDB.findWork(allSnapshots[snapshotIndex].workId);
    console.log("Snapshots: ", allSnapshots);
    console.log("Metadata: ", workMetadata);
    let allMetadata = await indexDB.getAllWork();
    console.log("All metadata: ", allMetadata);
    HTMLUpdate.updateStats(snapshotIndex, allSnapshots, workMetadata);
    return true;
}
let scraperController = {
    scrapeWebsite,
    displaySnapshot,
    scrapeAndUpdate,
    scrapeMultiWork
}
export default scraperController