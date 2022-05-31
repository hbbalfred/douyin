#!/bin/sh

set -e

root_dir=$(cd `dirname $0`;pwd)
ost_dir=$1
dl_dir="${ost_dir}_dl"
pic=$2
dl_url=$3

[ -z "$ost_dir" ] && echo "no ost dir" && exit 1

mkdir -p "$ost_dir"
mkdir -p "$dl_dir"

if [ ! -z "$dl_url" ]; then
	./ytdl-plst.sh "$dl_url" -o "$dl_dir"
fi

echo "Extract m4a..."
./conv.sh "$dl_dir"

echo "Move m4a..."
mv "$dl_dir"/*.m4a "$ost_dir"

echo "Merge m4a..."
./aud-con.sh "$ost_dir" "m4a" "${ost_dir}.m4a"

if [ -z "$pic" ]; then
	echo "Merge vidoes..."
	mkdir -p tmp
	./vid-syn.sh "$dl_dir" "tmp" "${ost_dir}.mp4"
else
	echo "Scale image..."
	cover="${ost_dir}_640.${pic##*.}"
	./scale-cover.sh "$pic" 640 "$cover"
	echo "Mix audios to video..."
	./aud2vid.sh "${ost_dir}.m4a" "$cover" "${ost_dir}.mp4"
fi
