import React, { useState } from 'react';
import BeneficiaryForm from './BeneficiaryForm';
import axios from '../../../../utils/axiosConfig';

const BeneficiariesTable = ({ beneficiaries, fetchBeneficiaries, loading }) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const filtered = beneficiaries.filter(b =>
    (b.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.beneficiary_type || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.assistance_type || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditData(null);
    setShowModal(true);
  };
  const handleEdit = (b) => {
    setEditData(b);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this beneficiary?')) return;
    await axios.delete(`/beneficiaries/${id}`);
    fetchBeneficiaries();
  };

  return (
    <div className="bg-white/70 backdrop-blur rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold">Beneficiaries</div>
        <button onClick={handleAdd} className="bg-emerald-600 text-white px-4 py-2 rounded shadow">Add Beneficiary</button>
      </div>
      <input
        className="w-full mb-4 px-3 py-2 border rounded"
        placeholder="Search beneficiaries..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Assistance</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8">No beneficiaries found.</td></tr>
            ) : filtered.map(b => (
              <tr key={b.id} className="hover:bg-emerald-50">
                <td className="px-4 py-2">{b.name}</td>
                <td className="px-4 py-2">{b.beneficiary_type}</td>
                <td className="px-4 py-2">{b.status}</td>
                <td className="px-4 py-2">{b.assistance_type}</td>
                <td className="px-4 py-2">₱ {Number(b.amount).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleEdit(b)} className="text-blue-600 mr-2">Edit</button>
                  <button onClick={() => handleDelete(b.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <BeneficiaryForm
          initialData={editData}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchBeneficiaries(); }}
        />
      )}
    </div>
  );
};

export default BeneficiariesTable; 