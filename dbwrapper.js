function runQuery(query, driver) {
    switch (driver) {
    case "sqlite3":
        var db = require('./sqlite');
        return db.runQuery(query);
       
    default:
        break;
    }

}

//console.log(runQuery("Select * from sqlite_master", "sqlite3"));
