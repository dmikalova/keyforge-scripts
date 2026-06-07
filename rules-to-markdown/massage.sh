#!/bin/bash
set -euo pipefail

OUTPUT_DIR="output"
HTML_DIR="$OUTPUT_DIR/html"
INPUT_HTML="$HTML_DIR/input.html"

if [ ! -f "$INPUT_HTML" ]; then
	echo "HTML file not found: $INPUT_HTML" >&2
	exit 1
fi

# Strip noisy/unrenderable bits from the pdf2htmlEX output so the resulting
# Markdown is smaller and actually renderable.
#  - drop the entire <head> (CSS, fonts, metadata, JS)
#  - drop any stray <script>, <style>, <link>, <meta>, <svg>, <iframe>
#  - drop all <img> tags (PDF page background images embedded as base64)
perl -0777 -i -pe '
	s{<head\b[^>]*>.*?</head>}{}gis;
	s{<script\b[^>]*>.*?</script>}{}gis;
	s{<style\b[^>]*>.*?</style>}{}gis;
	s{<svg\b[^>]*>.*?</svg>}{}gis;
	s{<iframe\b[^>]*>.*?</iframe>}{}gis;
	s{<(?:link|meta|img)\b[^>]*/?>}{}gi;
' "$INPUT_HTML"

echo "Massaged: $INPUT_HTML"
