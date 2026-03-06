async function fetchHTML(weblink) {
    const res = await fetch(weblink);
    if (!res.ok) {
        throw new Error(`HTTP error: website not extracted. Error code ${res.status}`);
    }
    const html = await res.text();
    return html;
}

const HTMLUtils = {
    fetchHTML
}
export default HTMLUtils;