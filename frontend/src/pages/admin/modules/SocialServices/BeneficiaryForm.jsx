import React, { useState } from 'react';
import axios from '../../../../utils/axiosConfig';

const defaultState = {
  name: '',
  beneficiary_type: '',
  status: 'Pending',
  assistance_type: '',
  amount: '',
  contact_number: '',
  email: '',
  address: '',
  application_date: '',
  approved_date: '',
  remarks: '',
  attachment: null,
};

const BeneficiaryForm = ({ initialData, onClose, onSaved }) => {
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
        res = await axios.post(`/beneficiaries/${form.id}?_method=PUT`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await axios.post('/beneficiaries', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      onSaved();
    } catch (err) {
      setError('Failed to save beneficiary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4 relative">
        <button type="button" onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl">&times;</button>
        <h2 className="text-xl font-bold mb-2 text-center">{form.id ? 'Edit' : 'Add'} Beneficiary</h2>
        {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="name" value={form.name} onChange={handleChange} className="border rounded px-3 py-2" placeholder="Full Name" required />
          <select name="beneficiary_type" value={form.beneficiary_type} onChange={handleChange} className="border rounded px-3 py-2" required>
            <option value="">Type</option>
            <option>Student</option>
            <option>Senior Citizen</option>
            <option>PWD</option>
            <option>Indigent</option>
            <option>Solo Parent</option>
          </select>
          <select name="status" value={form.status} onChange={handleChange} className="border rounded px-3 py-2" required>
            <option>Pending</option>
            <option>Processing</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <input name="assistance_type" value={form.assistance_type} onChange={handleChange} className="border rounded px-3 py-2" placeholder="Assistance Type" required />
          <input name="amount" type="number" value={form.amount} onChange={handleChange} className="border rounded px-3 py-2" placeholder="Amount" required />
          <input name="contact_number" value={form.contact_number} onChange={handleChange} className="border rounded px-3 py-2" placeholder="Contact Number" />
          <input name="email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2" placeholder="Email" />
          <input name="address" value={form.address} onChange={handleChange} className="border rounded px-3 py-2" placeholder="Address" />
          <input name="application_date" type="date" value={form.application_date} onChange={handleChange} className="border rounded px-3 py-2" placeholder="Application Date" />
          <input name="approved_date" type="date" value={form.approved_date} onChange={handleChange} className="border rounded px-3 py-2" placeholder="Approved Date" />
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

export default BeneficiaryForm; 