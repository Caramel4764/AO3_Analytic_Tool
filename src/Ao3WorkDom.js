import HTMLParserUtil from "./HTMLParserUtil.js";
import numberUtils from "./numberUtils.js";
class Ao3WorkDom {
    constructor(dom, url) {
        this.dom = dom;
        this.stats = {
            hits: 0,
            kudos: 0,
            bookmarks: 0,
            comments: 0,
            chapters: 0
        }
        this.metadata = {
            workId: "",
            title: "", 
            author: "",
            url: "", 
            published: ""
        }
        this.metadata.url = url;
        this.parseStat();
        this.parseMetadata()
    }
    getStats() {
        return this.stats;
    }
    getKudos() {
        return this.stats.kudos;
    }
    getHits() {
        return this.stats.hits;
    }
    getBookmarks() {
        return this.stats.bookmarks;
    }
    getCommentCount() {
        return this.stats.comments;
    }
    getChapterCount() {
        return this.stats.chapters;
    }
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
        //published date
        this.metadata.published = this.dom.querySelector("dl.stats dd.status").textContent;
        //author
        this.metadata.author = this.dom.querySelector("div.preface.group h3.byline.heading a").textContent;
        //title
        this.metadata.title = this.dom.querySelector("div.preface.group h2.title.heading").textContent.trim();
        //
        console.log(this.metadata);
    }
    parseStat() {
        let listOfDataLabel = this.dom.querySelectorAll("dl.stats dt");
        let listOfDataValue = this.dom.querySelectorAll("dl.stats dd");
        for (let i = 0; i < listOfDataLabel.length; i++) {
            listOfDataLabel[i].textContent = (listOfDataLabel[i].textContent).toLowerCase().replace(":", "");
            if (listOfDataLabel[i].textContent == "chapters") {
                this.stats[listOfDataLabel[i].textContent] = this.parseAO3Chapter(listOfDataValue[i].textContent);
                console.log(`ParsedChapter: ${this.parseAO3Chapter(listOfDataValue[i].textContent)}`);
            } else {
                this.stats[listOfDataLabel[i].textContent] = numberUtils.removeCommaFromNum(listOfDataValue[i].textContent);
            }
        }
        console.log(this.stats);
    }
}



export default Ao3WorkDom;