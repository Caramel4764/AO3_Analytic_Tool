import HTMLParserUtil from "./utils/HTMLParserUtil";
import Ao3WorkDom from "./Ao3WorkDom";
import indexDB from "./indexDB";
import dateUtils from "./utils/dateUtils";
import type { Metadata } from "./data/types";
import config from "./config";
import asyncUtil from "./utils/asyncUtil";
import CAnalytic from "./CAnalytic";
//import dateUtils from "./utils/dateUtils"
let allCAnalytic = new Map<number, CAnalytic>();
async function scrapeWebsiteAndSave (link): Promise<boolean> {
    let workId = HTMLParserUtil.getIdFromLink(link);
    let latestSnapshot = await indexDB.getMostRecentSnapshotFromWork(workId);
    if (latestSnapshot) {
        const lastScrapeTime = latestSnapshot.timeStamp;
        const currTime = new Date();
        const lastScrapeTimeReadable = dateUtils.timeStampToReadable(lastScrapeTime);
        const currTimeReadable = dateUtils.timeStampToReadable(currTime.getTime());
        
        if (lastScrapeTimeReadable == currTimeReadable) {
            throw new Error(`(${workId}) A day hasn't passed. Wait until midnight before updating...`);
        }
    }
    //fetch information
    let HTMLString = await HTMLParserUtil.fetchHTML(link)
    let HTMLDom = HTMLParserUtil.stringHTMLToDom(HTMLString);
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
        console.log("%c Work successfully added: ", "color: green;", newAo3WorkDom.getMetadata)
    } else {
        console.log("%c Work already exists: ", "color: red;",newAo3WorkDom.getMetadata);
    }
    await indexDB.addSnapshot(currSnap);
    console.log("%c (Successful) Added Snapshot: ", "color: green;", newAo3WorkDom.getSnapshot());
    return true;
}


async function scrapeMultiWork(listOfWork: Metadata[], statDivHolder): Promise<void> {
    for (let i = 0; i < listOfWork.length; i++) {
        //scrape multiple work at once
        const batch = listOfWork.slice(i, i+config.scrapeBatchSize);
        await Promise.allSettled(batch.map(work => scrapeAndUpdate(work.url, statDivHolder)));
        await asyncUtil.delay(config.scrapMSCD);
    }
}
async function scrapeAndUpdate(link, statDivHolder) {
    await scrapeWebsiteAndSave(link);
    let id = HTMLParserUtil.getIdFromLink(link);
    await displaySnapshot(id, statDivHolder);
}

async function displaySnapshot(workId, statDivHolder, index = -1): Promise<boolean> {
    let allSnapshots = await indexDB.getAllSnapshotsFromWork(workId);
    if (allSnapshots.length == 0) {
        throw new Error(`No snapshot found for given id (${workId})`);
    }
    let snapshotIndex;
    // if -1, find latest
    if (index == -1) {
        snapshotIndex = allSnapshots.length-1;
    }
    if (!allSnapshots) {
        return false;
    }
    let workMetadata = await indexDB.findWork(allSnapshots[snapshotIndex].workId);
    console.log('%c Snapshots: ', 'color: pink;', allSnapshots);
    console.log("%c Metadata: ", 'color: pink;', workMetadata);
    if (allCAnalytic.has(workId)) {
        console.log("%c Graph already exist so I'll update", "color: red;");
        allCAnalytic.get(workId).update(allSnapshots, workMetadata);
        return true;
    } else {
        //div
        const Analytic = new CAnalytic(allSnapshots, workMetadata, statDivHolder);
        Analytic.draw();
        allCAnalytic.set(workId, Analytic);
        console.log("%c Graph doesn't exist so I'll create", "color: green;");
        return true;
    }
}
async function displayAllWork(listOfWork:Metadata[], statDivHolder) {
    listOfWork.map(async(work)=>{
        await displaySnapshot(work.workId, statDivHolder);
    });
}
let scraperController = {
    scrapeWebsiteAndSave,
    displaySnapshot,
    scrapeAndUpdate,
    scrapeMultiWork,
    displayAllWork,
    
}
export default scraperController