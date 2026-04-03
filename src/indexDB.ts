import testingData from "./data/testingData";
import dateUtils from "./utils/dateUtils";
import type{ Metadata, Snapshot } from "./data/types";
import config from "./config"
function promiseRequest<T>(request, customSuccessMessage: string="", customErrorMessage: string=""): Promise <T> {
    return new Promise((resolve, reject)=> {
        request.onsuccess = () => {
            if (customSuccessMessage != "") {
                console.log(`Success: ${customSuccessMessage}`);
            }
            resolve(request.result);
        };
        request.onerror = () => reject(new Error(`${customErrorMessage}: ${request.error}`));
    })
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const DBRequest = indexedDB.open("ao3Data", 2);
        DBRequest.onupgradeneeded = function(event) {
            const db = (event.target as IDBOpenDBRequest).result;;
            //creates a table named snapshots
            db.createObjectStore("snapshots", {
                keyPath: "snapshotId"
            })
            db.createObjectStore("metadata", {
                keyPath: "workId"
            })
        } 
        DBRequest.onsuccess = function (event) {
            const db = (event.target as IDBOpenDBRequest).result;;
            resolve(db);
        }
        DBRequest.onerror = function (event) {
            reject((event.target as IDBOpenDBRequest).error);
        }
    });
}

async function getStore(storeName:string): Promise<IDBObjectStore> {
    const db = await openDB();
    let transaction = db.transaction(storeName, "readwrite");
    let store = transaction.objectStore(storeName);
    return store;
}

async function addSnapshot(snapshot:Snapshot): Promise<Snapshot> {
    let snapshotStore = await getStore("snapshots");
    let request = snapshotStore.put(snapshot);
    await promiseRequest(request, "Successful added snapshot", "Could not add snapshot");
    console.log("%c (Successful) Added Snapshot: ", "color: green;", snapshot);
    return snapshot;
}

async function isDBEmpty():Promise<boolean> {
    let allSnap = await getAllSnapshots();
    if (allSnap.length==0) {
        return true;
    }
    return false;
}
async function getAllSnapshotsFromWork(workId: number): Promise<Snapshot[]> {
    let snapshots = await getAllSnapshots();
    let allSnapshotWithId = [];
    for (let i = 0; i < snapshots.length; i++) {
        let currSnap = snapshots[i];
        if (currSnap.workId == workId) {
            allSnapshotWithId.push(currSnap);
        }
    }
    return allSnapshotWithId;
}
async function removeAllSnapshotsFromWork(workId: number): Promise<void> {
    let allSnapshotWithId = await getAllSnapshotsFromWork(workId);
    for (let i = 0; i < allSnapshotWithId.length; i++) {
        let currSnap = allSnapshotWithId[i];
        indexDB.removeSnapshot(currSnap.snapshotId);
    }
}
async function isDBByWorkEmpty(workID: number) {
    let allSnap = await getAllSnapshotsFromWork(workID);
    if (allSnap.length == 0) {
        return true;
    }
    return false;
}
async function getSnapshot(snapshotId: string): Promise<Snapshot> {
    let snapshotStore = await getStore("snapshots");
    let request = snapshotStore.get(snapshotId);

    return promiseRequest(request, "FoundSnapShot", "Could not find snapshot");
}
async function getMostRecentSnapshotFromWork(workId:number): Promise<Snapshot> {
    const allSnap = await getAllSnapshotsFromWork(workId);
    return allSnap[allSnap.length-1];
}
async function getAllSnapshots(): Promise<Snapshot[]> {
    if (config.isTesting) {
        return testingData.snapshots;
    } else {
        let snapshotStore = await getStore("snapshots");
        let request = snapshotStore.getAll();
        return promiseRequest(request, "Fetched all snapshot", "Fetching all snapshots failed")
    }
}
async function importSnapshots(addedSnapshots: Snapshot[]) {
    for (let i = 0; i < addedSnapshots.length; i++) {
        await addSnapshot(addedSnapshots[i]);
    }
    await cleanSameDaySnapshot();
    console.log("successfully imported snapshot")
}
async function removeSnapshot(snapshotId:string): Promise<Snapshot> {
    let snapshotStore = await getStore("snapshots");
    let request = snapshotStore.delete(snapshotId);
    return promiseRequest(request, "Deleted", "Could not delete because snapshot Id not found");
}

