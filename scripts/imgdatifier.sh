#!/bin/bash

# Function to encode images in base64 and construct the JSON tree structure
function scan_directory {
    local directory="$1"
    local json_result="{"

    # Loop through all files and directories in the current directory
    for file in "$directory"/*; do
        if [ -d "$file" ]; then
            # If it's a directory, recursively scan it
            json_result+="\"$(basename "$file")\": $(scan_directory "$file"),"
        elif [[ "$file" =~ \.(jpg|jpeg|png|gif)$ ]]; then
            # If it's an image, convert it to base64
            image_data=$(base64 -w 0 "$file")
            # Add the image data to the JSON, making it suitable for the src property
            json_result+="\"$(basename "$file")\": \"data:image/$(echo "$file" | awk -F. '{print tolower($NF)}');base64,$image_data\","
        fi
    done

    # Remove trailing comma and close the JSON object
    json_result=$(echo "$json_result" | sed 's/,$//')
    json_result+="}"

    echo "$json_result"
}

# Check if a path was provided
if [ -z "$1" ]; then
    echo "Please provide a directory path to start scanning."
    exit 1
fi

# Starting directory (argument passed by the user)
start_directory="$1"

# Check if the provided path is valid
if [ ! -d "$start_directory" ]; then
    echo "Invalid directory path: $start_directory"
    exit 1
fi

# Create the JSON structure by scanning the directory
json_output=$(scan_directory "$start_directory")

# Save the JSON output to a file
echo "$json_output" > image_tree.json

echo "JSON file with image data created: image_tree.json"

