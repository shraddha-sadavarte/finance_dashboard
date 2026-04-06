import { useState } from 'react';
import { X } from 'lucide-react';
import { createRecordApi, updateRecordApi } from '../../api/records.api.js';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';

const CATEGORIES = ['Salary', 'Freelance', 'Food', 'Rent', 'Transport', 'Utilities', 'Shopping', 'Healthcare', 'Entertainment', 'Other'];

const RecordForm = ({ record, onClose, onSuccess }) => {
  const isEdit = !!record;

  const [formData, setFormData] = useState({
    amount:      record?.amount      || '',
    type:        record?.type        || 'INCOME',
    category:    record?.category    || '',
    date:        record?.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    description: record?.description || '',
  });

  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.amount)   newErrors.amount   = 'Amount is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date)     newErrors.date     = 'Date is required';
    if (Number(formData.amount) <= 0) newErrors.amount = 'Amount must be positive';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateRecordApi(record.id, formData);
        toast.success('Record updated successfully');
      } else {
        await createRecordApi(formData);
        toast.success('Record created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? 'Edit Record' : 'New Record'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

          {/* Type Toggle */}
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['INCOME', 'EXPENSE'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: t }))}
                  className={`py-2 rounded-lg text-sm font-medium transition-all border
                    ${formData.type === t
                      ? t === 'INCOME'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-red-500/20 border-red-500/50 text-red-400'
                      : 'border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            error={errors.amount}
            required
          />

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-gray-800 border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category}</p>}
          </div>

          <Input
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            error={errors.date}
            required
          />

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional notes..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-gray-800 border border-gray-700 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordForm;