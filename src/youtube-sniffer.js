const network = require("./components/network");

class YoutubeSniffer {
	static parseNewestVideoData(pageSource) {
		let i, j;

		i = pageSource.indexOf("window[\"ytInitialData\"]");
		i = pageSource.indexOf("{", i);
		j = pageSource.indexOf(";", i);

		let data = JSON.parse(pageSource.slice(i, j));

		data = _get(data, "contents.twoColumnBrowseResultsRenderer.tabs", []);
		data = data.find(it => _get(it, "tabRenderer.content"));
		data = _get(data, "tabRenderer.content.sectionListRenderer.contents.0.itemSectionRenderer.contents.0.gridRenderer.items.0.gridVideoRenderer", {});

		return data;
	}

	constructor(pageUrl, interval) {
		this._pageUrl = pageUrl;
		this._interval = interval;
		this._started = null;
	}

	start() {
		if (!this._started) {
			this._started = setInterval(() => this.execute(), this._interval);
		}
	}

	async execute() {
		const pageSource = await network.loadPageSource(this._pageUrl, { proxy: true });

		const videoData = YoutubeSniffer.parseNewestVideoData(pageSource);

		if (!videoData) {
			throw new Error("Invalid page source code to parse the newest video data");
		}

		const exists = await this._storage.exists(videoData.videoId);

		if (!exists) {
			await this._downloader.load();
			await this._storage.save(videoData.videoId);
		}
		
	}
}
