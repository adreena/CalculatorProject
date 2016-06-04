var express = require('express');
var bodyParser = require('body-parser');
var port = 3000;
//express middleware
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//routes:
app.use('/',function(request, response){
	response.send('Connected to Calculator Servers');
});

app.listen(port);
console.log('server connected....');


