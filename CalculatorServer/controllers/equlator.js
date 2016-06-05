
var priority =  { '(':0, ')':1, '+' : 2, '-': 2, '/':3, '*':3, 'number':4};
var postfix = [];
var tempStack = [];


function convertToPostFix(equation){
	var index = 0;
	var equationLength = equation.length;
	var decimalPointExists = false;
    var isInvalid = false;
	while(index < equationLength && !isInvalid)
	{
		var character = equation[index];
		var characterCode = equation.charCodeAt(index);
		console.log(character + ", code : "+characterCode);

		if(characterCode === 42 || characterCode === 43  || 
		   characterCode === 45 || characterCode === 47 ) /* operators */
		{
			//reset deciaml point
			decimalPointExists = false;

			if(tempStack != null && tempStack.length>0)
			{
				while(tempStack.length >0 && tempStack[tempStack.length-1].priority >= priority[character])
				{
					var item = tempStack.pop();
					postfix.push(item);
					
				}
			}
			var operator = {
					value : character,
					priority: priority[character],
					isOperator: true
				}
			console.log("it's operator:");
			console.log(operator);
			tempStack.push(operator);
		}
		else if(characterCode == 40) /* ( */{
			//reset deciaml point
			decimalPointExists = false;

			tempStack.push({
				value : character,
				priority: priority[character],
				isOperator: true
			})
		}
		else if(characterCode == 41){
			//reset deciaml point
			decimalPointExists = false;

			var foundOpeningParanthesis = false;
			console.log(') found');
			console.log(tempStack);
			while(tempStack.length >0  && !foundOpeningParanthesis)
					{
						var item = tempStack.pop();
						
						if(item.value ==='(') /*break the while loop*/
							foundOpeningParanthesis= true;
						else
							postfix.push(item);
						
					}
		}
		else if ((characterCode>=48 && characterCode <=57)|| characterCode ===46) /* numbers */
		{
			//if top of postfix is an operand consume . and  decimaldoesnt exist change its priority to decimal
			// if top is decimal dont add it ; its invalid
			// if top is operand add a 0. to top
			var top = null;
			var postfixLength = postfix.length;

			var operand = {
				value : character,
				priority: priority['number'],
				isOperator: false
			}

			if(postfix!= null && postfixLength > 0){
				top = postfix[postfixLength-1];
			}
			
			if(characterCode === 46){
				if(top!=null)
				{  
					if(!decimalPointExists){
						if(top.isOperator){
							operand.value = '0.';
							decimalPointExists = true;
						}
						else{

							operand.value = top.value +'.';
							decimalPointExists = true;
						}
						postfix.pop();
					}else{
						//invalid entry
					}
				}
				else{
					if(!decimalPointExists){
						operand.value = '0.';
						decimalPointExists = true;
					}
					else{
						//invalid entry
					}
				}
			}
			else if(decimalPointExists){
				operand.value = top.value + character;
				postfix.pop();
			}
			
			console.log("it's operand:");
			console.log(operand);
		    postfix.push(operand);
		    

		}
		else{
			console.log('else');
			isInvalid = true;
			break;
		}
		//TODO: skip space or return invalid if there are invalid chcracters
	index+=1;
		
	}
	if(!isInvalid)
	{
		while(tempStack!=null && tempStack.length>0)
		postfix.push(tempStack.pop());
		console.log("---");
		console.log(postfix);
		console.log("----");
		console.log(tempStack);
	}
	var result = { result: postfix,
				   isInvalid: isInvalid};
				   return result;

}


module.exports.process = function(equation,callback){
	postfix = [];
    tempStack = [];
	console.log('started processing ...'+equation);
	var result = convertToPostFix(equation);
	console.log(result);
	if(result.isInvalid)
		callback("invalid Entry", []);
	else
		callback(null,result.result)
}