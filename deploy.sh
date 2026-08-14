#!/usr/bin/env bash
# Wrapper script to execute scripts/deploy.sh
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$DIR/scripts/deploy.sh" "$@"
