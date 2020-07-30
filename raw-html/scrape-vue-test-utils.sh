#!/bin/bash

sf() {
  echo "Scraping $1"
  rm ./vue-test-utils/$2
  ~/Github/SingleFile/cli/single-file --back-end jsdom "https://vue-test-utils.vuejs.org$1" "./vue-test-utils/$2"
}

sf / introduction.html 

sf /api api.html
sf /api/wrapper wrapper.html
sf /api/wrapper-array wrapper-array.html
sf /api/options options.html
sf /api/components components.html

sf /installation installation.html 

sf /guides guides.html 
sf /upgrading-to-v1 upgrading-to-v1.html
