const mariadb = require('../db.js');
const embedcreator = require('../embed.js');

// list autoroles from db
async function list() {
	try {
		db = await mariadb.getConnection();
		const roles = await db.query('SELECT role_id FROM auto_role');
		db.end();
		// select role_id column from roles table
		const rolelist = roles.map(role => role.role_id);
		return rolelist;
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
// add autorole to db
async function add(roleId) {
	try {
		db = await mariadb.getConnection();
		await db.query('INSERT INTO auto_role (role_id) VALUES (?)', [roleId]);
		db.end();
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
// remove autorole from db
async function remove(roleId) {
	try {
		db = await mariadb.getConnection();
		await db.query('DELETE FROM auto_role WHERE role_id = ?', [roleId]);
		db.end();
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
// assign roles to members
async function assignRoles(member) {
	try {
		const roles = await list();
		for (const role of roles) {
			try {
				await member.roles.add(role);
			}
			catch (error) {
				console.error(error);
				embedcreator.sendError(error);
			}
		}
		return embedcreator.log(`Assigned roles to ${member.user.tag}`);
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
}
// export functions
module.exports = {
	list,
	add,
	remove,
	assignRoles,
};
