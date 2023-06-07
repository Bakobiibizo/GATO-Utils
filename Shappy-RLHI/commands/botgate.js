const { SlashCommandBuilder } = require('@discordjs/builders');
const mariadb = require('../db.js');
const env = require('../env.js');
const embedcreator = require('../embed.js');
const botgate = require('../utilities/botgate.js');
const { PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('botgate')
		.setDescription('botgate command')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand =>
			subcommand
				.setName('status')
				.setDescription('Get the status of the botgate'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('set')
				.setDescription('Set the status of the botgate')
				.addBooleanOption(option =>
					option.setName('botgate')
						.setDescription('Enable or disable botgate')
						.setRequired(true),
				),
		),
	async execute(interaction) {
		// Limit command to Founders and Mods
		if (!(interaction.member.roles.cache.has(env.discord.admin_role))) {
			global.client.channels.cache.get(env.discord.logs_channel).send({
				embeds: [ embedcreator.setembed(
					{
						title: 'Incident Detected',
						description: `${interaction.member.user} tried to use the botgate command but did not have the correct role.`,
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
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === 'set') {
			if (interaction.options.get('botgate')) {
				const botgatevalue = interaction.options.get('botgate').value;
				// check if botgate setting exists
				db = await mariadb.getConnection();
				const exists = await db.query('SELECT * FROM settings WHERE setting = ?', ['botgate']);
				db.end();
				if (exists.length == 0) {
					// create botgate setting
					db = await mariadb.getConnection();
					await db.query('INSERT INTO settings (setting, value) VALUES (?, ?)', ['botgate', 0]);
					db.end();
				}
				if (botgatevalue === true) {
					db = await mariadb.getConnection();
					db.query('UPDATE settings SET value = ? WHERE setting = ?', [1, 'botgate']);
					db.end();
					embedcreator.alert(`Botgate Enabled by ${interaction.member.user}`);
					return interaction.reply({
						embeds: [embedcreator.setembed({
							title: 'Botgate Enabled',
							description: 'Botgate is now enabled.',
							color: 0x2ecc71,
						})], ephemeral: true,
					});
				}
				if (botgatevalue === false) {
					db = await mariadb.getConnection();
					db.query('UPDATE settings SET value = ? WHERE setting = ?', [0, 'botgate']);
					db.end();
					embedcreator.alert(`Botgate Disabled by ${interaction.member.user}`);
					return interaction.reply({
						embeds: [embedcreator.setembed({
							title: 'Botgate Disabled',
							description: 'Botgate is now disabled.',
							color: 0xe74c3c,
						})], ephemeral: true,
					});
				}
			}
		}
		if (subcommand === 'status') {
			// check if botgate is enabled
			botgatestatus = await botgate.status();
			if (botgatestatus) {
				return interaction.reply({
					embeds: [embedcreator.setembed({
						title: 'Botgate Status',
						description: 'Botgate is enabled.',
						color: 0x2ecc71,
					})], ephemeral: true,
				});
			}
			else {
				return interaction.reply({
					embeds: [embedcreator.setembed({
						title: 'Botgate Status',
						description: 'Botgate is disabled.',
						color: 0xe74c3c,
					})], ephemeral: true,
				});
			}
		}
	},
};