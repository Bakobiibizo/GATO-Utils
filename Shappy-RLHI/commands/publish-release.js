const { SlashCommandBuilder } = require('@discordjs/builders');
const embedcreator = require('../embed.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { CollectImage } = require('../utilities/publish-release.js');
const env = require('../env.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('publish-release')
		.setDescription('Publish a release to the releases channel'),
	async execute(interaction) {
		if (!interaction.member.roles.cache.has(env.utilities.releases.verified_artist_role)) {
			global.client.channels.cache.get(env.discord.logs_channel).send({
				embeds: [ embedcreator.setembed(
					{
						title: 'Incident Detected',
						description: `${interaction.member.user} tried to use the publish-release command but did not have the verified artist role.`,
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
			const modal = new ModalBuilder()
				.setTitle('Publish Release')
				.setCustomId('publish-release');
			const artistname = new TextInputBuilder()
				.setLabel('Artist Name')
				.setCustomId('artistname')
				.setStyle(TextInputStyle.Short);
			const trackname = new TextInputBuilder()
				.setLabel('Track Name')
				.setCustomId('trackname')
				.setStyle(TextInputStyle.Short);
			const releasedescription = new TextInputBuilder()
				.setLabel('Release Description')
				.setCustomId('releasedescription')
				.setStyle(TextInputStyle.Paragraph);
			const songwhip = new TextInputBuilder()
				.setLabel('Songwhip')
				.setCustomId('songwhip')
				.setStyle(TextInputStyle.Short);
			const firstquestion = new ActionRowBuilder().addComponents(artistname);
			const secondquestion = new ActionRowBuilder().addComponents(trackname);
			const thirdquestion = new ActionRowBuilder().addComponents(releasedescription);
			const fourthquestion = new ActionRowBuilder().addComponents(songwhip);
			modal.addComponents(firstquestion, secondquestion, thirdquestion, fourthquestion);
			await interaction.showModal(modal);
			const filter = i => i.customId === 'publish-release' && i.user.id === interaction.user.id;
			const answer = await interaction.awaitModalSubmit({ filter, time: 2700000 });
			if (answer) {
				const artistnameanswer = answer.fields.getTextInputValue('artistname');
				const tracknameanswer = answer.fields.getTextInputValue('trackname');
				const releasedescriptionanswer = answer.fields.getTextInputValue('releasedescription');
				const songwhipanswer = answer.fields.getTextInputValue('songwhip');
				if (songwhipanswer.startsWith('https://songwhip.com/')) {
					const artist_name = songwhipanswer.split('/')[3];
					const songwhipartistanswer = 'https://songwhip.com/' + artist_name;
					const answers = {
						artist: artistnameanswer,
						track: tracknameanswer,
						description: releasedescriptionanswer,
						songwhip: songwhipanswer,
						songwhip_artist: songwhipartistanswer,
					};
					await answer.reply({
						embeds: [
							embedcreator.setembed(
								{
									title: 'Answers Submitted',
									description: 'Please check your DMs for further instructions.',
									color: 0x19ebfe,
								},
							)],
						ephemeral: true,
					});
					await CollectImage(interaction, answers);
				}
				else {
					await answer.reply({
						embeds: [
							embedcreator.setembed(
								{
									title: 'Error',
									description: 'Please enter a valid Songwhip URL.',
									color: 0x19ebfe,
								},
							)],
						ephemeral: true,
					});
					embedcreator.sendError(interaction.user.id + ' entered an invalid Songwhip URL.' + '/n Answers \n Artist: ' + artistnameanswer + '\n Track: ' + tracknameanswer + '\n Description: ' + releasedescriptionanswer + '\n Songwhip: ' + songwhipanswer);
				}
			}
		}
		catch (error) {
			console.error(error);
			embedcreator.sendError(error);
		}
	},
};