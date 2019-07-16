const path = require("path");
const network = require("../../modules/network");
const sys = require("../../modules/sys");
const _get = require("lodash/get");
const _maxBy = require("lodash/maxBy");

// Command line arguments
const argv = require("yargs")
  .option("input-url", {
    alias: "i",
    description: "The input url",
    demandOption: true,
  })
  .option("output-dir", {
    alias: "o",
    description: "The path of directory to save images",
    demandOption: true,
  })
  .help()
  .argv;

main();

const OUTPUT_DIR = path.resolve(sys.baseDir(), argv["output-dir"]);

async function main() {
  await sys.mkdir(argv["output-dir"]);

  const html = await network.loadData(argv["input-url"], { proxy: true });
  // const html = await sys.readFile("./data/mock/instagram_tags.html");

  const shared = parseSharedData(html);
  // const shared = require("../../../data/mock/instagram_tags.json");

  const codes = parseImageCodes(shared);

  sys.log("Found images to download:", codes.length);

  for (let i = 0; i < codes.length; ++i) {
    await download(codes[i]);
    sys.log(`${i + 1}.`, codes[i], "download");
  }
}

async function download(shortcode) {
  const url = `https://www.instagram.com/p/${shortcode}/`;
  const html = await network.loadData(url, { proxy: true });

  const shared = parseSharedData(html);
  const display_resources = _get(shared, "entry_data.PostPage[0].graphql.shortcode_media.display_resources", []);
  sys.assert(display_resources.length, "Not found `display_resources`");

  const max = _maxBy(display_resources, x => x.config_width);
  const jpg = path.join(OUTPUT_DIR, `${shortcode}.jpg`);
  await network.loadDataTo(max.src, jpg, { proxy: true });
}

/**
 * extract urls of image
 * @param {Object} shared shared data
 * @returns {Array<String>}
 */
function parseImageCodes(shared) {
  // searching user
  const images = _get(shared, "entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges", []);

  // searching tag
  // const images = _get(shared, "entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.edges.edges", []);
  return images.map(x => x.node.shortcode);
}

/**
 * parse shared data
 * @param {String} raw page source code
 * @returns {String}
 */
function parseSharedData(raw) {
  let a, b;
  a = raw.indexOf("window._sharedData");
  a = raw.indexOf("{", a);
  b = raw.indexOf("</script>", a);
  b = raw.lastIndexOf("}", b);

  const shared = raw.slice(a, b + 1);
  return JSON.parse(shared);
}
