const { readdirSync } = require('fs');
const fsc = require('fs-cheerio');
const path = require('path');
const paths = require('./paths');

const lib = process.argv[2];
const { docsetResourcesDir, categoriesDir } = paths(lib);
const cleanHtmlDir = path.join(docsetResourcesDir, 'Documents');

const cleanHtmlFiles = readdirSync(cleanHtmlDir);

const tocTag = (type, name) =>
  `<a name="//apple_ref/cpp/${type}/${name}" class="dashAnchor"></a>`;

cleanHtmlFiles.forEach(async function addToc(fileName) {
  const inPath = path.join(docsetResourcesDir, 'Documents', fileName);
  const jsonFileName = fileName.replace('.html', '.json');
  const categories = require(path.join(categoriesDir, jsonFileName));
  const $ = await fsc.readFile(inPath);

  console.log('Adding TOC to ', inPath);

  $('a.header-anchor').each(function(i, elem) {
    const href = $(this).attr('href');
    // Use filename + href as key in category file
    const category = categories[fileName + href];
    if (category) {
      console.log(tocTag(category.type, encodeURIComponent(category.name)));
      $(this).after(tocTag(category.type, encodeURIComponent(category.name)));
    }
  });

  // Update the file
  fsc.writeFile(inPath, $);
});
