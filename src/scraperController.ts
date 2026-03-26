import HTMLParserUtil from "./utils/HTMLParserUtil";
import Ao3WorkDom from "./Ao3WorkDom";
import indexDB from "./indexDB";
import HTMLUpdate from "./HTMLUpdate"
//import dateUtils from "./utils/dateUtils"
async function scrapeWebsite (link): Promise<boolean> {
    //fetch information
    let HTMLString = await HTMLParserUtil.fetchHTML(link)
    let HTMLDom = HTMLParserUtil.stringHTMLToDom(HTMLString);
    console.log("HTMLDom: ", HTMLDom)
    let newAo3WorkDom = new Ao3WorkDom(HTMLDom, link);
    //store info
    let allSnapshots = await indexDB.getAllSnapshots();
    // 1 day cd
    let prevSnap = allSnapshots[allSnapshots.length-1];
    let currSnap = newAo3WorkDom.getSnapshot()
    let doesWorkExistAlr = await indexDB.doesWorkExist(newAo3WorkDom.getWorkId());
    //indexDB.cleanSameDaySnapshot();
    let isSnapShotExist = await indexDB.doesSnapshotDateExist(currSnap);
    console.log("CHECK: ", !isSnapShotExist);
    if (!isSnapShotExist) {
        await indexDB.addSnapshot(currSnap);
        //if work doesn't exist, add
        if (!doesWorkExistAlr) {
            //issue here
            indexDB.addWork(newAo3WorkDom.getMetadata());
            console.log("Work successfully added")
        } else {
            console.log("Work already exists");
        }
        console.log("Added Snapshot successfully");
        console.log("FoundSnapShot (Am i metadata): ", await indexDB.getSnapshot(newAo3WorkDom.getSnapshotId()));
        console.log("AllSnapshots: ", allSnapshots);
        return true;
    } else {
        alert("A day hasn't passed. Calm down");
        return false;
    }
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
    displaySnapshot
}
export default scraperController