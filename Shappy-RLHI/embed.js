const env = require('./env.js');
const merge = require('lodash.merge');
var setembed = function(opts){
	var embed = {
		// Discord Embed Template Coda
		title: '',
		description: '',
		color: 0x19ebfe,
		url: '',
		timestamp: `${new Date().toISOString()}`,
		footer: {
			text: 'the gato project',
			icon_url: `${global.client.guilds.cache.get(env.discord.guild).iconURL({ dynamic: true })}`,
		},
	};
	return merge (embed, opts);
};
var sendError = function(message){
	try {
		var embed = setembed({
			title: 'Error',
			description: `${message}`,
			color: 0xe74c3c,
		});
		global.client.channels.cache.get(env.discord.logs_channel).send({ embeds: [embed] });
	}
	catch (err) {
		console.log(err);
	}
};
var log = function(message){
	var embed = setembed({
		title: 'Log',
		description: `${message}`,
		color: 0x19ebfe,
	});
	global.client.channels.cache.get(env.discord.logs_channel).send({ embeds: [embed] });
};
var alert = function(message){
	var embed = setembed({
		title: '🚨 Alert 🚨',
		description: `${message}`,
		color: 0xe74c3c,
	});
	global.client.channels.cache.get(env.discord.logs_channel).send({ content: '🚨 Critical Alert 🚨' + '\n<@&' + env.discord.admin_role + '> <@&' + env.discord.mod_role + '>', embeds: [embed] });
};
var banAlert = async function(userbanning, userbanned, reason){
	try {
		var embed = setembed({
			title: '🚨 Ban Alert 🚨',
			description: `${userbanning} has banned ${userbanned} from the server.`,
			thumbnail: {
				url: `${userbanned.displayAvatarURL({ dynamic: true })}`,
			},
			fields: [
				{
					name: 'Reason',
					value: `${reason}`,
				},
				{
					name: 'User ID',
					value: `${userbanned.id}`,
				},
				{
					name: 'User Tag',
					value: `${userbanned.tag}`,
				},
				{
					name: 'Joined Discord',
					value: `${userbanned.createdAt}`,
				},
				{
					name: 'Mod ID',
					value: `${userbanning.id}`,
				},
				{
					name: 'Mod Tag',
					value: `${userbanning.tag}`,
				},
			],
			color: 0xe74c3c,
		});
		global.client.channels.cache.get(env.discord.logs_channel).send({ content: `Attention <@&${env.discord.mod_role}>, ${userbanning} has banned ${userbanned}`, embeds: [embed] });
	}
	catch (err) {
		console.log(err);
		sendError(err);
	}
};
var kickAlert = async function(userkicking, userkicked, reason){
	try {
		var embed = setembed({
			title: '🚨 Kick Alert 🚨',
			description: `${userkicking} has kicked ${userkicked} from the server.`,
			thumbnail: {
				url: `${userkicked.displayAvatarURL({ dynamic: true })}`,
			},
			fields: [
				{
					name: 'Reason',
					value: `${reason}`,
				},
				{
					name: 'User ID',
					value: `${userkicked.id}`,
				},
				{
					name: 'User Tag',
					value: `${userkicked.tag}`,
				},
				{
					name: 'Joined Discord',
					value: `<t:${parseInt(userkicked.createdTimestamp / 1000, 10)}:F>`,
				},
				{
					name: 'Mod ID',
					value: `${userkicking.id}`,
				},
				{
					name: 'Mod Tag',
					value: `${userkicking.tag}`,
				},
			],
			color: 0xe74c3c,
		});
		global.client.channels.cache.get(env.discord.logs_channel).send({ content: `Attention <@&${env.discord.mod_role}>, ${userkicking} has kicked ${userkicked}`, embeds: [embed] });
	}
	catch (err) {
		console.log(err);
		sendError(err);
	}
};
var mentionAlert = async function(message){
	try {
		var embed = setembed({
			title: '🚨 Mass Mention Alert 🚨',
			description: `${message.author} has mass mentioned in ${message.channel}`,
			thumbnail: {
				url: `${message.member.displayAvatarURL({ dynamic: true })}`,
			},
			fields: [
				{
					name: 'Message Content',
					value: `${message.content}`,
				},
				{
					name: 'User ID',
					value: `${message.author.id}`,
				},
				{
					name: 'User Tag',
					value: `${message.author.tag}`,
				},
				{
					name: 'Joined Discord',
					value: `<t:${parseInt(message.author.createdTimestamp / 1000, 10)}:F>`,
				},
				{
					name: 'Joined Server',
					value: `<t:${parseInt(message.member.joinedTimestamp / 1000, 10)}:F>`,
				},
			],
			color: 0xe74c3c,
		});
		global.client.channels.cache.get(env.discord.logs_channel).send({ content: `Attention <@&${env.discord.mod_role}>, ${message.member} attempted to mass mention`, embeds: [embed] });
	}
	catch (err) {
		console.log(err);
		sendError(err);
	}
};
module.exports = { setembed, sendError, log, alert, banAlert, kickAlert, mentionAlert };
