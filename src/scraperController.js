import HTMLParserUtil from "./HTMLParserUtil.js";
import Ao3WorkDom from "./Ao3WorkDom.js";
import indexDB from "./indexDB.js";

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
async function displaySnapshots() {
    let allSnapshots = await indexDB.getAllSnapshots();
    if (!allSnapshots) {
        return false;
    }
    let workMetadata = indexDB.findWork(allSnapshots[0].workId);
    console.log("Snapshots: ", allSnapshots);
    console.log("Metadata: ", workMetadata);
}
let scraperController = {
    scrapeWebsite,
    displaySnapshots
}
export default scraperController