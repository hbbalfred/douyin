const sys = require("./lib/modules/sys");
let logger;
test();

async function test() {
  logger = sys.singleLineLog();
  await loading();

  logger = sys.singleLineLog();
  await loading("clean");
}

async function loading(mod) {
  return new Promise((r, _) => {
    let i = 0;
    console.log("start to load");
    let id = setInterval(() => {
      logger.log(`loading...${++i}%`);

      if (i >= 100) {
        logger.end(mod);
        console.log("completed");
        clearInterval(id);
      }
    }, 20);
  });
}
