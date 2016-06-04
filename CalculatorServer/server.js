var express = require('express');
var port = 3000;
var engines = require('consolidate');
var bodyParser = require('body-parser');


//express middleware
var app = express();
//app.use(;

function errorHandler(err,req,res,next){
	console.error(err.message);
	console.error(err.stack);
	res.status(500);
	res.rencer(error_template);
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//setting up template engine
app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname+ '/views');


var router = express.Router();

router.route('/equlator')
	  .get(function(req,res){
	  	res.render('index'); 

	  })
	 .post(function(req,res,next){
	 	//req.checkBody('equation','equation field is required').notEmpty();
	  	console.log("got to post");
	  	var equation = req.body.equation;
	  	if(typeof equation == 'undefined'){
	  		next(Error('Please type yout equation'));
	  	}else{
			/*res.render('index',{
								'result': equation,
								'length': equation.length}); */
								res.send({
								'result': equation,
								'length': equation.length});
			
	  	}
	  });

//routes:
app.use(errorHandler);
app.use('/',router);
app.get('/',function(req, res){
	res.send('Connected to Equlator Server !');
});

app.use(function(req,res){
	res.sendStatus(404);
})


app.listen(port, function(){
	console.log('server is running on port:'+port);
});



