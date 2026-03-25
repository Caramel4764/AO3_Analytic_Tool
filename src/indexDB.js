import testingData from "./data/testingData";
import dateUtils from "./dateUtils";
import testingConfig from "./testingConfig.js";
function promiseRequest(request, customSuccessMessage="", customErrorMessage="") {
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

function openDB() {
    return new Promise((resolve, reject) => {
        const DBRequest = indexedDB.open("ao3Data", 2);
        DBRequest.onupgradeneeded = function(event) {
            const db = event.target.result;
            //creates a table named snapshots
            db.createObjectStore("snapshots", {
                keyPath: "snapshotId"
            })
            db.createObjectStore("metadata", {
                keyPath: "workId"
            })
        } 
        DBRequest.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        }
        DBRequest.onerror = function (event) {
            reject(event.target.error);
        }
    });
}

async function getStore(storeName) {
    const db = await openDB();
    let transaction = db.transaction(storeName, "readwrite");
    let store = transaction.objectStore(storeName);
    return store;
}

async function addSnapshot(snapshot) {
    let snapshotStore = await getStore("snapshots");
    let request = snapshotStore.put(snapshot);
    return promiseRequest(request, "Successful added snapshot", "Could not add snapshot");
}

async function getSnapshot(snapshotId) {
    let snapshotStore = await getStore("snapshots");
    let request = snapshotStore.get(snapshotId);
    return promiseRequest(request, "FoundSnapShot", "Could not find snapshot");
}
async function getAllSnapshotsFromWork(workId) {
    let snapshots = await getAllSnapshots();
    console.log("Snapshots: ", snapshots);
    console.log("workID: ", workId);

    let allSnapshotWithId = [];
    for (let i = 0; i < snapshots.length; i++) {
        let currSnap = snapshots[i];
        if (currSnap.workId == workId) {
            allSnapshotWithId.push(currSnap);
        }
    }
    return allSnapshotWithId;
}
async function getAllSnapshots() {
    if (testingConfig.isTesting) {
        return testingData.snapshots;
    } else {
        let snapshotStore = await getStore("snapshots");
        let request = snapshotStore.getAll();
        return promiseRequest(request, "Fetched all snapshot", "Fetching all snapshots failed")
    }
}

async function removeSnapshot(snapshotId) {
    let snapshotStore = await getStore("snapshots");
    let request = snapshotStore.delete(snapshotId);
    return promiseRequest(request, "Deleted", "Could not delete because snapshot Id not found");
}

async function clearSnapshot() {
    let snapshotStore = await getStore("snapshots");
    let request = snapshotStore.clear();
    return promiseRequest(request, "All snapshot cleared", "Could not delete all");
}
async function getAllUniqueSnapshotDate(workId) {
    let allSnapshots = await getAllSnapshots();
    let uniqueDates = new Set();
    for (let i = 0; i < allSnapshots.length-1; i++) {
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
async function doesSnapshotDateExist(snapshot) {
    let allUniqueDate = await getAllUniqueSnapshotDate(snapshot.workId);
    let readableDate = dateUtils.timeStampToReadable(snapshot.timeStamp);
    if (allUniqueDate.has(readableDate)){
        return true;
    } else {
        return false;
    }
}
//if multiple timestamp have the same date, only the first will be kept
async function cleanSameDaySnapshot() {
    let allSnapshots = await getAllSnapshots();
    let allWorks = await getAllWork();
    for (let j = 0; j < allWorks.length(); j++) {
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
async function addWork(metadata) {
    //if the work doesn't already exist, then add
    let foundWork = await findWork(metadata.workId);
    if (foundWork == null) {
        let metadataStore = await getStore("metadata");
        let request = metadataStore.put(metadata);
        return promiseRequest(request, "Successful added work", "Could not add work");
    } else {
        console.log("Work already exist. Will not add", foundWork)
        return foundWork;
    }
}
async function findWork(workId) {
    if (testingConfig.isTesting) {
        for (let i = 0; i<testingData.metadata.length;i++) {
            if (testingData.metadata[i].workId == workId) {
                return testingData.metadata[i];
            }
        }
        return false;
    } else {
        let metadataStore = await getStore("metadata");
        let request = metadataStore.get(workId);
        return promiseRequest(request, "Found Work", "Could not find snapshot");
    }
}
async function getAllWork() {
    if (testingConfig.isTesting) {
        return testingData.metadata;
    } else {
        let metadataStore = await getStore("metadata");
        let request = metadataStore.getAll();
        return promiseRequest(request, "Fetched all work", "Fetching all work failed")
    }
}
async function doesWorkExist(workId) {
    let allWork = await getAllWork();
    for (let i = 0; i < allWork.length; i++) {
        if (allWork[i].workId == workId) {
            return true;
        }
    }
    return false;
}
async function removeWork(workId) {
    let metadataStore = await getStore("metadata");
    let request = metadataStore.delete(workId);
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
    getAllSnapshotsFromWork
}

export default indexDB;