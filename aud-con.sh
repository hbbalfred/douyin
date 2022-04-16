#!/bin/sh

# concat audios

set -u

root_dir=$(cd `dirname $0`;pwd)

work_dir=$1
aud_ext=${2:-m4a}
out_file=${3:-final.m4a}

tmp_dir=$root_dir/tmp
ls_file=$tmp_dir/ls

mkdir -p "$tmp_dir"
echo "" > "$ls_file"

i=0
for f in "$work_dir"/*.$aud_ext; do
  from=$root_dir/$f
  to=$tmp_dir/$(gdate +%s%N)
  cp -a "$from" "$to"
  echo "file '$to'" >> $ls_file; 
done

ffmpeg -v error -y -f concat -safe 0 -i "$ls_file" -c copy "$out_file"