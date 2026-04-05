//global error handler
//caches every error thrown in the app
import { sendError } from '../utils/response.js';
import { AppError } from '../utils/errors.js';

const errorHandler = (err, req, res, next) => {
    //log every error in development
    if(process.env.NODE_ENV === 'development'){
        console.error(err);
    }

    //our own known errors
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            data: null,
        })
    }

    //mysql duplicate entry(e.g. email already exists)
    if(err.code === 'ER_DUP_ENTRY'){
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry. Resource already exists.',
            data: null,
        })
    }

    //unknown errors
    return res.status(500).json({
        success:false,
        message: 'Something went wrong. Please try again later.',
        data: null,
    })
}

export default errorHandler;