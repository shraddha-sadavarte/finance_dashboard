import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/db.js'
import env from '../../config/env.js';
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError} from '../../utils/errors.js'

//register
export const registerUser = async ({ name, email, password, role }) => {
    //check if email already exists
    const [existingEmail] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

    if(existingEmail.length > 0){
        throw new ConflictError('Email already exists');
    }

    //validate role - only allow valid roles
    const allowedRoles = ['VIEWER', 'ANALYST', 'ADMIN'];
    const assignedRole = role && allowedRoles.includes(role) ? role : 'VIEWER';

    //HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);
    //inser into db
    const [result] = await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, assignedRole]);

    //return new user
    return {
        id: result.insertId,
        name,
        email, 
        role: assignedRole,
    }
}

//login
export const loginUser = async ({email, password}) => {

    //find by email
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    const user = rows[0];

    if(!user){
        //intentionally vague to prevent user enumeration
        throw new UnauthorizedError('Invalid email or password');
    }

    //check if account is active
    if(!user.is_active){
        throw new UnauthorizedError('Account is inactive. Please contact admin.');
    }

    //compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        throw new UnauthorizedError('Invalid email or password');
    }

    //sign jwt token
    const token = jwt.sign(
        {
            id: user.id,
            role: user.role, //we taken role in payload so we dont need to query db for role on every request, we can just verify token and get role from there
        },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn }
    )

    return {
        token, 
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
    }
}