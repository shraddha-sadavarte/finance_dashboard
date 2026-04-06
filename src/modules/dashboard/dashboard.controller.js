import * as dashboardService from './dashboard.service.js';
import { sendSuccess } from '../../utils/response.js';

// Summary 
export const getSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary();
    return sendSuccess(res, data, 'Dashboard summary fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Category Breakdown 
export const getCategoryBreakdown = async (req, res, next) => {
  try {
    // Optional ?type=INCOME or ?type=EXPENSE filter
    const { type } = req.query;
    const data = await dashboardService.getCategoryBreakdown(type);
    return sendSuccess(res, data, 'Category breakdown fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Monthly Trends 
export const getMonthlyTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getMonthlyTrends();
    return sendSuccess(res, data, 'Monthly trends fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Weekly Trends 
export const getWeeklyTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getWeeklyTrends();
    return sendSuccess(res, data, 'Weekly trends fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Recent Activity 
export const getRecentActivity = async (req, res, next) => {
  try {
    // Optional ?limit=20 to get more or fewer records
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const data = await dashboardService.getRecentActivity(limit);
    return sendSuccess(res, data, 'Recent activity fetched successfully');
  } catch (error) {
    next(error);
  }
};