import HTMLUtils from "./src/html.js";
import queryData from "./src/queryData.js";

const linkInput = document.getElementById("link_input");
const trackBtn = document.getElementById("track_btn");


trackBtn.addEventListener('click', async function() {
    queryData.link = linkInput.value;
    try {
        queryData.content = await HTMLUtils.fetchHTML(queryData.link);
        console.log(queryData.content);
    } catch {
        alert("invalid link");
    }
});