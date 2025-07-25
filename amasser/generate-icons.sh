#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

rm "$SCRIPT_DIR/icons/"*

for SIZE in 48 96 128; do
  magick "${SCRIPT_DIR}/amasser-orig.png" \
    -resize "${SIZE}x${SIZE}" \
    "${SCRIPT_DIR}/icons/amasser-${SIZE}.png"
done

for ANGLE in $(seq 0 22.5 337.5); do
  magick "${SCRIPT_DIR}/icons/amasser-128.png" \
    -virtual-pixel none \
    -distort SRT "${ANGLE}" \
    "${SCRIPT_DIR}/icons/amasser-128-${ANGLE}.png"
done
