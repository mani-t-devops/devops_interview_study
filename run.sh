#!/usr/bin/env bash
# One-click launch script for DevOps Interview Prep Hub
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "Starting DevOps Interview Prep Web Hub..."
python3 server.py
