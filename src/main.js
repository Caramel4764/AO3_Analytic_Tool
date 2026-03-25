import HTMLParserUtil from "./HTMLParserUtil.js";
import Ao3WorkDom from "./Ao3WorkDom.js";
import scraperController from "./scraperController.js";

const linkInput = document.getElementById("link_input");
const trackBtn = document.getElementById("track_btn");
const parseBtn = document.getElementById("parse_btn");


//let newAo3WorkDom;
trackBtn.addEventListener('click', async function() {
    const res = await fetch('http://localhost:3000/testURL');
    const data = await res.json();
    let link;
    link = data.apiKey;
    //link = linkInput.value;
    try {
        //timer tick down
        scraperController.scrapeWebsite(link);
    } catch(error) {
        console.error(error);
        alert("invalid link");
    }
});

parseBtn.addEventListener('click', function() {
    scraperController.displaySnapshot("123");
})
scraperController.displaySnapshot("456");
// look for indexDB and display if something is there