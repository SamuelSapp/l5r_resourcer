const kata = require("./kata.json");
const invocations = require("./invocations.json");
const kiho = require("./kiho.json");
const maho = require("./maho.json");
const ninjutsu = require("./ninjutsu.json");
const rituals = require("./rituals.json");
const shuji = require("./shuji.json");
var mysql = require("mysql");
const mysql_config = require("./mysql_config.json");

var characters = {};

var con = mysql.createConnection(mysql_config);

function mysql_connect () {
	con.connect(function(err) {
		if (err) throw err;
		loadCharacterData();
	});
}

function createChar(username, characterID) {
	//-1 = unknown error
	//-2 = characterID already taken
	//-3 = entered characterID is a number
	//1 = success
	var newCharacter = Object.assign({}, charPrototype);
	
	if (isNaN(characterID)) {
		if (username in characters) {
			//User has accountdata
			if (!(characterID in characters[username])) {
				//Not User"s first character, but new character
				newCharacter["username"] = username;
				newCharacter["charID"] = characterID;
				characters[username][characterID] =  newCharacter;
				
				con.query("INSERT INTO characters SET ?", newCharacter, function (err, result) {
					if (err) throw err;
					setActive(username, characterID);
					characters[username][characterID]["techniques"] = parseJSON(characters[username][characterID]["techniques"]);
				});
				return 1;
			} else {
				//Error - CharacterID already taken
				return -2;
			}
		} else {
			//User has no accountdata
			newCharacter["username"] = username;
			newCharacter["charID"] = characterID;
			characters[username] = {[characterID]:newCharacter};
			
			con.query("INSERT INTO characters SET ?", newCharacter, function (err, result) {
				if (err) throw err;
				setActive(username, characterID);
				characters[username][characterID]["techniques"] = parseJSON(characters[username][characterID]["techniques"]);
			});
			return 1;
		}
	} else {
		//entered characterID is a number
		return -3;
	}
	return -1;
};

function deleteChar(username, characterID) {
	if (username in characters) {
		if (!(characterID in characters[username])) {
			//CharacterID not present
			return -3;
		} else {
			//Delete the character
			if (characters[username][characterID]["isLocked"] == false) {
				delete characters[username][characterID];
				con.query("DELETE FROM characters WHERE (username, charID) = (?,?)", [username,characterID], function (err, result) {
					if (err) throw err;
				});
				return 1;
			} else {
				//character is locked
				return -4;
			}
		}
	} else {
		//User has no characters
		return -2;
	}
	return -1;
}

function list(username) {
	var characterList = "";
	if (username in characters) {
		Object.keys(characters[username]).forEach(function(characterID) {
			characterList += characters[username][characterID]["name"] + " -" + [characterID] + "\n";
		});
		return characterList;
	} else {
		//no characters
		return -1;
	}
}

