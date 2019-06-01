const moment = require("moment");

const playList = [
  { filename: "The Last Escape ", duration: "0:18 " },
  { filename: "Option Screen ", duration: "0:55 " },
  { filename: "Title Calling ", duration: "0:07 " },
  { filename: "Her Determination ", duration: "0:57 " },
  { filename: "The Opening ", duration: "1:32 " },
  { filename: "The Beginning Of Nightmare ", duration: "1:24 " },
  { filename: "Is There A Way Out? ", duration: "0:35 " },
  { filename: "The Great Novelist ", duration: "1:49 " },
  { filename: "Free From Fear ", duration: "2:34 " },
  { filename: "Meeting Brad ", duration: "1:10 " },
  { filename: "Cold Sweat ", duration: "0:47 " },
  { filename: "The City Of Ruin ", duration: "2:35 " },
  { filename: "Imminent Slaughter ", duration: "0:28 " },
  { filename: "Nemesis' Theme ", duration: "1:19 " },
  { filename: "Feel The Tense... ", duration: "2:07 " },
  { filename: "The Front Hall ", duration: "1:55 " },
  { filename: "The First Floor ", duration: "3:08 " },
  { filename: "Well Dressed Up ", duration: "1:03 " },
  { filename: "The City Without Hope ", duration: "3:27 " },
  { filename: "Watch Out For Your Back ", duration: "1:09 " },
  { filename: "Carlos' Theme ", duration: "1:32 " },
  { filename: "Never Give Up The Escape ", duration: "2:33 " },
  { filename: "Nicholai's Theme ", duration: "1:43 " },
  { filename: "Together For The Escape ", duration: "1:25 " },
  { filename: "Valediction ", duration: "2:43 " },
  { filename: "Coldhearted Soldier ", duration: "2:28 " },
  { filename: "Quick & Fast Relief ", duration: "0:09 " },
  { filename: "The Common Cure ", duration: "0:11 " },
  { filename: "Escape To Ecstasy ", duration: "0:11 " },
  { filename: "Zombies Trespassing ", duration: "0:24 " },
  { filename: "Free Falling ", duration: "0:57 " },
  { filename: "Abrupt Gunfire ", duration: "1:12 " },
  { filename: "Don't Come Any Closer! ", duration: "1:26 " },
  { filename: "Complete Rest ", duration: "2:39 " },
  { filename: "Hero Time ", duration: "2:21 " },
  { filename: "S.G.G.S. Explosion ", duration: "0:16 " },
  { filename: "Pride And Valor ", duration: "0:27 " },
  { filename: "An Impending Danger ", duration: "0:47 " },
  { filename: "Cable Car Crash ", duration: "0:14 " },
  { filename: "Ominous Presentiment ", duration: "0:13 " },
  { filename: "The Clock Tower ", duration: "3:30 " },
  { filename: "Don't Lose Courage ", duration: "2:01 " },
  { filename: "No Rest For The Wicked ", duration: "2:44 " },
  { filename: "Mysterious Orgel (Correct) ", duration: "0:13 " },
  { filename: "Mysterious Orgel (Wrong) ", duration: "0:15 " },
  { filename: "From Relief To Terror ", duration: "0:32 " },
  { filename: "Menacing Nemesis ", duration: "1:30 " },
  { filename: "Unstoppable Nemesis ", duration: "1:48 " },
  { filename: "Bring Back Her Consciousness ", duration: "2:26 " },
  { filename: "The Hospital ", duration: "2:45 " },
  { filename: "Traitor ", duration: "1:08 " },
  { filename: "Almost There... ", duration: "0:24 " },
  { filename: "Nemesis Again ", duration: "1:42 " },
  { filename: "Nothing But A Pawn ", duration: "1:16 " },
  { filename: "Earthquake? ", duration: "0:20 " },
  { filename: "The Grave Digger ", duration: "1:47 " },
  { filename: "The Park ", duration: "2:48 " },
  { filename: "The Disused Plant ", duration: "2:43 " },
  { filename: "All Of A Sudden ", duration: "0:35 " },
  { filename: "The Worst Scenario ", duration: "1:39 " },
  { filename: "Defiant Behavior ", duration: "0:50 " },
  { filename: "The Last Argument ", duration: "1:48 " },
  { filename: "Deservedly Death ", duration: "0:21 " },
  { filename: "Four Minutes Before The Treatment ", duration: "1:08 " },
  { filename: "Nemesis Doesn't Give Up ", duration: "3:25 " },
  { filename: "Treated To Resurrect ", duration: "0:20 " },
  { filename: "Missile Approaching ", duration: "3:11 " },
  { filename: "Against The Chopper ", duration: "1:39 " },
  { filename: "Emergency Level D ", duration: "3:03 " },
  { filename: "Nemesis Final Metamorphosis ", duration: "3:40 " },
  { filename: "The Last Decision ", duration: "0:41 " },
  { filename: "The Second Chopper (Ver.1) ", duration: "0:12 " },
  { filename: "The Second Chopper (Ver.2) ", duration: "0:26 " },
  { filename: "The Second Chopper (Ver.3) ", duration: "0:38 " },
  { filename: "Euthanasia Of Raccoon City ", duration: "0:58 " },
  { filename: "Unfortunate Event ", duration: "1:05 " },
  { filename: "Staffs & Credits ", duration: "2:02 " },
  { filename: "Ever After ", duration: "1:48 " },
  { filename: "Title Calling (Arranged Ver.) ", duration: "0:07 " },
  { filename: "Choose The Best One ", duration: "1:21 " },
  { filename: "The Doomed City ", duration: "2:42 " },
  { filename: "Hellish Agony ", duration: "3:01 " },
  { filename: "Freedom Obtained ", duration: "1:18 " },
  { filename: "Reward And Result ", duration: "1:13 " },
  { filename: "CM-1 (Short Ver.) ", duration: "0:18 " },
  { filename: "CM-2 (Long Ver.) ", duration: "0:31 " },
];

main();

function main() {
  let duration = moment.duration(0);

  for (let i = 0; i < playList.length; ++i) {
    const idx = leadZero(i + 1);
    const name = playList[i].filename.trim();

    const h = duration.get('hours');
    const m = duration.get('minutes');
    const s = duration.get('seconds');
    const hms = fillDuration(playList[i].duration.trim());
    if (!hms) {
      console.error("Invalid duration:", playList[i].filename, playList[i].duration);
      process.exit(1);
      return;
    }
    duration = duration.add(moment.duration(hms));

    const time = h > 0
      ? `${leadZero(h)}:${leadZero(m)}:${leadZero(s)}`
      : `${leadZero(m)}:${leadZero(s)}`;

    console.log(`#${idx}.(${time}) ${name}`);
  }
}

function leadZero(x) {
  return ('0' + x).substr(-2);
}

function fillDuration(duration) {
  if (typeof duration === "string") {
    const hms = duration.split(":");
    if (hms.length === 0) {
      return;
    }
    if (hms.length === 1) {
      return `00:00:${leadZero(hms[0])}`;
    }
    if (hms.length === 2) {
      return `00:${leadZero(hms[0])}:${leadZero(hms[1])}`;
    }
    return `${leadZero(hms[0])}:${leadZero(hms[1])}:${leadZero(hms[2])}`;
  }
}