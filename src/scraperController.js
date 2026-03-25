import HTMLParserUtil from "./HTMLParserUtil.js";
import Ao3WorkDom from "./Ao3WorkDom.js";
import indexDB from "./indexDB.js";
import HTMLUpdate from "./HTMLUpdate.js"
import dateUtils from "./dateUtils.js"
async function scrapeWebsite (link) {
    //fetch information
    let HTMLString = await HTMLParserUtil.fetchHTML(link)
    let HTMLDom = HTMLParserUtil.stringHTMLToDom(HTMLString);
    let newAo3WorkDom = new Ao3WorkDom(HTMLDom, link);
    //store info
    let allSnapshots = await indexDB.getAllSnapshots();
    // 1 day cd
    let prevSnap = allSnapshots[allSnapshots.length-1];
    let currSnap = newAo3WorkDom.getSnapshot()
    let doesWorkExistAlr = indexDB.doesWorkExist(newAo3WorkDom.getWorkId());
    //indexDB.cleanSameDaySnapshot();
    if (!indexDB.doesSnapshotDateExist(currSnap)) {
        await indexDB.addSnapshot(currSnap);
        if (!doesWorkExistAlr) {
            await indexDB.addWork(newAo3WorkDom.getMetadata());
        } else {
            console.log("Work already exists");
        }
        console.log("FoundSnapShot (Am i metadata): ", await indexDB.getSnapshot(newAo3WorkDom.getSnapshotId()));
        console.log("AllSnapshots: ", allSnapshots);
    } else {
        alert("A day hasn't passed. Calm down");
    }
}


async function displaySnapshot(workId, index = -1) {
    let allSnapshots = await indexDB.getAllSnapshotsFromWork(workId);
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
}
let scraperController = {
    scrapeWebsite,
    displaySnapshot
}
export default scraperController