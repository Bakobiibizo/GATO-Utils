const mariadb = require('../db.js');
const env = require('../env.js');
const embedcreator = require('../embed.js');
const welcome = require('./welcome.js');
// get users from database and put id's in array
async function getUsers() {
	db = await mariadb.getConnection();
	rows = await db.query('SELECT user_id FROM notify');
	users = [];
	for (row of rows) {
		users.push(row.user_id);
	}
	db.end();
	return users;
}

async function sendNotify(member) {
	const users = await getUsers();
	for (userId of users) {
		console.log(userId);
		const user = await global.client.users.fetch(userId);
		user.send(
			{
				embeds: [ embedcreator.setembed(
					{
						title: 'New Member',
						description: `${member.user} has joined ${global.client.guilds.cache.get(env.discord.guild).name}`,
						color: 0x19ebfe,
						image: {
							url: member.user.displayAvatarURL(),
						},
					},
				)],
			},
		);
	}
}
async function sendKickAlert(member) {
	const users = await getUsers();
	for (userId of users) {
		console.log(userId);
		const user = await global.client.users.fetch(userId);
		user.send(
			{
				embeds: [ embedcreator.setembed(
					{
						title: '🚨 Bot Kicked 🚨',
						description: `${member.user} joined ${global.client.guilds.cache.get(env.discord.guild).name} and was kicked due to botgate being enabled`,
						color: 0xe74c3c,
						image: {
							url: member.user.displayAvatarURL(),
						},
					},
				)],
			},
		);
	}
	global.client.channels.cache.get(env.discord.logs_channel).send(
		{
			content: '🚨 Bot Kicked from Server 🚨' + '\n<@&' + env.discord.admin_role + '> <@&' + env.discord.mod_role + '>',
			embeds: [ embedcreator.setembed(
				{
					title: 'Bot Kicked',
					description: `${member.user} joined ${global.client.guilds.cache.get(env.discord.guild).name} and was kicked due to botgate being enabled`,
					color: 0xe74c3c,
					image: {
						url: member.user.displayAvatarURL(),
					},
				},
			)],
		},
	);
}

async function SendNewBotAlert(member) {
	const users = await getUsers();
	for (userId of users) {
		console.log(userId);
		const user = await global.client.users.fetch(userId);
		user.send(
			{
				embeds: [ embedcreator.setembed(
					{
						title: '🚨 Bot Added 🚨',
						description: `Botgate was disabled and ${member.user} joined ${global.client.guilds.cache.get(env.discord.guild).name}, please re-enable botgate as soon as possible`,
						color: 0x2ecc71,
						image: {
							url: member.user.displayAvatarURL(),
						},
					},
				)],
			},
		);
	}

	global.client.channels.cache.get(env.discord.logs_channel).send(
		{
			content: '🚨 Bot Added to Server 🚨' + '\n<@&' + env.discord.admin_role + '> <@&' + env.discord.mod_role + '>',
			embeds: [ embedcreator.setembed(
				{
					title: '🚨 Bot Added 🚨',
					description: `Botgate was disabled and ${member.user} joined ${global.client.guilds.cache.get(env.discord.guild).name}, please re-enable botgate as soon as possible`,
					color: 0x2ecc71,
					image: {
						url: member.user.displayAvatarURL(),
					},
				},
			)],
		},
	);
}

async function sendWelcome(member) {
// send welcome message
	const welcome_channel = await global.client.channels.cache.get(env.discord.welcome_channel);
	const welcome_message = await welcome.getWelcome();
	welcome_channel.send(
		// send message
		{
			content: 'Welcome to ' + global.client.guilds.cache.get(env.discord.guild).name + ` ${member.user}` + '!\n' + await welcome_message,
		},
	);
}

module.exports = { sendNotify, getUsers, sendKickAlert, SendNewBotAlert, sendWelcome };