function showChar(embed, username, characterID) {
	var charData = characters[username][characterID];
	embed.setAuthor(charData["name"])
	.setTitle("Air " + charData["air"] + " - Earth " + charData["earth"] + " - Fire " + charData["fire"] + " - Water " + charData["water"] + " - Void " + charData["void"])
	.setDescription("| Fatigue: " + charData["fatigue"] + "/" + (parseInt(charData["earth"]) + parseInt(charData["fire"]))*2 + " | Strife: " + charData["strife"] + "/" + (parseInt(charData["earth"]) + parseInt(charData["water"]))*2 + " | Focus: " + (parseInt(charData["air"]) + parseInt(charData["fire"])) + " | Vigilance: " + Math.ceil((parseFloat(charData["air"]) + parseFloat(charData["water"]))/2.0) + " | Void Points: " + charData["voidpoints"] + "/" + charData["void"] + " |\n| Honor: " + charData["honor"] + " | Glory: " + charData["glory"] + " | Status: " + charData["status"] + " |\n| Koku: " + charData["koku"] + " | Bu: " + charData["bu"] + " | Zeni: " +charData["zeni"] + " |")
	.addField("Martial Arts Skills", "M.A. [Melee]: " + charData["mamelee"] + "\nM.A. [Ranged]: " + charData["maranged"] + "\nM.A. [Unarmed]: " + charData["maunarmed"],true)
	.addField("Martial  Skills", "Fitness [Defense]: " + charData["fitness"] + "\nMeditation: " + charData["meditation"] + "\nTactics: " + charData["tactics"],true)
	.addField("Artisan Skills", "Aesthetics: " + charData["aesthetics"] + "\nComposition: " + charData["composition"] + "\nDesign: " + charData["design"] + "\nSmithing: " + charData["smithing"],true)
	.addField("Social Skills", "Command: " + charData["command"] + "\nCourtesy: " + charData["courtesy"] + "\nGames: " + charData["games"] + "\nPerformance:  " + charData["performance"],true)
	.addField("Scholar Skills", "Culture: " + charData["culture"] + "\nGovernment: " + charData["government"] + "\nSentiment: " + charData["sentiment"] + "\nTheology: " + charData["theology"] + "\nMedicine: " + charData["medicine"],true)
	.addField("Trade Skills", "Commerce: " + charData["commerce"] + "\nLabor: " + charData["labor"] + "\nSeafaring: " + charData["seafaring"] + "\nSkulduggery: " + charData["skulduggery"] + "\nSurvival: " + charData["survival"],true);
	
	var charTechs = charData["techniques"];
	Object.keys(charTechs).forEach(function(techType){
		if (Object.keys(charTechs[techType]).length > 0) {
			var fieldString = "";
			Object.keys(charTechs[techType]).forEach(function(technique){
				fieldString += charTechs[techType][technique] + "\n"; 
			});
			embed.addField(techniques[techType], fieldString, true);
		}
	});
	
	Object.keys(charData["notes"]).forEach(function(noteNum){
		embed.addField("Note " + noteNum, charData["notes"][noteNum], true);
	});
}

function lock(username, characterID) {
	if ((username in characters) && (characterID in characters[username])) {
		//character exists
		if (characters[username][characterID]["isLocked"] == false) {
			//character is unlocked
			characters[username][characterID]["isLocked"] = true;
			con.query("UPDATE characters SET isLocked = true WHERE (username, charID) = (?, ?)", [username, characterID], function (err, result) {
				if (err) throw err;
			});
			return 1;
		} else {
			//character is already locked
			return -3;
		}
		
	} else {
		//character does not exist
		return -2;
	}
	return -1;
}

function unlock(username, characterID) {
	if ((username in characters) && (characterID in characters[username])) {
		//character exists
		if (characters[username][characterID]["isLocked"] == false) {
			//character is already unlocked
			return -3;
		} else {
			//character is locked
			characters[username][characterID]["isLocked"] = false;
			con.query("UPDATE characters SET isLocked = false WHERE (username, charID) = (?, ?)", [username, characterID], function (err, result) {
				if (err) throw err;
			});
			return 1;
		}
		
	} else {
		//character does not exist
		return -2;
	}
	return -1;
}

function getActive(username) {
	var activeChar = ""
	if (username in characters) {
		Object.keys(characters[username]).forEach(function(characterID) {
			if (characters[username][characterID]["isActive"] == true) {
				activeChar = characterID;
			}
		});
		if (activeChar == "") {
			//didn"t find an active character
			return -2;
		} else {
			return activeChar;
		}
	} else {
		//user account doesn"t exist.
		return -1;
	}
}

