const { Client, GatewayIntentBits, Partials, ActivityType, AuditLogEvent, Events } = require('discord.js');
const env = require('./env.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');
const mariadb = require('./db.js');
const greet = require('./utilities/greet.js');
const embedcreator = require('./embed.js');
const emojiUnicode = require('emoji-unicode');
const figlet = require('figlet');
const botgate = require('./utilities/botgate.js');
const pkg = require('./package.json');
const CustomVC = require('./utilities/custom-vc.js');
const autorole = require('./utilities/autorole.js');
const vctools = require('./utilities/vc-tools.js');
const { checkMention } = require('./utilities/message-filter.js');
global.client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildModeration],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
global.client.login(env.discord.token);
console.log(figlet.textSync('THE GATO PROJECT', {
	font: 'Standard',
	horizontalLayout: 'default',
	verticalLayout: 'default',
}));
console.log(`Version: ${pkg.version}`);
console.log(`Author: ${pkg.author}`);
console.log(`GitHub: ${pkg.repository.url}`);
global.client.once('ready', async () => {
	console.log('Ready!');
	// get the number of users in the server
	const guild = global.client.guilds.cache.get(env.discord.guild);
	const members = await guild.members.fetch();
	// set the client's presence
	global.client.user.setActivity(`${members.size} members`, { type: ActivityType.Watching });
});

(async () => {
	db = await mariadb.getConnection();
	// drop table if it exists
	// only for testing
	// await db.query('DROP TABLE IF EXISTS roles');
	// create roles table if it doesn't exist
	await db.query('CREATE TABLE IF NOT EXISTS roles (id VARCHAR(255) PRIMARY KEY, emoji VARCHAR(255), raw_emoji VARCHAR(255), message_id VARCHAR(255), channel_id VARCHAR(255)) COLLATE utf8mb4_general_ci CHARSET utf8mb4;');
	// create notify table if it doesn't exist
	await db.query('CREATE TABLE IF NOT EXISTS notify (user_id VARCHAR(255) PRIMARY KEY, name VARCHAR(255))');
	// create settings table if it doesn't exist
	await db.query('CREATE TABLE IF NOT EXISTS settings (setting VARCHAR(255) PRIMARY KEY, value BOOLEAN)');
	// create custom vc table if it doesn't exist
	await db.query('CREATE TABLE IF NOT EXISTS custom_vc (user_id VARCHAR(255) PRIMARY KEY, channel_id VARCHAR(255))');
	// create auto role table if it doesn't exist
	await db.query('CREATE TABLE IF NOT EXISTS auto_role (role_id VARCHAR(255) PRIMARY KEY)');
	db.end();
}
)();
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Place your client and guild ids here
const clientId = env.discord.client_id;
const guildId = env.discord.guild;

for (const file of commandFiles) {
	console.log(`Loading command ${file}...`);
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(env.discord.token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
})();
global.client.on('messageCreate', async message => {
	if (message.author.bot) return;
	checkMention(message);
},
);

global.client.on('guildMemberAdd', async member => {

	// check if member is a bot
	if (member.user.bot) {
		botgatestatus = await botgate.status();
		console.log(`${member.user.tag} is a bot.`);
		if (botgatestatus === true) {
			console.log('Botgate is enabled.');
			console.log('Kicking bot...');
			member.kick('Botgate is enabled.');
			console.log('Kicked bot.');
			return greet.sendKickAlert(member);
		}
		else {
			console.log('Botgate is disabled.');
			const guild = global.client.guilds.cache.get(env.discord.guild);
			const members = await guild.members.fetch();
			global.client.user.setActivity(`${members.size} members`, { type: ActivityType.Watching });
			return greet.SendNewBotAlert(member);
		}
	}
	greet.sendNotify(member);

	// Update presence
	const guild = global.client.guilds.cache.get(env.discord.guild);
	const members = await guild.members.fetch();
	global.client.user.setActivity(`${members.size} members`, { type: ActivityType.Watching });
},
);

