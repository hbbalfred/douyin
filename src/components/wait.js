module.exports = function wait(seconds) {
	return new Promise((resolve, reject) => {
		console.log(`Wait ${seconds} seconds`);
		
		setTimeout(() => resolve(), seconds * 1000);
	});
};