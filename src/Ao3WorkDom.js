import HTMLParserUtil from "./HTMLParserUtil.js";
import numberUtils from "./numberUtils.js";

/**
 * @typedef {Object} Snapshot
 * @property {number} bookmarks - Number of bookmarks
 * @property {number} chapters - Number of chapters
 * @property {number} comments - Number of comments received
 * @property {number} hits - Number of hits
 * @property {number} kudos - Number of kudos
 * @property {string} published - Original publication date of the work (YYYY-MM-DD)
 * @property {number} snapshotId - Unique id of the snapshot (workID-timeStamp)
 * @property {number} timeStamp - Unix timestamp in milliseconds (Date.now())
 * @property {string} timeStampReadable - Human-readable version of timeStamp
 * @property {string} updated - Last updated date of the work (YYYY-MM-DD)
 * @property {number} words - Number of words
 * @property {number} workID - Id of the work
 */
class Ao3WorkDom {
    constructor(dom, url) {
        this.dom = dom;
        this.snapshot = {
            timeStamp: "",
            timeStampReadable: "",
            workId: "",
            snapshotId: "",
            hits: 0,
            kudos: 0,
            bookmarks: 0,
            comments: 0,
            chapters: 0
        }
        this.metadata = {
            workId: "",
            timeStamp: "",
            timeStampReadable: "",
            title: "", 
            author: "",
            url: "", 
            published: ""
        }
        this.metadata.url = url;
        this.parseMetadata();
        this.parseStat();
    }
    getSnapshot() {
        return this.snapshot;
    }
    getMetadata() {
        return this.metadata;
    }
    getSnapshotId() {
        return this.snapshot.snapshotId;
    }
    getKudos() {
        return this.snapshot.kudos;
    }
    getHits() {
        return this.snapshot.hits;
    }
    getBookmarks() {
        return this.snapshot.bookmarks;
    }
    getCommentCount() {
        return this.snapshot.comments;
    }
    getChapterCount() {
        return this.snapshot.chapters;
    }
    /** Extracts the chapter count from string. Currently this is the first number
     * 
     * @param {String} chapterString - The string returned by Ao3 (ie 1/5, 2/?)
     * 
     * @returns {Int} - the number of chapters
     */
    parseAO3Chapter(chapterString) {
        let chapterInt = "";
        for (let i = 0; i < chapterString.length; i++) {
            if (chapterString[i]=='/') {
                //console.log(`ParsedChapter: ${Number(chapterInt)}`);
                return Number(chapterInt);
            }
            chapterInt+=chapterString[i];
        }
        return 0;
    }

    updateMetaData() {
        //workMetadata.id = 
        //workMetadata.title = 
        //workMetadata.author = 
        //workMetadata.url = 
        workMetadata.published = queryData.stats.published;
    }
    updateSnapshot() {
        let currDate = Date.now();
        workSnapshot.workId = workMetadata.workId;
        workSnapshot.snapshotId = workMetadata.workId+currDate
        workSnapshot.timeStamp = currDate;
        workSnapshot.lastUpdated = queryData.stats.updated;
        workSnapshot.chapterCount = numberUtils.removeCommaFromNum(queryData.stats.chapters);
        workSnapshot.kudos = numberUtils.removeCommaFromNum(queryData.stats.kudos);
        workSnapshot.hits = numberUtils.removeCommaFromNum(queryData.stats.hits);
        workSnapshot.commentCount = numberUtils.removeCommaFromNum(queryData.stats.comments);
        workSnapshot.bookmarks = numberUtils.removeCommaFromNum(queryData.stats.bookmarks);
    }
    parseMetadata() {
        const matchingUrlPart = (this.metadata.url).match(/works\/(?<workId>\d+)/);
        this.metadata.workId = matchingUrlPart ? Number(matchingUrlPart.groups.workId): null;
        this.metadata.published = this.dom.querySelector("dl.stats dd.status").textContent;
        this.metadata.author = this.dom.querySelector("div.preface.group h3.byline.heading a").textContent;
        this.metadata.title = this.dom.querySelector("div.preface.group h2.title.heading").textContent.trim();
        this.metadata.timeStamp = Date.now();
        this.metadata.timeStampReadable = new Date().toISOString();
        console.log(this.metadata);
    }
    parseStat() {
        let listOfDataLabel = this.dom.querySelectorAll("dl.stats dt");
        let listOfDataValue = this.dom.querySelectorAll("dl.stats dd");
        for (let i = 0; i < listOfDataLabel.length; i++) {
            listOfDataLabel[i].textContent = (listOfDataLabel[i].textContent).toLowerCase().replace(":", "");
            if (listOfDataLabel[i].textContent == "chapters") {
                this.snapshot[listOfDataLabel[i].textContent] = this.parseAO3Chapter(listOfDataValue[i].textContent);
            } else {
                this.snapshot[listOfDataLabel[i].textContent] = numberUtils.removeCommaFromNum(listOfDataValue[i].textContent);
            }
        }
        this.snapshot.timeStamp = Date.now();
        this.snapshot.workId = this.metadata.workId;
        this.snapshot.snapshotId = this.snapshot.workId+"-"+Date.now();
        this.snapshot.timeStampReadable = new Date().toISOString();

        console.log(this.snapshot);
    }
}



export default Ao3WorkDom;