#!/bin/bash
set -euo pipefail

OUTPUT_DIR="output"
HTML_DIR="$OUTPUT_DIR/html"
INPUT_HTML="$HTML_DIR/input.html"
FINAL_MD="$OUTPUT_DIR/output.md"

if [ ! -f "$INPUT_HTML" ]; then
	echo "HTML file not found: $INPUT_HTML" >&2
	exit 1
fi

echo "Converting $INPUT_HTML -> $FINAL_MD"
npx --quiet turndown-cli "$INPUT_HTML" "$FINAL_MD"

echo "Conversion complete: $FINAL_MD"
