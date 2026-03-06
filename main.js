import HTMLUtils from "./src/html.js";
import queryData from "./src/queryData.js";
import workMetadata from "./src/workMetadata.js";
import workSnapshot from "./src/workSnapshot.js";

const linkInput = document.getElementById("link_input");
const trackBtn = document.getElementById("track_btn");
const parseBtn = document.getElementById("parse_btn");

trackBtn.addEventListener('click', async function() {
    queryData.link = linkInput.value;
    try {
        queryData.content = await HTMLUtils.fetchHTML(queryData.link);
        HTMLUtils.parseStat(queryData.content);
        console.log(queryData.content);
    } catch(error) {
        console.error(error);
        alert("invalid link");
    }
});

parseBtn.addEventListener('click', function() {
    
    console.log(queryData.stats);
})