function runQuery(query, driver) {
  switch (driver) {
    case "sqlite3":
      var db = require('./sqlite');
      return db.runQuery(query);
    case "mongo":
      break;
    case "TSQL":
      break;
    case "webdb":
      var db.require('./webdb')
    default:
      break;
  }
}

//console.log(runQuery("Select * from sqlite_master", "sqlite3"));
