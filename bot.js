const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const npc = require("./NPC.json");
const kata = require("./kata.json");
const invocations = require("./invocations.json");
const kiho = require("./kiho.json");
const maho = require("./maho.json");
const ninjutsu = require("./ninjutsu.json");
const rituals = require("./rituals.json");
const shuji = require("./shuji.json");
const info_lists = require("./info_lists.json");
const rollEngine = require("./rollEngine.js");
const charEngine = require("./charEngine.js")


let infoprefix = "-";
let diceprefix = "!";
let charprefix = "&";

client.on('ready', () => {
	rollEngine.loadEmotes(client.emojis);
	charEngine.loadCharacterData();
});

client.on("message", (message) => {
	
	if (!(message.content.startsWith(infoprefix)  || message.content.startsWith(diceprefix) || message.content.startsWith(charprefix)) || message.author.bot) return;
	
	if (message.content.startsWith(infoprefix)) {
		
		var command = message.content.toLowerCase();
		command = command.replace(/(?![a-z])./g, '')
		
		const embed = new Discord.RichEmbed();
		embed.setColor("#017cba");
		
		var validCommand = false
		
		if (command in npc){
			validCommand = true;
			embed.setImage(npc[command].imageURL)
			.setAuthor(npc[command].title, "", npc[command].infoURL)
			.setDescription(npc[command].description);
		} else if (command in kata){
			validCommand = true;
			embed.setImage(kata[command].imageURL)
			.setAuthor(kata[command].title)
			.setFooter(kata[command].footer);
		} else if (command in invocations){
			validCommand = true;
			embed.setImage(invocations[command].imageURL)
			.setAuthor(invocations[command].title)
			.setFooter(invocations[command].footer);
		}else if (command in kiho){
			validCommand = true;
			embed.setImage(kiho[command].imageURL)
			.setAuthor(kiho[command].title)
			.setFooter(kiho[command].footer);
		}else if (command in maho){
			validCommand = true;
			embed.setImage(maho[command].imageURL)
			.setAuthor(maho[command].title)
			.setFooter(maho[command].footer);
		}else if (command in ninjutsu){
			validCommand = true;
			embed.setImage(ninjutsu[command].imageURL)
			.setAuthor(ninjutsu[command].title)
			.setFooter(ninjutsu[command].footer);
		}else if (command in rituals){
			validCommand = true;
			embed.setImage(rituals[command].imageURL)
			.setAuthor(rituals[command].title)
			.setFooter(rituals[command].footer);
		}else if (command in shuji){
			validCommand = true;
			embed.setImage(shuji[command].imageURL)
			.setAuthor(shuji[command].title)
			.setFooter(shuji[command].footer);
		}else if (command in info_lists){
			validCommand = true;
			embed.setDescription(info_lists[command].description)
			.setAuthor(info_lists[command].title)
		} else if (command === "help") {
			validCommand = true;
			embed.setImage("https://i.imgur.com/zUeBxmP.gif")
			.setAuthor("No")
			.setDescription("go fuck yourself");
		}
		
		if (validCommand) {
			message.channel.send({embed});
			} else {
			message.channel.send("*In Alexa voice:* I'm sorry, I don't know that one.");
		}
	} else if (message.content.startsWith(diceprefix)) {
	//Dice and Rolling Commands
		var splitMessage = message.content.toLowerCase();
		var splitIndex = message.content.indexOf(" ");
		if (splitIndex != -1) {
			var command = splitMessage.substring(1,splitIndex);
			var param = splitMessage.substring(splitIndex+1).replace(/ /g, "");
			
			if (param != "") {
				switch(command) {
					case "roll":
					case "r":
					//Roll Command
						var rollType = "error";
					
						if (param.replace(/[brsw]/g, '') === ""){
							rollType = "strung";
						} else if (param.replace(/[0-9]+[brsw]/g, '') === ""){
							rollType = "counted";
						}
					
						if (rollType != "error"){
							rollEngine.rollResults[message.author.username] = rollEngine.newRoll(rollType, param);
							message.channel.send(rollEngine.rollResults[message.author.username].diceStr);
							message.channel.send(rollEngine.rollResults[message.author.username].resultStr);
						} else {
							message.channel.send("You used the wrong letters or something, man.\rUse r, s, b, or w only please.");
						}
					break;
					case "keep":
					case "k":
					//Keep Command
						var rollType = "error";
						
						if (param.replace(/[0-9]/g, '') === ""){
							rollType = "strung";
						}
						
						if (rollType != "error"){
							if (!(typeof rollEngine.rollResults[message.author.username] == "undefined")) {
								rollEngine.rollResults[message.author.username] = rollEngine.keep(param, rollEngine.rollResults[message.author.username].rollArray);
								message.channel.send(rollEngine.rollResults[message.author.username].diceStr);
								message.channel.send(rollEngine.rollResults[message.author.username].resultStr);
							} else {
							//Error - No previous roll
								message.channel.send("You need to !roll first.");
							}
						} else {
						//Error - parameters do not match regular expression
							message.channel.send("You entered the keep command's parameters wrong, friendo.");
						}
					break;
					case "add":
					case "a":
					//Add Command
						var rollType = "error";
						
						if (param.replace(/[brsw]/g, '') === ""){
							rollType = "strung";
						} else if (param.replace(/[0-9]+[brsw]/g, '') === ""){
							rollType = "counted";
						}
					
						if (rollType != "error"){
							if (!(typeof rollEngine.rollResults[message.author.username] == "undefined")) {
								rollEngine.rollResults[message.author.username] = rollEngine.add(param, rollType, rollEngine.rollResults[message.author.username].rollArray);
								message.channel.send(rollEngine.rollResults[message.author.username].diceStr);
								message.channel.send(rollEngine.rollResults[message.author.username].resultStr);
							} else {
							//Error - No previous roll
								message.channel.send("Nice try. Do your !roll first.");
							}
						} else {
							message.channel.send("You used the wrong letters or something in the add command, fella.\rUse r, s, b, or w only please.");
						}
					break;
					case "reroll":
					case "rr":
					//Reroll Command
						var rollType = "error";
						
						if (param.replace(/[0-9]/g, '') === ""){
							rollType = "strung";
						}
						
						if (rollType != "error"){
							if (!(typeof rollEngine.rollResults[message.author.username] == "undefined")) {
								rollEngine.rollResults[message.author.username] = rollEngine.reroll(param, rollEngine.rollResults[message.author.username].rollArray);
								message.channel.send(rollEngine.rollResults[message.author.username].diceStr);
								message.channel.send(rollEngine.rollResults[message.author.username].resultStr);
							} else {
							//Error - No previous roll
								message.channel.send("You need to !roll before you can !reroll.");
							}
						} else {
							message.channel.send("Your reroll command smells funny, lady.");
						}
					break;
					case "air":
					case "earth":
					case "fire":
					case "water":
					case "void":
						if (param in charEngine.skills) {
							var outcome = charEngine.getRoll(message.author.username, command, param);
							if (outcome == -2) {
								message.channel.send("You don't have any characters to roll with.");
							} else if (outcome == -3) {
								message.channel.send("You don't have an active character.");
							} else if (outcome == -1) {
								message.channel.send("There was some weird error with your roll.");
							} else {
								rollEngine.rollResults[message.author.username] = rollEngine.newRoll("counted", outcome.dice);
								message.channel.send("Rolling " + charEngine.rings[command] + " " + charEngine.skills[param] + " as " + outcome.name);
								message.channel.send(rollEngine.rollResults[message.author.username].diceStr);
								message.channel.send(rollEngine.rollResults[message.author.username].resultStr);
							}
						} else {
							message.channel.send("That skill does not exist.");
						}
					break;
					default:
					//Error
						message.channel.send("You've put a command I don't recognize, man.");
					break;
				}
			} else {
			//Error
				message.channel.send("You have a space somewhere weird or something.");
			}
		} else {
		//Error
			message.channel.send("Okay, but you need two parts fella.");
		}
	} else if (message.content.startsWith(charprefix)) {
	//Character Commands
		var splitMessage = message.content;
		var splitIndex = message.content.indexOf(" ");
		if (splitIndex != -1) {
			var command = splitMessage.substring(1,splitIndex);
			var param = splitMessage.substring(splitIndex+1).trim();
			
			if (param != "") {
				switch(command) {
					case "create":
					//Create new character
						param = param.toLowerCase().replace(/ /g, "");
						var outcome = charEngine.create(message.author.username, param);
						//-1 = taken
						//1 = success
						if (outcome == 1) {
							message.channel.send("Congratulations: " + param + " has been created and made your active character.");
						} else if (outcome == -1) {
							message.channel.send("You already have a character with that ID, probably.");
						} else {
							message.channel.send("Unforeseen error while creating character");
						}
					break;
					case "active":
					//Change active character
						param = param.toLowerCase().replace(/ /g, "");
						var outcome = charEngine.active(message.author.username, param);
						//-1 = error
						//-2 = nochar
						//-3 = toolate
						//1 = success
						if (outcome == 1) {
							message.channel.send("Switched active character to " + param);
						} else if (outcome == -3) {
							message.channel.send(param + " is already your active character");
						} else if (outcome == -2) {
							message.channel.send("That character doesn't exist");
						} else {
							message.channel.send("Unforeseen error while changing active character");
						}
					break;
					case "set":
					//Set a parameter's value
						var secondSplitIndex = param.indexOf(" ");
						if (secondSplitIndex != -1) {
							var setCommand = param.substring(0,secondSplitIndex).toLowerCase();
							var param = param.substring(secondSplitIndex+1).trim();
							var outcome = charEngine.set(message.author.username, setCommand, param);
							//-1 = error
							//-2 = NaN
							//success = string
							if (outcome == -1) {
								message.channel.send("Couldn't find the parameter you wanted");
							} else if (outcome == -2){
								message.channel.send("Did you try to put not a number in a number thing?");
							} else {
								message.channel.send(outcome + "'s " + setCommand + " has been set to " + param);
							}
						} else {
							message.channel.send("Too few parameters");
						}
					break;
					case "delete":
					//Delete a character
						param = param.toLowerCase().replace(/ /g, "");
						var outcome = charEngine.deleteChar(message.author.username, param);
						//-1 = error
						//-2 = no characters
						//-3 = wrong character
						//-4 = character is edit-locked
						//1 = success
						if (outcome == 1) {
							message.channel.send("Congratulations, you've deleted [name not found]");
						} else if (outcome == -2 || outcome == -3) {
							message.channel.send("You don't have a character with that ID.");
						} else if (outcome == -4) {
							message.channel.send("That character is edit-locked.");
						} else {
							message.channel.send("Unforeseen error while deleting character");
						}
					break;
					case "lock":
					//Lock a character so it can't be altered
						param = param.toLowerCase().replace(/ /g, "");
						var outcome = charEngine.lock(message.author.username, param);
						if (outcome == 1) {
							message.channel.send("Your character has been locked and cannot be altered until unlocked.");
						} else {
							message.channel.send("I couldn't find that character.");
						}
					break;
					case "unlock":
					//Unlock a character so it can be altered
						param = param.toLowerCase().replace(/ /g, "");
						var outcome = charEngine.unlock(message.author.username, param);
						if (outcome == 1) {
							message.channel.send("Your character has been unlocked and you're free to edit it.");
						} else {
							message.channel.send("I couldn't find that character.");
						}
					break;
					case "show":
					//Displays a character sheet
						const embed = new Discord.RichEmbed()
						.setColor("#017cba");
						param = param.replace(/ /g, "");
						const username = message.author.username;
						//const username = "protolad";
						
						if ((username in charEngine.characters) && (param in charEngine.characters[username])) {
							const showChar = charEngine.characters[username][param];
							embed.setAuthor(showChar["name"])
							.setTitle("Air " + showChar["air"] + " - Earth " + showChar["earth"] + " - Fire " + showChar["fire"] + " - Water " + showChar["water"] + " - Void " + showChar["void"])
							.setDescription("| Endurance: " + showChar["fatigue"] + "/" + (parseInt(showChar["earth"]) + parseInt(showChar["fire"]))*2 + " | Composure: " + showChar["strife"] + "/" + (parseInt(showChar["earth"]) + parseInt(showChar["water"]))*2 + " | Focus: " + (parseInt(showChar["air"]) + parseInt(showChar["fire"])) + " | Vigilance: " + Math.ceil((parseFloat(showChar["air"]) + parseFloat(showChar["water"]))/2.0) + " | Void Points: " + showChar["voidpoints"] + "/" + showChar["void"] + " |\n| Honor: " + showChar["honor"] + " | Glory: " + showChar["glory"] + " | Status: " + showChar["status"] + " |")
							.addField("Martial Arts Skills", "M.A. [Melee]: " + showChar["mamelee"] + "\nM.A. [Ranged]: " + showChar["maranged"] + "\nM.A. [Unarmed]: " + showChar["maunarmed"],true)
							.addField("Martial  Skills", "Fitness [Defense]: " + showChar["fitness"] + "\nMeditation: " + showChar["meditation"] + "\nTactics: " + showChar["tactics"],true)
							.addField("Artisan Skills", "Aesthetics: " + showChar["aesthetics"] + "\nComposition: " + showChar["composition"] + "\nDesign: " + showChar["design"] + "\nSmithing: " + showChar["smithing"],true)
							.addField("Social Skills", "Command: " + showChar["command"] + "\nCourtesy: " + showChar["courtesy"] + "\nGames: " + showChar["games"] + "\nPerformance:  " + showChar["performance"],true)
							.addField("Scholar Skills", "Culture: " + showChar["culture"] + "\nGovernment: " + showChar["government"] + "\nSentiment: " + showChar["sentiment"] + "\nTheology: " + showChar["theology"] + "\nMedicine: " + showChar["medicine"],true)
							.addField("Trade Skills", "Commerce: " + showChar["commerce"] + "\nLabor: " + showChar["labor"] + "\nSeafaring: " + showChar["seafaring"] + "\nSkulduggery: " + showChar["skulduggery"] + "\nSurvival: " + showChar["survival"],true);
							message.channel.send({embed});
						} else {
							message.channel.send("Something went wrong with the show command.");
						}
					break;
					case "add":
					//Add a technique
						
					break;
					case "remove":
					//Remove a technique
						
					break;
					default:
					//Error
						message.channel.send("You've put a command I don't recognize, man.");
					break;
				}
			} else {
			//Error
				message.channel.send("You have a space somewhere weird or something.");
			}
		} else {
			var command = splitMessage.substring(1);
			switch(command) {
				case "list":
					var yourCharacters = charEngine.list(message.author.username);
					if (yourCharacters != -1) {
						const embed = new Discord.RichEmbed()
						.setColor("#017cba")
						.setAuthor(message.author.username + "'s Characters")
						.setDescription(yourCharacters);
						message.channel.send({embed});
					} else {
						message.channel.send("You don't have any active characters at the moment.");
					}
				break;
				case "active":
					var outcome = charEngine.getActive(message.author.username);
					if (!(outcome == -1)) {
						message.channel.send("Your active character is " + outcome);
					} else {
						message.channel.send("You don't have any active characters at the moment.");
					}
				break;
				case "show":
					const embed = new Discord.RichEmbed()
					.setColor("#017cba");
					const username = message.author.username;
					const param = charEngine.getActive(username);
					
					if ((username in charEngine.characters) && (param in charEngine.characters[username])) {
						const showChar = charEngine.characters[username][param];
						embed.setAuthor(showChar["name"])
						.setTitle("Air " + showChar["air"] + " - Earth " + showChar["earth"] + " - Fire " + showChar["fire"] + " - Water " + showChar["water"] + " - Void " + showChar["void"])
						.setDescription("| Endurance: " + showChar["fatigue"] + "/" + (parseInt(showChar["earth"]) + parseInt(showChar["fire"]))*2 + " | Composure: " + showChar["strife"] + "/" + (parseInt(showChar["earth"]) + parseInt(showChar["water"]))*2 + " | Focus: " + (parseInt(showChar["air"]) + parseInt(showChar["fire"])) + " | Vigilance: " + Math.ceil((parseFloat(showChar["air"]) + parseFloat(showChar["water"]))/2.0) + " | Void Points: " + showChar["voidpoints"] + "/" + showChar["void"] + " |\n| Honor: " + showChar["honor"] + " | Glory: " + showChar["glory"] + " | Status: " + showChar["status"] + " |")
						.addField("Martial Arts Skills", "M.A. [Melee]: " + showChar["mamelee"] + "\nM.A. [Ranged]: " + showChar["maranged"] + "\nM.A. [Unarmed]: " + showChar["maunarmed"],true)
						.addField("Martial  Skills", "Fitness [Defense]: " + showChar["fitness"] + "\nMeditation: " + showChar["meditation"] + "\nTactics: " + showChar["tactics"],true)
						.addField("Artisan Skills", "Aesthetics: " + showChar["aesthetics"] + "\nComposition: " + showChar["composition"] + "\nDesign: " + showChar["design"] + "\nSmithing: " + showChar["smithing"],true)
						.addField("Social Skills", "Command: " + showChar["command"] + "\nCourtesy: " + showChar["courtesy"] + "\nGames: " + showChar["games"] + "\nPerformance:  " + showChar["performance"],true)
						.addField("Scholar Skills", "Culture: " + showChar["culture"] + "\nGovernment: " + showChar["government"] + "\nSentiment: " + showChar["sentiment"] + "\nTheology: " + showChar["theology"] + "\nMedicine: " + showChar["medicine"],true)
						.addField("Trade Skills", "Commerce: " + showChar["commerce"] + "\nLabor: " + showChar["labor"] + "\nSeafaring: " + showChar["seafaring"] + "\nSkulduggery: " + showChar["skulduggery"] + "\nSurvival: " + showChar["survival"],true);
						message.channel.send({embed});
					} else {
						message.channel.send("You don't seem to have an active character to show.");
					}
				break;
				default:
					message.channel.send("Okay, you broke something");
				break;
			}
			
		}
	}
});



client.login(config.token);