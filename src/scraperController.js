import HTMLParserUtil from "./HTMLParserUtil.js";
import Ao3WorkDom from "./Ao3WorkDom.js";

async function scrapeWebsite (link) {
    //fetch information
    let HTMLString = await HTMLParserUtil.fetchHTML(link)
    let HTMLDom = HTMLParserUtil.stringHTMLToDom(HTMLString);
    newAo3WorkDom = new Ao3WorkDom(HTMLDom, link);
    //store info
    
}

let scraperController = {
    scrapeWebsite
}
export default scraperController