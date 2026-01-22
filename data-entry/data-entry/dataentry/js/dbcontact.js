    var dbConnection = SQL.connect({
        Driver: "SQL Server",
        Host: "CDMCHICAGO2018",
        Port: 3306,
        Database: "reverse",
        UserName: "sa",
        Password: "AlexGG1209$$" });
    var sql = "SELECT custname, city, state \
               FROM contacts \
               ORDER BY custname,city ASC \
               LIMIT 1";
    var result = dbConnection.query(sql);
    if (!result.isValid) {
        test.fail("Entry not found.");
    } else {
        test.compare(result.value("custname"), context.dbentry.compname);
        test.compare(result.value("compid"), context.dbentry.compid);
    }
    dbConnection.close();
