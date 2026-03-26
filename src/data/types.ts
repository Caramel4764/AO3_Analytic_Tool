import Chart from 'chart.js/auto';

/**
 * @typedef {Object} Snapshot
 * @property {number} bookmarks - Number of bookmarks
 * @property {number} chapters - Number of chapters
 * @property {number} comments - Number of comments received
 * @property {number} hits - Number of hits
 * @property {number} kudos - Number of kudos
 * @property {string} published - Original publication date of the work (YYYY-MM-DD)
 * @property {number} snapshotId - Unique id of the snapshot (workId-timeStamp)
 * @property {number} timeStamp - Unix timestamp in milliseconds (Date.now())
 * @property {string} timeStampReadable - Human-readable version of timeStamp
 * @property {string} updated - Last updated date of the work (YYYY-MM-DD)
 * @property {number} words - Number of words
 * @property {number} workId - Id of the work associated to this snapshot
 */

export interface Snapshot {
    bookmarks: number;
    chapters: number;
    comments: number;
    hits: number;
    kudos: number;
    published?: string;
    snapshotId: string;
    timeStamp: number;
    timeStampReadable: string;
    updated?: string;
    words?: number;
    workId: number | null;
}

/**
 * @typedef {Object} Metadata
 * @property {number} workId - Id of the work
 * @property {number} timeStamp - Unix timestamp in milliseconds (Date.now())
 * @property {string} timeStampReadable - Human-readable version of timeStamp
 * @property {string} title - Title of the work
 * @property {number} author - Number of words
 * @property {number} url - Ao3 Url
 * @property {number} published - Publish date (YYYY-MM-DD)
 * 
 */

export interface Metadata {
    workId: number | null;
    timeStamp: number;
    timeStampReadable: string;
    title: string;
    author: string;
    url: string;
    published: string;
}

export interface ChartConfigParam {
    label: string;
    data: { x: string; y: number }[];
    color: string;
    tooltipLabel: string;
    snapshots: Snapshot[];
    newChapterColor: string;
    getChartCallback: () => Chart | undefined;
}