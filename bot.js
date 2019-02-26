const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const npc = require("./NPC.json");
 
let prefix = "-";

client.on("message", (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	
	var new_msg = message.content.toLowerCase();
	
	var command = new_msg.split(" ")
	
	const embed = new Discord.RichEmbed();
	
	var validCommand = false
	
	switch(command[0]) {
		case '-npc':
			if(command[1] in npc){
				validCommand = true
				embed.setImage(npc[command[1]].imageURL)
				.setAuthor(npc[command[1]].title, "", npc[command[1]].infoURL)
				.setDescription(npc[command[1]].description)
			} else {
				
			}
			break;
		default:
			break;
	}
	
	if (validCommand) {
		message.channel.send({embed});
	} else {
		message.channel.send("Something went wrong, my dude.");
	}
});
 
client.login(config.token);