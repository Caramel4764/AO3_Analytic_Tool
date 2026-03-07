
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
        const DBRequest = indexedDB.open("ao3Data", 1);
        DBRequest.onupgradeneeded = function(event) {
            const db = event.target.result;
            //creates a table named snapshots
            db.createObjectStore("snapshots", {
                keyPath: "snapshotId"
            })
            db.createObjectStore("metadata", {})
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

async function getAllSnapshots() {
    let snapshotStore = await getStore("snapshots");
    let request = snapshotStore.getAll();
    return promiseRequest(request, "Fetched all snapshot", "Fetching all snapshots failed")
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

async function findWork(workID) {
    let metadataStore = await getStore("snapshots");
    let request = metadataStore.get(workID);
    return promiseRequest(request, "Found Work", "Could not find snapshot");
}

async function removeWork(workID) {
    let metadataStore = await getStore("snapshots");
    let request = metadataStore.delete(workID);
    return promiseRequest(request, "Deleted Work", "Could not delete because work Id not found");
}
let indexDB = {
    addSnapshot,
    getSnapshot,
    removeSnapshot,
    findWork,
    removeWork,
    getAllSnapshots,
    clearSnapshot
}

export default indexDB;