function setActive(username, characterID) {
	//-1 = error
	//-2 = Character is not in the index
	//-3 = character is already active
	//1 = success
	if (username in characters) {
		if (!(characterID in characters[username])) {
			//Character listed is not in the index
			return -2;
		} else {
			//Found the character
			if (characters[username][characterID]["isActive"] == true) {
				//Character is already active
				return -3;
			} else {
				Object.keys(characters[username]).forEach(function(testID) {
					if (characters[username][testID]["isActive"] == true) {
						con.query("UPDATE characters SET isActive = false WHERE (username, charID) = (?, ?)", [username, testID], function (err, result) {
							if (err) throw err;
							characters[username][testID]["isActive"] == false;
						});
					}
				});
				characters[username][characterID]["isActive"] = true;
				con.query("UPDATE characters SET isActive = true WHERE (username, charID) = (?, ?)", [username, characterID], function (err, result) {
					if (err) throw err;
					characters[username][characterID]["isActive"] == true;
				});
				return 1;
			}
		}
	} else {
		//use account doesn"t exist
		return -2;
	}
	return -1; //error
}

function setValue(username, command, param) {
	//-1 = parameter not listed
	//-2 = invalid number command parameter
	//-3 = character is locked
	//-4 = no active character
	//-5 = non-number parameter too long
	var activeCharID = getActive(username);
	if ((activeCharID != -1) && (activeCharID != -2)) {
		//found character
		if (changeableparameters.includes(command)) {
			if (characters[username][activeCharID]["isLocked"] == false) {
				//character is unlocked
				if (numberparameters.includes(command)) {
					//command is a number
					param = parseInt(param);
					if ((onedigitparameters.includes(command)) && !(isNaN(param)) && (param.toString().length == 1)) {
						//valid single-digit command parameter
						con.query("UPDATE characters SET ?? = ? WHERE (username, charID) = (?, ?)", [command, param, username, activeCharID], function (err, result) {
							if (err) throw err;
						});
						characters[username][activeCharID][command] = param;
						return activeCharID;
					} else if ((twodigitparameters.includes(command)) && !(isNaN(param)) && (param.toString().length <= 2) && (param >= 0)) {
						//valid two-digit command parameter
						con.query("UPDATE characters SET ?? = ? WHERE (username, charID) = (?, ?)", [command, param, username, activeCharID], function (err, result) {
							if (err) throw err;
						});
						characters[username][activeCharID][command] = param;
						return activeCharID;
					} else if ((fourdigitparameters.includes(command)) && !(isNaN(param)) && (param.toString().length <= 4) && (param >= 0)) {
						//valid four-digit command parameter
						con.query("UPDATE characters SET ?? = ? WHERE (username, charID) = (?, ?)", [command, param, username, activeCharID], function (err, result) {
							if (err) throw err;
						});
						characters[username][activeCharID][command] = param;
						return activeCharID;
					} else {
						//invalid number parameter
						return -2;
					}
				} else {
					//command is not a number
					if (param.length <= 32) {
						//valid non-number parameter
						con.query("UPDATE characters SET ?? = ? WHERE (username, charID) = (?, ?)", [command, param, username, activeCharID], function (err, result) {
							if (err) throw err;
						});
						characters[username][activeCharID][command] = param;
						return activeCharID;
					} else {
						//parameter is too long
						return -5;
					}
				}
			} else {
				//character is locked
				return -3;
			}
		} else {
			//invalid parameter
			return -1;
		}
	} else {
		//couldn"t find an active character
		return -4;
	}
	
}

