const fs = require('fs');
const path = require('path');
const moment = require('moment');
const cmd = require("child_process").exec;

const DIR = path.resolve(__dirname, "../build/gradian3/tmp");

main();

async function main() {
  const files = fs.readdirSync(DIR, { withFileTypes: true }).filter(file => file.isFile());

  const ost = [];

  for (const file of files) {
    const duration = await getDuration(path.join(DIR, file.name));
    const filename = file.name
    ost.push({ filename, duration });
  }

  const re = /\d+ Grandia III ost\s+-\s+(.*)\.mp4/;

  let duration = moment.duration(0);

  for (let i = 0; i < ost.length; ++i) {
    const idx = leadZero(i + 1);
    const name = re.exec(ost[i].filename)[1];

    let h = duration.get('hours');
    let m = duration.get('minutes');
    let s = duration.get('seconds');
    duration = duration.add(moment.duration(ost[i].duration));

    const time = h > 0
      ? `${leadZero(h)}:${leadZero(m)}:${leadZero(s)}`
      : `${leadZero(m)}:${leadZero(s)}`;

    console.log(`#${idx}. ${name} - ${time}`);
  }
}

function leadZero(x) {
  return ('0' + x).substr(-2);
}

async function getDuration(file) {
  return new Promise((resolve, reject) => {
    cmd(`ffmpeg -i "${file}" 2>&1 | grep Duration`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      
      const duration = stdout.split(',')[0].trim().split(' ')[1];
      resolve(duration);
    });
  });
}
