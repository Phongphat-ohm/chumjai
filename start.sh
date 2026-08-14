#!/usr/bin/env bash
# Wrapper script to execute scripts/start.sh
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$DIR/scripts/start.sh" "$@"
