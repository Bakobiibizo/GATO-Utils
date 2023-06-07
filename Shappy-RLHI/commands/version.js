const { SlashCommandBuilder } = require('@discordjs/builders');
const embedcreator = require('../embed.js');
const pkg = require('../package.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('version')
		.setDescription('Get the version of the bot'),
	async execute(interaction) {
		interaction.reply({
			embeds: [embedcreator.setembed({
				title: 'Version Information',
				description: `**Shappy-RLHI**\n**Ping:** ${global.client.ws.ping}ms\n**Version:** ${pkg.version}\n**Author:** ${pkg.author}\n**GitHub:** ${pkg.repository.url}\n**Bug Reports:** ${pkg.bugs.url}`,
				color: 0x19ebfe,
			})], ephemeral: true,
		});
		embedcreator.log(`${interaction.member.user} used the version command.`);
	},
};