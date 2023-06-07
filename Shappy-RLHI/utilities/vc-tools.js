const env = require('../env.js');
const embedcreator = require('../embed.js');
async function getMaxBitrate() {
	// get max bitrate from discord
	const guild = await global.client.guilds.cache.get(env.discord.guild);
	const maxbitrate = await guild.premiumTier;
	// convert to bitrate
	if (maxbitrate === 0) {
		return 96000;
	}
	if (maxbitrate === 1) {
		return 128000;
	}
	if (maxbitrate === 2) {
		return 256000;
	}
	if (maxbitrate === 3) {
		return 384000;
	}
}
// Set bitrate of each channel to max bitrate
async function setBitrate() {
	try {
		const guild = await global.client.guilds.cache.get(env.discord.guild);
		const maxbitrate = await getMaxBitrate();
		const channels = await guild.channels.cache.filter(channel => channel.type === 2 && channel.bitrate !== maxbitrate);
		channels.forEach(async channel => {
			await channel.setBitrate(maxbitrate);
			bitrate = maxbitrate / 1000;
			embedcreator.log(`Set bitrate of ${channel} to ${bitrate}kbps`);
		});
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
module.exports = {
	getMaxBitrate,
	setBitrate,
};