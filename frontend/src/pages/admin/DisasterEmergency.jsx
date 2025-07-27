import React, { useState, useEffect } from 'react';
import AddDisasterEmergencyRecord from './modules/Disaster&Emergency/AddDisasterEmergencyRecord';
import axios from '../../utils/axiosConfig';
import EmergencyHotlinesTable from './modules/Disaster&Emergency/EmergencyHotlinesTable';
import { ExclamationTriangleIcon, PhoneIcon, PlusIcon, TableCellsIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

const DisasterEmergency = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    type: '',
    date: '',
    location: '',
    description: '',
    actions_taken: '',
    casualties: '',
    reported_by: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHotlinesTable, setShowHotlinesTable] = useState(false);
  const [showAddHotlineModal, setShowAddHotlineModal] = useState(false);
  const [hotlinesCount, setHotlinesCount] = useState(0);

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/disaster-emergencies');
      setRecords(res.data);
    } catch (err) {
      setError('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const fetchHotlinesCount = async () => {
    try {
      const res = await axios.get('/emergency-hotlines');
      setHotlinesCount(res.data.length);
    } catch {}
  };

  useEffect(() => {
    fetchRecords();
    fetchHotlinesCount();
  }, []);

  const handleEdit = (record) => {
    setEditId(record.id);
    setEditForm({ ...record });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.put(`/disaster-emergencies/${editId}`, editForm);
      setShowEditModal(false);
      setEditId(null);
      fetchRecords();
    } catch (err) {
      setError('Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    setLoading(true);
    setError('');
    try {
      await axios.delete(`/disaster-emergencies/${id}`);
      fetchRecords();
    } catch (err) {
      setError('Failed to delete record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
      <div className="w-full max-w-7xl mx-auto space-y-10">
        {/* Animated Header */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-400 rounded-full shadow-2xl mb-6 transform hover:scale-110 transition-all duration-300">
            <ExclamationTriangleIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
            Disaster & Emergency Management
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Comprehensive management for barangay disaster and emergency records, hotlines, and response procedures.
          </p>
          <div className="flex justify-center gap-4">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-6 py-2 rounded-full text-sm font-medium border border-green-200">
              {records.length} Total Disaster/Emergency Records
            </div>
            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-6 py-2 rounded-full text-sm font-medium border border-emerald-200">
              {hotlinesCount} Emergency Hotlines
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <button
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-base font-semibold transition-all duration-300 transform hover:scale-105"
            onClick={() => setShowAddHotlineModal(true)}
          >
            <PhoneIcon className="w-6 h-6" />
            Add Emergency Hotline
          </button>
          <button
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-base font-semibold transition-all duration-300 transform hover:scale-105"
            onClick={() => setShowHotlinesTable((prev) => !prev)}
          >
            <TableCellsIcon className="w-6 h-6" />
            {showHotlinesTable ? 'Hide' : 'Show'} Emergency Hotlines Table
          </button>
          <AddDisasterEmergencyRecord onSuccess={fetchRecords} />
        </div>
        {/* Placeholder for Add Emergency Hotline Modal */}
        {showAddHotlineModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4 text-emerald-700 flex items-center gap-2">
                <PhoneIcon className="w-6 h-6" /> Add Emergency Hotline
              </h2>
              <p className="text-gray-500">(Hotline add form goes here.)</p>
              <div className="flex gap-4 mt-6">
                <button onClick={() => setShowAddHotlineModal(false)} className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400">Close</button>
              </div>
            </div>
          </div>
        )}
        {/* Emergency Hotlines Table */}
        {showHotlinesTable && (
          <div className="animate-fade-in">
            <EmergencyHotlinesTable />
          </div>
        )}
        {/* Card-style section for Disaster/Emergency Records */}
        <div className="bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 px-8 py-6">
            <h3 className="text-white font-bold text-xl flex items-center gap-3">
              <DocumentTextIcon className="w-6 h-6" />
              Disaster and Emergency Records ({records.length})
            </h3>
          </div>
          <div className="overflow-x-auto p-8">
            {error && <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 px-8 py-6 rounded-2xl mb-6 flex items-center shadow-lg animate-bounce">{error}</div>}
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                <tr>
                  <th className="px-8 py-6 text-left font-bold text-emerald-700">Type</th>
                  <th className="px-6 py-6 text-left font-bold text-emerald-700">Date</th>
                  <th className="px-6 py-6 text-left font-bold text-emerald-700">Location</th>
                  <th className="px-6 py-6 text-left font-bold text-emerald-700">Description</th>
                  <th className="px-6 py-6 text-left font-bold text-emerald-700">Actions Taken</th>
                  <th className="px-6 py-6 text-left font-bold text-emerald-700">Casualties</th>
                  <th className="px-6 py-6 text-left font-bold text-emerald-700">Reported By</th>
                  <th className="px-6 py-6 text-left font-bold text-emerald-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                          <ExclamationTriangleIcon className="w-10 h-10 text-emerald-400" />
                        </div>
                        <p className="text-emerald-600 font-semibold text-lg">No disaster or emergency records found</p>
                        <p className="text-emerald-400 text-sm">Click the button above to add a new record</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((rec, idx) => (
                    <tr key={rec.id} className={`transition-all duration-300 group ${idx % 2 === 0 ? 'bg-white' : 'bg-green-50'} hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50`}>
                      <td className="px-6 py-6 font-bold text-emerald-900 group-hover:text-emerald-600 transition-colors duration-300">{rec.type}</td>
                      <td className="px-6 py-6">{rec.date}</td>
                      <td className="px-6 py-6">{rec.location}</td>
                      <td className="px-6 py-6 max-w-xs truncate" title={rec.description}>{rec.description}</td>
                      <td className="px-6 py-6 max-w-xs truncate" title={rec.actions_taken}>{rec.actions_taken}</td>
                      <td className="px-6 py-6">{rec.casualties}</td>
                      <td className="px-6 py-6">{rec.reported_by}</td>
                      <td className="px-6 py-6 flex gap-2">
                        <button onClick={() => handleEdit(rec)} className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105" title="Edit Record">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(rec.id)} className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105" title="Delete Record">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
            <form
              onSubmit={handleEditSubmit}
              className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg space-y-4"
            >
              <h2 className="text-2xl font-bold mb-2 text-emerald-700 flex items-center gap-2">
                <DocumentTextIcon className="w-6 h-6" /> Edit Disaster/Emergency Record
              </h2>
              <input name="type" value={editForm.type} onChange={handleEditChange} required placeholder="Type (e.g. Fire, Flood)" className="w-full border rounded px-4 py-2" />
              <input name="date" value={editForm.date} onChange={handleEditChange} required type="date" className="w-full border rounded px-4 py-2" />
              <input name="location" value={editForm.location} onChange={handleEditChange} required placeholder="Location" className="w-full border rounded px-4 py-2" />
              <textarea name="description" value={editForm.description} onChange={handleEditChange} required placeholder="Description" className="w-full border rounded px-4 py-2" />
              <textarea name="actions_taken" value={editForm.actions_taken} onChange={handleEditChange} placeholder="Actions Taken" className="w-full border rounded px-4 py-2" />
              <input name="casualties" value={editForm.casualties} onChange={handleEditChange} placeholder="Casualties (optional)" className="w-full border rounded px-4 py-2" />
              <input name="reported_by" value={editForm.reported_by} onChange={handleEditChange} placeholder="Reported By (optional)" className="w-full border rounded px-4 py-2" />
              <div className="flex gap-4 mt-4">
                <button type="submit" disabled={loading} className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-2 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700">
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="bg-gray-300 px-6 py-2 rounded-xl font-bold hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
};

export default DisasterEmergency;