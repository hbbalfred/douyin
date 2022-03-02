#!/bin/sh

# audio to video

set -u

audio_file="$1"
cover_file="$2"
out_file="${3:-final.mp4}"

ffmpeg -loop 1 -y -i $audio_file -i $cover_file -shortest $out_file