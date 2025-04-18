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
	charEngine.mysql_connect();
});

client.on("message", (message) => {
	
	if (!(message.content.startsWith(infoprefix)  || message.content.startsWith(diceprefix) || message.content.startsWith(charprefix)) || message.author.bot) return;
	
	if (message.content.startsWith(infoprefix)) {
		
		var command = message.content.toLowerCase().replace(/(?![a-z])./g, '');
		
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
		} else if (command == "help") {
			validCommand = true;
			embed.setImage("https://i.imgur.com/zUeBxmP.gif")
			.setAuthor("Information Help Menu")
			.setDescription("-help | Information Help Menu\n!help | Rolling Help Menu\n&help | Character Help Menu")
			.addField("-techniques", "Display the root of the Techniques Information Tree.")
			.addField("-[technique-name]", "e.g. -earthquake - Display an information card for the given technique.");
		} else if (command == "skills") {
			validCommand = true;
			embed.setAuthor("Skills")
			.addField("Martial Arts Skills", "M.A. [Melee]: mamelee\nM.A. [Ranged]: maranged\nM.A. [Unarmed]: maunarmed",true)
			.addField("Martial  Skills", "Fitness [Defense]: fitness\nMeditation: meditation\nTactics: tactics",true)
			.addField("Artisan Skills", "Aesthetics: aesthetics\nComposition: composition\nDesign: design\nSmithing: smithing",true)
			.addField("Social Skills", "Command: command\nCourtesy: courtesy\nGames: games\nPerformance:  performance",true)
			.addField("Scholar Skills", "Culture: culture\nGovernment: government\nSentiment: sentiment\nTheology: theology\nMedicine: medicine",true)
			.addField("Trade Skills", "Commerce: commerce\nLabor: labor\nSeafaring: seafaring\nSkulduggery: skulduggery\nSurvival: survival",true);
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
					//Character Rolling Command
					//-1 = unknown error
					//-2 = user has no account
					//-3 = user has no active character
						if (param in charEngine.skills) {
							var outcome = charEngine.getRoll(message.author.username, command, param);
							if (outcome == -3) {
								message.channel.send("You don't have an active character.");
							} else if (outcome == -2) {
								message.channel.send("You don't have any characters to roll with.");
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
		} else if (splitMessage.substring(1) == "help") {
			const embed = new Discord.RichEmbed();
			embed.setColor("#017cba")
			.setAuthor("Rolling Help Menu")
			.setDescription("-help | Information Help Menu\n!help | Rolling Help Menu\n&help | Character Help Menu")
			.addField("!roll [dice] or !r [dice]", "Rolls the indicated dice. [dice] can be formatted as 3s2r or sssrr - r or b represent Ring dice, s or w represent Skill dice.")
			.addField("!keep [positions] or !k [positions]", "Keeps the indicated dice. [positions] is the position of dice to keep - e.g. !k 12 keeps the first and second dice, then discards the rest.")
			.addField("!add [dice] or !a [dice]", "Adds the indicated dice. [dice] can be formatted as 3s2r or sssrr - r or b represent Ring dice, s or w represent Skill dice.")
			.addField("!reroll [positions] or !rr [positions]", "Rerolls the indicated dice. [positions] is the position of dice to keep - e.g. !rr 12 rerolls the first and second dice, keeping the rest the same.")
			.addField("![ring] [skill]", "Rolls the indicated ring and skill of your active character. Use -rings or -skills to view the available rings or skills.");
			
			message.channel.send({embed});
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
						var outcome = charEngine.createChar(message.author.username, param);
						//-1 = unknown error
						//-2 = characterID already taken
						//-3 = entered characterID is a number
						//1 = success
						if (outcome == 1) {
							message.channel.send("Congratulations: " + param + " has been created and made your active character.");
						} else if (outcome == -2) {
							message.channel.send("You already have a character with that ID, probably.");
						} else if (outcome == -3) {
							message.channel.send("Character ID can't be a number.");
						} else {
							message.channel.send("Unforeseen error while creating character");
						}
					break;
					case "active":
					//Change active character
						param = param.toLowerCase().replace(/ /g, "");
						var outcome = charEngine.setActive(message.author.username, param);
						//-1 = unknown error
						//-2 = Character is not in the index or user doesn't exist
						//-3 = character is already active
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
					//-1 = parameter not listed
					//-2 = invalid number command parameter
					//-3 = character is locked
					//-4 = no active character
					//-5 = non-number parameter too long
					//string = success
						var secondSplitIndex = param.indexOf(" ");
						if (secondSplitIndex != -1) {
							var setCommand = param.substring(0,secondSplitIndex).toLowerCase();
							var param = param.substring(secondSplitIndex+1).trim();
							var outcome = charEngine.setValue(message.author.username, setCommand, param);
							
							if (outcome == -1) {
								message.channel.send("Couldn't find the parameter you wanted.");
							} else if (outcome == -2){
								message.channel.send("Number input was negative, too large, or not a number.");
							} else if (outcome == -3) {
								message.channel.send("Your active character is locked.");
							} else if (outcome == -4) {
								message.channel.send("You don't seem to have an active character.");
							} else if (outcome == -5) {
								message.channel.send("Your input was too long.");
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
						//-1 = unknown error
						//-2 = no characters
						//-3 = Character ID not present
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
						} else if (outcome == -3) {
							message.channel.send("That character is already locked.");
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
						}  else if (outcome == -3) {
							message.channel.send("That character is already unlocked.");
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
						
						if ((username in charEngine.characters) && (param in charEngine.characters[username])) {
							charEngine.showChar(embed, username, param);
							message.channel.send({embed});
						} else {
							message.channel.send("Something went wrong with the show command.");
						}
					break;
					case "addtech":
					//Add a technique
					//string = success
					//-2 = error getting active character
					//-3 = param not valid technique
					//-4 = character already has technique
						param = param.toLowerCase().replace(/(?![a-z])./g, '');
						var outcome = charEngine.addTech(message.author.username, param);
						if (outcome == -2) {
							message.channel.send("I couldn't find an active character");
						} else if (outcome == -3) {
							message.channel.send("Invalid technique");
						} else if (outcome == -4) {
							message.channel.send("Your character already has that technique.");
						} else {
							message.channel.send("Successfully added the technique: " + outcome);
						}
					break;
					case "removetech":
					//Remove a technique
					//string = success
					//-2 = error getting active character
					//-3 = character doesn't have param
						param = param.toLowerCase().replace(/(?![a-z])./g, '');
						var outcome = charEngine.removeTech(message.author.username, param);
						if (outcome == -2) {
							message.channel.send("I couldn't find an active character");
						} else if (outcome == -3) {
							message.channel.send("Your character doesn't have a technique matching " + param);
						} else {
							message.channel.send("Successfully removed the technique: " + outcome);
						}
					break;
					case "addnote":
					//Add a new note
					//1-10 = success
					//-2 = no active character
					//-3 = character locked
					//-4 = too many notes
						var outcome = charEngine.addNote(message.author.username, param);
						if (outcome == -1) {
							message.channel.send("I don't know how you did this (addnote)");
						} else if (outcome == -2){
							message.channel.send("Could not find an active character");
						} else if (outcome == -3) {
							message.channel.send("Your active character is locked.");
						} else if (outcome == -4) {
							message.channel.send("You already have 10 notes.");
						} else {
							message.channel.send("Created note " + outcome);
						}
					break;
					case "setnote":
					//Set a note's message
					//1-10 = success
					//-2 = no active character
					//-3 = character locked
					//-4 = Note number invalid
					//-5 = Too few parameters
						var outcome = charEngine.setNote(message.author.username, param);
						if (outcome == -1) {
							message.channel.send("I don't know how you did this (addnote)");
						} else if (outcome == -2){
							message.channel.send("Could not find an active character");
						} else if (outcome == -3) {
							message.channel.send("Your active character is locked.");
						} else if (outcome == -4) {
							message.channel.send("Your note number is invalid.");
						} else if (outcome == -5) {
							message.channel.send("Too few parameters");
						} else {
							message.channel.send("Set value of note " + outcome);
						}
					break;
					case "removenote":
					//Set a note's message
					//1-10 = success
					//-2 = no active character
					//-3 = character locked
					//-4 = Note number invalid
					//-5 = note doesn't exist
						var outcome = charEngine.removeNote(message.author.username, param);
						if (outcome == -1) {
							message.channel.send("I don't know how you did this (addnote)");
						} else if (outcome == -2){
							message.channel.send("Could not find an active character");
						} else if (outcome == -3) {
							message.channel.send("Your active character is locked.");
						} else if (outcome == -4) {
							message.channel.send("Your note number is invalid.");
						} else if (outcome == -5) {
							message.channel.send("You don't have a note with that number.");
						} else {
							message.channel.send("Removed note " + outcome);
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
			var command = splitMessage.substring(1);
			const embed = new Discord.RichEmbed()
			switch(command) {
				case "list":
					var yourCharacters = charEngine.list(message.author.username);
					if (yourCharacters != -1) {
						embed.setColor("#017cba")
						.setAuthor(message.author.username + "'s Characters")
						.setDescription(yourCharacters);
						message.channel.send({embed});
					} else {
						message.channel.send("You don't have any active characters at the moment.");
					}
				break;
				case "active":
					var outcome = charEngine.getActive(message.author.username);
					if (isNaN(outcome)) {
						message.channel.send("Your active character is " + outcome);
					} else {
						message.channel.send("You don't have any active characters at the moment.");
					}
				break;
				case "show":
					embed.setColor("#017cba");
					const username = message.author.username;
					const param = charEngine.getActive(username);
					
					if ((username in charEngine.characters) && (param in charEngine.characters[username])) {
						const showChar = charEngine.characters[username][param];
						charEngine.showChar(embed, username, param);
						message.channel.send({embed});
					} else {
						message.channel.send("You don't seem to have an active character to show.");
					}
				break;
				case "help":
					
					embed.setColor("#017cba")
					.setAuthor("Character Help Menu")
					.setDescription("-help | Information Help Menu\n!help | Rolling Help Menu\n&help | Character Help Menu")
					.addField("&create [characterID]", "Create new character with ID [characterID]")
					.addField("&delete [characterID]", "Delete character with ID [characterID]")
					.addField("&active [characterID]", "Set active character to character with ID [characterID]")
					.addField("&active", "Display current active character")
					.addField("&list", "List all characters and their IDs.")
					.addField("&show [characterID]", "Display character sheet of the character with ID [characterID]")
					.addField("&show", "Display character sheet of currently active character")
					.addField("&set [parameter] [value]", "Set the value of [parameter] to [value] for the currently active character. Use &show for an idea of [parameter]s.")
					.addField("&lock [characterID]", "Lock the character with ID [characterID], preventing further editing.")
					.addField("&unlock [characterID]", "Unlock the character with ID [characterID], allowing further editing.")
					.addField("&addtech [technique]", "Adds the given technique to the currently active character.")
					.addField("&removetech [technique]", "Removes the given technique from the currently active character.")
					.addField("&addnote [text]", "Adds a new note in the lowest available slot with the given text.")
					.addField("&setnote [notenumber] [text]", "Sets the text of the given note.")
					.addField("&removenote [notenumber]", "Deletes the given note.");
					
					message.channel.send({embed});
				break;
				default:
					message.channel.send("Okay, you broke something");
				break;
			}
			
		}
	}
});



client.login(config.token);