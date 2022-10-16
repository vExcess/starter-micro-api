const http = require("http");
const https = require("https");

// fetch polyfill
function fetch(url, options) {
    return new Promise(resolve => {
        function responseCallback (res) {
            res.setEncoding('binary');

            let accumBytes = 0;
            let accum = [];
            res.on("data", chunk => {
                if (chunk !== null) {
                    accumBytes += chunk.length;
                    accum.push(chunk);
                }
            });

            res.headers.get = p => res.headers[p];
            
            res.on('end', () => {
                // let data = Buffer.concat(accum, accumBytes);
                // console.log(data)
                resolve({
                    url: url,
                    headers: res.headers,
                    status: res.statusCode,
                    ok: res.statusCode >= 200 && res.statusCode < 300,
                    text: () => accum.join(""),
                    json: () => JSON.parse(accum.join("")),
                    arrayBuffer: () => {
                        for (var i = 0; i < accum.length; i++) {
                            accum[i] = Buffer.from(accum[i], "binary");
                        }
                        let buff = Buffer.concat(accum, accumBytes);

                        let arrBuff = new ArrayBuffer(buff.length);
                        let typedArr = new Uint8Array(arrBuff);
                        for (var i = 0; i < buff.length; i++) {
                            typedArr[i] = buff[i];
                        }

                        return typedArr.buffer;
                    }
                });
            });
        }

        var protocol = url.startsWith("https:") ? https : http;
        protocol.get(url, responseCallback).on("error", console.error);
    });
}

var httpServer = http.createServer(async function(req, res) {
    try {
        var query = req.url.slice(req.url.indexOf("?") + 1);
        var len = query.length;

        var queryData = {};
        
        var i = 0;
        while (i < len) {
            if (query.slice(i, i + 4) === "=%22") {
                let key, value;
                key = value = undefined;
                
                let j = i - 1;
                while (query.charAt(j) !== "?" && query.charAt(j) !== "&" && j >= 0) {
                    j--;
                }
                key = query.slice(j + 1, i);

                j = i + 2;
                while (query.slice(j, j + 3) !== "%22" && j < len) {
                    j++;
                }
                value = decodeURIComponent(query.slice(i + 4, j));
                i = j;

                queryData[key] = value;
            }

            i++;
        }

        console.log(queryData);

        if (queryData.url && queryData.user) {
            let proxRes = await fetch(queryData.url);
            let arrBuff = await proxRes.arrayBuffer();
            let resBytes = new Uint8Array(arrBuff);

            res.setHeader("Access-Control-Allow-Origin", "*");
            res.writeHead(200, {"Content-Type": proxRes.headers.get("content-type")});
            res.write(resBytes);
        }

        res.end();
    } catch (err) {
        console.log(err);
    }
});

httpServer.listen(3000, () => {
    console.log("Server Online!");
});
