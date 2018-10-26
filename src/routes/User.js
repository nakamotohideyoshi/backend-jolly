/**
 * User Route Handler
 */
const router = require('express').Router();
const jwt = require('jsonwebtoken');

let authService = JOLLY.service.Authentication,
	userController = JOLLY.controller.UserController;


/**
 * Display user's information.
 */
router.get('/', authService.verifyUserAuthentication, (req, res) => {

	userController.listUsers((userList) => {

		res.apiSuccess({
			user_list: userList
		});

	});

});

/**
 * User information route
 */
router.get('/me', authService.verifyUserAuthentication, (req, res, next) => {
	userController.findUserById(req.userId)
		.then(userObject => {
			userData = userObject.toJson({
                isSafeOutput: true
            });
            res.apiSuccess(userData);
		}).catch(next);

});

/**
 * Register new user into system.
 */
router.post('/register', (req, res) => {

	userController
		.registerUser(req.body)
		.then((userData) => {
			authToken = authService.generateToken({
				userId: userData.id
			});
			res.apiSuccess({
				auth_token: authToken, 
				user: userData
			});
		});
});


module.exports = router;
