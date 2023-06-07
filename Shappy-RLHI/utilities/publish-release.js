const env = require('../env.js');
const fetch = require('node-fetch');
const embedcreator = require('../embed.js');
const { AttachmentBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, WebhookClient } = require('discord.js');
const webhookClient = new WebhookClient({ url: env.utilities.releases.webhook_url });
url = null;
answers = null;
guild = null;
nickname = null;
userobject = null;
async function CollectImage(interaction, answers) {
	try {
	// get userid from interaction
		guild = await global.client.guilds.cache.get(env.discord.guild);
		const userid = await interaction.user.id;
		userobject = await guild.members.fetch(userid);
		nickname = await userobject.displayName;

		// get user from client
		const user = await global.client.users.fetch(userid);
		message = await user.send(
			{
				embeds: [ embedcreator.setembed(
					{
						title: 'Image submission',
						description: 'Please send the image you want to submit',
						color: 0x19ebfe,
					},
				)],
			},
		);
		const collector = message.channel.createMessageCollector(
			{
				time: 900000,
				max: 1,
			},
		);

		collector.on('collect', async (m) => {
			if (m.attachments.size > 0) {
				const attachment = await m.attachments.first();
				url = await attachment.url;
				file = await fetch(url);
				releaseimage = new AttachmentBuilder(url, attachment.filename);
				await previewRelease(answers, interaction.user);
			}
		},
		);
		collector.on('end', (collected, reason) => {
			if (reason === 'time') {
				embedcreator.log(nickname + ' timed out on image submission');
				user.send(
					{
						embeds: [ embedcreator.setembed(
							{
								title: 'Image submission',
								description: 'You have not sent an image in time, please resubmit',
								color: 0x19ebfe,
							},
						)],
					},
				);
			}
		},
		);
	}
	catch (error) {
		console.log(error);
		embedcreator.sendError(error);
	}
}
async function previewRelease(answers, user) {
	try {
		console.log('previewRelease');
		artist = answers.artist;
		track = answers.track;
		description = answers.description;
		songwhip = answers.songwhip;
		songwhip_artist = answers.songwhip_artist;
		embed = {
			title: track,
			url: songwhip,
			description: description,
			author: {
				name: artist,
				url: songwhip_artist,
				icon_url: userobject.displayAvatarURL(),
			},
			fields: [
				{
					name: 'Link',
					value: songwhip,
					inline: true,
				},
				{
					name: 'Submitted by',
					value: nickname,
					inline: true,
				},
			],
			color: 0x19ebfe,
			image: {
				url: url,
			},
		};

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('submit')
					.setLabel('Submit')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('cancel')
					.setLabel('Cancel')
					.setStyle(ButtonStyle.Danger),
			);
		embedpreview = await user.send(
			{
				embeds: [embedcreator.setembed({
					title: 'Embed Preview',
					description: 'Please review the embed before submitting\n press submit to publish your submission\n press cancel to cancel your submission',
				},
				),
				embed], components: [row],
			},
		);
		console.log('preview sent');
		const collector = await embedpreview.channel.createMessageComponentCollector(
			{
				time: 900000,
				max: 1,
			},
		);
		collector.on('collect', async (i) => {
			console.log('response received');
			if (i.customId === 'submit') {
				console.log('submit');
				await sendImage(answers);
				i.reply(
					{
						embeds: [ embedcreator.setembed(
							{
								title: 'Release submission',
								description: 'Your release has been submitted',
								color: 0x19ebfe,
							},
						),
						],
					},
				);
			}
			else if (i.customId === 'cancel') {
				console.log('cancel');
				i.reply(
					{
						embeds: [ embedcreator.setembed(
							{
								title: 'Release Submission',
								description: 'Your release submission has been cancelled',
								color: 0x19ebfe,
							},
						)],
					},
				);
			}
		},
		);
		collector.on('end', (collected, reason) => {
			if (reason === 'time') {
				embedcreator.log(nickname + ' timed out on embed preview');
				user.send(
					{
						embeds: [ embedcreator.setembed(
							{
								title: 'Embed Preview',
								description: 'You have not responded in time, please resubmit',
								color: 0x19ebfe,
							},
						)],
					},
				);
			}
			else {
				console.log('collector ended');
			}
		},
		);
	}
	catch (error) {
		console.log(error);
		embedcreator.sendError(error);
	}
}
async function sendImage(answers) {
	try {
		guild = await global.client.guilds.fetch(env.discord.guild);
		channel = await guild.channels.fetch(env.utilities.releases.image_channel);
		channel.send({ files: [releaseimage] }).then(async (message) => {
			// get attachment url
			attachmenturl = await message.attachments.first().url;
			return sendRelease(answers, attachmenturl);
		},
		);
	}
	catch (error) {
		console.log(error);
		embedcreator.sendError(error);
	}
}
async function sendRelease(answers, attachmenturl) {
	try {
		guild = await global.client.guilds.fetch(env.discord.guild);
		channel = await guild.channels.fetch(env.utilities.releases.releases_channel);
		artist = answers.artist;
		track = answers.track;
		description = answers.description;
		songwhip = answers.songwhip;
		songwhip_artist = answers.songwhip_artist;
		embed = {
			title: track,
			url: songwhip,
			description: description,
			author: {
				name: artist,
				url: songwhip_artist,
				icon_url: userobject.displayAvatarURL(),
			},
			fields: [
				{
					name: 'Link',
					value: songwhip,
					inline: true,
				},
				{
					name: 'Submitted by',
					value: nickname,
					inline: true,
				},
			],
			color: 0x19ebfe,
			image: {
				url: attachmenturl,
			},
		};
		webhookClient.send(
			{
				name: '',
				avatarURL: '',
				content: '<@&' + env.utilities.releases.release_role + '>' + ' New Release from ' + artist,
				embeds: [embed],
			});
	}
	catch (error) {
		console.log(error);
		embedcreator.sendError(error);
	}
}


module.exports = { CollectImage };