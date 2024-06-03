//Database class
let Database = function (name) {
    this.name = name; //Save database name
    this.currentVersion = null; //Current db version
    this.db = null; //Database instance
};

//Database prototype
Database.prototype = {
    "open": function (version, upgrade) {
        let self = this;
        this.currentVersion = version; //Save current version
        return new Promise(function (resolve, reject) {
            let request = window.indexedDB.open(self.name, version);
            //Register on upgrade listener
            request.addEventListener("upgradeneeded", function (event) {
                console.log("Update database");
                return upgrade(event.target.result, event); //Call the upgrade listener
            });
            //Database opened
            request.addEventListener("success", function (event) {
                console.log("database ready");
                self.db = event.target.result; //Save database instance
                return resolve(self);
            });
            //Database connection error
            request.addEventListener("error", function (event) {
                return reject(event);
            });
        });
    },
    //Perform an action to the database
    "tx": function (names, mode, listener) {
        let self = this;
        return new Promise(function (resolve, reject) {
            //let transaction = cb.call(null, self.db); //Get the transaction
            let transaction = self.db.transaction(names, mode);
            //Register transaction completed listener
            transaction.addEventListener("complete", function (event) {
                return resolve(event);
            });
            //Register transaction error listener
            transaction.addEventListener("error", function (event) {
                return reject(event);
            });
            //Perfom actions witht he transaction
            return listener(transaction, names, mode);
        });
    },
    //Delete the database
    "destroy": function () {
        let self = this;
        return new Promise(function (resolve, reject) {
            let request = window.indexedDB.deleteDatabase(self.name);
            //Register completed request
            request.addEventListener("success", function (event) {
                return resolve(event);
            });
            //Register error request
            request.addEventListener("error", function (event) {
                return reject(event);
            });
        });
    },
    //Close the connection to the database
    "close": function () {
        return this.db.close();
    }
};

//Create a database
export function createDatabase (name) {
    return new Database(name);
}

