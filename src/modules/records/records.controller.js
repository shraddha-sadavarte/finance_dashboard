import * as recordsService from './records.service.js';
import { sendSuccess, sendPaginated } from '../../utils/response.js';

//Reusable filter extractor 
const extractFilters = (query) => ({
  page:      Math.max(1, parseInt(query.page) || 1),
  limit:     Math.min(100, parseInt(query.limit) || 10),
  type:      query.type      || '',
  category:  query.category  || '',
  startDate: query.startDate || '',
  endDate:   query.endDate   || '',
  search:    query.search?.trim() || '',
});

// Create Record 
export const createRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, description } = req.body;

    const record = await recordsService.createRecord({ amount, type, category, date, description, userId: req.user.id, }); // from authenticate middleware

    return sendSuccess(res, record, 'Record created successfully', 201);

  } catch (error) {
    next(error);
  }
};

// Get All Records 
export const getAllRecords = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);
    const { records, total } = await recordsService.getAllRecords(filters);

    return sendPaginated(
      res, records, total,
      filters.page, filters.limit,
      'Records fetched successfully'
    );

  } catch (error) {
    next(error);
  }
};

// Get Own Records 
export const getMyRecords = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);

    const { records, total } = await recordsService.getMyRecords({
      userId: req.user.id,
      ...filters,
    });

    return sendPaginated(
      res, records, total,
      filters.page, filters.limit,
      'Your records fetched successfully'
    );

  } catch (error) {
    next(error);
  }
};

// Get Single Record 
export const getRecordById = async (req, res, next) => {
  try {
    const record = await recordsService.getRecordById(req.params.id);
    return sendSuccess(res, record, 'Record fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Update Record 
export const updateRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, description } = req.body;

    const record = await recordsService.updateRecord(req.params.id, { amount, type, category, date, description,});

    return sendSuccess(res, record, 'Record updated successfully');

  } catch (error) {
    next(error);
  }
};

// Delete Record 
export const deleteRecord = async (req, res, next) => {
  try {
    const result = await recordsService.deleteRecord(req.params.id);
    return sendSuccess(res, result, 'Record deleted successfully');
  } catch (error) {
    next(error);
  }
};