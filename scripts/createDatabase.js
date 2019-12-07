const fs = require('fs');
const fsc = require('fs-cheerio');
const path = require('path');
const ramda = require('ramda');
const sqlite3 = require('sqlite3');
const paths = require('./paths');

const lib = process.argv[2];

const { docsetResourcesDir, categories } = paths(lib);

dbPath = path.join(docsetResourcesDir, 'docSet.dsidx');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

// Initialize DB
const db = new sqlite3.Database(dbPath);

function insertQuery({ name, path, type }) {
  return `INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES ("${name}", "${type}", "${path}");`;
}

db.serialize(() => {
  db.run(
    'CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT);',
  );
  db.run('CREATE UNIQUE INDEX anchor ON searchIndex (name, type, path);');

  ramda.forEachObjIndexed(function(value, key) {
    const { skip, name, path, type } = value;
    if (skip) {
      console.log('Skipping', key);
    } else {
      console.log('Adding entry for', key, name, type);
      console.log(
        insertQuery({
          name,
          path,
          type,
        }),
      );
      db.run(
        insertQuery({
          name,
          path,
          type,
        }),
      );
    }
  }, categories);
});
