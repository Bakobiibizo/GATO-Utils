const fs = require('fs');
async function getList() {
	const file = fs.readFileSync('./data/prompts.txt');
	prompts = await file.toString();
	prompts = prompts.split('\n');
	return prompts;
}

async function getPrompt() {
	const prompts = await getList();
	const prompt = prompts[Math.floor(Math.random() * prompts.length)];
	return prompt;
}

module.exports = { getList, getPrompt };