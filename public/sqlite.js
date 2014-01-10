
/*function dbInit(dbName,mode) {
*sqlite3 = require('sqlite3').verbose(); //.verbose produces long stack traces
*db = new sqlite3.Database(dbName,mode);   
}*/

sqlite3 = require('sqlite3').verbose(); //.verbose produces long stack traces
db = new sqlite3.Database('c:/Chinook_Sqlite.sqlite');   
/*sqlite3.Database(filename, [mode], [callback])
* Filename ":memory:" an anonymous in-memory database will be used. An empty string will use an anonymous disk-based database. Otherwise filename
* Mode sqlite3.OPEN_READONLY, sqlite3.OPEN_READWRITE and sqlite3.OPEN_CREATE. The default value is OPEN_READWRITE | OPEN_CREATE
*/
//Database.serialize([callback]) Puts the execution mode into serialized. This means that at most one statement object can execute a query at a time. Other statements wait in a queue until the previous statements executed.
//Database.parallelize([callback]) Puts the execution mode into parallelized. This means that queries scheduled will be run in parallel.
//Database.run(sql, [param, ...], [callback]) executes SQL statement but does not return results
//Database.get(sql, [param, ...], [callback]) Runs the SQL query with the specified parameters and calls the callback with the first result row afterwards
//Database.all(sql, [param, ...], [callback]) Runs the SQL query with the specified parameters and calls the callback with all result rows afterwards.
//Database.each(sql, [param, ...], [callback], [complete]) Runs the SQL query with the specified parameters and calls the callback with for each result row
//Database.exec(sql, [callback]) Runs all SQL queries in the supplied string. No result rows are retrieved.
//Database.prepare(sql, [param, ...], [callback]) Prepares the SQL statement and optionally binds the specified parameters and calls the callback when done. The function returns a Statement object.
//Statement.bind([param, ...], [callback])
//Statement.finalize([callback]) Finalizes the statement. This is typically optional, but if you experience long delays before the next query is executed, explicitly finalizing your statement might be necessary.
//Statement.run([param, ...], [callback]) Binds parameters and executes the statement. The function returns the Statement object to allow for function chaining
//Statement.get([param, ...], [callback]) Binds parameters, executes the statement and retrieves the first result row. 
//Statement.all([param, ...], [callback]) Binds parameters, executes the statement and calls the callback with all result rows.
//Statement.each([param, ...], [callback], [complete]) Binds parameters, executes the statement and calls the callback for each result row. The function returns the Statement object to allow for function chaining.

function runQuery(sql) {
  //Single row operation
  var sqlQuery = sql;
  db.each(sql, function(err, rows) {
  return rows;
  });
};

function getTableStructure(callback) {
  var rows = [];
  var tableDefs = []; //Need to return this at some point
  db.serialize(function() {
  db.each("SELECT name,sql FROM sqlite_master WHERE type='table';",function(err,row) {
    var rowobj = new Object();
	rowobj.name=row.name;
	rowobj.sql = row.sql;
	rows.push(rowobj);
  },function(err,numrows){
	  rows.forEach(function(element,index,array) {
	    var resultList = tableDefs.push(decipherTableStructure(element.sql));
	     if ( callback && typeof callback === 'function' )
                callback(resultList);
	  });
	});
  });
};




function decipherTableStructure(sql)
{
  var table = [];
  var constraints = [];
  constraints.name = "Constraints";
  var foreignKeys = [];
  foreignKeys.name = "Foreign Keys";
  var strSql =sql.slice(sql.indexOf("(")+1,sql.lastIndexOf(")"));
  strSql= strSql.toLowerCase();
  while(strSql.length > 0)
  {
    var col = new Object();
    
    
	var line = strSql.slice(0,(strSql.indexOf(",")== -1)? strSql.length:strSql.indexOf(","));
	if(line.indexOf("numeric(") > 0){
	  line = strSql.slice(0,strSql.indexOf(",",strSql.indexOf(",")));
	}
  var end = line.length;
	if (line.indexOf("constraint") > -1){
      //Add constraint handling
	  var constraintobj = new Object();
	  line = line.slice(line.indexOf("["),end);
	  constraintobj.name = line.slice(line.indexOf("[") + 1, line.indexOf("]"));
	  line = line.slice(line.indexOf("]")+1,line.length);
	  line = line.trim();
	  constraintobj.type = line.slice(0,line.indexOf("("));
	  constraintobj.type = constraintobj.type.trim();
	  constraintobj.column = line.slice(line.indexOf("[") + 1, line.indexOf("]"));
	  constraints.push(constraintobj);
	}
    else if (line.indexOf("foreign key") > -1) {
	  //Add foreign key handling
	  var foreignKeysObj = new Object();
	  line = line.slice(line.indexOf("("),end);
	  foreignKeysObj.columnline =line.slice(line.indexOf("[") + 1, line.indexOf("]"));
	  line = line.slice(line.indexOf(")") + 1, end);
	  foreignKeysObj.tableReferenced = line.slice(line.indexOf("[") + 1, line.indexOf("]"));
	  line = line.slice(line.indexOf("(") + 1, line.length);
	  foreignKeysObj.columnReferenced = line.slice(line.indexOf("[") + 1, line.indexOf("]"));
	  line = line.slice(line.indexOf(")") + 1, line.length);
	  line = ""; //Need to figure out a way to parse the On Delete and On Update
	  foreignKeys.push(foreignKeysObj);
	} 
    else {
	  
	  col.name = line.slice(line.indexOf("[") + 1, line.indexOf("]"));
	  line = line.replace("[" + col.name + "]", "");
	  col.nullable = (line.indexOf("not null") == -1);
	  line = line.replace("not null", "");
	  line = line.replace("null", "");
	  line = line.trim();
	  col.datatype = line;
	}
    if (col.hasOwnProperty("name")) {
      table.push(col);
    }
    strSql = strSql.slice(end + 1, strSql.length);
      strSql = strSql.trim();
  }
  table.push(constraints);
  table.push(foreignKeys);
  return table;
};

exports.runQuery = runQuery;
exports.getTableStructure = getTableStructure;
exports.decipherTableStructure = decipherTableStructure;
//exports.dbInit = dbInit;