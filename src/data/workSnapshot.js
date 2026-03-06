import workMetadata from "./workMetadata.js"

const workSnapshot = {
    workId: workMetadata.workId,
    snapshotId: workMetadata.workId+Date.now(),
    timeStamp: Date.now(),
    lastUpdated: "",
    chapterCount: 0,
    kudos: 0,
    hits: 0,
    commentCount: 0,
    bookmarks: 0,
};

export default workSnapshot;