// require("../components/pipe-in").onFinish = input => start(input.split("\n"));

// function start(list) {
// 	const urlMap = {};

// 	list = list.filter(item => item);

// 	for (const item of list) {
// 		const json = JSON.parse(item);

// 		for (const aweme of json.aweme_list) {
// 			const addr = aweme.aweme_info.video.play_addr;
// 			urlMap[addr.uri] = addr.url_list;
// 		}
// 	}

// 	console.log(JSON.stringify(urlMap));
// }
