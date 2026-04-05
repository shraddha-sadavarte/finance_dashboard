//handles req and re
import * as authService from './auth.service.js';
import { sendSuccess } from '../../utils/response.js'
import { ValidationError } from '../../utils/errors.js';

export const register = async (req, res, next) => {
    try{
        const {name, email, password, role} = req.body;

        //basic input validation
        if(!name || !email || !password){
            throw new ValidationError('Name, email and password are required');
        }

        if(typeof email !== 'string' || !email.includes('@')){
            throw new ValidationError('Invalid email format');
        }

        if(password.length < 6){
            throw new ValidationError('Password must be at least 6 characters');
        }

        const data = await authService.registerUser({name, email, password, role});
        return sendSuccess(res, data, 'User registered successfully', 200);
    } catch(err){
        next(err); //pass to global error handler
    }
}

//login
export const login = async(req, res, next) => {
    try{
        const {email, password} = req.body;

        if(!email || !password){
            throw new ValidationError('Email and password are required');
        }

        const data = await authService.loginUser({email, password});
        return sendSuccess(res, data, 'Login successful', 200);
    } catch(err){
        next(err); //pass to global error handler

    }
}