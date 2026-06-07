#!/bin/bash
set -euo pipefail

RULES_PDF="https://keyforging.com/mrb"
OUTPUT_DIR="output"
INPUT_PDF="$OUTPUT_DIR/input.pdf"

mkdir -p "$OUTPUT_DIR"

# Download the rules PDF (skip if already present)
if [ ! -f "$INPUT_PDF" ]; then
	curl -L -o "$INPUT_PDF" "$RULES_PDF"
else
	echo "Using existing $INPUT_PDF"
fi
