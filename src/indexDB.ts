import testingData from "./data/testingData";
import dateUtils from "./utils/dateUtils";
import type{ Metadata, Snapshot } from "./data/types";
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
    return promiseRequest(request, "Successful added snapshot", "Could not add snapshot");
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
    console.log("TESTIN:", allSnap.length)
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

async function getAllSnapshots(): Promise<Snapshot[]> {
    if (testingData.testingConfig.isTesting) {
        return testingData.snapshots;
    } else {
        let snapshotStore = await getStore("snapshots");
        let request = snapshotStore.getAll();
        return promiseRequest(request, "Fetched all snapshot", "Fetching all snapshots failed")
    }
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
//if multiple timestamp have the same date, only the first will be kept
async function cleanSameDaySnapshot(): Promise<void> {
    let allSnapshots = await getAllSnapshots();
    let allWorks = await getAllWork();
    for (let j = 0; j < allWorks.length; j++) {
        let currWork = allWorks[j];
        let uniqueDates = await getAllUniqueSnapshotDate(currWork.workId);
        for (let i = 0; i < allSnapshots.length-1; i++) {
            let currSnap = allSnapshots[i];
            let currDate = dateUtils.timeStampToReadable(currSnap.timeStamp);
            if (uniqueDates.has(currDate)) {
                removeSnapshot(currSnap.snapshotId);
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
    if (testingData.testingConfig.isTesting) {
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
    if (testingData.testingConfig.isTesting) {
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
    console.log("false: ")

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
    isDBByWorkEmpty
}

export default indexDB;