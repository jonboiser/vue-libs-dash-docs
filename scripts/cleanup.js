const path = require('path');
const fsc = require('fs-cheerio');
const ramda = require('ramda');

async function cleanFile(inPath, outPath) {
  console.log('Cleaning', inPath);
  let $ = await fsc.readFile(inPath);
  
  // Remove extra navigation
  $('header').remove();
  $('.sidebar').remove();
  
  // Remove extra CSS
  $('.page').removeClass('page');
  
  // Rewrite links to reference local HTML files
  $('a').each(function(i, elem) {
    let href = $(this).attr('href');
    if (href.startsWith('https://router.vuejs.org')) {
      const newHref = ramda.last(ramda.split('/', href));
      $(this).attr('href', newHref);
    }
  })
  
  // Write clean file to disk
  await fsc.writeFile(outPath, $);
}


let inPath = path.join(__dirname, '../raw-html', 'API Reference _ Vue Router (2019-10-18 11_53_26 AM).html');
let outPath = path.join(__dirname, '../clean-html', 'api-reference.html');

cleanFile(inPath, outPath);


inPath = path.join(__dirname, '../raw-html', 'Redirect and Alias _ Vue Router (2019-10-18 11_51_44 AM).html');
outPath = path.join(__dirname, '../clean-html', 'redirect-and-alias.html');

cleanFile(inPath, outPath);
