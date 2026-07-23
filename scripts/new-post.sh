#!/bin/bash

# Resolve paths relative to this script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_ROOT="$(dirname "$SCRIPT_DIR")/new-site"

# Title: use $1 if provided, otherwise prompt
TITLE="$1"
if [ -z "$TITLE" ]; then
  read -rp "Post title: " TITLE
fi

if [ -z "$TITLE" ]; then
  echo "Error: A title is required."
  exit 1
fi

# Description: optional prompt, falls back to placeholder if left blank
read -rp "Short description (Enter to skip): " DESCRIPTION
if [ -z "$DESCRIPTION" ]; then
  DESCRIPTION="Enter a short description here"
fi

# Tags: optional prompt, comma-separated -> YAML array
read -rp "Tags, comma-separated (Enter to skip): " TAGS_RAW
if [ -z "$TAGS_RAW" ]; then
  TAGS="[]"
else
  # split on commas, trim whitespace, quote each, rejoin
  IFS=',' read -ra TAG_ARRAY <<< "$TAGS_RAW"
  QUOTED_TAGS=()
  for tag in "${TAG_ARRAY[@]}"; do
    trimmed=$(echo "$tag" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    [ -n "$trimmed" ] && QUOTED_TAGS+=("\"$trimmed\"")
  done
  TAGS="[$(IFS=,; echo "${QUOTED_TAGS[*]}")]"
fi

# Sanitize the title for a filename (lowercase, replace spaces with hyphens)
FILENAME=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g')
DATE=$(date +"%Y-%m-%dT%H:%M:%SZ")
FILEPATH="${SITE_ROOT}/src/content/blog/${FILENAME}.md"

# Guard against overwriting an existing post
if [ -f "$FILEPATH" ]; then
  echo "Error: A post already exists at $FILEPATH"
  echo "Choose a different title, or edit that file directly."
  exit 1
fi

# Create the file with the frontmatter template
cat <<EOF > "$FILEPATH"
---
title: "$TITLE"
date: $DATE
description: "$DESCRIPTION"
tags: $TAGS
draft: true
---

Write your post content here...
EOF

echo "Created new post at: $FILEPATH"