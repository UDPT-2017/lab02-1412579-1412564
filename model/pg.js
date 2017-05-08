var pg = require('pg');

var configDB = require('../config/pg.js');	

var config = {
	user: configDB.user, //env var: PGUSER
	database: configDB.database, //env var: PGDATABASE
	password: configDB.password, //env var: PGPASSWORD
	host: configDB.host, // Server hosting the postgres database
	port: 5432, //env     var: PGPORT
	max: 20, // max number of clients in the pool
	idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

const pool = new pg.Pool(config);

module.exports = pool;

