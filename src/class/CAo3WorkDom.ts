//import HTMLParserUtil from "./utils/HTMLParserUtil";
import numberUtils from "../utils/numberUtils";
import type {Snapshot, Metadata} from "../data/types"
import HTMLParserUtil from "../utils/HTMLParserUtil";
import dateUtils from "../utils/dateUtils";

class CAo3WorkDom {
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
        console.log("THIS.SNAP: ", this.snapshot);
        console.log("THIS.META: ", this.metadata);
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
        return Number(this.metadata.workId);
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
    static parseAO3Chapter(chapterString:string): number {
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
    /** Fills metadata from the dom
     * 
    */
    parseMetadata():void {
        this.metadata.workId = HTMLParserUtil.getIdFromLink(this.metadata.url);
        this.metadata.published = this.dom.querySelector("dl.stats dd.status").textContent;
        this.metadata.author = this.dom.querySelector("div.preface.group h3.byline.heading").textContent.trim();
        this.metadata.title = this.dom.querySelector("div.preface.group h2.title.heading").textContent.trim();
        this.metadata.timeStamp = Date.now();
        this.metadata.timeStampReadable = dateUtils.timeStampToReadable(this.metadata.timeStamp);
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
                this.snapshot[listOfDataLabel[i].textContent] = CAo3WorkDom.parseAO3Chapter(listOfDataValue[i].textContent);
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



export default CAo3WorkDom;