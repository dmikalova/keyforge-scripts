#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

./download.sh
./html.sh
./massage.sh
./md.sh
