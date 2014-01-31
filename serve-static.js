var connect = require('connect'),
    http = require('http');

connect()
    .use(connect.static('www'))
    .listen(3000);