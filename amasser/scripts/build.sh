#!/bin/bash
set -euo pipefail

npx tsc || exit 1
cp -r src/*.{css,html} dist/
