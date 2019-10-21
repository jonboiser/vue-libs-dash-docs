const fsc = require('fs-cheerio');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../vuerouter.docset/Contents/Resources/docSet.dsidx');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

// Initialize DB
const db = new sqlite3.Database(dbPath);

function insertQuery({ name, path }) {
  return `INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES ('${name}', 'Method', '${path}');`;
}

db.serialize(() => {
  db.run('CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT);');
  db.run('CREATE UNIQUE INDEX anchor ON searchIndex (name, type, path);');

  // Go through HTML files and create an entry for each anchor-link
  const files = fs.readdirSync(path.join(__dirname, '../clean-html'));

  files.forEach(async (fileName, i) => {
    const inPath = path.join(__dirname, '../clean-html', fileName);

    console.log('Creating entries for', inPath);

    const $ = await fsc.readFile(inPath);

    $('a.header-anchor').each(function(i, elem) {
      let path = $(this).attr('href');
      const name = $(this).parent().text().replace('# ', '');
      if (path.startsWith('#')) {
        path = fileName + path;
      }

      // TODO add more precise Types
      db.run(insertQuery({
        name,
        path,
      }));
    });
  });
});
