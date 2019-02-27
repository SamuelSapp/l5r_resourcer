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
 
let prefix = "-";

client.on("message", (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	
	if (message.author.username === "Moose") {
		message.channel.send("Fuck off, Moose");
	} else {
	
	var command = message.content.toLowerCase();
	//command = command.substring(1);
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
	}
});
 
client.login(config.token);