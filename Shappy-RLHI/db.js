const mariadb = require('mariadb');
const env = require('./env.js');

const pool = mariadb.createPool({
	host: 'docker.io/bakobiibizo/mariadb:latest',
	port: 3306,
	user: env.mariadb.user.toString(),
	password: env.mariadb.password.toString(),
	database: env.mariadb.database.toString(),
	charset: 'utf8mb4',
});

module.exports = {
	getConnection: function () {
		return new Promise(function (resolve, reject) {
			pool.getConnection().then(function (connection) {
				resolve(connection);
			}).catch(function (error) {
				reject(error);
			});
		});
	},
};
