import jwt from 'jsonwebtoken'
import env from '../config/env.js'
import { UnauthorizedError } from '../utils/errors.js'

const authenticate = (req, res, next) => {
    try{
        //get toekn from header
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            throw new UnauthorizedError('No token provided. Please login')
        }

        //extract token
        const token = authHeader.split(' ')[1];

        if(!token){
            throw new UnauthorizedError('Invalid token format');
        }

        //verify token
        //if toekn is expired or tampered - jwt.verify will throw an error which will be caught by global error handler
        const decoded = jwt.verify(token, env.jwt.secret);

        //attach user info to request object
        req.user = {
            id: decoded.id,
            role: decoded.role,
        }

        //move to next middleware or route handler
        next();
    } catch(err){
        //handle specific jwt erroors with clear messages
        if(err.name === 'TokenExpiredError'){
            return next(new UnauthorizedError('Token expired. Please login again'));
        }
        if(err.name === 'JsonWebTokenError'){
            return next(new UnauthorizedError('Invalid token. Please login again'));
        }
        next(err); //pass to global error handler for any other errors
    }
}

export default authenticate;