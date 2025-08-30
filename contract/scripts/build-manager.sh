#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Build the manager process
"$SCRIPT_DIR/build-lua.sh" manager