#!/usr/bin/env bash

EXCLUDES=()
EXCLUDES+=(--exclude ".*")
EXCLUDES+=(--exclude do_rsync.sh)
EXCLUDES+=(--exclude LICENSE)
EXCLUDES+=(--exclude README.md)

rsync -avzh --progress "${EXCLUDES[@]}" ./ paulkenn@paulmkennedy.com:~/www/games/
