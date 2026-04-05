import { Router } from 'express';
import { register, login } from './auth.controller.js';

const router = Router();

//register
router.post('/register', register);

//login
router.post('/login', login);

export default router;