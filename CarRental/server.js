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

	var numberOfDays = '0';
	var CARTYPES = { "Economy": 34.99 , "Intermediate": 36.99 ,  "Premium": 40.99 };
	var EXTRAs = {"Collision": 6.99 , "Insurance": 40.50, "GPS": 24.99};

	var carType='';
	var carPrice = '0';
	var insurance = '0';
	var collisionDamage = '0';
	var gps = '0';
	var promotionDefault = '5/100';
	var tax = "8/100";

	//reading form
	carPrice = CARTYPES[req.body.carType];
	carType = req.body.carType;

    var collisionTemp = req.body.collisionDamage ? true : false;
    if(collisionTemp)
    	collisionDamage = EXTRAs["Collision"];

    var insuranceTemp = req.body.insurance ? true : false;
    if(insuranceTemp)
    	insurance = EXTRAs["Insurance"];

    var gpsTemp = req.body.gps ? true : false;
    if(gpsTemp)
    	gps = EXTRAs["GPS"];

    //counting the number of days
    var fromDate = new Date(req.body.fromDate);
    var toDate = new Date(req.body.toDate);
    toDate = Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
    fromDate = Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    numberOfDays = (toDate - fromDate) / 86400000;

	//building equation
	var totalWithoutPromotion = numberOfDays+'*('+carPrice+'+'+insurance+'+'+collisionDamage+'+'+gps+')';
	var beforeTax = totalWithoutPromotion +'-('+totalWithoutPromotion + '*'+ promotionDefault+')'; 
	var equation = beforeTax +'+('+ beforeTax +')*'+ tax;
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
			res.render('checkout', {total: parseFloat(body.result).toFixed(2), /*trimming to .00 decimal*/
									carType: req.body.carType,
									fromDate: req.body.fromDate,
									toDate: req.body.toDate,
									tax: '8%'});
		}
	});

});

app.use(function(req,res){
	res.sendStatus(404);
});


app.listen(port, function(){
	console.log('server is running on port:'+port);
});



