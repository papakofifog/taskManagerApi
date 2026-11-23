const { dbPath } = require('./database');

// The SQLite database is opened (and its tables created) when ./database is first required.
const connectToTaskManagerDB = () => {
    console.log(`Connected to the SQLite database at ${dbPath}`);
};

module.exports = connectToTaskManagerDB;
