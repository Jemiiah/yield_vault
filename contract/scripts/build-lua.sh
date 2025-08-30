#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Color codes for output
RED='\033[0;31m'    # Red color for errors
GREEN='\033[0;32m'  # Green color for success messages
YELLOW='\033[0;33m' # Yellow color for info
NC='\033[0m'        # No Color (reset to default)

# Check if process name is provided
PROCESS_NAME="${1:-main}"
if [ "$PROCESS_NAME" != "main" ] && [ "$PROCESS_NAME" != "manager" ]; then
    echo -e "${RED}Error: Process name must be 'main' or 'manager'. Got: '$PROCESS_NAME'${NC}"
    echo "Usage: $0 [main|manager]"
    exit 1
fi

echo -e "${YELLOW}Building process: $PROCESS_NAME${NC}"

# Set variables for directories
SOURCE_DIR="$SCRIPT_DIR/../src"
BUILD_DIR="$SCRIPT_DIR/../build"

# Change to the project root directory
PROJECT_ROOT="$SCRIPT_DIR/.."
cd "$PROJECT_ROOT" || exit 1

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}Error: Source directory '$SOURCE_DIR' not found.${NC}"
    exit 1
fi

# Create build directory if it doesn't exist
mkdir -p "$BUILD_DIR"

# Define output file path
OUTPUT_FILE="$BUILD_DIR/${PROCESS_NAME}-process.lua"

# Remove only the specific process file if it exists
if [ -f "$OUTPUT_FILE" ]; then
    echo -e "${YELLOW}Removing previous build: $OUTPUT_FILE${NC}"
    rm "$OUTPUT_FILE"
fi

# Check if there are any .lua files in the src directory
LUA_FILES=$(find "$SOURCE_DIR" -path "$SOURCE_DIR/test" -prune -o -type f -name "*.lua" -print)
if [ -z "$LUA_FILES" ]; then
    echo -e "${RED}Error: No '.lua' files found in '$SOURCE_DIR' excluding '$SOURCE_DIR/test'.${NC}"
    exit 1
fi

# Find the specified Lua file
MAIN_LUA_FILE=$(find "$SOURCE_DIR" -path "$SOURCE_DIR/test" -prune -o -type f -name "${PROCESS_NAME}.lua" -print | head -n 1)
if [ -z "$MAIN_LUA_FILE" ]; then
    echo -e "${RED}Error: Lua file '${PROCESS_NAME}.lua' not found in '$SOURCE_DIR' excluding '$SOURCE_DIR/test'.${NC}"
    exit 1
fi

# Navigate to the build-lua directory
cd "$SOURCE_DIR" || exit 1

# Generate the module list in the format directory.filename, excluding 'test' directory
MODULE_LIST=()
while IFS= read -r file; do
    # Skip files in the 'test' directory
    if [[ "$file" == ./test/* ]]; then
        continue
    fi
    # Remove the leading './' if present
    relative_path="${file#./}"
    # Remove the '.lua' extension
    module_path="${relative_path%.lua}"
    # Replace '/' with '.'
    module_name="${module_path//\//.}"
    # Exclude the target process module (since it's specified separately with -s)
    if [ "$module_name" != "$PROCESS_NAME" ]; then
        MODULE_LIST+=("$module_name")
    fi
done < <(find . -type f -name "*.lua")

# Use amalg.lua to combine Lua files
RELATIVE_OUTPUT_FILE="../build/${PROCESS_NAME}-process.lua"
if ! amalg.lua -s "$MAIN_LUA_FILE" -o "$RELATIVE_OUTPUT_FILE" "${MODULE_LIST[@]}" ; then
    echo -e "${RED}Error: 'amalg.lua' command failed.${NC}"
    exit 1
fi

echo -e "${GREEN}Build finished: $OUTPUT_FILE${NC}"
exit 0
