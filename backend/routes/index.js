import express from "express";
import {
    getUsers,
    getUserById,
    Register,
    updateUser,
    deleteUser,
    Login,
    Logout
} from "../controllers/Users.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";

const router = express.Router();

router.get('/users', verifyToken, getUsers);
router.post('/login', Login);
router.get('/token', refreshToken);
router.delete('/logout', Logout);
router.get('/users/:id', getUserById);
router.post('/register', Register);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
export default router;