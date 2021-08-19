#!/bin/sh

# conv.sh {word_dir} {src_extname} {dst_extname}
# conv.sh ./videos mp4 m4a

root_dir=$(cd `dirname $0`;pwd)
work_dir="$root_dir/$1"
src_ext="${2:-mp4}"
dst_ext="${3:-m4a}"

for src in "$work_dir"/*.$src_ext; do
    dst=$(basename -s .$src_ext "$src").$dst_ext
    ffmpeg -y -v 0 -i "$src" -map_metadata -1 -vn -c:a copy "$work_dir/$dst"
    echo $dst
done
