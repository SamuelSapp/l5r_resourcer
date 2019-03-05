var diceEmotes = {}

function loadEmotes(emojis) {
	diceEmotes = {
		1:emojis.find(emoji => emoji.name === "black"),
		2:emojis.find(emoji => emoji.name === "blackot"),
		3:emojis.find(emoji => emoji.name === "blacko"),
		4:emojis.find(emoji => emoji.name === "blackst"),
		5:emojis.find(emoji => emoji.name === "blacks"),
		6:emojis.find(emoji => emoji.name === "blacket"),
		7:emojis.find(emoji => emoji.name === "white"),
		8:emojis.find(emoji => emoji.name === "white"),
		9:emojis.find(emoji => emoji.name === "whiteo"),
		10:emojis.find(emoji => emoji.name === "whiteo"),
		11:emojis.find(emoji => emoji.name === "whiteo"),
		12:emojis.find(emoji => emoji.name === "whitest"),
		13:emojis.find(emoji => emoji.name === "whitest"),
		14:emojis.find(emoji => emoji.name === "whites"),
		15:emojis.find(emoji => emoji.name === "whites"),
		16:emojis.find(emoji => emoji.name === "whiteso"),
		17:emojis.find(emoji => emoji.name === "whiteet"),
		18:emojis.find(emoji => emoji.name === "whitee"),
		expsuccess:emojis.find(emoji => emoji.name === "expsuccess"),
		success:emojis.find(emoji => emoji.name === "success"),
		opportunity:emojis.find(emoji => emoji.name === "opportunity"),
		strife:emojis.find(emoji => emoji.name === "strife")
	};
}

function newRoll(rollType, command) {
	var numWhite = 0;
	var numBlack = 0;
	
	if (rollType == "strung") {
		for (let i = 0; i < command.length; i++) {
			switch (command.charAt(i)) {
				case 'w':
				case 's':
				numWhite++;
				break;
				case 'b':
				case 'r':
				numBlack++;
				break;
				default:
				break;
			}
		}
	} else if (rollType == "counted") {
		var diceSplits = command.replace(/[0-9]+[brsw]/g, "-$&").substr(1).split("-");
		diceSplits.forEach(function(item) {
			var die = item.slice(-1);
			switch(die) {
				case 'w':
				case 's':
				numWhite += parseInt(item, 10);
				break;
				case 'b':
				case 'r':
				numBlack += parseInt(item, 10);
				break;
				default:
				break;
			}
		});
	}
	
	var rollArray = [];
	
	for (i = 0; i < numBlack; i++) {
		rollArray.push(rollDie("black"));
	}
	for (i = 0; i < numWhite; i++) {
		rollArray.push(rollDie("white"));
	}
	
	return parseRollResults(rollArray);
};

function keep(command, rollArray) {
	var newRollArray = []
	for (let i = 0; i < command.length; i++) {
		let x = parseInt(command.charAt(i));
		if (x <= rollArray.length) {
			newRollArray.push(rollArray[x-1]);
		}
	}
	
	return parseRollResults(newRollArray);
};

function add(command, rollType, rollArray) {
	var numWhite = 0;
	var numBlack = 0;
	
	if (rollType == "strung") {
		for (let i = 0; i < command.length; i++) {
			switch (command.charAt(i)) {
				case 'w':
				case 's':
				numWhite++;
				break;
				case 'b':
				case 'r':
				numBlack++;
				break;
				default:
				break;
			}
		}
	} else if (rollType == "counted") {
		var diceSplits = command.replace(/[0-9]+[brsw]/g, "-$&").substr(1).split("-");
		diceSplits.forEach(function(item) {
			var die = item.slice(-1);
			switch(die) {
				case 'w':
				case 's':
				numWhite += parseInt(item, 10);
				break;
				case 'b':
				case 'r':
				numBlack += parseInt(item, 10);
				break;
				default:
				break;
			}
		});
	}
	
	var index = rollArray.findIndex(function(item,index,array) {return item > 6;});
	for (var i = 0; i < numBlack; i++) {
		rollArray.splice(index, 0, rollDie("black"));
	}
	for (var i = 0; i < numWhite; i++) {
		rollArray.push(rollDie("white"));
	}
	
	return parseRollResults(rollArray);
};

