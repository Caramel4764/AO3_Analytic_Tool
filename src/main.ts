//import HTMLParserUtil from "./utils/HTMLParserUtil";
//import Ao3WorkDom from "./Ao3WorkDom";
import indexDB from "./indexDB";
import scraperController from "./scraperController";

const linkInput = document.getElementById("link_input") as HTMLInputElement;
const trackBtn = document.getElementById("track_btn");
const parseBtn = document.getElementById("parse_btn");

const workID = 123;
//let newAo3WorkDom;
trackBtn.addEventListener('click', async function() {
    const res = await fetch('http://localhost:3000/testURL');
    const data = await res.json();
    let link;
    link = linkInput.value;
    try {
        //timer tick down
        scraperController.scrapeAndUpdate(link);
    } catch(error) {
        console.error(error);
        alert("invalid link");
    }
});
parseBtn.addEventListener('click', function() {
    scraperController.displaySnapshot(workID);
})
// look for indexDB and display if something is there
let isThereData = await indexDB.isDBEmpty();
let isDBEmpty = await indexDB.isDBByWorkEmpty(workID);
console.log(!isDBEmpty);
if (!isThereData && !isDBEmpty) {
    scraperController.displaySnapshot(workID);
}