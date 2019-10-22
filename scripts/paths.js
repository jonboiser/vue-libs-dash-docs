const path = require('path');

const docsetDir = lib =>
  path.join(__dirname, `../${lib}.docset/Contents/Resources`);
const rawHtmlDir = lib => path.join(__dirname, `../raw-html/${lib}`);

module.exports = function getPaths(lib) {
  if (lib === 'vuex') {
    return {
      onlineUrl: 'https://vuex.vuejs.org',
      docsetResourcesDir: docsetDir('vuex'),
      rawHtmlDir: rawHtmlDir('vuex'),
    };
  } else if (lib === 'vue-router') {
    return {
      onlineUrl: 'https://router.vuejs.org',
      docsetResourcesDir: docsetDir('vuerouter'),
      rawHtmlDir: rawHtmlDir('vue-router'),
    };
  } else {
    return {
      onlineUrl: 'https://vue-test-utils.vuejs.org',
      docsetResourcesDir: docsetDir('vuetest'),
      rawHtmlDir: rawHtmlDir('vue-test-utils'),
      categories: require('../categories/vue-test-utils'),
    };
  }
};
