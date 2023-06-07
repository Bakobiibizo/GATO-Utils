const prompt = require('../utilities/prompt.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const embedcreator = require('../embed.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prompt')
		.setDescription('Get a random writing prompt'),
	async execute(interaction) {
		writingprompt = await prompt.getPrompt();
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('new-prompt')
					.setLabel('New Prompt')
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId('thanks')
					.setLabel('Thanks')
					.setStyle(ButtonStyle.Success),
			);
		interaction.reply({
			embeds: [embedcreator.setembed({
				title: 'Writing Prompt',
				description: writingprompt,
				color: 0x19ebfe,
			})], components: [row],
		});
		embedcreator.log(`${interaction.member.user} used the prompt command.`);
		const filter = i => (i.customId === 'thanks' || i.customId === 'new-prompt') && i.user.id === interaction.user.id && i.message.interaction.id === interaction.id;
		id = interaction.id;
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
		collector.on('collect', async i => {
			if (i.customId === 'new-prompt') {
				writingprompt = await prompt.getPrompt();
				i.deferUpdate();
				await interaction.editReply({
					embeds: [embedcreator.setembed({
						title: 'Writing Prompt',
						description: writingprompt,
						color: 0x19ebfe,
					})],
				});
			}
			if (i.customId === 'thanks') {
				await interaction.deleteReply();
			}
		});
		collector.on('end', async () => {
			try {
				await interaction.deleteReply();
			}
			catch (error) {
				console.error(error);
				embedcreator.sendError(error);
			}
		},
		);
	},
};