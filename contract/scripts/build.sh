#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Color codes for output
RED='\033[0;31m'    # Red color for errors
YELLOW='\033[0;33m'  # Yellow color for warnings or informational messages
GREEN='\033[0;32m'  # Green color for success messages
NC='\033[0m'        # No Color (reset to default)

# Step 1: Check dependencies
if ! "$SCRIPT_DIR/check_deps.sh"; then
    echo -e "${YELLOW}Some dependencies are missing or incorrect.${NC}"
    read -p "Attempt to install missing dependencies? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Step 2: Install dependencies
        if ! "$SCRIPT_DIR/install_deps.sh"; then
            echo -e "${RED}Failed to install dependencies.${NC}"
            exit 1
        fi
        # Re-check dependencies after installation
        if ! "$SCRIPT_DIR/check_deps.sh"; then
            echo -e "${YELLOW}Dependencies are still missing or incorrect after installation.${NC}"
            exit 1
        fi
    else
        exit 1
    fi
fi

# Step 3: Build both processes
echo -e "${YELLOW}Building main process...${NC}"
if ! "$SCRIPT_DIR/build-lua.sh" main; then
    echo -e "${RED}Main process build failed.${NC}"
    exit 1
fi

echo -e "${YELLOW}Building manager process...${NC}"
if ! "$SCRIPT_DIR/build-lua.sh" manager; then
    echo -e "${RED}Manager process build failed.${NC}"
    exit 1
fi

echo -e "${GREEN}Build completed successfully for both processes.${NC}"
exit 0
