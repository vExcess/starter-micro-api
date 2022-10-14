var http = require('http');

var httpServer = http.createServer(function (req, res) {
    console.log(`Just got a request at ${req.url}!`)
    res.write('Yo!');
    res.end();
});

httpServer.listen(3000);
