// We have this here as there is no native support for IndexedDB in wasm_bindgen
// TODO: https://github.com/rustwasm/gloo/issues/68#issuecomment-606951683
export function open_db(db_name, db_cache)  {
    if (db_cache === null || db_cache === undefined) {
        console.error(`The IndexedDB ${db_name} does not exist.`);
        return null;
    }

    let db;
    try {
       db = window.indexedDB.open(db_name, 2)
    }catch (e) {
        console.error("Error opening IndexedDB database: ", e);
        return null;
    }

    db.addEventListener("upgradeneeded", (event) => {
        var objectStore = event.target.result.createObjectStore(db_cache.store, {
            keyPath: db_cache.keyPath,
        });

        objectStore.createIndex("url", "url", {
            unique: db_cache.indexes.url.unique,
        });
        objectStore.createIndex("_exp", "_exp", {
            unique: db_cache.indexes._exp.unique,
        });
    });

    return db;
}

// Interacts with the IndexedDB method to clear expired cache
export function clear_expired_cache(db_name, db_cache) {
    let db = open_db(db_name, db_cache);
    if (db === null) {
        return;
    }

    db.addEventListener("success", (event) => {
        var db = event.target.result;
        var transaction = db.transaction("static", "readwrite");
        var store = transaction.objectStore("static");
        var index = store.index("_exp");
        var bound = IDBKeyRange.upperBound(Date.now());
        index.openCursor(bound).addEventListener("success", (event) => {
            var cursor = event.target.result;
            if (cursor) {
                store.delete(cursor.primaryKey);
                cursor.continue();
            }
        });
    });
}

// Interacts with the IndexedDB method transact with the cache
export function serve_static(db_name, body, file_type, url, _exp){
    let db = open_db(db_name, body);
    if (db === null) {
        return;
    }

    db.onsuccess(function (event) {
        var db = event.target.result;
        var transaction = db.transaction("static", "readwrite");
        var store = transaction.objectStore("static");

        store.put({
            url: url,
            body: body,
            type: file_type,
            _exp: _exp
        });
    });

    return new Blob([JSON.stringify(body, null, 2)], {
        type: file_type,
    });
}