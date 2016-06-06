//bignumber library
var BigNumber = require('bignumber.js');

var priority =  { '(':0, ')':1, '+' : 2, '-': 2, '/':3, '*':3, 'number':4};

var parenthesisStack =[];
var CategoryEnum = {OPERATOR: 0 , NUMBER:1, DECIMAL:2 , 
					OPEN_PARENTHESIS: 3, CLOSE_PARENTHESIS:4};

function getTopOfStack(stack){
	var top = null;
	if(stack !=null && stack.length > 0)
        top = stack[stack.length-1];
    return top;
}

/* Finds the category of character  based on its Ascii code */
function getCategory(characterCode){
	
	var category = null;

	/* Ascii codes for + - * / */
	if(characterCode === 42 || characterCode === 43  || 
		characterCode === 45 || characterCode === 47 ){
		category = CategoryEnum.OPERATOR;
	}
	/* Ascii codes for 0 to 9 */
	else if(characterCode >= 48 && characterCode <= 57){
		category = CategoryEnum.NUMBER;
	}
	/* Ascii code for . decimal */
	else if(characterCode === 46){
		category = CategoryEnum.DECIMAL;
	}
	/* Ascii codes for ( */
	else if(characterCode === 40){
		category = CategoryEnum.OPEN_PARENTHESIS;
	}
	/* Ascii codes for ) */
	else if(characterCode === 41){
		category = CategoryEnum.CLOSE_PARENTHESIS;
	}
	return category;
} 

/*validate character */
function validate(topPostfix, character, characterCategory,decimalPointExists){
	var isInvalid = false;
	//checking invalid character code
	if(characterCategory == null )
		isInvalid = true;
	else{
		
		/*if new characterCode is not a number nor ( nor . */
		if(topPostfix == null)
		{
			if(characterCategory != CategoryEnum.NUMBER && 
		   	   characterCategory != CategoryEnum.OPEN_PARENTHESIS  &&
		   	   characterCategory != CategoryEnum.DECIMAL )
			{ 
				/*
				  if stack is empty only allow . or numbers or ( to enter
				  if top is operator, dont allow a new operator or ) to enter
				 */
				if(character != '+' && character != '-' )
					isInvalid = true;
			}
		}
		else
		{
			if(characterCategory === CategoryEnum.CLOSE_PARENTHESIS)
			{
				/*if character is ")" , there should be 1 "(" in parenthesisStack 
				  otherwise it's invalid */
				if(parenthesisStack ==null || parenthesisStack.length == 0){
					isInvalid = true;
				}
			}
			/*if character is ")" , there should be 1 "(" in parenthesisStack 
			  otherwise it's invalid */
			if(characterCategory === CategoryEnum.DECIMAL && decimalPointExists)
			{
				isInvalid = true;
			}
			else if(characterCategory === CategoryEnum.OPERATOR && topPostfix.value === '.')
			{
				isInvalid = true;
			}
		}
	}
	return isInvalid;

}