async function clearSnapshot(): Promise<IDBRequest<undefined>> {
    let snapshotStore = await getStore("snapshots");
    let request = snapshotStore.clear();
    return promiseRequest(request, "All snapshot cleared", "Could not delete all");
}
async function getAllUniqueSnapshotDate(workId:number): Promise<Set<String>> {
    let allSnapshots = await getAllSnapshots();
    let uniqueDates = new Set<string>();
    for (let i = 0; i < allSnapshots.length; i++) {
        let currSnap = allSnapshots[i];
        //if not snapshot of this work, skip to next
        if (currSnap.workId != workId) {
            continue;
        }
        let currDate = dateUtils.timeStampToReadable(currSnap.timeStamp);
        // if doesn't exist, add it.
        if (!uniqueDates.has(currDate)) {
            uniqueDates.add(currDate);
        }
    }
    return uniqueDates;
}
async function importMetadatas(addedMetadata: Metadata[]) {
    for (let i = 0; i < addedMetadata.length; i++) {
        let currMeta = addedMetadata[i]
        if (!(await doesWorkExist(currMeta.workId))) {
            await addWork(currMeta);
        }
    }
    console.log(await getAllWork());
    console.log("Successfully imported Metadatas");
}
async function doesSnapshotDateExist(snapshot: Snapshot): Promise<boolean> {
    let allUniqueDate = await getAllUniqueSnapshotDate(snapshot.workId);
    let readableDate = dateUtils.timeStampToReadable(snapshot.timeStamp);
    if (allUniqueDate.has(readableDate)){
        console.log("ALREADY EXISTS")
        return true;
    } else {
        console.log("SET: ", allUniqueDate);
        console.log("LOOKING FOR: ", readableDate);

        return false;
    }
}
async function removeSingleSnapshotByDate(metadata:Metadata, timeStamp:string): Promise<Snapshot> {
    let allSnapshots = await getAllSnapshotsFromWork(metadata.workId);
    let wantedISO = new Date(timeStamp).toISOString().slice(0, 10);
    for (let i = 0; i<allSnapshots.length; i++) {
        let currSnap = allSnapshots[i];
        let currISODate = new Date(currSnap.timeStamp).toISOString().slice(0, 10);
        if (currISODate == wantedISO) {
            console.log("currISODate:", currISODate);
            console.log("wantedISO:", wantedISO);
            console.log("timeStamp: ", timeStamp);
            let snapshotRef = await getSnapshot(currSnap.snapshotId);
            removeSnapshot(currSnap.snapshotId);
            return snapshotRef;
        }
    }
    throw new Error(`No snapshot found for date(${wantedISO}) on ${metadata.title}`);
}
async function removeAllSnapshotsByDate(timeStamp): Promise<Snapshot[]> {
    console.log("trying to remove");
    let allWorks = await getAllWork();
    let results = await Promise.allSettled(
        allWorks.map(async (work) => {
            return await removeSingleSnapshotByDate(work, timeStamp);
        })
    )
    let deleted: Snapshot[] = results.filter((res)=> {
        return res.status === "fulfilled";
    }).map((res) => {
        return res.value;
    });
    console.log("finished");

    return deleted;
}
//if multiple timestamp have the same date, only the first will be kept
async function cleanSameDaySnapshot(): Promise<void> {
    let allSnapshots = await getAllSnapshots();
    let allWorks = await getAllWork();

    for (let j = 0; j < allWorks.length; j++) {
        let currWork = allWorks[j];
        const seenDates = new Set<string>();

        // Only look at snapshots for this work, sorted oldest first
        const workSnapshots = allSnapshots
            .filter(s => s.workId === currWork.workId)
            .sort((a, b) => a.timeStamp - b.timeStamp);

        for (let i = 0; i < workSnapshots.length; i++) {
            let currSnap = workSnapshots[i];
            let currDate = dateUtils.normalizeDate(dateUtils.timeStampToReadable(currSnap.timeStamp));

            if (seenDates.has(currDate)) {
                await removeSnapshot(currSnap.snapshotId);
            } else {
                seenDates.add(currDate);
            }
        }
    }
}
async function addWork(metadata: Metadata): Promise<Metadata|null> {
    //if the work doesn't already exist, then add
    let foundWork = await findWork(metadata.workId);
    if (foundWork == null) {
        let metadataStore = await getStore("metadata");
        let request = metadataStore.put(metadata);
        return promiseRequest(request, "Successful added work", "Could not add work");
    } else {
        console.log("Work already exist. Will not add", foundWork)
        return null;
    }
}
async function findWork(workId: number): Promise<Metadata> {
    if (config.isTesting) {
        for (let i = 0; i<testingData.metadata.length;i++) {
            if (testingData.metadata[i].workId == workId) {
                return testingData.metadata[i];
            }
        }
        return null;
    } else {
        let metadataStore = await getStore("metadata");
        let request = metadataStore.get(workId);
        return promiseRequest(request, "Found Work", "Could not find snapshot");
    }
}
async function getAllWork(): Promise<Metadata[]> {
    if (config.isTesting) {
        return testingData.metadata;
    } else {
        let metadataStore = await getStore("metadata");
        let request = metadataStore.getAll();
        return promiseRequest<Metadata[]>(request, "Fetched all work", "Fetching all work failed")
    }
}
async function doesWorkExist(workId:number):Promise<boolean> {
    let allWork = await getAllWork();
    console.log("ALL WORK:", allWork);
    console.log("workId: ", workId)
    for (let i = 0; i < allWork.length; i++) {
        if (allWork[i].workId == workId) {
            console.log("true: ")
            return true;
        }
    }
    return false;
}
//remove work and associated snapshots
async function removeWork(workId:number): Promise<Metadata> {
    let metadataStore = await getStore("metadata");
    let request = metadataStore.delete(workId);
    removeAllSnapshotsFromWork(workId);
    return promiseRequest(request, "Deleted Work", "Could not delete because work Id not found");
}

let indexDB = {
    addSnapshot,
    getSnapshot,
    removeSnapshot,
    findWork,
    removeWork,
    addWork,
    getAllSnapshots,
    clearSnapshot,
    getAllWork,
    doesWorkExist,
    cleanSameDaySnapshot,
    doesSnapshotDateExist,
    getAllSnapshotsFromWork,
    isDBEmpty,
    isDBByWorkEmpty,
    getMostRecentSnapshotFromWork,
    importSnapshots,
    importMetadatas,
    removeAllSnapshotsByDate
}

export default indexDB;