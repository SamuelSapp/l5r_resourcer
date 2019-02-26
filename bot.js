const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
 
let prefix = "-";
client.on("message", (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	
	var new_msg = message.content.toLowerCase();
	
	var command = new_msg.split(" ")
	
	const embed = new Discord.RichEmbed();
	
	var validCommand = false
	
	switch(command[0]) {
		case '-c':
			switch(command[1]) {
				case 'kagehisa':
				validCommand = true;
					embed.setImage("https://d28lcup14p4e72.cloudfront.net/234130/4204379/KakitaKagehisa.jpg")
					.setAuthor("Kakita Kagehisa", "", "https://forum.lady8jane.com/post/crane-clan-kakita-kagehisa-chief-emerald-magistrate-9943618?pid=1306399709")
					.setDescription("Kakita Kagehisa is the Chief Emerald Magistrate of Ryoko Owari Tochi since the assassination of Kakita Naritoki about a month ago. Before that he served as assistant to first Matsu Shigeko and then Kakita Naritoki for together almost five years. \n\nPrior to his time in Ryoko Owari he was a Crane Clan Magistrate in Shiro sano Kakita. He started his service there as Yoriki in his early twenties and worked his way up to Chief Crane Clan Magistrate of the Kakita Academy over the course of about 15 years.")
					break;
				default:
					break;
			}
			break;
		default:
			break;
	}
	
	if (validCommand) {
		message.channel.send({embed});
	}
});
 
client.login(config.token);