function addTech(username, param) {
	//string = success
	//-2 = error getting active character
	//-3 = param not valid technique
	//-4 = character already has technique
	var activeCharID = getActive(username);
	if ((activeCharID != -1) && (activeCharID != -2)) {
		if (characters[username][activeCharID]["isLocked"] == false) {
			var charTechs = characters[username][activeCharID]["techniques"];
			var techName = "";
			if (param in kata) {
				if (!(param in charTechs["kata"])) {
					charTechs["kata"][param] = kata[param]["title"];
					techName = kata[param]["title"];
				} else {
					return -4
				}
			} else if (param in invocations) {
				if (!(param in charTechs["invocations"])) {
					charTechs["invocations"][param] = invocations[param]["title"];
					techName = invocations[param]["title"];
				} else {
					return -4
				}
			} else if (param in kiho) {
				if (!(param in charTechs["kiho"])) {
					charTechs["kiho"][param] = kiho[param]["title"];
					techName = kiho[param]["title"];
				} else {
					return -4
				}
			} else if (param in maho) {
				if (!(param in charTechs["maho"])) {
					charTechs["maho"][param] = maho[param]["title"];
					techName = maho[param]["title"];
				} else {
					return -4
				}
			} else if (param in ninjutsu) {
				if (!(param in charTechs["ninjutsu"])) {
					charTechs["ninjutsu"][param] = ninjutsu[param]["title"];
					techName = ninjutsu[param]["title"];
				} else {
					return -4
				}
			} else if (param in rituals) {
				if (!(param in charTechs["rituals"])) {
					charTechs["rituals"][param] = rituals[param]["title"];
					techName = rituals[param]["title"];
				} else {
					return -4
				}
			} else if (param in shuji) {
				if (!(param in charTechs["shuji"])) {
					charTechs["shuji"][param] = shuji[param]["title"];
					techName = shuji[param]["title"];
				} else {
					return -4
				}
			} else {
				//param not a valid technique
				return -3;
			}
			con.query("UPDATE characters SET techniques = ? WHERE (username, charID) = (?, ?)", [stringifyJSON(characters[username][activeCharID]["techniques"]), username, activeCharID], function (err, result) {
				if (err) throw err;
			});
			return techName;
		} else {
			//error character locked
			return -5;
		}
	} else {
		//error getting active character
		return -2;
	}
}

function removeTech(username, param) {
	//string = success
	//-2 = error getting active character
	//-3 = character doesn't have param
	var activeCharID = getActive(username);
	if ((activeCharID != -1) && (activeCharID != -2)) {
		if (characters[username][activeCharID]["isLocked"] == false) {
			var charTechs = characters[username][activeCharID]["techniques"];
			var techName = "";
			Object.keys(charTechs).forEach(function(techType){
				if (param in charTechs[techType]) {
					techName = charTechs[techType][param];
					delete charTechs[techType][param];
					characters[username][activeCharID]["techniques"] = charTechs;
					con.query("UPDATE characters SET techniques = ? WHERE (username, charID) = (?, ?)", [stringifyJSON(characters[username][activeCharID]["techniques"]), username, activeCharID], function (err, result) {
						if (err) throw err;
					});
				}
			});
			if (techName == "") {
				return -3;
			} else {
				return techName;
			}
		} else {
			//error character locked
			return -4;
		}
		
	} else {
		//error getting active character
		return -2;
	}
}

function addNote(username, param) {
	var activeCharID = getActive(username);
	if ((activeCharID != -1) && (activeCharID != -2)) {
		if (characters[username][activeCharID]["isLocked"] == false) {
			var i = 1;
			var looking = true;
			while ((i <= 10) && (looking)) {
				if (!(i in characters[username][activeCharID]["notes"])) {
					looking = false;
					characters[username][activeCharID]["notes"][i] = param;
					con.query("UPDATE characters SET notes = ? WHERE (username, charID) = (?, ?)", [stringifyJSON(characters[username][activeCharID]["notes"]), username, activeCharID], function (err, result) {
						if (err) throw err;
					});
					return i;
				}
			}
			if (looking) {
				//error already have 10 notes
				return -4;
			}
		} else {
			//error character locked
			return -3;
		}
	} else {
		//error getting active character
		return -2;
	}
	return -1;
}

function setNote(username, param) {
	var secondSplitIndex = param.indexOf(" ");
	if (secondSplitIndex != -1) {
		var noteNum = parseInt(param.substring(0,secondSplitIndex));
		param = param.substring(secondSplitIndex+1);
		if (!(isNaN(noteNum)) && (noteNum <= 10) && (noteNum >= 1)) {
			var activeCharID = getActive(username);
			if ((activeCharID != -1) && (activeCharID != -2)) {
				if (characters[username][activeCharID]["isLocked"] == false) {
					characters[username][activeCharID]["notes"][noteNum] = param;
					con.query("UPDATE characters SET notes = ? WHERE (username, charID) = (?, ?)", [stringifyJSON(characters[username][activeCharID]["notes"]), username, activeCharID], function (err, result) {
						if (err) throw err;
					});
					return noteNum;
				} else {
					//error character locked
					return -3;
				}
			} else {
				//error getting active character
				return -2;
			}
		} else {
			//error note number is invalid
			return -4;
		}
	} else {
		//too few parameters
		return -5;
	}
	return -1;
}

