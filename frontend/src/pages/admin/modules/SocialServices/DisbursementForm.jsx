import React, { useState } from 'react';
import axios from '../../../../utils/axiosConfig';

const defaultState = {
  beneficiary_id: '',
  date: '',
  amount: '',
  method: '',
  remarks: '',
  attachment: null,
};

const DisbursementForm = ({ initialData, beneficiaries = [], onClose, onSaved }) => {
  const [form, setForm] = useState(initialData ? { ...defaultState, ...initialData } : defaultState);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleFile = e => setFile(e.target.files[0]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (file) formData.append('attachment', file);
      let res;
      if (form.id) {
        res = await axios.post(`/disbursements/${form.id}?_method=PUT`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await axios.post('/disbursements', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      onSaved();
    } catch (err) {
      setError('Failed to save disbursement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4 relative">
        <button type="button" onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">&times;</button>
        <h2 className="text-xl font-bold mb-2">{form.id ? 'Edit' : 'Add'} Disbursement</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select name="beneficiary_id" value={form.beneficiary_id} onChange={handleChange} className="border rounded px-3 py-2" required>
            <option value="">Select Beneficiary</option>
            {beneficiaries.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <input name="date" type="date" value={form.date} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="amount" type="number" value={form.amount} onChange={handleChange} className="border rounded px-3 py-2" placeholder="Amount" required />
          <input name="method" value={form.method} onChange={handleChange} className="border rounded px-3 py-2" placeholder="Method (e.g., Cash, Bank)" required />
        </div>
        <textarea name="remarks" value={form.remarks} onChange={handleChange} className="border rounded px-3 py-2 w-full" placeholder="Remarks" />
        <input name="attachment" type="file" onChange={handleFile} className="w-full" />
        {form.attachment && typeof form.attachment === 'string' && (
          <a href={form.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Current Attachment</a>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded">{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
};

export default DisbursementForm; 