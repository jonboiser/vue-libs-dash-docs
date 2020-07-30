#!/bin/bash

sf() {
  echo "Scraping $1"
  rm ./vue-router/$2
  ~/Github/SingleFile/cli/single-file --back-end jsdom "https://router.vuejs.org$1" "./vue-router/$2"
}

sf / introduction.html 

sf /api api.html

sf /installation.html installation.html 

sf /guide guide.html 
sf /guide/essentials/dynamic-matching.html dynamic-matching.html
sf /guide/essentials/history-mode.html history-mode.html
sf /guide/essentials/named-routes.html named-routes.html
sf /guide/essentials/named-views.html named-views.html
sf /guide/essentials/navigation.html navigation.html
sf /guide/essentials/nested-routes.html nested-routes.html
sf /guide/essentials/passing-props.html passing-props.html
sf /guide/essentials/redirect-and-alias.html redirect-and-alias.html

sf /guide/advanced/data-fetching.html data-fetching.html
sf /guide/advanced/lazy-loading.html lazy-loading.html
sf /guide/advanced/meta.html meta.html
sf /guide/advanced/navigation-guards.html navigation-guards.html
sf /guide/advanced/scroll-behavior.html scroll-behavior.html
sf /guide/advanced/transitions.html transitions.html
