var async = require('./async-master');
var fs = require('fs');
var path = require('path');
/*
process.stdin.resume();
process.stdin.once('data',function(data){
	console.log("You said '" + data + "'");
	process.exit();
});
*/

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();
if(dd<10) {
    dd='0'+dd
} 
if(mm<10) {
    mm='0'+mm
}
var dateWithDots = mm + '.' + dd +'.' + yyyy;

var askQuestion = function(question,acceptableAnswers,doSomething){
		console.log("\n" + question);
		function verifyAnswer(){
			process.stdin.resume();
			process.stdin.once('data', function(data){
				data = data.toString().toLowerCase().trim();
				function finish(){
					answers.push([question,data]);
					process.stdin.pause();
					doSomething();
				};
				if(acceptableAnswers.indexOf(data) != -1){
					finish();
				} else {
					console.log("\nSorry, acceptable answers look like this:\n")
					acceptableAnswers.slice(0,25).forEach(function(x){console.log("\t*",x);});
					console.log('\nPlease enter a new answer.');
					verifyAnswer();
				}
			});
		};
		verifyAnswer();
};
const aQ = askQuestion;


var answers = [];


function readAnswers(question){
	return answers.filter(function(x){return x[0]===question});
}

function checkForAnswer(question,answer){
	if(answer.indexOf(readAnswers(question)[0][1]) != -1){
		return true;
	}
	else{
		return false;
	}
}

function getAnswer(question){
	return answers.filter(function(x){return x[0]===question})[0][1];	
}

function checkDREG(){
	return checkForAnswer('What region(s) does this request affect?',regions.slice(0,3).concat(regions.slice(7,9)));
}
function checkWREG(){
	return checkForAnswer('What region(s) does this request affect?',regions.slice(3,7).concat(regions.slice(7,9)));
}
function checkAuth(){
	return checkForAnswer('Does this request affect an auth rule?',yesOrNo.slice(0,2));
}
function checkCase(){
	return checkForAnswer('Does this request affect a case rule?',yesOrNo.slice(0,2));
}
function checkQueue(){
	return checkForAnswer('Does this request affect a queue?',yesOrNo.slice(0,2));
}


var regions = ['d','DREG','DREG1','w','WREG','LCREG','LREG','b','both']; // length: 9 // --Slice-- DREG1 [0:3] // WREG [3:7] // Both [7:9]
var yesOrNo = ['y','yes','n','no'];
var range = (l,r) => new Array(r - l).fill().map((_,k) => k + l); // online boilerplate for range


