export const request: IDBOpenDBRequest = window.indexedDB.open('SURVEY_DB', 1);
export let db: IDBDatabase;
export let store: IDBObjectStore;
request.onerror = (event: any) => {
    console.error(event!.target!.result)
}
request.onsuccess = (event:any) => {
    // add implementation here
    console.log("onsuccess",event)
    db = event.target.result;

    // // create the Contacts object store 
    // // with auto-increment id
    // store = db.createObjectStore('SURVEY_STORE', {
    //     autoIncrement: true
    // });

    // // create an index on the email property
    // let index = store.createIndex('name', 'name', {
    //     unique: true
    // });
};

// create the Contacts object store and indexes
request.onupgradeneeded = (event: any) => {
    db = event.target.result;

    // create the Contacts object store 
    // with auto-increment id
    store = db.createObjectStore('SURVEY_STORE', {
        autoIncrement: true
    });

    // create an index on the email property
    let index = store.createIndex('name', 'name', {
        unique: true
    });
};

export function insertSurvey(db: IDBDatabase, survey: any) {
    // create a new transaction
    const txn = db.transaction('SURVEY_STORE', 'readwrite');

    // get the Contacts object store
    const store = txn.objectStore('SURVEY_STORE');
    //
    let query = store.put(survey);

    // handle success case
    query.onsuccess = function (event) {
        console.log(event);
    };

    // handle the error case
    query.onerror = function (event: any) {
        console.log(event.target.errorCode);
    }

    // close the database once the 
    // transaction completes
    txn.oncomplete = function () {
        // db.close();
    };
}

function getAllAnswers(db: IDBDatabase, callback: (entries: any[]) => void) {
    const txn = db.transaction('SURVEY_STORE', "readonly");
    const objectStore = txn.objectStore('SURVEY_STORE');
    let result: any[] = [];

    objectStore.openCursor().onsuccess = (event: any) => {
        let cursor = event.target.result;
        if (cursor) {
            let entry = cursor.value;
            console.log(entry);
            result.push(entry)
            // continue next record
            cursor.continue();
        }
    };
    // close the database connection
    txn.oncomplete = function () {
        // db.close();
        callback(result)
    };
}
