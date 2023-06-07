//const embedcreator = require('../embed.js');
//const env = require('../env.js');
//async function checkMention(message) {
//	try {
//		if (message.member.roles.cache.has(env.discord.admin_role) || message.member.roles.cache.has(env.discord.mod_role)) return;
//		if (message.content.includes('@everyone') || message.content.includes('@here')) {
//			embed = embedcreator.setembed(
//				{
//					title: 'Unauthorized Mention Detected',
//					description: 'You have attempted to mention everyone or here that behavior is not allowed.',
//					color: 0xe74c3c,
//				},
//			),
//			await embedcreator.mentionAlert(message);
//			reply = await message.reply({ embeds: [embed], ephemeral: true });
//			message.delete();
//			// wait 5 seconds then delete the reply
//			setTimeout(() => {
//				reply.delete();
//			}
//			, 5000);
//		}
//	}
//	catch (err) {
//		console.log(err);
//		embedcreator.sendError(err);
//	}
//}
//module.exports = {
//	checkMention,
//};