function removeNote(username, param) {
	var noteNum = parseInt(param);
	if (!(isNaN(noteNum)) && (noteNum <= 10) && (noteNum >= 1)) {
		var activeCharID = getActive(username);
		if ((activeCharID != -1) && (activeCharID != -2)) {
			if (characters[username][activeCharID]["isLocked"] == false) {
				if ((noteNum in characters[username][activeCharID]["notes"])) {
					delete characters[username][activeCharID]["notes"][noteNum];
					con.query("UPDATE characters SET notes = ? WHERE (username, charID) = (?, ?)", [stringifyJSON(characters[username][activeCharID]["notes"]), username, activeCharID], function (err, result) {
						if (err) throw err;
					});
					return noteNum;
				} else {
					//error note not existent
					return -5;
				}
			} else {
				//error character locked
				return -3;
			}
		} else {
			//error getting active character
			return -2;
		}
	} else {
		//error note number is invalid
		return -4;
	}
}

function getRoll(username, ringParam, skillParam) {
	//-1 = unknown error
	//-2 = user has no account
	//-3 = user has no active character
	if (username in characters) {
		var activeCharID = getActive(username);
		if ((activeCharID != -1) && (activeCharID != -2)) {
			return {dice:characters[username][activeCharID][ringParam] + "r" + characters[username][activeCharID][skillParam] + "s", name:characters[username][activeCharID]["name"]};
		} else {
			//user has no active character
			return -3;
		}
	} else {
		//user has no characters
		return -2;
	}
	return -1;
}

function loadCharacterData() {
	con.query("SELECT * FROM characters", function (err, result, fields) {
		if (err) throw err;
		result.forEach(function(currentChar) {
			if (currentChar.username in characters) {
				currentChar["techniques"] = parseJSON(currentChar["techniques"]);
				currentChar["notes"] = parseJSON(currentChar["notes"]);
				characters[currentChar.username][currentChar.charID] =  currentChar;
			} else {
				currentChar["techniques"] = parseJSON(currentChar["techniques"]);
				currentChar["notes"] = parseJSON(currentChar["notes"]);
				characters[currentChar.username] = {[currentChar.charID]:currentChar};
			}
		});
	});
};

function stringifyJSON (input) {
	var output = JSON.stringify(input);
	return output;
}

