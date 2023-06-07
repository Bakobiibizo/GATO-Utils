const { Configuration, OpenAIApi } = require('openai');
const env = require('../env.js');
const embedcreator = require('../embed.js');
async function getOpenAI() {
	try {
		const configuratuion = new Configuration({
			apiKey: env.utilities.openai,
		});
		const openai = new OpenAIApi(configuratuion);
		return openai;
	}
	catch (err) {
		console.log(err);
		embedcreator.sendError(err);
	}
}
async function createCompletion(prompt) {
	try {
		openai = await getOpenAI();
		response = await openai.createChatCompletion({
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'user', content: String(prompt) }],
			max_tokens: 300,
		},
		)
			.then((response) => {
				return response.data.choices[0].message.content;
			},
			)
			.catch((err) => {
				console.log(err);
				embedcreator.sendError(err);
				return err;
			},
			);
		return response;
	}
	catch (err) {
		console.log(err);
		embedcreator.sendError(err);
		return err;
	}
}

async function GenerateImage(prompt) {
	try {
		openai = await getOpenAI();
		response = await openai.createImage({
			prompt: String(prompt),
			n: 1,
			size: '1024x1024',
		},
		)
			.then((response) => {
				return response.data.data[0].url;
			},
			)
			.catch((err) => {
				console.log(err);
				embedcreator.sendError(err);
				return err;
			},
			);
		return response;
	}
	catch (err) {
		console.log(err);
		embedcreator.sendError(err);
	}
}

module.exports = { getOpenAI, createCompletion, GenerateImage };