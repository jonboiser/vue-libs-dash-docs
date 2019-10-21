const path = require('path');

module.exports = function getPaths(lib) {
  if (lib === 'vuex') {
    return {
      onlineUrl: 'https://vuex.vuejs.org',
      docsetResourcesDir: path.join(
        __dirname,
        '..',
        'vuex.docset',
        'Contents/Resources',
      ),
      rawHtmlDir: path.join(__dirname, '..', 'vuex-html'),
    };
  } else {
    return {
      onlineUrl: 'https://router.vuejs.org',
      docsetResourcesDir: path.join(
        __dirname,
        '..',
        'vuerouter.docset',
        'Contents/Resources',
      ),
      rawHtml: path.join(__dirname, '..', 'vue-router-html'),
    };
  }
};
