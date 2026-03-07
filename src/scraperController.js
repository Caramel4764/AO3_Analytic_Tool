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
    indexDB.addSnapshot(newAo3WorkDom.getSnapshot());
    console.log("FoundSnapShot: ", indexDB.getSnapshot(newAo3WorkDom.getSnapshotId()));
    console.log("AllSnapshots: ", indexDB.getAllSnapshots());
}

let scraperController = {
    scrapeWebsite
}
export default scraperController