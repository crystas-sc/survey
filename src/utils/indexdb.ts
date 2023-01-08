export let indexedDBCurrentVersion = parseInt(window.localStorage.getItem("DB_CURRENT_VER") || "1")

export let request: IDBOpenDBRequest = window.indexedDB.open('SURVEY_DB', indexedDBCurrentVersion);
request.onerror = (event: any) => {
    console.error(event!.target!.result)
}
request.onsuccess = (event: any) => {
    // add implementation here
    console.log("onsuccess", event)

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

    // create the Contacts object store 
    // with auto-increment id
    let store = request.result.createObjectStore('SURVEY_STORE', {
        autoIncrement: true
    });

    // create an index on the email property
    let index = store.createIndex('name', 'name', {
        unique: true
    });
};

export function generalNameToStoreName(name: string) {
    return name.replaceAll(/\s/gi, "_").toUpperCase() + "_STORE"
}

export function createStoreIfNotExists(name: string, questionnaireSectionData: any) {
    let db = request.result
    if (!db.objectStoreNames.contains(generalNameToStoreName(name))) {
        db.close();
        request = window.indexedDB.open('SURVEY_DB', indexedDBCurrentVersion + 1)
        request.onsuccess = (event: any) => {
            window.localStorage.setItem("DB_CURRENT_VER", indexedDBCurrentVersion + 1 + "")
            db.onerror = (event: any) => {
                console.log("db error", event)
            }
        };
        request.onupgradeneeded = (event: any) => {
            db = request.result;
            window.localStorage.setItem("DB_CURRENT_VER", indexedDBCurrentVersion + 1 + "")
            let store = db.createObjectStore(generalNameToStoreName(name), {
                autoIncrement: true,
                keyPath: "usernameid"
            });


            questionnaireSectionData.forEach((section: any, sectionIdx: number) => {
                section.questions.forEach((question: any, qNo: number) => {
                    let key = `section${sectionIdx}.question${qNo}.a`
                    store.createIndex(key, key, { unique: false, multiEntry: false });
                })
            })


        }
        request.onerror = (event: any) => {
            console.error(event!.target!.result)
        }

        request.onblocked = (event: any) => {
            console.error("onblocked", event)
        }



    }
}

export function insertSurvey( survey: any, storeName: string) {
    // create a new transaction
    const txn = request.result.transaction(storeName, 'readwrite');

    // get the Contacts object store
    const store = txn.objectStore(storeName);
    //
    let query = store.put(survey);

    // handle success case
    query.onsuccess = function (event) {
        console.log(event);
    };

    // handle the error case
    query.onerror = function (event: any) {
        console.log(event);
    }

    // close the database once the 
    // transaction completes
    txn.oncomplete = function () {
        // db.close();
    };
}

export async function getAllIndexedAnswers(storeName: string, indexName: string) {

    return new Promise((resolve, reject) => {
        const txn = request.result.transaction(storeName, "readonly");
        const objectStore = txn.objectStore(storeName);
        let result: any[] = [];

        objectStore.index(indexName).openCursor().onsuccess = (event: any) => {
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
            resolve(result)
        };
    })

}

function getAllAnswers(db: IDBDatabase, storeName: string, callback: (entries: any[]) => void) {
    const txn = db.transaction(storeName, "readonly");
    const objectStore = txn.objectStore(storeName);
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