async.series([
	function(callback){aQ('What is the number of your request?',range(1,9999).map(function(x){return x.toString();}),callback)},
	function(callback){aQ('What region(s) does this request affect?',regions,callback)},
	function(callback){aQ('Does this request affect an auth rule?',yesOrNo,callback)},
	function(callback){aQ('Does this request affect a case rule?',yesOrNo,callback)},
	function(callback){aQ('Does this request affect a queue?',yesOrNo,callback)},
	function(callback){
		if(checkDREG()===true && checkAuth()===true){
			aQ('What is the number of your DREG Auth Rule?',range(1,100).map(function(x){return x.toString();}),callback);
		} else {
			callback();
		}
	},
	function(callback){
		if(checkDREG()===true && checkCase()===true){
			aQ('What is the number of your DREG Case Rule?',range(1,100).map(function(x){return x.toString();}),callback);
		} else {
			callback();
		}
	},
	function(callback){
		if(checkDREG()===true && checkQueue()===true){
			aQ('What is the name of your DREG Queue?',fs.readFileSync("C:\\Users\\USER\\Desktop\\NodeTools\\queueList.txt").toString().toLowerCase().split("\r\n"),callback);
		} else {
			callback();
		}
	},
	function(callback){
		if(checkWREG()===true && checkAuth()===true){
			aQ('What is the number of your WREG Auth Rule?',range(1,100).map(function(x){return x.toString();}),callback);
		} else {
			callback();
		}
	},
	function(callback){
		if(checkWREG()===true && checkCase()===true){
			aQ('What is the number of your WREG Case Rule?',range(1,100).map(function(x){return x.toString();}),callback);
		} else {
			callback();
		}
	},
	function(callback){
		if(checkWREG()===true && checkQueue()===true){
			aQ('What is the name of your WREG Queue?',range(1,100).map(function(x){return x.toString();}),callback);
		} else {
			callback();
		}
	}
		],function(){
			var filepath = ["C:\\Users\\USER\\Desktop\\Working\\SMCRFA-",getAnswer('What is the number of your request?')].join('');
			function dirExists(){
				try{
					fs.accessSync(filepath);
					return true;
				} catch(e) {
					return false;
				}
			};
			function filemaker(dirOrFile,condition,path){
				if(dirOrFile === 'dir' && condition === true){
					fs.mkdirSync(path);
				}
				if(dirOrFile === 'file' && condition === true){
					fs.writeFileSync(path);
				}
				return;
			};
			if(!dirExists()){
				filemaker('dir',true,filepath);
				filemaker('file',true,path.join(filepath,'Core Logic.vsd'));
				if(checkDREG()){
					var reqNumber = getAnswer('What is the number of your request?');
					filemaker('dir',true,path.join(filepath,'DREG1 Validation'));
					filemaker('file',true,path.join(filepath,'APDFL Timestamp.JPG'));
					filemaker('file', true, path.join(filepath, 'DREG1 Validation', 'Logical Validation.xlsx'));
					if(checkAuth()){
						var authRuleNumber = getAnswer('What is the number of your DREG Auth Rule?');
						filemaker('file',true,path.join(filepath,'DREG1 - Auth Rule ' + authRuleNumber + ' - ' + dateWithDots + ' - ' + 'SMCRFA-' + reqNumber + '.pdf'));
						filemaker('file',true,path.join(filepath,'DREG1 Validation','Auth Rule ' + authRuleNumber + ' Validation.xlsx'));
					}
					if(checkCase()){
						var caseRuleNumber = getAnswer('What is the number of your DREG Case Rule?');
						filemaker('file',true,path.join(filepath,'DREG1 - Case Rule ' + caseRuleNumber + ' - ' + dateWithDots + ' - ' + 'SMCRFA-' + reqNumber + '.pdf'));
						filemaker('file',true,path.join(filepath, 'DREG1 Validation', 'Case Rule ' + caseRuleNumber + ' Validation.xlsx'));
					}
					if(checkQueue()){
						var queueName = getAnswer('What is the name of your DREG Queue?');
						filemaker('file',true,path.join(filepath,'DREG1 - Queue: ' + queueName + ' - ' + dateWithDots + ' - ' + 'SMCRFA-' + reqNumber + '.pdf'));
					}
				};
				if(checkWREG()){
					var reqNumber = getAnswer('What is the number of your request?');
					filemaker('dir',true,path.join(filepath,'WREG Validation'));
					filemaker('file',true,path.join(filepath,'PRAFL Timestamp.JPG'));
					filemaker('file', true, path.join(filepath, 'WREG Validation', 'Logical Validation.xlsx'));				
					if(checkAuth()){
						var authRuleNumber = getAnswer('What is the number of your WREG Auth Rule?');
						filemaker('file',true,path.join(filepath,'WREG - Auth Rule ' + authRuleNumber + ' - ' + dateWithDots + ' - ' + 'SMCRFA-' + reqNumber + '.pdf'));
						filemaker('file',true,path.join(filepath, 'WREG Validation', 'Auth Rule ' + authRuleNumber + ' Validation.xlsx'));
					}
					if(checkCase()){
						var caseRuleNumber = getAnswer('What is the number of your WREG Case Rule?');
						filemaker('file',true,path.join(filepath,'WREG - Case Rule ' + caseRuleNumber + ' - ' + dateWithDots + ' - ' + 'SMCRFA-' + reqNumber + '.pdf'));
						filemaker('file',true,path.join(filepath, 'WREG Validation', 'Case Rule ' + caseRuleNumber + ' Validation.xlsx'));
					}
					if(checkQueue()){
						var queueName = getAnswer('What is the name of your WREG Queue?');
						filemaker('file',true,path.join(filepath,'WREG - Queue: ' + queueName + ' - ' + dateWithDots + ' - ' + 'SMCRFA-' + reqNumber + '.pdf'));
					}
				};
				console.log('\nThanks, we\'re done.\nYour files have been written.\n');
			} else {
				console.log('It looks like files already exist for this strategy. Exiting.....');
			}
		});
