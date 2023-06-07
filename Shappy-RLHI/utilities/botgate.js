const mariadb = require('../db.js');

// check if botgate is enabled
async function status() {
	db = await mariadb.getConnection();
	const botgatestatus = await db.query('SELECT value FROM settings WHERE setting = ?', ['botgate']);
	db.end();
	if (botgatestatus[0].value == 1) {
		return true;
	}
	return false;
}

module.exports = { status };