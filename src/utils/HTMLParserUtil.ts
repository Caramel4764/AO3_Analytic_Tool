//import workMetadata from "../data/workMetadata";
//import workSnapshot from "../data/workSnapshot";

/** Fetches HTML as string from url
 * 
 * @param {String} weblink - URL of website to extract HTML
 * 
 * @returns {Promise<string>} - A promise that returns the HTML in string
 */
async function fetchHTMLServer(weblink:string):Promise<string> {
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

async function fetchHTML(weblink:string):Promise<string> {
    let weblinkNoWarning = weblink+"?view_adult=true";
    const res = await fetch(weblinkNoWarning); // ← direct fetch, no proxy
    if (!res.ok) {
        throw new Error(`HTTP error: website not extracted. Error code ${res.status}`);
    }
    const html = await res.text();
    return html;
}
/** Return a mini dom parsed from HTMLString
 * 
 * @param {String} HTMLString - The html in string format to convert
 * 
 * @returns {Document} - The DOM document
 */
function stringHTMLToDom(HTMLString:string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(HTMLString, "text/html");
}

function getIdFromLink(link:string):number {
    const matchingUrlPart = link.match(/works\/(?<workId>\d+)/);
    const id = matchingUrlPart ? Number(matchingUrlPart.groups.workId): null;
    return id;
}
const HTMLParserUtil = {
    fetchHTML,
    stringHTMLToDom,
    getIdFromLink,
}
export default HTMLParserUtil;