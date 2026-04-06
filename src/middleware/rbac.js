//rbac = role based access control
import { ForbiddenError } from '../utils/errors.js';

//this is a middleware factory - it returns a middleware function 
//that's why we call it as authorize('ADMIN) not just authorize
const authorize = (...allowedRoles) => { //...allowedRoles -> spread operator allow to pass one or more roles
    return (req, res, next) => {
        if(!req.user){
            return next(new ForbiddenError('Authentication required'))
        }
        //check if users role is in the allowed roles list
        if(!allowedRoles.includes(req.user.role)){
            return next(new ForbiddenError(`Access denied. Required role: ${allowedRoles.join(' or ')}`))
        }

        //role is allowed - move forward
        next();
    }
}

export default authorize;

//specifying exact permissions for each role
// Action                        VIEWER    ANALYST    ADMIN
// ─────────────────────────────────────────────────────────
// View own records                ✅         ✅         ✅
// View all records                ❌         ✅         ✅
// Create records                  ❌         ❌         ✅
// Update records                  ❌         ❌         ✅
// Delete records                  ❌         ❌         ✅
// View dashboard summary          ✅         ✅         ✅
// View analytics/trends           ❌         ✅         ✅
// Manage users                    ❌         ❌         ✅
// Change user roles               ❌         ❌         ✅
// Deactivate users                ❌         ❌         ✅