import * as usersService from './users.service.js';
import { sendSuccess, sendPaginated } from '../../utils/response.js';
import { ValidationError } from '../../utils/errors.js';

// Get All Users 
export const getAllUsers = async (req, res, next) => {
  try {
    // Extract query params with defaults
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 10);
    const search = req.query.search?.trim() || '';
    const role   = req.query.role   || '';

    const { users, total } = await usersService.getAllUsers({
      page,
      limit,
      search,
      role,
    });

    return sendPaginated(res, users, total, page, limit, 'Users fetched successfully');

  } catch (error) {
    next(error);
  }
};

// Get Single User 
export const getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    return sendSuccess(res, user, 'User fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Get Own Profile 
export const getMe = async (req, res, next) => {
  try {
    // req.user.id comes from authenticate middleware
    const user = await usersService.getUserById(req.user.id);
    return sendSuccess(res, user, 'Profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Update User Role 
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role) {
      throw new ValidationError('Role is required');
    }

    const user = await usersService.updateUserRole(req.params.id, role);
    return sendSuccess(res, user, 'User role updated successfully');

  } catch (error) {
    next(error);
  }
};

// Update User Status 
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      throw new ValidationError('isActive must be a boolean (true or false)');
    }

    const user = await usersService.updateUserStatus(
      req.params.id,
      isActive,
      req.user.id   // pass requesting user's id to prevent self-deactivation
    );

    const message = isActive ? 'User activated successfully' : 'User deactivated successfully';
    return sendSuccess(res, user, message);

  } catch (error) {
    next(error);
  }
};

// Delete User 
export const deleteUser = async (req, res, next) => {
  try {
    const result = await usersService.deleteUser(req.params.id, req.user.id);
    return sendSuccess(res, result, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};