async function fetchHTML(weblink) {
    let weblinkNoWarning = weblink+"?view_adult=true";
    //?view_adult=true prevents warning page
    const res = await fetch(`http://localhost:3000/proxy?url=${encodeURIComponent(weblinkNoWarning)}`);
    if (!res.ok) {
        throw new Error(`HTTP error: website not extracted. Error code ${res.status}`);
    }
    const html = await res.text();
    console.log(`HasStats: ${html.includes("stats")}`);
    console.log(`HasKudos: ${html.includes("kudos")}`);
    console.log(`HTMLContentLength: ${html.length}`);
    return html;
}

function parseStat(HTMLContent) {
    const parser = new DOMParser();
    const webpage = parser.parseFromString(html, "text/html");
    const kudos = webpage.querySelector(".kudos").textContent;
}

const HTMLUtils = {
    fetchHTML
}
export default HTMLUtils;