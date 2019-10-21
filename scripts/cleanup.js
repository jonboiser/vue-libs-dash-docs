const { readdirSync } = require('fs');
const fsc = require('fs-cheerio');
const path = require('path');
const ramda = require('ramda');
const paths = require('./paths');

const lib = process.argv[2];
const { rawHtmlDir, onlineUrl, docsetResourcesDir } = paths(lib);
const rawHtmlFiles = readdirSync(rawHtmlDir);

rawHtmlFiles.forEach(async function cleanFile(fileName) {
  const inPath = path.join(rawHtmlDir, fileName);
  const outPath = path.join(docsetResourcesDir, fileName);

  console.log('Cleaning', inPath);

  const $ = await fsc.readFile(inPath);

  // Remove extra navigation and CSS
  $('header').remove();
  $('.sidebar').remove();
  $('.page').removeClass('page');

  // HACK: Wrap headers in .custom to remove extra padding
  ['h1', 'h2', 'h3'].forEach(function(htag) {
    $(htag).each(function(i, elem) {
      $(this).wrap('<span class="custom"></span>');
    });
  });

  // Rewrite links to reference local HTML files.
  $('a').each(function(i, elem) {
    let href = $(this).attr('href');
    if (href.startsWith(onlineUrl)) {
      let newHref;
      // Handle exceptions for indexes
      if (href === onlineUrl + '/') {
        newHref = 'introduction.html';
      } else if (href === onlineUrl + '/guide/') {
        newHref = 'guide.html';
      } else if (href.startsWith(onlineUrl + '/api/')) {
        newHref = href.replace(onlineUrl + '/api/', 'api.html');
      } else {
        newHref = ramda.last(ramda.split('/', href));
      }

      $(this).attr('href', newHref);
    }
  });

  // Write clean file to disk
  await fsc.writeFile(outPath, $);
});
