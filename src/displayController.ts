import HTMLParserUtil from "./utils/HTMLParserUtil";
import Ao3WorkDom from "./Ao3WorkDom";
import indexDB from "./indexDB";
import dateUtils from "./utils/dateUtils";
import type { Metadata, Snapshot } from "./data/types";

async function scrapeWebsiteAndSaveHTMLDOM (HTMLString:string, link:string): Promise<boolean> {
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

async function addSnapshotMetadata(metadata: Metadata, snapshot: Snapshot) {
    console.log('InsideSnapMeta');
  let latestSnapshot = await indexDB.getMostRecentSnapshotFromWork(metadata.workId);
  let allSnapshots = await indexDB.getAllSnapshotsFromWork(metadata.workId);
  console.log("ALL SNAP TEST: ", allSnapshots);
  if (latestSnapshot) {
      const lastScrapeTime = latestSnapshot.timeStamp;
      const currTime = new Date();
      const lastScrapeTimeReadable = dateUtils.timeStampToReadable(lastScrapeTime);
      const currTimeReadable = dateUtils.timeStampToReadable(currTime.getTime());
      if (lastScrapeTimeReadable == currTimeReadable) {
          throw new Error(`(${metadata.workId}) A day hasn't passed. Wait until midnight before updating...`);
      }
  }
  //store info
  let currSnap = snapshot;
  let doesWorkExistAlr = await indexDB.doesWorkExist(metadata.workId);
  //indexDB.cleanSameDaySnapshot();
  //if work doesn't exist, add
  if (!doesWorkExistAlr) {
      //issue here
      indexDB.addWork(metadata);
      console.log("%c Work successfully added: ", "color: green;", metadata)
  } else {
      console.log("%c Work already exists: ", "color: red;",metadata);
  }
  await indexDB.addSnapshot(currSnap);
  console.log("%c (Successful) Added Snapshot: ", "color: green;", snapshot);
  return true;
}

let displayController = {
  scrapeWebsiteAndSaveHTMLDOM,
  addSnapshotMetadata
}
export default displayController;