function convertToPostfix(equation){
	var index = 0;
	var equationLength = equation.length;
	var decimalPointExists = false;
    var isInvalid = false;
    var postfix = [];
	var helperStack = [];
	
	while(index < equationLength && !isInvalid)
	{
		var character = equation[index];
		var characterCode = equation.charCodeAt(index);
		var characterCategory = getCategory(characterCode);
		var topPostfix = getTopOfStack(postfix);
		var topHelper = getTopOfStack(helperStack);
		isInvalid = validate(topPostfix, character, characterCategory, decimalPointExists);
		if(!isInvalid)
		{

			/* operators + - / * */
			if(characterCategory === CategoryEnum.OPERATOR) 
			{
				//reset deciaml point
				decimalPointExists = false;

				//invalid cases of mutiple operators in a row ++ or *+
				var previousCharacterCategory = getCategory(equation.charCodeAt(index-1));
				if(previousCharacterCategory === CategoryEnum.OPERATOR)
				{	
					isInvalid = true;
				}
				else
				{
					/*covering (+ (- */
					if(previousCharacterCategory === CategoryEnum.OPEN_PARENTHESIS )
					{
						if(equationLength > index+1)
						{
							var nextCharacterCategory = getCategory(equation.charCodeAt(index+1))
							if(character === "+" || character == "-")
							{
								//push the next char from equation to postfix and apply - or + to it
								if(nextCharacterCategory === CategoryEnum.NUMBER || nextCharacterCategory === CategoryEnum.DECIMAL)
								{
									if(character === "-")
									{
										character = character + equation[index+1];
										if(character === '.')
											character = '0.';
										var operand = {
											value : character,
											priority: priority['number'],
											isOperator: false
										}
										postfix.push(operand);
										
										index+=1;
									}
								}
								else
									isInvalid = true;
							}
							else
							{
								isInvalid = true;
							}
						}
						else
						{
							isInvalid = true;
						}
					}
					else
					{
						if(helperStack != null && helperStack.length>0)
						{
							while(helperStack.length >0 && helperStack[helperStack.length-1].priority >= priority[character])
							{
								var item = helperStack.pop();
								postfix.push(item);	
							}
						}
						var operator = {
							value : character,
							priority: priority[character],
							isOperator: true
						}
						helperStack.push(operator);
					}
				}
			}
			/* push it to helperStack */
			else if(characterCategory === CategoryEnum.OPEN_PARENTHESIS) /* ( */
			{
				//reset deciaml point
				decimalPointExists = false;
				parenthesisStack.push('(');

				helperStack.push({
					value : character,
					priority: priority[character],
					isOperator: true
				})
			}
			/* pop items from helperStack and push them to postfix array until it reaches a ( */
			else if(characterCategory === CategoryEnum.CLOSE_PARENTHESIS)
			{
				//reset deciaml point
				decimalPointExists = false;

				var foundOpeningParenthesis  = false;

				while(helperStack.length >0  && !foundOpeningParenthesis )
				{
					var item = helperStack.pop();
					
					if(item.value ==='(') /*break the while loop*/
					{	
						foundOpeningParenthesis = true;
						/*
						  parenthesis  stack should already be in correct state
						  otheriwise validation would fail
						  */
						parenthesisStack.pop();
					}
					else
						postfix.push(item);
					
				}
			}
			/* push it to postfix */
			else if (characterCategory === CategoryEnum.NUMBER ||
					 characterCategory === CategoryEnum.DECIMAL) /* numbers or decimal point */
			{
				/*if top of postfix is an operand consume . and  decimaldoesnt exist change its priority to decimal
				 if top is decimal dont add it ; its invalid
				 if top is operand add a 0. to top */
				var top = null;
				var previousCharacterCategory = null;
				var postfixLength = postfix.length;
				var operand = {
					value : character,
					priority: priority['number'],
					isOperator: false
				};

				/* read the top of postfix array */
				if(postfix!= null && postfixLength > 0)
				{
					top = postfix[postfixLength-1];
				}
				/*if last character is a number or decimal, append current character to top*/
				if(characterCategory === CategoryEnum.NUMBER)
				{
					if(index > 0)
					{
						previousCharacterCategory = getCategory(equation.charCodeAt(index-1));
						if(previousCharacterCategory === CategoryEnum.NUMBER || 
						   previousCharacterCategory === CategoryEnum.DECIMAL )
						{
							operand.value = top.value + character;
							
							if(previousCharacterCategory === CategoryEnum.DECIMAL){
								decimalPointExists = true;
							}
							postfix.pop();
						}
					}
				}
				/* if it's a decimal point  check its previous character category */
				else if(characterCategory === CategoryEnum.DECIMAL)
				{
					/* if there is a number/operator/( before . */
					if(top!=null)
					{  
						if(!decimalPointExists)
						{
							var previousCharacterCategory = getCategory(equation.charCodeAt(index-1));
							if(previousCharacterCategory === CategoryEnum.OPEN_PARENTHESIS ||
								previousCharacterCategory === CategoryEnum.OPERATOR)
							{
								/* if therese is a ( or an operator before . convert it to 0. */
								operand.value = '0.';
								decimalPointExists = true;
							}
							else
							{
								/* if therese is a number before . append . to the end of that number */
								operand.value = top.value +'.';
								decimalPointExists = true;
								postfix.pop();
							}
						}
						else
						{
							isInvalid=true;
						}
					}
					/* if therese is no number/operator/( before . convert it to 0. */
					else
					{
						if(!decimalPointExists){
							operand.value = '0.';
							decimalPointExists = true;
						}
					}
				}
				else if(decimalPointExists)
				{
					operand.value = top.value + character;
					decimalPointExists = true;
					postfix.pop();
				}
			    postfix.push(operand);
			}
			index+=1;
		}
		else
		{
			/* catching invalid cases */
			break;
		}
	}
	if(!isInvalid)
	{
		/*invalid: 2 + ((2 +3) */
		if(parenthesisStack	!= null && parenthesisStack.length > 0)
		{	
			isInvalid = true;
		}
		else
		{
			/*transfer remaining operators from helperStack to postfix */
			while(helperStack!=null && helperStack.length>0)
				postfix.push(helperStack.pop());
			console.log("--POSTFIX--");
			console.log(postfix);
			console.log("----");
		}
	}
	var result = { result: postfix,
				   isInvalid: isInvalid};
	return result;
}

