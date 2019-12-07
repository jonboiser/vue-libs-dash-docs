const { readdirSync } = require('fs');
const fs = require('fs');
const fsc = require('fs-cheerio');
const path = require('path');
const ramda = require('ramda');
const paths = require('./paths');

const lib = process.argv[2];
const { rawHtmlDir, onlineUrl, docsetResourcesDir } = paths(lib);
const rawHtmlFiles = readdirSync(rawHtmlDir);

const stripHtmlExt = ramda.replace('.html', '');

function parseTestUtilLink(url) {
  const re = /https:\/\/vue-test-utils.vuejs.org\/((?<sub>.*\/)((?<htmlfile>.*\.html)(?<rest>.*))?)?/;
  const match = re.exec(url);
  if (!match) {
    throw Error('Cannot parse URL: ', url);
  }
  return match.groups;
}

function rewriteTestUtilLink(url) {
  const { sub, htmlfile, rest } = parseTestUtilLink(url);
  const makeUrl = (filename, htmfile) => {
    return htmlfile ? `${filename}#${stripHtmlExt(htmlfile)}` : filename;
  };
  if (!sub) {
    return 'introduction.html';
  }
  // Weird case of api/options.html
  if (sub === 'api/' && htmlfile === 'options.html') {
    return rest ? `options.html${rest}` : 'options.html';
  }

  if (sub === 'guides/') {
    return makeUrl('guides.html', htmlfile);
  } else if (sub === 'api/') {
    return makeUrl('api.html', htmlfile);
  } else if (sub === 'api/wrapper/') {
    return makeUrl('wrapper.html', htmlfile);
  } else if (sub === 'api/wrapper-array/') {
    return makeUrl('wrapper-array.html', htmlfile);
  } else if (sub === 'api/components/') {
    return makeUrl('components.html', htmlfile);
  }
}

rawHtmlFiles.forEach(async function cleanFile(fileName) {
  const linkData = {};
  const inPath = path.join(rawHtmlDir, fileName);
  const outPath = path.join(docsetResourcesDir, 'Documents', fileName);

  console.log('Cleaning', inPath);

  const $ = await fsc.readFile(inPath);

  // Remove extra navigation and CSS
  $('header').remove();
  $('.sidebar').remove();
  $('.page').removeClass('page');

  // HACK: Wrap headers in .custom to remove extra padding
  ['h1', 'h2', 'h3', 'h4'].forEach(function(htag) {
    $(htag).each(function(i, elem) {
      $(this).wrap('<span class="custom"></span>');
    });
  });

  // Rewrite links to reference local HTML files.
  $('a').each(function(i, elem) {
    let href = $(this).attr('href');
    if (href.startsWith(onlineUrl)) {
      let newHref;
      if (lib === 'vue-test-utils') {
        newHref = rewriteTestUtilLink(href);
      } else {
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
      }

      $(this).attr('href', newHref);
    }
  });

  // Write JSON file of a.header-anchors to annotate manually,
  // after applying some defaults.
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

    const parentTag = $(this).parent()[0].name;
    const tagToGuess = {
      h1: 'Guide',
      h2: 'Section',
      h3: 'Method',
      h4: 'Method',
    };
    // TODO add more precise Types
    linkData[path] = {
      name,
      path,
      type: tagToGuess[parentTag] || 'Method',
      tag: parentTag,
    };
  });

  // Write categories JSON file
  const categoryFileName = path.join(
    __dirname,
    '../categories',
    lib,
    fileName.replace('.html', '.json'),
  );
  if (!fs.existsSync(categoryFileName)) {
    console.log(
      'Category file created at',
      path.join('..', fileName.replace('.html', '.json')),
    );

    fs.writeFileSync(categoryFileName);
  }

  // Write clean HTML file
  fsc.writeFile(outPath, $);
});
