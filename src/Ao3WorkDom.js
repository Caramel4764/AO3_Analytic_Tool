import HTMLParserUtil from "./HTMLParserUtil.js";
import numberUtils from "./numberUtils.js";
class Ao3WorkDom {
    constructor(dom) {
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
        this.parseStat(this.dom);
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
                console.log(`important: ${chapterInt}`);
                return Number(chapterInt);
            }
            chapterInt+=chapterString[i];
        }
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

    parseStat(HTMLDom) {
        let listOfDataLabel = HTMLDom.querySelectorAll("dl.stats dt");
        let listOfDataValue = HTMLDom.querySelectorAll("dl.stats dd");
        for (let i = 0; i < listOfDataLabel.length; i++) {
            listOfDataLabel[i].textContent = (listOfDataLabel[i].textContent).toLowerCase().replace(":", "");
            console.log(`${listOfDataLabel[i].textContent}: ${listOfDataValue[i].textContent}`);
            if (listOfDataLabel[i].textContent == "chapters") {
                this.stats[listOfDataLabel[i].textContent] = this.parseAO3Chapter(listOfDataValue[i].textContent);
            }
            this.stats[listOfDataLabel[i].textContent] = listOfDataValue[i].textContent;
        }
        console.log(this.stats);
    }
}



export default Ao3WorkDom;