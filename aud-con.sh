#!/bin/sh

# concat audios

set -u

root_dir=$(cd `dirname $0`;pwd)

work_dir=$1
aud_ext="${2:-m4a}"
out_file="${3:-final.m4a}"

# echo "" > _tmp

# for f in "$work_dir"/*.$aud_ext; do echo "file '$PWD/$f'" >> _tmp; done

ffmpeg -v error -y -f concat -safe 0 -i _tmp -c copy "$out_file"

# rm _tmp