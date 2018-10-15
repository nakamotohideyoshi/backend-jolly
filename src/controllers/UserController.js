/**
 * User controller class, in charge of transactions related to users and their profiles.
 */

const EntityUser = require('../entities/EntityUser'),
	DbNames = require('../enum/DbNames');


class UserController {

	/**
     * Controller constructor method.
	 * @returns {UserController|*}
	 */
	constructor () {

		if ( !UserController.instance ) {

			UserController.instance = this;
		}

		return UserController.instance;
	}

	/**
     * Returns default database related to user's account.
	 * @returns {Db}
	 */
	getDefaultDB () {

		let Database = JOLLY.service.Db,
			databaseName = DbNames.ACCOUNTS;

		return Database.database(databaseName);
	}

	/**
	 * Register user into system.
	 * @param {Object} options
	 * @returns {Promise<Object>}
	 */
	registerUser (options) {

		let self = this,
			authService = JOLLY.service.Authentication;

		return new Promise((resolve, reject) => {

			let {username, email, password} = options,
				encryptedPassword = authService.generateHashedPassword(password),
				newUser;

			newUser = new EntityUser({
				username,
				email,
				password: encryptedPassword
			});

			self.saveUser(newUser)
				.then((userData) => {

					resolve (userData.toJson());

				})
				.catch(reject);
		});
	}

	findUserByUsername (options) {

		let db = this.getDefaultDB(),
			username = options.username,
			user = null;

		return new Promise((resolve, reject) => {

			db.collection('users').findOne({
				username
			}).then((data) => {

				if (data) {

					user = new EntityUser(data);
				}

				resolve (user);

			}).catch(reject);

		});
	}



	listUsers(cb) {

		let Database = JOLLY.service.Db;

		Database.query(DbNames.ACCOUNTS, 'users', (userList) => {

			let itemList = [];

			if (userList) {

				userList.forEach((userData) => {

					let userObject = new EntityUser(userData);

					itemList.push(userObject.toJson({isSafeOutput: true}));
				})

			}

			cb(itemList);
		});
	}

	findUser(cb) {

		let db = this.getDefaultDB();

		db.collection('users').findOne((err, result) => {

			if (err) throw err;

			let user = new EntityUser(result);
			cb(user);
		});
	}


	/**
	 * Save user into database.
	 * @param {EntityUser} user - User entity we are going to register into system.
	 * @returns {Promise}
	 * @resolve {EntityUser}
	 */
	saveUser (user) {

		let db = this.getDefaultDB(),
			collectionName = 'users',
			userData = user.toJson(),
			userEntity;

		if (userData.id == null) {
			delete (userData.id);
		}

		return new Promise((resolve, reject) => {

			db.collection(collectionName)
				.insertOne(userData)
				.then((result) => {

					//userData.id = result.insertedId;
					userEntity = new EntityUser(userData);
					resolve(userEntity);
				})
				.catch(reject);

			});
	}

}

module.exports = UserController;