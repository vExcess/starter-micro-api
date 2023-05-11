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
                        let i;
                        for (i = 0; i < accum.length; i++) {
                            accum[i] = Buffer.from(accum[i], "binary");
                        }
                        let buff = Buffer.concat(accum, accumBytes);

                        let arrBuff = new ArrayBuffer(buff.length);
                        let typedArr = new Uint8Array(arrBuff);
                        
                        for (i = 0; i < buff.length; i++) {
                            typedArr[i] = buff[i];
                        }

                        return typedArr.buffer;
                    }
                });
            });
        }

        let protocol = url.startsWith("https:") ? https : http;
        if (options.method.toLowerCase() === "post") {
            
            protocol.request({
                hostname: url.split("/")[2],
                port: 80,
                path: "/" + url.split("/").slice(3).join("/"),
                method: "POST",
                headers: options.headers
            }, responseCallback).on("error", console.error);
        } else {
            protocol.get(url, responseCallback).on("error", console.error);
        }
    });
}

function parseQuery(url) {
    let quesIdx = url.indexOf("?");
    if (quesIdx === -1) {
        return {};
    } else {
        let end = url.slice(quesIdx + 1);
        if (end.length > 2) {
            let vars = end.split("&");
            let keys = {};
            for (var i = 0; i < vars.length; i++) {
                var eqIdx = vars[i].indexOf("=");
                vars[i] = [
                    decodeURIComponent(vars[i].slice(0, eqIdx)),
                    decodeURIComponent(vars[i].slice(eqIdx + 1))
                ];
                var number = Number(vars[i][1]);
                if (!Number.isNaN(number)) {
                    vars[i][1] = number;
                }
                keys[vars[i][0]] = vars[i][1];
            }
            return keys;
        } else {
            return {};
        }
    }
}

const httpServer = http.createServer(async (req, res) => {
    try {
        if (req.url.startsWith("/fetch?")) {
            let queryData = parseQuery(req.url);
            if (queryData.url) {
                queryData.url = Buffer.from(queryData.url, "base64").toString();
                console.log(queryData);

                let sendHeaders = {};
                try {
                    sendHeaders = JSON.stringify(queryData.headers ?? "{}");
                } catch (e) {}
                let proxRes = await fetch(queryData.url, {
                    method: queryData.method ?? "GET",
                    headers: sendHeaders,
                    body: queryData.body
                });
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.writeHead(200, proxRes.headers);
                res.write(new Uint8Array(await proxRes.arrayBuffer()));
                res.end();
            } else {
                res.end();
            }
        } else {
            res.write("Server Online!");
            res.end();
        }
    } catch (err) {
        console.log(err);
        res.end();
    }
});

httpServer.listen(3000, () => {
    console.log("Server Online!");
});
