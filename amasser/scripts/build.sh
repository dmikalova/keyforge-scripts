#!/bin/bash
set -euo pipefail

npx tsc
cp -r src/*.{css,html} dist/
