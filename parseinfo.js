var input = "";

process.stdin.on("data", (chunk) => input += chunk.toString() );
process.stdin.on("close", () => main());

class most {
    count = {}
    look(x) {
        if (!this.count[x]) {
            this.count[x] = 0;
        }
        this.count[x]++;
    }
    get() {
        var x, mx = 0;
        Object.entries(this.count).map(kv => {
            if (kv[1] > mx) {
                x = kv[0];
                mx = kv[1];
            }
        });
        return x;
    }
}

class max {
    val = -1;
    look(x) {
        if (x > this.val) {
            this.val = x;
        }
    }
    get() {
        return this.val;
    }
}

var parsers = {
    width: parseInt,
    height: parseInt,
    duration: parseFloat,
    bit_rate: parseInt,
    r_frame_rate: (str) => {
        var t = str.split("/");
        if (t.length < 2) {
            return parseInt(t[0]);
        } else {
            return parseInt(t[0]) / parseInt(t[1]);
        }
    },
};

var evals = {
    width: new most(),
    height: new most(),
    duration: new most(),
    bit_rate: new max(),
    r_frame_rate: new max(),
};

function main() {
    input.trim().split("\n").map(row => {
        var [k, v] = row.split("=");
        evals[k].look(parsers[k](v));
    });

    Object.keys(evals).sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }).map(k => console.log("%s=%s", k, evals[k].get()));
}
