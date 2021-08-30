#!/bin/sh

set -u

root_dir=$(cd `dirname $0`;pwd)

work_dir=$1
tmp_dir="${2:-.}"
list_file="$tmp_dir/ls"
final_file="${3:-final.mp4}"

if [ ! -d "$tmp_dir" ]; then
    mkdir -p "$tmp_dir"
fi

stats() {
    for mp4 in "$work_dir"/*.mp4; do
        ffprobe -v error -select_streams v:0 -of default=noprint_wrappers=1 \
        -show_entries stream=width,height,r_frame_rate,duration,bit_rate "$mp4"
    done
}

echo "Parse video info..."
echo ""
echo "Total videos: $(ls -l "$work_dir"/*.mp4 | grep "^-" | wc -l)"

read -d '\n' bit_rate duration height r_frame_rate width <<< "$(stats | node parseinfo.js | sed -E 's/^.+=(.+)/\1/')"

# echo "width=$width"
# echo "height=$height"
# echo "r_frame_rate=$r_frame_rate"
# echo "duration=$duration"
# echo "bit_rate=$bit_rate"

# normalize
for src in "$work_dir"/*.mp4; do
    mp4=$(date +%s).mp4
    pad="$tmp_dir"/"pad-$mp4"
    dst="$tmp_dir"/"$mp4"

    ffmpeg -v error -i "$src" -y -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2" "$pad"

    ffmpeg -v error -i "$pad" -y -c:a aac -c:v h264 -r "$r_frame_rate" -b:v "$bit_rate" -ac 2 "$dst"

    echo "file '$root_dir/$dst'" >> "$list_file"
    rm -f "$pad"

    echo "$dst <- $src"
done

# synthesize
ffmpeg -v error -y -f concat -safe 0 -i "$list_file" -c copy "$final_file"
rm -f "$list_file"

echo "Synthezied: $final_file"
