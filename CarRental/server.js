var express = require('express');
var path = require('path');
var port = 5000;
var engines = require('consolidate');
var bodyParser = require('body-parser');
var r = require('request').defaults({
	json: true
});


//express middleware
var app = express();

//bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

//setting up template engine
app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname+ '/views');



//routes:
var router = express.Router();

app.use('/',router);

app.get('/',function(req, res){
	res.render('home');
});

app.get('/checkout',function(req, res){
	res.render('checkout');
});

app.post('/estimate', function(req,res){
	var equation = req.body.equation;
	console.log(equation);
	r({
		url: 'http://192.168.1.70:3000/equlator',
		method: 'POST',
		body: {equation: equation},
		headers: { //We can define headers too
        'Content-Type': 'Application/json'
    	} 
	  }, function(err, response,body)
	  {
		if(err){
			console.log(err);
		}
		else{
			console.log(body);
			res.render('checkout', {total: body.result});
		}
	});

});

app.use(function(req,res){
	res.sendStatus(404);
});


app.listen(port, function(){
	console.log('server is running on port:'+port);
});



