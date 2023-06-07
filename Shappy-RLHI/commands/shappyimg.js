const { SlashCommandBuilder } = require('@discordjs/builders');
const embedcreator = require('../embed.js');
const { GenerateImage } = require('../utilities/openai.js');
const { inlineCode } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('shappyimg')
		.setDescription('Give me a prompt and I will generate an image')
		.addStringOption(option =>
			option.setName('prompt')
				.setDescription('Image generation prompt')
				.setRequired(true)),
	async execute(interaction) {
		try {
			const prompt = interaction.options.get('prompt').value;
			// delay reply to prevent interaction timeout
			await interaction.deferReply();
			const response = await GenerateImage(prompt);
			await interaction.editReply(
				{
					embeds: [ embedcreator.setembed(
						{
							title: 'Response to ' + inlineCode(prompt) + '',
							author: {
								name: 'OpenAI',
								url: 'https://openai.com/',
							},
							image: {
								url: response,
							},
							color: 0x2ecc71,
							footer : {
								text: 'ShappyImg',
							},
						},
					)],
				},
			);
		}
		catch (err) {
			console.log(err);
			await interaction.editReply(
				{
					embeds: [ embedcreator.setembed(
						{
							title: 'Error',
							description: err,
							color: 0xe74c3c,
						},
					)],
				},
			);
		}
	},
};
