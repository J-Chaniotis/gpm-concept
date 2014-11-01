'use strict';

/*
Clear the terminal (linux/OSX)
*/
process.stdout.write('\u001B[2J\u001B[0;0f');

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var router = express.Router();
var fs = require('fs');


var app = express();

router.post('/save', function (req, res) {
    fs.writeFileSync(path.join('./public/',req.body.name), JSON.stringify(req.body.data));
    res.end();
});

app.set('port', 3005);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use('/api', router);    
app.use(express.static(path.join(__dirname, 'public')));

// Dont spam with 404
app.use(function (req, res) {
    res.send(404, req.originalUrl + ' not found');
});

// development error handler
// will print stacktrace
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.send('error', {
        message: err.message,
        error: err
    });
});





app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
