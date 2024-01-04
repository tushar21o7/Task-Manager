import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(registerUser).get((req, res) => res.send('Register route'));

router.route('/login').post(loginUser).get((req, res) => res.send('Login route'));

// protected routes
router.route('/logout').all(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;