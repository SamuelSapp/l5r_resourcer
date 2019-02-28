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

let infoprefix = "-";
let diceprefix = "!";

var diceEmotes = {};

client.on('ready', () => {
	console.log('ready');
	diceEmotes = {
	1:client.emojis.find(emoji => emoji.name === "black"),
	2:client.emojis.find(emoji => emoji.name === "blackot"),
	3:client.emojis.find(emoji => emoji.name === "blacko"),
	4:client.emojis.find(emoji => emoji.name === "blackst"),
	5:client.emojis.find(emoji => emoji.name === "blacks"),
	6:client.emojis.find(emoji => emoji.name === "blacket"),
	7:client.emojis.find(emoji => emoji.name === "white"),
	8:client.emojis.find(emoji => emoji.name === "white"),
	9:client.emojis.find(emoji => emoji.name === "whiteo"),
	10:client.emojis.find(emoji => emoji.name === "whiteo"),
	11:client.emojis.find(emoji => emoji.name === "whiteo"),
	12:client.emojis.find(emoji => emoji.name === "whitest"),
	13:client.emojis.find(emoji => emoji.name === "whitest"),
	14:client.emojis.find(emoji => emoji.name === "whites"),
	15:client.emojis.find(emoji => emoji.name === "whites"),
	16:client.emojis.find(emoji => emoji.name === "whiteso"),
	17:client.emojis.find(emoji => emoji.name === "whiteet"),
	18:client.emojis.find(emoji => emoji.name === "whitee"),
	expsuccess:client.emojis.find(emoji => emoji.name === "expsuccess"),
	success:client.emojis.find(emoji => emoji.name === "success"),
	opportunity:client.emojis.find(emoji => emoji.name === "opportunity"),
	strife:client.emojis.find(emoji => emoji.name === "strife")
};
	
});

client.on("message", (message) => {
	
	if (!(message.content.startsWith(infoprefix)  || message.content.startsWith(diceprefix)) || message.author.bot) return;
	
	if (message.content.startsWith(infoprefix)) {
		
		var command = message.content.toLowerCase();
		command = command.replace(/(?![a-z])./g, '')
		
		const embed = new Discord.RichEmbed();
		embed.setColor("#017cba")
		
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
			message.channel.send("Something went wrong, my dude.");
		}
	} else if (message.content.startsWith(diceprefix)) {
		var commands = message.content.toLowerCase().split(" ");
		
		if (commands[0] === diceprefix.concat("roll")) {
			if (commands[1].replace(/([brsw])/g, '') === "") {
				var numWhite = 0;
				var numBlack = 0;
				
				for (let i = 0; i < commands[1].length; i++) {
					switch (commands[1].charAt(i)) {
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
				rollResults[message.author.username] = newRoll(numBlack, numWhite);
				message.channel.send(rollResults[message.author.username].diceStr);
				message.channel.send(rollResults[message.author.username].resultStr);
			} else {
				message.channel.send("You used the wrong letters or something, man.\rUse r, s, b, or w only please.");
			}
		} else {
			message.channel.send("Something went wrong, my dude.");
		}
		
		
	}
});

var rollResults = {
	prototype: {
		rollArray: [],
		diceStr: "",
		resultStr: "",
		numBlack: 0,
		numWhite: 0,
		success: 0,
		expsuccess: 0,
		opportunity: 0,
		strife: 0
	}
};



function randBetween(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

function newRoll(numBlack, numWhite) {
	var rollArray = [];
	var diceStr = "";
	var resultStr = "";
	var success = 0;
	var expsuccess = 0;
	var opportunity = 0;
	var strife = 0;
	for (i = 0; i < numBlack; i++) {
		var x = randBetween(1,6);
		rollArray.push(x);
		diceStr = diceStr.concat(diceEmotes[x]);
	}
	for (i = 0; i < numWhite; i++) {
		var x = randBetween(7,18);
		rollArray.push(x);
		diceStr = diceStr.concat(diceEmotes[x]);
	}
	
	rollArray.forEach(function(item, index, array) {
		switch(item) {
			case 1:
			break;
			case 2:
			opportunity++;
			strife++;
			break;
			case 3:
			opportunity++;
			break;
			case 4:
			success++;
			strife++;
			break;
			case 5:
			success++;
			break;
			case 6:
			success++;
			expsuccess++;
			strife++;
			break;
			case 7:
			break;
			case 8:
			break;
			case 9:
			opportunity++;
			break;
			case 10:
			opportunity++;
			break;
			case 11:
			opportunity++;
			break;
			case 12:
			success++;
			strife++;
			break;
			case 13:
			success++;
			strife++;
			break;
			case 14:
			success++;
			break;
			case 15:
			success++;
			break;
			case 16:
			success++;
			opportunity++;
			break;
			case 17:
			success++;
			expsuccess++;
			strife++;
			break;
			case 18:
			success++;
			expsuccess++;
			break;
			default:
			break;
		}
	});
	
	if (expsuccess > 0) {
		resultStr = resultStr.concat(diceEmotes.expsuccess, expsuccess.toString());
	};
	if (success > 0) {
		resultStr = resultStr.concat(diceEmotes.success, success.toString());
	};
	if (opportunity > 0) {
		resultStr = resultStr.concat(diceEmotes.opportunity, opportunity.toString());
	};
	if (strife > 0) {
		resultStr = resultStr.concat(diceEmotes.strife, strife.toString());
	};
	
	return {
		rollArray: rollArray,
		diceStr: diceStr,
		resultStr: resultStr,
		numBlack: numBlack,
		numWhite: numWhite,
		success: success,
		expsuccess: expsuccess,
		opportunity: opportunity,
		strife: strife
	};
};	

client.login(config.token);