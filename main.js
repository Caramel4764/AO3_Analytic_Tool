import HTMLParserUtil from "./src/HTMLParserUtil.js";
import Ao3WorkDom from "./src/Ao3WorkDom.js";
import scraperController from "./src/scraperController.js";
const linkInput = document.getElementById("link_input");
const trackBtn = document.getElementById("track_btn");
const parseBtn = document.getElementById("parse_btn");
let newAo3WorkDom;

trackBtn.addEventListener('click', async function() {
    let link = linkInput.value;
    try {
        //timer tick down
        scraperController.scrapeWebsite(link);
    } catch(error) {
        console.error(error);
        alert("invalid link");
    }
});

parseBtn.addEventListener('click', function() {
    newAo3WorkDom.getKudos();
    //console.log(queryData.stats);
})

// look for indexDB and display if something is there