import workMetadata from "./data/workMetadata.js";
import workSnapshot from "./data/workSnapshot.js";

/** Fetches HTML as string from url
 * 
 * @param {String} weblink - URL of website to extract HTML
 * 
 * @returns {Promise<string>} - A promise that returns the HTML in string
 */
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
/** Return a mini dom parsed from HTMLString
 * 
 * @param {String} HTMLString - The html in string format to convert
 * 
 * @returns {Document} - The DOM document
 */
function stringHTMLToDom(HTMLString) {
    const parser = new DOMParser();
    return parser.parseFromString(HTMLString, "text/html");
}

const HTMLParserUtil = {
    fetchHTML,
    stringHTMLToDom,
}
export default HTMLParserUtil;