function calculatePostfix(postfix){
	var result = [];
	if(postfix != null && postfix.length > 0)
	{
		var len = postfix.length;
		for(var index=0; index< len ; index++){
			var token = postfix[index];
			/*
				if token is operand, push it to stakc
				else pop 2 operand from stack, apply the operator and push the result
			*/
			if(!token.isOperator)
			{
				result.push(token.value);
			}
			else
			{
				var operand2 = result.pop();
				var operand1 = result.pop();
				var temp = 0;

				if(isFinite(operand2))
				{
					if(!isFinite(operand1)){
						if(token.value === '+')
							result.push(operand2);
						else if (token.value === '-')
						{
							temp = (new BigNumber(operand2)).neg();
							result.push(temp);
						}
					}
					else
					{
						/*both finite values */
						operand1 = new BigNumber(operand1);
						operand2 = new BigNumber(operand2);

						switch(token.value)
						{
							case '+':
								/*if(typeof operand1 === undefined)
									temp = BigNumber(operand2);
								else*/
								temp = operand1.plus(operand2);
								break;
							case '-':
								/*if(typeof operand1 === undefined)
									temp = -1 * BigNumber(operand2).mul(-1);
								else*/
								temp = operand1.minus(operand2);
								break;
							case '*':
								temp = operand1.times(operand2);
								break;
							case '/':

								temp = operand1.dividedBy(operand2);
								break;
							default:
								break;
						}
						console.log(operand1+ " "+token.value+" "+ operand2 +" = "+temp);
						result.push(temp);
					}
				}
				else{
					result.push(Infinity)
				}
			}
		}
	}
	console.log("---RESULT---");
	console.log(result);
	return result;
}

/*Process: 
 1- converts equation string from Infix to Postfix 
 2- passes postfix to calculatePostFix 
 */
module.exports.process = function(equation,callback){
    parenthesisStack= [];
	console.log('started processing ...'+equation);
	var postfix = convertToPostfix(equation);

	if(postfix.isInvalid)
		callback("invalid Entry", '');
	else
	{
		console.log("passing it to Calculator");
		var finalResult = calculatePostfix(postfix.result);
		if(finalResult!=null && finalResult.length>0)
		{
			if(isFinite(finalResult[0]))
		    	callback(null,finalResult[0]);
		    else
		    	callback(null,'Infinity');
			
		}
		
	}
}