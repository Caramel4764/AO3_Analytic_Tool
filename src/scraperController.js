import HTMLParserUtil from "./HTMLParserUtil.js";
import Ao3WorkDom from "./Ao3WorkDom.js";
import indexDB from "./indexDB.js";
import HTMLUpdate from "./HTMLUpdate.js"
import testingData from "./data/testingData.js"
//testing scrapeWebsite
/*function getDummyData () {
    //fetch information
    //store info
    indexDB.addSnapshot(testingData.snapshots);
    indexDB.addWork(testingData.metadata);
    console.log("FoundSnapShot: ", indexDB.getSnapshot(newAo3WorkDom.getSnapshotId()));
    console.log("AllSnapshots: ", indexDB.getAllSnapshots());
}*/

async function scrapeWebsite (link) {
    //fetch information
    let HTMLString = await HTMLParserUtil.fetchHTML(link)
    let HTMLDom = HTMLParserUtil.stringHTMLToDom(HTMLString);
    let newAo3WorkDom = new Ao3WorkDom(HTMLDom, link);
    //store info
    //indexDB.clearSnapshot();
    await indexDB.addSnapshot(newAo3WorkDom.getSnapshot());
    await indexDB.addWork(newAo3WorkDom.getMetadata());
    console.log("FoundSnapShot: ", await indexDB.getSnapshot(newAo3WorkDom.getSnapshotId()));
    console.log("AllSnapshots: ", await indexDB.getAllSnapshots());
}


async function displaySnapshot(index = -1) {
    let allSnapshots = await indexDB.getAllSnapshots();
    let snapshotIndex;
    // if -1, find latest
    if (index == -1) {
        snapshotIndex = allSnapshots.length-1;
    }
    if (!allSnapshots) {
        return false;
    }
    //console.log(allSnapshots[snapshotIndex]);
    let workMetadata = await indexDB.findWork(allSnapshots[snapshotIndex].workId);
    console.log("Snapshots: ", allSnapshots);
    console.log("Metadata: ", workMetadata);
    HTMLUpdate.updateStats(allSnapshots[snapshotIndex], workMetadata);
}
let scraperController = {
    scrapeWebsite,
    displaySnapshot
}
export default scraperController