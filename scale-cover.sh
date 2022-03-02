#!/bin/sh

# scale image
# https://www.oodlestechnologies.com/blogs/crop-and-scale-image-using-ffmpeg/
# https://trac.ffmpeg.org/wiki/Scaling

input="$1"
wid="${2:-640}"
out="${3:-cover.${input##*.}}"

ffmpeg -v error -y -i $input -vf "scale=$wid:ih*ow/iw" $out
