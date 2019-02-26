const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const npc = require("./NPC.json");
const kata = require("./kata.json");
const info_lists = require("./info_lists.json");
 
let prefix = "-";

client.on("message", (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	
	var command = message.content.toLowerCase();
	command = command.replace("-", "");
	
	const embed = new Discord.RichEmbed();
	
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
	} else if (command in info_lists){
		validCommand = true;
		embed.setDescription(info_lists[command].description)
			.setAuthor(info_lists[command].title)
	} else if (command === "help") {
		validCommand = true;
		embed.setImage("https://i.imgur.com/zUeBxmP.gif")
			.setAuthor("No")
			.setDescription("go kill yourself");
	}
	
	if (validCommand) {
		message.channel.send({embed});
	} else {
		message.channel.send("Something went wrong, my dude.");
	}
});
 
client.login(config.token);