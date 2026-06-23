#!/bin/bash

# Check if a title was provided
if [ -z "$1" ]; then
  echo "Error: Please provide a title for the post."
  echo "Usage: ./scripts/new-post.sh \"My Awesome Post Title\""
  exit 1
fi

# Resolve paths relative to this script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_ROOT="$(dirname "$SCRIPT_DIR")/new-site"

# Sanitize the title for a filename (lowercase, replace spaces with hyphens)
TITLE="$1"
FILENAME=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g')
DATE=$(date +"%Y-%m-%dT%H:%M:%SZ")
FILEPATH="${SITE_ROOT}/src/content/blog/${FILENAME}.md"

# Create the file with the frontmatter template
cat <<EOF > "$FILEPATH"
---
title: "$TITLE"
date: $DATE
description: "Enter a short description here"
tags: []
draft: true
---

Write your post content here...
EOF

echo "Created new post at: $FILEPATH"