#!/bin/sh

root_dir=$(cd `dirname $0`;pwd)
work_dir=$1


time='00:00:00'

for mp4 in "$work_dir"/*.mp4; do
    sec=$(ffprobe -v error -select_streams v:0 -of default=noprint_wrappers=1 \
    -show_entries stream=duration "$mp4"  | sed -E 's/^.+=(.+)/\1/' | xargs printf "%.0f\n")

    time=$(date -j -f %T -v+"$sec"S $time +%T)

    echo "$time `basename "$mp4"`"
done