function reroll(command, rollArray) {
	for (let i = 0; i < command.length; i++) {
		let x = parseInt(command.charAt(i));
		if (x <= rollArray.length) {
			if (rollArray[x-1] <= 6) {
				rollArray[x-1] = rollDie("black");
			} else {
				rollArray[x-1] = rollDie("white");
			}
		}
	}
	
	return parseRollResults(rollArray);
};

function parseRollResults(rollArray) {
	var diceStr = "";
	var resultStr = "";
	var success = 0;
	var expsuccess = 0;
	var opportunity = 0;
	var strife = 0;
	
	rollArray.forEach(function(item, index, array) {
		diceStr += diceEmotes[item];
		success += diceDetails[item].success;
		expsuccess += diceDetails[item].expsuccess;
		opportunity += diceDetails[item].opportunity;
		strife += diceDetails[item].strife;
	});
	
	if (expsuccess > 0) {
		resultStr += diceEmotes.expsuccess + expsuccess.toString();
	};
	if (success > 0) {
		resultStr += diceEmotes.success + success.toString();
	};
	if (opportunity > 0) {
		resultStr += diceEmotes.opportunity + opportunity.toString();
	};
	if (strife > 0) {
		resultStr += diceEmotes.strife + strife.toString();
	};
	
	return {
		rollArray: rollArray,
		diceStr: diceStr,
		resultStr: resultStr,
		success: success,
		expsuccess: expsuccess,
		opportunity: opportunity,
		strife: strife
	};
};

function rollDie(dieType) {
	if (dieType == "black") {
		return randBetween(1,6);
	} else if (dieType == "white") {
		return randBetween(7,18);
	} else {
		return 0;
	}
}

function randBetween(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

var rollResults = {
	prototype: {
		rollArray: [],
		diceStr: "",
		resultStr: "",
		success: 0,
		expsuccess: 0,
		opportunity: 0,
		strife: 0
	}
};

var diceDetails = {
	1: {success: 0, expsuccess: 0, opportunity: 0, strife: 0},
	2: {success: 0, expsuccess: 0, opportunity: 1, strife: 1},
	3: {success: 0, expsuccess: 0, opportunity: 1, strife: 0},
	4: {success: 1, expsuccess: 0, opportunity: 0, strife: 1},
	5: {success: 1, expsuccess: 0, opportunity: 0, strife: 0},
	6: {success: 1, expsuccess: 1, opportunity: 0, strife: 1},
	7: {success: 0, expsuccess: 0, opportunity: 0, strife: 0},
	8: {success: 0, expsuccess: 0, opportunity: 0, strife: 0},
	9: {success: 0, expsuccess: 0, opportunity: 1, strife: 0},
	10: {success: 0, expsuccess: 0, opportunity: 1, strife: 0},
	11: {success: 0, expsuccess: 0, opportunity: 1, strife: 0},
	12: {success: 1, expsuccess: 0, opportunity: 0, strife: 1},
	13: {success: 1, expsuccess: 0, opportunity: 0, strife: 1},
	14: {success: 1, expsuccess: 0, opportunity: 0, strife: 0},
	15: {success: 1, expsuccess: 0, opportunity: 0, strife: 0},
	16: {success: 1, expsuccess: 0, opportunity: 1, strife: 0},
	17: {success: 1, expsuccess: 1, opportunity: 0, strife: 1},
	18: {success: 1, expsuccess: 1, opportunity: 0, strife: 0}
};

exports.loadEmotes = loadEmotes;
exports.rollResults = rollResults;
exports.newRoll = newRoll;
exports.keep = keep;
exports.add = add;
exports.reroll = reroll;