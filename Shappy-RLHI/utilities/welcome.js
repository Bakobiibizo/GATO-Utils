const fs = require('fs');
async function getList() {
	file = fs.readFileSync('../data/welcomeme.txt');
	messages = await file.toString();
	messages = messages.split(' end');
	return messages;
}

async function getWelcome() {
	const welcomelist = await getList();
	const welcome = welcomelist[Math.floor(Math.random() * (welcomelist.length - 1))];
	return welcome.replace(/\\n/g, '\n');
}

module.exports = { getList, getWelcome };