const fs = require("fs");
const path = require("path");

const playList = [
  "Resident Evil 4 Soundtrack - End of Umbrella",
  "Resident Evil 4 Soundtrack - The Drive ~ First Contact",
  "Resident Evil 4 Soundtrack - Ganado I",
  "Resident Evil 4 Soundtrack - A Strange Pasture",
  "Resident Evil 4 Soundtrack - A Ruined Village",
  "Resident Evil 4 Soundtrack - Ganado II",
  "Resident Evil 4 Soundtrack - Serenity",
  "Resident Evil 4 Soundtrack - Ganado III",
  "Resident Evil 4 Soundtrack - Del Lago",
  "Resident Evil 4 Soundtrack - Noche",
  "Resident Evil 4 Soundtrack - El Gigante",
  "Resident Evil 4 Soundtrack - Echo in the Night",
  "Resident Evil 4 Soundtrack - Bitores Mendez",
  "Resident Evil 4 Soundtrack - Hard Road to the Castle",
  "Resident Evil 4 Soundtrack - Game Over",
  "Resident Evil 4 Soundtrack - Catapult",
  "Resident Evil 4 Soundtrack - Garrador",
  "Resident Evil 4 Soundtrack - Ganado IV",
  "Resident Evil 4 Soundtrack - Cold Sweat",
  "Resident Evil 4 Soundtrack - Target Practice",
  "Resident Evil 4 Soundtrack - Novistadors",
  "Resident Evil 4 Soundtrack - Central Hall",
  "Resident Evil 4 Soundtrack - Agony",
  "Resident Evil 4 Soundtrack - Evil Malaise",
  "Resident Evil 4 Soundtrack - Death From Above",
  "Resident Evil 4 Soundtrack - Crazy Cultist Drivers",
  "Resident Evil 4 Soundtrack - Bad Vibes",
  "Resident Evil 4 Soundtrack - Verdugo",
  "Resident Evil 4 Soundtrack - Robo-Salazar",
  "Resident Evil 4 Soundtrack - Tower of Death",
  "Resident Evil 4 Soundtrack - Salazar",
  "Resident Evil 4 Soundtrack - Save Theme",
  "Resident Evil 4 Soundtrack - Infiltration",
  "Resident Evil 4 Soundtrack - Ganado V",
  "Resident Evil 4 Soundtrack - Regenerador",
  "Resident Evil 4 Soundtrack - U-3",
  "Resident Evil 4 Soundtrack - Path to Closure",
  "Resident Evil 4 Soundtrack - Krauser",
  "Resident Evil 4 Soundtrack - Back-Up",
  "Resident Evil 4 Soundtrack - Final Battle",
  "Resident Evil 4 Soundtrack - The Escape",
  "Resident Evil 4 Soundtrack - Horizon",
  "Resident Evil 4 Soundtrack - Sorrow (Ending Credits)",
  "Resident Evil 4 Soundtrack - Result",
  "Resident Evil 4 Soundtrack - The Mercenaries",
  "Resident Evil 4 Soundtrack - The Mercenaries Leon",
  "Resident Evil 4 Soundtrack - The Mercenaries Ada",
  "Resident Evil 4 Soundtrack - The Mercenaries Krauser",
  "Resident Evil 4 Soundtrack - The Mercenaries Hunk",
  "Resident Evil 4 Soundtrack - The Mercenaries Wesker",
  "Resident Evil 4 Soundtrack - Assignment Ada",
  "Resident Evil 4 Soundtrack - Assignment Ada End Roll ~ tarde",
  "Resident Evil 4 Soundtrack - Assignment Ada End Roll ~ noche",
  "Resident Evil 4 Soundtrack - the another order",
  "Resident Evil 4 Soundtrack - Ganado VI",
  "Resident Evil 4 Soundtrack - Interlude",
  "Resident Evil 4 Soundtrack - Intention",
  "Resident Evil 4 Soundtrack - Shipyard",
  "Resident Evil 4 Soundtrack - End and Aim",
];

const VIDEOS_DIR = path.resolve(__dirname, "../build/residentevil4");

fs.readdirSync(VIDEOS_DIR, { withFileTypes: true })
  .filter(file => file.isFile() && file.name.endsWith(".mp4"))
  .forEach(file => {
    const fileName = file.name.substr(0, file.name.length - 4);
    const idx = playList.indexOf(fileName);
    if (idx === -1) {
      console.error("No file name:", fileName);
      process.exit(1);
      return;
    }

    const lead = ("000" + (idx + 1)).substr(-3);

    fs.renameSync(path.join(VIDEOS_DIR, file.name), path.join(VIDEOS_DIR, `${lead} ${file.name}`));
  });