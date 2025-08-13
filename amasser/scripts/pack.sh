#!/bin/bash
set -euo pipefail

npm run clean
npm run build

mkdir chrome firefox

cp -r dist fonts icons chrome/
jq '. + {background: {service_worker: "dist/bg.js", type: "module"}} | del(.commands)' manifest.json >chrome/manifest.json
(cd chrome && zip -q -r ../keyforge-amasser-chrome-contents.zip .)

cp -r dist fonts icons firefox/
jq '. + {background: {scripts: ["dist/bg.js"], type: "module"}} | del(.commands)' manifest.json >firefox/manifest.json
(cd firefox && zip -q -r ../keyforge-amasser-firefox-contents.zip .)
