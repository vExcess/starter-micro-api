var http = require("http");
// var fetch = require("./node_modules/node-fetch/lib/index");

var httpServer = http.createServer(async function(req, res) {
    console.log(require("./node_modules/qwe.js"));
    
    try {
//         var query = req.url.slice(req.url.indexOf("?") + 1);
//         var len = query.length;

//         var queryData = {};
        
//         var i = 0;
//         while (i < len) {
//             if (query.slice(i, i + 4) === "=%22") {
//                 let key, value;
//                 key = value = undefined;
                
//                 let j = i - 1;
//                 while (query.charAt(j) !== "?" && query.charAt(j) !== "&" && j >= 0) {
//                     j--;
//                 }
//                 key = query.slice(j + 1, i);

//                 j = i + 2;
//                 while (query.slice(j, j + 3) !== "%22" && j < len) {
//                     j++;
//                 }
//                 value = decodeURIComponent(query.slice(i + 4, j));
//                 i = j;

//                 queryData[key] = value;
//             }

//             i++;
//         }

//         console.log(queryData);

//         if (queryData.url && queryData.user) {
//             let proxRes = await fetch(queryData.url);
//             let arrBuff = await proxRes.arrayBuffer();
//             let resBytes = new Uint8Array(arrBuff);

//             res.setHeader("Access-Control-Allow-Origin", "*");
//             res.write(resBytes);
//         }

        res.end();
    } catch (err) {
        console.log(err);
    }
});

httpServer.listen(3000, () => {
    console.log("Server Online!");
});
