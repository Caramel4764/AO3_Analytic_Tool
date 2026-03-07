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
    transaction = db.transaction(storeName, "readwrite");
    store = transaction.objectStore(storeName);
    return store;
}

async function addSnapshot(snapshot) {
    snapshotStore = await getStore("snapshots");
    snapshotStore.add(snapshot);
}

function findSnapshot(snapshotId) {
    
}

function removeSnapshot(snapshotId) {

}

function findWork(workID) {

}

function removeWork(workID) {

}
let indexDB = {
    addSnapshot,
    findSnapshot,
    removeSnapshot,
    findWork,
    removeWork
}

export default indexDB;