const loading_log = (n) => {
	if (n > 0) {
		process.stdout.write("\u001b[2K")
		process.stdout.write("\u001b[u")
	}
	process.stdout.write("\u001b[s");
	process.stdout.write(`loading ${n}%`);
};

const loading = (i) => {
	if (i === 0) {
		console.log('start');
	} else if (i === 10) {
		return console.log('end');
	} 

	
	loading_log(i);
	setTimeout(() => loading(++i), 200);
}

loading(0);