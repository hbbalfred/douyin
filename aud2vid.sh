#!/bin/sh

# audio to video

set -u

audio_file="$1"
cover_file="$2"
out_file="${3:-final.mp4}"

ffmpeg -y -loop 1 -i $cover_file -i $audio_file -acodec copy -shortest -r 1 $out_file