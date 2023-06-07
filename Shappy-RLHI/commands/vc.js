const { SlashCommandBuilder } = require('@discordjs/builders');
const env = require('../env.js');
const embedcreator = require('../embed.js');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('vc')
		.setDescription('Allows you to bulk move people to a voice channel')
		.setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
		.addSubcommand(subcommand =>
			subcommand
				.setName('move')
				.setDescription('Move a group of users to a voice channel')
				.addChannelOption(option =>
					option
						.setName('destination')
						.setDescription('The name of the voice channel to move the users to')
						.setRequired(true))
				.addChannelOption(option =>
					option
						.setName('source')
						.setDescription('The name of the voice channel to move the users from')
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('mute')
				.setDescription('Mute a group of users to a voice channel')
				.addUserOption(option =>
					option
						.setName('exclude')
						.setDescription('List of users to exclude from the mute')
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('unmute')
				.setDescription('Unmute a group of users to a voice channel')
				.addUserOption(option =>
					option
						.setName('exclude')
						.setDescription('List of users to exclude from the unmute')
						.setRequired(false))),
	async execute(interaction) {
		// Limit command to Founders and Mods
		if (!(interaction.member.roles.cache.has(env.discord.admin_role) || interaction.member.roles.cache.has(env.discord.mod_role))) {
			global.client.channels.cache.get(env.discord.logs_channel).send({
				embeds: [ embedcreator.setembed(
					{
						title: 'Incident Detected',
						description: `${interaction.member.user} tried to use the vc move command but did not have the correct role.`,
						color: 0xe74c3c,
					},
				)],
			},
			);
			return interaction.reply({
				embeds: [ embedcreator.setembed(
					{
						title: 'Incident Reported',
						description: 'You do not have permission to use this command. This incident has been reported.',
						color: 0xe74c3c,
					},
				),
				], ephemeral: true,
			});
		}
		try {
			const people = [];
			const exclude = [];
			const subcommand = interaction.options.getSubcommand();
			if (subcommand === 'mute') {
				// Exclude self
				exclude.push(interaction.member.user.id);
				if (interaction.options.get('exclude')) {
					exclude.push(interaction.options.get('exclude').value);
				}
				channel = await global.client.channels.cache.get(interaction.member.voice.channel.id);
				await channel.members.forEach(member => {
					if (!exclude.includes(member.user.id)) {
						member.voice.setMute(true);
						people.push(member.user);
					}
				});
				vc = channel;
				if (!channel) {
					return interaction.reply({
						embeds: [ embedcreator.setembed(
							{
								title: 'Error',
								description: 'You must be in a voice channel to use this command.',
								color: 0xe74c3c,
							},
						),
						], ephemeral: true,
					});
				}
				if (vc.members.size === 0) {
					return interaction.reply({
						embeds: [ embedcreator.setembed(
							{
								title: 'No Users',
								description: 'There are no users in the voice channel.',
								color: 0xe74c3c,
							},
						),
						], ephemeral: true,
					});
				}
				global.client.channels.cache.get(env.discord.logs_channel).send({
					embeds: [ embedcreator.setembed(
						{
							title: 'VC Mute',
							description: `${interaction.member.user} muted ${people} in ${vc}`,
							color: 0xe74c3c,
						},
					)],
				});
				return interaction.reply({
					embeds: [ embedcreator.setembed(
						{
							title: 'VC Mute',
							description: `Muted ${people} in ${vc}`,
							color: 0xe74c3c,
						},
					),
					], ephemeral: true,
				});
			}
			if (subcommand === 'unmute') {
				channel = await global.client.channels.cache.get(interaction.member.voice.channel.id);
				await channel.members.forEach(member => {
					member.voice.setMute(false);
					people.push(member.user);
				});
				vc = channel;
				if (!channel) {
					return interaction.reply({
						embeds: [ embedcreator.setembed(
							{
								title: 'Error',
								description: 'You must be in a voice channel to use this command.',
								color: 0xe74c3c,
							},
						),
						], ephemeral: true,
					});
				}
				if (vc.members.size === 0) {
					return interaction.reply({
						embeds: [ embedcreator.setembed(
							{
								title: 'No Users',
								description: 'There are no users in the voice channel.',
								color: 0xe74c3c,
							},
						),
						], ephemeral: true,
					});
				}
				global.client.channels.cache.get(env.discord.logs_channel).send({
					embeds: [ embedcreator.setembed(
						{
							title: 'VC Mute',
							description: `${interaction.member.user} unmuted ${people} in ${vc}`,
							color: 0xe74c3c,
						},
					)],
				});
				return interaction.reply({
					embeds: [ embedcreator.setembed(
						{
							title: 'VC Mute',
							description: `Unmuted ${people} in ${vc}`,
							color: 0x2ecc71,
						},
					),
					], ephemeral: true,
				});
			}

			if (subcommand === 'move') {
				const userdestination = interaction.options.get('destination').value;
				const destination = userdestination.replace(/[^0-9.]+/g, '');
				const destinationvc = global.client.channels.cache.get(destination);
				console.log('move');
				if (interaction.options.get('source')) {
					console.log('source');
					var usersource = interaction.options.get('source').value;
					var sourceid = usersource.replace(/[^0-9.]+/g, '');
					var sourcevc = await global.client.channels.cache.get(sourceid);
					if (sourcevc && sourcevc.type === 2 && destinationvc && destinationvc.type === 2) {
						await sourcevc.members.forEach(member => {
							member.voice.setChannel(destination);
							people.push(member);
						});
						return interaction.reply({
							embeds: [ embedcreator.setembed(
								{
									title: 'Success',
									description: `Successfully moved ${people} from ${sourcevc} to ${destinationvc}`,
									color: 0x19ebfe,
								},
							)],
							ephemeral: true,
						});
					}
					else {
						interaction.reply({
							embeds: [ embedcreator.setembed(
								{
									title: 'Error',
									description: 'Invalid voice channel',
									color: 0xe74c3c,
								},
							)],
							ephemeral: true,
						});
					}
				}
				else {
					var sourcevcauto = await global.client.channels.cache.get(interaction.member.voice.channel.id);
					if (sourcevcauto && sourcevcauto.type === 2 && destinationvc && destinationvc.type === 2) {
						await sourcevcauto.members.forEach(member => {
							member.voice.setChannel(destination);
							people.push(member);
						});
						return interaction.reply({
							embeds: [ embedcreator.setembed(
								{
									title: 'Success',
									description: `Successfully moved ${people} from ${sourcevcauto} to ${destinationvc}`,
									color: 0x19ebfe,
								},
							)],
							ephemeral: true,
						});
					}
					else {
						interaction.reply({
							embeds: [ embedcreator.setembed(
								{
									title: 'Error',
									description: 'Invalid voice channel',
									color: 0xe74c3c,
								},
							)],
							ephemeral: true,
						});
					}
				}
			}
		}
		catch (error) {
			console.log(error);
			embedcreator.sendError(error);
			interaction.reply({
				embeds: [ embedcreator.setembed(
					{
						title: 'Error',
						description: 'vc move has crashed. Please report this to the bot owner.',
						color: 0xe74c3c,
					},
				)],
				ephemeral: true,
			});
		}
	},
};

