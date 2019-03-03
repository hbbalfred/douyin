module.exports = function wait(seconds) {
	return new Promise((resolve, reject) => {
		if (typeof seconds !== "number") {
			seconds = 0;
		}
		if (!seconds) {
			return resolve();
		}
		
		// console.log(`Wait ${seconds.toFixed(2)} seconds`);
		
		setTimeout(() => resolve(), seconds * 1000);
	});
};