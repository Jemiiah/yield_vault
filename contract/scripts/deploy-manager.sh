#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Change to project root
cd "$PROJECT_ROOT" || exit 1

# Deploy manager process
aoform apply -f processes-manager.yaml