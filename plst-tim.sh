#!/bin/sh

set -e

root_dir=$(cd `dirname $0`;pwd)
work_dir=$1
file_ext=mp4

info=""

for f in "$work_dir"/*.$file_ext; do
	t=$(ffprobe -v error -i "$f" -show_entries format=duration -sexagesimal -of csv="p=0")

	info+="$f\n$t\n"
#    sec=$(ffprobe -v error -select_streams v:0 -of default=noprint_wrappers=1 \
#    -show_entries stream=duration "$mp4"  | sed -E 's/^.+=(.+)/\1/' | xargs printf "%.0f\n")
#
#    time=$(date -j -f %T -v+"$sec"S $time +%T)
#
#    echo "$time `basename "$mp4"`"
done

js="var input='';
process.stdin.on('data', (chunk) => input += chunk.toString());
process.stdin.on('close', () => main(input));
function main(input) {
	let r = input.trim().split('\u000a');
	let a = [];
	for (let i=0; i < r.length; i+=2) {
		a.push({f:r[i], d:r[i+1]});
	}

	const HS=3600000, MS=60000, SS=1000;

	let tim = 0;
	for (let i=1; i < a.length; i++) {
		let hms = a[i-1].d.split(':');
		let mss = hms[2].split('.');
		hms[2] = mss[0]; hms[3] = mss[1].substring(0,3);
		hms = hms.map(x => parseInt(x));

		let h = hms[0], m = hms[1], s = hms[2], sss=hms[3];

		tim += h*HS + m*MS + s*SS + sss;

		h = tim / HS >> 0;
		m = (tim - h*HS) / MS >> 0;
		s = (tim - h*HS - m*MS) / SS >> 0;
		sss = tim - h*HS - m*MS - s*SS;

		if (sss > 400) { s += 1; }
		if (s > 59) { s = 0; m += 1; }
		if (m > 59) { m = 0; h += 1; }

		let hh = h < 10 ? '0' + h : h;
		let mm = m < 10 ? '0' + m : m;
		let ss = s < 10 ? '0' + s : s;

		if (h === 0) {
			a[i].t = mm + ':' + ss;
		} else {
			a[i].t = hh + ':' + mm + ':' + ss;
		}
	}
	a[0].t = '00:01';

	const z = (i) => {
		let x = Math.floor(Math.log10(i));
		let y = Math.floor(Math.log10(a.length));
		if (x < y) {
			let zo = new Array(y-x).fill('0').join('');
			return zo + i;
		}
		return i;
	};

	a.forEach((x,i) => {
		let s = z(i+1) + '|' + x.t + ' ' + x.f;
		console.log(s);
	});
}"

echo "$js" > tmp.js
echo "$info" | node tmp.js
rm -rf tmp.js
