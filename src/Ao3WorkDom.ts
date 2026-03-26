//import HTMLParserUtil from "./utils/HTMLParserUtil";
import numberUtils from "./utils/numberUtils";
import type {Snapshot, Metadata} from "./data/types"

class Ao3WorkDom {
    dom: Document;
    snapshot: Snapshot;
    metadata: Metadata;
    constructor(dom: Document, url: string) {
        this.dom = dom;
        this.snapshot = {
            timeStamp: 0,
            timeStampReadable: "",
            workId: null,
            snapshotId: "",
            hits: 0,
            kudos: 0,
            bookmarks: 0,
            comments: 0,
            chapters: 0
        }
        this.metadata = {
            workId: null,
            timeStamp: 0,
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
    getSnapshot():Snapshot {
        return this.snapshot;
    }
    getMetadata():Metadata {
        return this.metadata;
    }
    getSnapshotId():string {
        return this.snapshot.snapshotId;
    }
    getWorkId():number {
        return this.metadata.workId;
    }
    getKudos():number {
        return this.snapshot.kudos;
    }
    getHits():number {
        return this.snapshot.hits;
    }
    getBookmarks():number {
        return this.snapshot.bookmarks;
    }
    getCommentCount():number {
        return this.snapshot.comments;
    }
    getChapterCount():number {
        return this.snapshot.chapters;
    }
    /** Extracts the chapter count from string. Currently this is the first number
     * 
     * @param {String} chapterString - The string returned by Ao3 (ie 1/5, 2/?)
     * 
     * @returns {Int} - the number of chapters
     */
    parseAO3Chapter(chapterString:string): number {
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

    //updateMetaData() {
        //workMetadata.id = 
        //workMetadata.title = 
        //workMetadata.author = 
        //workMetadata.url = 
        //workMetadata.published = queryData.stats.published;
    //}
    /*updateSnapshot() {
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
    }*/
    /** Fills metadata from the dom
     * 
    */
    parseMetadata():void {
        const matchingUrlPart = (this.metadata.url).match(/works\/(?<workId>\d+)/);
        this.metadata.workId = matchingUrlPart ? Number(matchingUrlPart.groups.workId): null;
        this.metadata.published = this.dom.querySelector("dl.stats dd.status").textContent;
        this.metadata.author = this.dom.querySelector("div.preface.group h3.byline.heading a").textContent;
        this.metadata.title = this.dom.querySelector("div.preface.group h2.title.heading").textContent.trim();
        this.metadata.timeStamp = Date.now();
        this.metadata.timeStampReadable = new Date().toISOString();
        console.log(this.metadata);
    }
    /** Fills stat from dom
     * 
     */
    parseStat():void {
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