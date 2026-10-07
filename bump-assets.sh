#!/bin/sh
# Stamps each page's stylesheet and script links with a short hash of the file's contents
# (e.g. css/styles.css?v=1a2b3c4d), so browsers fetch the new file after every change
# instead of reusing a cached copy for up to 10 minutes (GitHub Pages' cache time).
# Run from the project folder after editing css/styles.css or js/script.js:  sh bump-assets.sh
cd "$(dirname "$0")" || exit 1
css=$(shasum css/styles.css | cut -c1-8)
js=$(shasum js/script.js | cut -c1-8)
for page in *.html; do
  sed -i '' -E \
    -e "s#href=\"css/styles\.css(\?v=[a-f0-9]+)?\"#href=\"css/styles.css?v=$css\"#" \
    -e "s#src=\"js/script\.js(\?v=[a-f0-9]+)?\"#src=\"js/script.js?v=$js\"#" \
    "$page"
done
echo "styles.css?v=$css  script.js?v=$js"
