const fs = require('fs');
const fsc = require('fs-cheerio');
const path = require('path');
const ramda = require('ramda');
const sqlite3 = require('sqlite3');
const paths = require('./paths');

const lib = process.argv[2];

const { docsetResourcesDir } = paths(lib);

dbPath = path.join(docsetResourcesDir, 'docSet.dsidx');
documentsDir = path.join(docsetResourcesDir, 'Documents');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

// Initialize DB
const db = new sqlite3.Database(dbPath);

function insertQuery({ name, path }) {
  return `INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES ("${name}", "Method", "${path}");`;
}

const queryData = {};

db.serialize(() => {
  db.run(
    'CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT);',
  );
  db.run('CREATE UNIQUE INDEX anchor ON searchIndex (name, type, path);');

  // Go through HTML files and create an entry for each anchor-link
  const documentFiles = fs.readdirSync(documentsDir);

  const insertQueries = documentFiles.map(async function makeQueries(
    fileName,
    i,
  ) {
    const inPath = path.join(documentsDir, fileName);
    const queries = [];

    console.log('Creating insert queries for', inPath);

    const $ = await fsc.readFile(inPath);

    $('a.header-anchor').each(function(i, elem) {
      let path = $(this).attr('href');
      const name = ramda.replace(
        '# ',
        '',
        $(this)
          .parent()
          .text(),
      );

      if (path.startsWith('#')) {
        path = fileName + path;
      }

      // TODO add more precise Types
      queryData[path] = {
        name,
        path,
        type: 'Method',
        tag: $(this).parent()[0].name,
      };

      db.run(
        insertQuery({
          name: ramda.replace(/\"/g, "'", name),
          path,
        }),
      );
    });
    return queries;
  });

  Promise.all(insertQueries).then(x => {
    // console.log(queryData);
    fs.writeFileSync(`${lib}.json`, JSON.stringify(queryData, null, 2), 'utf8');
  });
});
