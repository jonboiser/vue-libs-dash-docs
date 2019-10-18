const path = require('path');
const fsc = require('fs-cheerio');
const { readdirSync } = require('fs');
const ramda = require('ramda');

const onlineUrl = 'https://router.vuejs.org';

async function cleanFile(fileName) {
  const inPath = path.join(__dirname, '../raw-html', fileName);
  const outPath = path.join(__dirname, '../clean-html', fileName);

  console.log('Cleaning', inPath);

  const $ = await fsc.readFile(inPath);

  // Remove extra navigation and CSS
  $('header').remove();
  $('.sidebar').remove();
  $('.page').removeClass('page');

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
  })

  // Write clean file to disk
  await fsc.writeFile(outPath, $);
}

const files = readdirSync(path.join(__dirname, '../raw-html'));

files.forEach(cleanFile);
