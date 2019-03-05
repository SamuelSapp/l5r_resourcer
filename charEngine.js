var fs = require("fs");

var charIndex = {}
var characters = {}

function create(username, characterID) {
	var newCharacter = Object.assign({},charPrototype);
	
	if (username in charIndex) {
		if (!(characterID in charIndex[username]["characters"])) {
			//Not User's first character, but new character
			charIndex[username]["active"] = characterID;
			charIndex[username]["characters"][characterID] = characterID;
			characters[username][characterID]  = newCharacter;
			saveCharacterData(username);
			return 1;
		} else {
			//Error - CharacterID already taken
			return -2;
		}
	} else {
		//User's first character
		charIndex[username] = {"active":characterID, "characters":{[characterID]:characterID}};
		characters[username] = {[characterID]:newCharacter};
		
		saveCharacterData(username);
		return 1;
	}
	return -1;
};

function deleteChar(username, characterID) {
	if (username in charIndex) {
		if (!(characterID in charIndex[username]["characters"])) {
			//CharacterID not present
			return -3;
		} else {
			//Delete the character
			if (characters[username][characterID]["lockStatus"] == "unlocked") {
				if (charIndex[username]["active"] == [characterID]) {
					charIndex[username]["active"] = "";
				}
				fs.unlink("./characters/" + username + "/" + characterID + ".json", (err) => {
					if (err) throw err;
				});
				delete charIndex[username]["characters"][characterID];
				delete characters[username][characterID];
				saveIndexData(username);
				return 1;
			} else {
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

function lock(username, characterID) {
	if ((username in characters) && (characterID in characters[username])) {
		characters[username][characterID]["lockStatus"] = "locked";
		return 1;
	}
	return -1;
}

function unlock(username, characterID) {
	if ((username in characters) && (characterID in characters[username])) {
		characters[username][characterID]["lockStatus"] = "unlocked";
		return 1;
	}
	return -1;
}

function getActive(username) {
	if (username in charIndex && charIndex[username]["active"] != "") {
		return charIndex[username]["active"];
	} else {
		return -1;
	}
}

function active(username, characterID) {
	if (username in charIndex) {
		if (!(characterID in charIndex[username]["characters"])) {
			//Character listed is not in the index
			return "-2";
		} else {
			//Found the character
			if (charIndex[username]["active"] == characterID) {
				//Character is already active
				return "-3"
			}
			charIndex[username]["active"] = characterID;
			saveIndexData();
			return "1";
		}
	} else {
		//User doesn't have a character?
		return "-2";
	}
	return "-1"; //error
}

function set(username, command, param) {
	if (command in characters[username][charIndex[username]["active"]]) {
		if (command in numberparameters) {param = param.replace(/[^0-9]/g, '')};
		if (param == "") {return -2};
		if (characters[username][charIndex[username]["active"]]["lockStatus"] == "unlocked") {
			characters[username][charIndex[username]["active"]][command] = param;
			saveCharacterData(username);
			return charIndex[username]["active"];
		} else {
			return -3;
		}
	} else {
		return -1;
	}
}

function getRoll(username, ringParam, skillParam) {
	if (username in charIndex) {
		if (charIndex[username]["active"] != "") {
			return {dice:characters[username][charIndex[username]["active"]][ringParam] + "r" + characters[username][charIndex[username]["active"]][skillParam] + "s", name:characters[username][charIndex[username]["active"]]["name"]};
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

function saveIndexData() {
	fs.writeFile("./characters/char_index.json", JSON.stringify(charIndex, null, 4), (err) => {
		if (err) {
			console.error(err);
			return;
		};
	});
}

function saveCharacterData(username) {
	if (username in charIndex) {
		
		saveIndexData();
		
		checkDirectory("./characters/" + username + "/", function(error) {
			if(error) {
				console.log("Something went way wrong", error);
			} else {
				fs.writeFile("./characters/" + username + "/" + charIndex[username]["active"] + ".json", JSON.stringify(characters[username][charIndex[username]["active"]], null, 4), (err) => {
					if (err) {
						console.error(err);
						return;
					};
				});
			}
		});
	}
};

function loadCharacterData() {
	charIndex = JSON.parse(fs.readFileSync("./characters/char_index.json"));
	
	if (charIndex != {}) {
		Object.keys(charIndex).forEach(function(username) {
			characters[username] = {};
			Object.keys(charIndex[username]["characters"]).forEach(function(character) {
				characters[username][character] = JSON.parse(fs.readFileSync("./characters/" + username + "/" + character + ".json"))
			});
		});
	}
};

function checkDirectory(directory, callback) {  
  fs.stat(directory, function(err, stats) {
    //Check if error defined and the error code is "not exists"
    if (err && err.errno === -4058) {
      //Create the directory, call the callback.
      fs.mkdir(directory, callback);
    } else {
      //just in case there was a different error:
      callback(err)
    }
  });
}

var charPrototype = {
	"lockStatus":"unlocked",
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
	"techniques":{}
};

const numberparameters = [
	"air",
	"earth",
	"fire",
	"water",
	"void",
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
	"survival"
];

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
}

exports.getRoll = getRoll;
exports.set = set;
exports.active = active;
exports.list = list;
exports.lock = lock;
exports.unlock = unlock;
exports.getActive = getActive;
exports.deleteChar = deleteChar;
exports.charIndex = charIndex;
exports.characters = characters;
exports.skills = skills;
exports.rings = rings;
exports.create = create;
exports.loadCharacterData = loadCharacterData;