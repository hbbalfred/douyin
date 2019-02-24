const cmd = require("child_process").exec;

module.exports = function nextVideo() {
	return new Promise((resolve, reject) => {
		console.log("To next video");
		
		cmd(`adb shell input swipe 800 1000 800 100`, (error, stdout, stderr) => {
			if (error) {
				console.error(error);
				reject("Error: Swip to next video");
			} else {
				resolve();
			}
		});
	});
}