global.client.on('guildMemberUpdate', async (oldMember, newMember) => {
	try {
		if (oldMember.pending && !newMember.pending) {
			setTimeout(async () => {
				await greet.sendWelcome(newMember);
			}, 500);
			await autorole.assignRoles(newMember);

		}
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
});

global.client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(interaction.commandName);
	const commandFile = `./commands/${interaction.commandName}.js`;
	if (!fs.existsSync(commandFile)) return;
	const command = require(commandFile);
	await command.execute(interaction);
});
global.client.on('messageReactionAdd', async (reaction, user) => {
	if (user.bot) return;
	if (reaction.partial) {
		try {
			await reaction.fetch();
		}
		catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			embedcreator.sendError(error);
			return;
		}
	}
	const message = reaction.message;
	const channel = message.channel;
	const guild = channel.guild;
	console.log(reaction.emoji);
	if (reaction.emoji.id) {
		emoji = reaction.emoji.name;
	}
	else {
		emoji = emojiUnicode(reaction.emoji.name);
	}
	console.log(emoji);
	// query db for role
	try {
		db = await mariadb.getConnection();
		const role = await db.query('SELECT * FROM roles WHERE emoji = ? AND message_id = ?', [emoji, message.id]);
		db.end();
		const roleId = String(role[0].id);
		console.log(role);
		console.log(roleId);
		const roleName = await guild.roles.cache.get(roleId).name;
		const member = guild.members.cache.get(user.id);
		if (member) {
			try {
				member.roles.add(roleId);
			}
			catch (error) {
				console.error(error);
				embedcreator.sendError(error);
			}
		}
		console.log(`${user.username} reacted to ${roleName} in ${guild.name} with ${emoji}`);
		embedcreator.log(`${user} reacted to ${roleName} in ${guild.name} with ${reaction.emoji}`);
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
},
);
global.client.on('messageReactionRemove', async (reaction, user) => {
	if (user.bot) return;
	if (reaction.partial) {
		try {
			await reaction.fetch();
		}
		catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			embedcreator.sendError(error);
			return;
		}
	}
	try {
		const message = reaction.message;
		const channel = message.channel;
		const guild = channel.guild;
		console.log(reaction.emoji);
		if (reaction.emoji.id) {
			emoji = reaction.emoji.name;
		}
		else {
			emoji = emojiUnicode(reaction.emoji.name);
		}
		console.log(emoji);
		// query db for role
		db = await mariadb.getConnection();
		const role = await db.query('SELECT * FROM roles WHERE emoji = ? AND message_id = ?', [emoji, message.id]);
		db.end();
		if (role.length === 0) return;
		const roleId = String(role[0].id);
		const member = guild.members.cache.get(user.id);
		const roleName = guild.roles.cache.get(roleId).name;
		if (member) {
			try {
				member.roles.remove(roleId);
			}
			catch (error) {
				console.error(error);
			}
		}
		console.log(`${user.username} un-reacted to ${roleName} in ${guild.name} with ${emoji}`);
		embedcreator.log(`${user} un-reacted to ${roleName} in ${guild.name} with ${reaction.emoji}`);
	}
	catch (error) {
		console.error(error);
		// send error to discord
		embedcreator.sendError(error);
	}
},
);

global.client.on('voiceStateUpdate', async (oldState, newState) => {
	newUserChannel = await newState.channelId;
	oldUserChannel = await oldState.channelId;
	const createcustomvc = env.utilities.customvc.channel;
	await CustomVC.Cleanup(oldState);
	if (newUserChannel === createcustomvc) {
		CustomVC.Create(newState);
	}
	await vctools.setBitrate();
});

// listen for button interactions
global.client.on('interactionCreate', async interaction => {
	try {
		if (!interaction.isButton()) return;
		// check if channel is in db
		const channel = interaction.channel.id;
		const custom_vc_channels = await CustomVC.getChannels();
		if (!custom_vc_channels.includes(channel)) return;
		usercheck = await CustomVC.checkUser(interaction.user.id);
		if (usercheck === false) return;
		if (!usercheck.includes(channel)) return;
		await CustomVC.buttonResponder(interaction);
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
});

global.client.on(Events.GuildAuditLogEntryCreate, async auditLog => {
	// define audit log variables
	const { action, executorId, targetId, reason } = auditLog;
	// Check only for banned users.
	if (action == AuditLogEvent.MemberBanAdd) {
		// Ensure the executor is cached.
		const user = await client.users.fetch(executorId);
		// Ensure the banned guild member is cached.
		const banedUser = await client.users.fetch(targetId);
		const reasonformatted = reason || 'No reason provided';
		// Now log the output!
		await embedcreator.banAlert(user, banedUser, reasonformatted);
		console.log(`${user.tag} banned ${banedUser.tag}! Reason: ${reasonformatted}`);
	}
	else if (action == AuditLogEvent.MemberKick) {
		// Ensure the executor is cached.
		const user = await client.users.fetch(executorId);
		// Ensure the banned guild member is cached.
		const kickedUser = await client.users.fetch(targetId);
		const reasonformatted = reason || 'No reason provided';
		// Now you can log the output!
		await embedcreator.kickAlert(user, kickedUser, reasonformatted);
		console.log(`${user.tag} kicked ${kickedUser.tag}! Reason: ${reasonformatted}`);
	}
});

process.on('unhandledRejection', error => {
	console.error(error);
	// send error to discord
	embedcreator.sendError(error);
},
);