function parseJSON(input) {
	var output = JSON.parse(input.replace(/[\\']/g, ''));
	return output;
}

var charPrototype = {
	"username":"",
	"charID":"",
	"isActive":false,
	"isLocked":false,
	"name":"",
	"clan":"",
	"air":1,
	"earth":1,
	"fire":1,
	"water":1,
	"void":1,
	"fatigue":0,
	"strife":0,
	"voidpoints":0,
	"honor":0,
	"glory":0,
	"status":0,
	"aesthetics":0,
	"composition":0,
	"design":0,
	"smithing":0,
	"fitness":0,
	"mamelee":0,
	"maranged":0,
	"maunarmed":0,
	"meditation":0,
	"tactics":0,
	"command":0,
	"courtesy":0,
	"games":0,
	"performance":0,
	"culture":0,
	"government":0,
	"sentiment":0,
	"theology":0,
	"medicine":0,
	"commerce":0,
	"labor":0,
	"seafaring":0,
	"skulduggery":0,
	"survival":0,
	"techniques":'{"kata":{}, "invocations":{}, "kiho":{}, "maho":{}, "ninjutsu":{}, "rituals":{}, "shuji":{}}',
	"notes":'{}',
	"koku":0,
	"bu":0,
	"zeni":0
};

const changeableparameters = [
	"name",
	"clan",
	"air",
	"earth",
	"fire",
	"water",
	"void",
	"fatigue",
	"strife",
	"voidpoints",
	"honor",
	"glory",
	"status",
	"aesthetics",
	"composition",
	"design",
	"smithing",
	"fitness",
	"mamelee",
	"maranged",
	"maunarmed",
	"meditation",
	"tactics",
	"command",
	"courtesy",
	"games",
	"performance",
	"culture",
	"government",
	"sentiment",
	"theology",
	"medicine",
	"commerce",
	"labor",
	"seafaring",
	"skulduggery",
	"survival",
	"koku",
	"bu",
	"zeni"
];

const numberparameters = [
	"air",
	"earth",
	"fire",
	"water",
	"void",
	"fatigue",
	"strife",
	"voidpoints",
	"honor",
	"glory",
	"status",
	"aesthetics",
	"composition",
	"design",
	"smithing",
	"fitness",
	"mamelee",
	"maranged",
	"maunarmed",
	"meditation",
	"tactics",
	"command",
	"courtesy",
	"games",
	"performance",
	"culture",
	"government",
	"sentiment",
	"theology",
	"medicine",
	"commerce",
	"labor",
	"seafaring",
	"skulduggery",
	"survival",
	"koku",
	"bu",
	"zeni"
];

const onedigitparameters = [
	"air",
	"earth",
	"fire",
	"water",
	"void",
	"aesthetics",
	"composition",
	"design",
	"smithing",
	"fitness",
	"mamelee",
	"maranged",
	"maunarmed",
	"meditation",
	"tactics",
	"command",
	"courtesy",
	"games",
	"performance",
	"culture",
	"government",
	"sentiment",
	"theology",
	"medicine",
	"commerce",
	"labor",
	"seafaring",
	"skulduggery",
	"survival"
];

const twodigitparameters = [
	"fatigue",
	"strife",
	"voidpoints",
	"honor",
	"glory",
	"status"
];

const fourdigitparameters = [
	"koku",
	"bu",
	"zeni"
]

const rings = {
	"air":"Air",
	"earth":"Earth",
	"fire":"Fire",
	"water":"Water",
	"void":"Void"
}

const skills = {
	"aesthetics":"Aesthetics",
	"composition":"Composition",
	"design":"Design",
	"smithing":"Smithing",
	"fitness":"Fitness [Defense]",
	"mamelee":"M.A. [Melee]",
	"maranged":"M.A. [Ranged]",
	"maunarmed":"M.A. [Unarmed]",
	"meditation":"Meditation",
	"tactics":"Tactics",
	"command":"Command",
	"courtesy":"Courtesy",
	"games":"Games",
	"performance":"Performance",
	"culture":"Culture",
	"government":"Government",
	"sentiment":"Sentiment",
	"theology":"Theology",
	"medicine":"Medicine",
	"commerce":"commerce",
	"labor":"Labor",
	"seafaring":"Seafaring",
	"skulduggery":"Skulduggery",
	"survival":"Survival"
};

const techniques = {
	"kata":"Kata",
	"invocations":"Invocations",
	"kiho":"Kiho",
	"maho":"Maho",
	"ninjutsu":"Ninjutsu",
	"rituals":"Rituals",
	"shuji":"Shuji"
};

exports.mysql_connect = mysql_connect;
exports.createChar = createChar;
exports.deleteChar = deleteChar;
exports.addTech = addTech;
exports.removeTech = removeTech;
exports.addNote = addNote;
exports.setNote = setNote;
exports.removeNote = removeNote;
exports.showChar = showChar;
exports.list = list;
exports.lock = lock;
exports.unlock = unlock;
exports.getActive = getActive;
exports.setActive = setActive;
exports.setValue = setValue;
exports.getRoll = getRoll;
exports.loadCharacterData = loadCharacterData;

exports.characters = characters;
exports.skills = skills;
exports.rings = rings;