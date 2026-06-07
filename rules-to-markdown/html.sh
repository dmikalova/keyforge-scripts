#!/bin/bash
set -euo pipefail

OUTPUT_DIR="output"
INPUT_PDF="input.pdf" # path inside container, relative to /pdf
HTML_SUBDIR="html"
OUTPUT_HTML="input.html"
PDF2HTMLEX_IMAGE="pdf2htmlex/pdf2htmlex:0.18.8.rc2-master-20200820-alpine-3.12.0-x86_64"

mkdir -p "$OUTPUT_DIR/$HTML_SUBDIR"

# Convert PDF to a single HTML file.
# Run via Docker (colima) since pdf2htmlEX is no longer available in Homebrew.
# Prereqs: brew install colima docker && colima start && docker pull "$PDF2HTMLEX_IMAGE"
# Note: image is x86_64-only, so Apple Silicon runs it under emulation.
docker run --rm --platform linux/amd64 \
	-v "$PWD/$OUTPUT_DIR":/pdf \
	"$PDF2HTMLEX_IMAGE" \
	--dest-dir "$HTML_SUBDIR" \
	"$INPUT_PDF" \
	"$OUTPUT_HTML"
