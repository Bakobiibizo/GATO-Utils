const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mariadb = require('../db.js');
const embedcreator = require('../embed.js');
const env = require('../env.js');
const { getMaxBitrate } = require('./vc-tools.js');
collector = false;
async function buttonResponder(interaction) {
	const buttonid = interaction.customId;
	const userchannel = await checkUser(interaction.user.id);
	const userid = interaction.user.id;
	// check if collector is running
	if (collector) {
		await interaction.reply({ content: 'Please finish the previous action first', ephemeral: true });
		return;
	}
	if (buttonid === 'deletechannel') {
		await interaction.reply({ content: 'Channel deleted' });
		await deleteChannel(userchannel);
	}
	if (buttonid === 'renamechannel') {
		interaction.reply({ content: 'Please enter the new name' });
		// message collector to collect new name
		const filter = m => m.author.id === interaction.user.id;
		collector = interaction.channel.createMessageCollector({ filter, time: 600000 });
		collector.on('collect', async m => {
			const newname = await m.content;
			const message = await m;
			await collector.stop();
			collector = false;
			await renameChannel(userchannel, newname);
			followup = await interaction.followUp({ content: 'Channel renamed to ' + newname });
			// delete reply after timout
			setTimeout(async function() {
				await followup.delete();
				const reply = await interaction.fetchReply();
				await reply.delete();
				// delete user message
				await message.delete();
			}, 1000);
			const { content, embed, row } = await generateMenuEmbed(interaction.channel.id);
			await interaction.followUp({ content: content, embeds: [embed], components: [row] });
			// cleanup old embed
			const oldembed = await interaction.channel.messages.fetch(interaction.message.id);
			await oldembed.delete();
		});
		collector.on('end', async collected => {
			if (collected.size === 0) {
				timeout = await interaction.followUp({ content: 'Timed out' });
				// cleanup timeout message
				setTimeout(async function() {
					await timeout.delete();
					const reply = await interaction.fetchReply();
					await reply.delete();
				}, 1000);
			}
		});
	}
	if (buttonid === 'userlimit') {
		interaction.reply({ content: 'Please enter the new user limit' });
		// message collector to collect new user limit
		const filter = m => m.author.id === interaction.user.id;
		collector = interaction.channel.createMessageCollector({ filter, time: 600000 });
		collector.on('collect', async m => {
			const newlimit = await m.content;
			const message = await m;
			await collector.stop();
			collector = false;
			if (parseInt(newlimit) >= 0 && parseInt(newlimit) <= 99) {
				await changeUserLimit(userchannel, newlimit);
				followup = await interaction.followUp({ content: 'User limit changed to ' + newlimit });
				// delete reply after timout
				setTimeout(async function() {
					await followup.delete();
					const reply = await interaction.fetchReply();
					await reply.delete();
					// delete user message
					await message.delete();
				}, 1000);
				const { content, embed, row } = await generateMenuEmbed(interaction.channel.id);
				await interaction.followUp({ content: content, embeds: [embed], components: [row] });
				// cleanup old embed
				const oldembed = await interaction.channel.messages.fetch(interaction.message.id);
				await oldembed.delete();
			}
			else {
				followup = await interaction.followUp({ content: 'Invalid user limit' });
				// delete followUp after timout
				setTimeout(async function() {
					await followup.delete();
					const reply = await interaction.fetchReply();
					await reply.delete();
					// delete user message
					await message.delete();
				}
				, 1000);
			}
		});
		collector.on('end', async collected => {
			if (collected.size === 0) {
				timeout = await interaction.followUp({ content: 'Timed out' });
				// cleanup timeout message
				setTimeout(async function() {
					await timeout.delete();
					const reply = await interaction.fetchReply();
					await reply.delete();
				}, 1000);
			}
		});
	}
	if (buttonid === 'transferownership') {
		await interaction.reply({ content: 'Please mention the new owner' });
		// message collector to collect new owner
		const filter = m => m.author.id === interaction.user.id;
		collector = await interaction.channel.createMessageCollector({ filter, time: 600000 });
		collector.on('collect', async m => {
			const newowner = await m.mentions.members.first();
			const message = await m;
			await collector.stop();
			collector = false;
			if (newowner) {
				await transferOwnership(userid, newowner.user.id, userchannel);
				followup = await interaction.followUp({ content: 'Ownership transferred to <@' + newowner.user + '>' });
				// delete reply after timout
				setTimeout(async function() {
					await followup.delete();
					const reply = await interaction.fetchReply();
					await reply.delete();
					// delete user message
					await message.delete();
				}, 1000);
				const { content, embed, row } = await generateMenuEmbed(interaction.channel.id);
				await interaction.followUp({ content: content, embeds: [embed], components: [row] });
				// cleanup old embed
				const oldembed = await interaction.channel.messages.fetch(interaction.message.id);
				await oldembed.delete();
			}
			else {
				followup = await interaction.followUp({ content: 'Invalid user' });
				// delete followUp after timout
				setTimeout(async function() {
					await followup.delete();
					const reply = await interaction.fetchReply();
					await reply.delete();
					// delete user message
					await message.delete();
				}
				, 1000);
			}
		});
		collector.on('end', async collected => {
			if (collected.size === 0) {
				timeout = await interaction.followUp({ content: 'Timed out' });
				// cleanup timeout message
				setTimeout(async function() {
					await timeout.delete();
					const reply = await interaction.fetchReply();
					await reply.delete();
				}, 1000);
			}
		});
	}
	if (buttonid === 'visibility') {
		const status = await changeVisibility(userchannel);
		await interaction.reply({ content: 'Visibility changed to ' + status });
		// delete reply after timout
		setTimeout(async function() {
			const reply = await interaction.fetchReply();
			await reply.delete();
		}, 1000);
		const { content, embed, row } = await generateMenuEmbed(interaction.channel.id);
		await interaction.followUp({ content: content, embeds: [embed], components: [row] });
		// cleanup old embed
		const oldembed = await interaction.channel.messages.fetch(interaction.message.id);
		await oldembed.delete();
	}
}
// Rename Channel
async function renameChannel(channelid, newname) {
	try {
		const channel = await global.client.channels.cache.get(channelid);
		return await channel.setName(newname);
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
// Change Visibility
async function changeVisibility(channelid) {
	try {
		guild = await global.client.guilds.cache.get(env.discord.guild);
		const channel = global.client.channels.cache.get(channelid);
		const haspermission = await channel.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.ViewChannel);
		if (haspermission) {
			await channel.permissionOverwrites.edit(guild.roles.everyone.id, { ViewChannel: false, Connect: false });
			return 'hidden';
		}
		else {
			await channel.permissionOverwrites.edit(guild.roles.everyone.id, { ViewChannel: true, Connect: true });
			// change button to visible
			return 'visible';
		}
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}

// Change User Limit
async function changeUserLimit(channelid, newlimit) {
	try {
		const channel = await global.client.channels.cache.get(channelid);
		return await channel.setUserLimit(newlimit);
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
// Transfer Ownership
async function transferOwnership(olduser, newuser, channelid) {
	try {
	// set vc perms
		const channel = await global.client.channels.cache.get(channelid);
		// set perms
		await channel.permissionOverwrites.delete(olduser);
		await channel.permissionOverwrites.edit(
			newuser,
			{
				ViewChannel: true,
				ManageChannels: true,
				ManageRoles: true,
				Stream: true,
				ReadMessageHistory: true,
				SendMessages: true,
				Connect: true,
				Speak: true,
				MoveMembers: true,
				MuteMembers: true,
				DeafenMembers: true,
				UseEmbeddedActivities: true,
			},
		);
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
	try {
		const db = await mariadb.getConnection();
		await db.query('UPDATE custom_vc SET user_id = ? WHERE channel_id = ?', [newuser, channelid]);
		db.end();
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
// Check if user already has a channel
async function checkUser(userid) {
	const db = await mariadb.getConnection();
	const rows = await db.query('SELECT channel_id FROM custom_vc WHERE user_id = ?', [userid]);
	db.end();
	if (rows.length > 0) {
		return rows[0].channel_id;
	}
	else {
		return false;
	}
}
// Get Channels from DB
async function getChannels() {
	db = await mariadb.getConnection();
	rows = await db.query('SELECT channel_id FROM custom_vc');
	channels = [];
	for (row of rows) {
		channels.push(row.channel_id);
	}
	db.end();
	return channels;
}
// Delete Channel
async function deleteChannel(channel_id) {
	try {
		const db = await mariadb.getConnection();
		await db.query('DELETE FROM custom_vc WHERE channel_id = ?', [channel_id]);
		db.end();
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
	try {
		if (global.client.channels.cache.get(channel_id)){
			await global.client.channels.cache.get(channel_id).delete();
		}

	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
// Create CustomVC
async function Create(newState) {
	// check to ensure user doesn't already have a channel
	// get member from newState
	const {member} = newState;
	const userid = await member.id;
	const userhaschannel = await checkUser(newState.member.id);
	if (userhaschannel) {
		return member.voice.setChannel(userhaschannel);
	}
	// create channel
	// get category
	const category = newState.guild.channels.cache.get(newState.channelId).parentId;
	guild = await global.client.guilds.cache.get(env.discord.guild);
	userobject = await guild.members.fetch(userid);
	nickname = await userobject.displayName;
	vc_bitrate = await getMaxBitrate();
	const channel = await member.guild.channels.create({
		name: nickname + '\'s Channel',
		type: ChannelType.GuildVoice,
		bitrate: vc_bitrate,
		parent: category,
		// allow user to manage channel
		permissionOverwrites: [
			{
				id: userid,
				allow: [
					PermissionFlagsBits.ViewChannel,
					PermissionFlagsBits.ManageChannels,
					PermissionFlagsBits.ManageRoles,
					PermissionFlagsBits.Stream,
					PermissionFlagsBits.ReadMessageHistory,
					PermissionFlagsBits.SendMessages,
					PermissionFlagsBits.Connect,
					PermissionFlagsBits.Speak,
					PermissionFlagsBits.MoveMembers,
					PermissionFlagsBits.MuteMembers,
					PermissionFlagsBits.DeafenMembers,
				],
			},
			{
				id: newState.guild.roles.everyone,
				allow: [
					PermissionFlagsBits.ViewChannel,
					PermissionFlagsBits.Connect,
					PermissionFlagsBits.Stream,
					PermissionFlagsBits.ReadMessageHistory,
					PermissionFlagsBits.SendMessages,
					PermissionFlagsBits.Speak,
				],
			},
		],
	});

	// move member to channel
	await member.voice.setChannel(channel);

	// add channel to db
	try {
		const db = await mariadb.getConnection();
		await db.query('INSERT INTO custom_vc (user_id, channel_id) VALUES (?, ?)', [member.id, channel.id]);
		db.end();
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
	try {
		// send menu embed
		const { content, embed, row } = await generateMenuEmbed(channel.id);
		await channel.send({ content: content, embeds: [embed], components: [row] });
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
// Generate Menu Embed
async function generateMenuEmbed(channelid) {
	// get owner
	const db = await mariadb.getConnection();
	const rows = await db.query('SELECT user_id FROM custom_vc WHERE channel_id = ?', [channelid]);
	db.end();
	const owner = rows[0].user_id;
	const content = 'Welcome <@' + owner + '> to your custom voice channel.';
	const channel = await global.client.channels.cache.get(channelid);
	const guild = await global.client.guilds.cache.get(env.discord.guild);
	// check if channel is visible
	const visible = await channel.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.ViewChannel);
	if (visible) {
		visibilitystatus = 'Visible';
		visibilitybutton = ButtonStyle.Success;
	}
	else {
		visibilitystatus = 'Hidden';
		visibilitybutton = ButtonStyle.Danger;
	}
	const embed = await embedcreator.setembed(
		{
			title: 'Custom voice channel menu',
			description: `
			**Visibility:** ${visibilitystatus}
			**Owner:** <@${owner}>
			**Channel name:** ${channel.name}
			**Bitrate:** ${channel.bitrate}
			**User limit:** ${channel.userLimit}
			Click on the buttons below to manage your channel.
			`,
		},
	);
	const userlimit = new ButtonBuilder()
		.setCustomId('userlimit')
		.setLabel('User limit')
		.setEmoji('👥')
		.setStyle(ButtonStyle.Primary);
	const visibility = new ButtonBuilder()
		.setCustomId('visibility')
		.setLabel(visibilitystatus)
		.setEmoji('👁️')
		.setStyle(visibilitybutton);
	const transferownership = new ButtonBuilder()
		.setCustomId('transferownership')
		.setLabel('Transfer ownership')
		.setEmoji('👑')
		.setStyle(ButtonStyle.Primary);
	const deletechannel = new ButtonBuilder()
		.setCustomId('deletechannel')
		.setLabel('Delete channel')
		.setEmoji('🗑️')
		.setStyle(ButtonStyle.Danger);
	const renamechannel = new ButtonBuilder()
		.setCustomId('renamechannel')
		.setLabel('Rename channel')
		.setEmoji('📝')
		.setStyle(ButtonStyle.Primary);
	const row = new ActionRowBuilder()
		.addComponents(renamechannel, userlimit, visibility, transferownership, deletechannel);
	return { content, embed, row };
}
// Destroy CustomVC
async function Cleanup() {
	try {
		// grab channe id's from db
		const channels = await getChannels();
		// loop through channels
		for (const channel_id of channels) {
			// check if channel exists
			const channel = await global.client.channels.cache.get(channel_id);
			if (channel) {
				// check if channel is empty
				if (channel.members.size == 0) {
				// delete channel
					await deleteChannel(channel.id);
				}
			}
			else {
				// delete channel from db
				await deleteChannel(channel_id);
			}
		}
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}


module.exports = { Create, Cleanup, getChannels, checkUser, deleteChannel, buttonResponder };