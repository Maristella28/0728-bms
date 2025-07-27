import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  XMarkIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";

const StatCard = ({ label, value, icon, iconBg }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center group">
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-3xl font-bold text-green-600 group-hover:text-emerald-600 transition">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
  </div>
);

const badge = (text, color, icon = null) => (
  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
    {icon && icon}
    {text}
  </span>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'denied':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'approved':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'pending':
      return <ClockIcon className="w-3 h-3" />;
    case 'denied':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    default:
      return <ClockIcon className="w-3 h-3" />;
  }
};

const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentStatusIcon = (status) => {
  switch (status) {
    case 'paid':
      return <CheckCircleIcon className="w-3 h-3" />;
    default:
      return <CurrencyDollarIcon className="w-3 h-3" />;
  }
};

const initialForm = {
  asset_id: '',
  request_date: '',
  status: 'pending',
};

const InventoryAssets = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [assets, setAssets] = useState([]);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchAssets();
  }, []);

  useEffect(() => {
    setFilteredRequests(
      requests.filter((request) =>
        (request.resident && request.resident.profile && 
         `${request.resident.profile.first_name || ''} ${request.resident.profile.last_name || ''}`.toLowerCase().includes(search.toLowerCase())) ||
        (request.resident && request.resident.residents_id && 
         request.resident.residents_id.toLowerCase().includes(search.toLowerCase())) ||
        (request.asset && request.asset.name && 
         request.asset.name.toLowerCase().includes(search.toLowerCase()))
      )
    );
  }, [search, requests]);

  const fetchRequests = () => {
    setLoading(true);
    axios.get('/asset-requests')
      .then(res => setRequests(res.data))
      .catch(() => alert('Failed to load requests'))
      .finally(() => setLoading(false));
  };

  const fetchAssets = () => {
    axios.get('/assets')
      .then(res => setAssets(res.data))
      .catch(() => alert('Failed to load assets'));
  };

  // CREATE
  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/asset-requests', form);
      setRequests([...requests, res.data]);
      setForm(initialForm);
      alert('Request created!');
    } catch (err) {
      alert('Failed to create request');
    }
  };

  // UPDATE
  const handleEdit = (request) => {
    setEditingId(request.id);
    setForm({
      asset_id: request.asset_id,
      request_date: request.request_date,
      status: request.status,
    });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    try {
      const res = await axios.patch(`/asset-requests/${editingId}`, form);
      setRequests(requests.map(r => r.id === editingId ? res.data : r));
      setEditingId(null);
      setForm(initialForm);
      alert('Request updated!');
    } catch (err) {
      alert('Failed to update request');
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await axios.delete(`/asset-requests/${id}`);
      setRequests(requests.filter(r => r.id !== id));
      alert('Request deleted!');
    } catch (err) {
      alert('Failed to delete request');
    }
  };

  // Approve/Decline (status update)
  const handleApprove = async (id) => {
    await axios.patch(`/asset-requests/${id}`, { status: 'approved' });
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };

  const handleDecline = async (id) => {
    await axios.patch(`/asset-requests/${id}`, { status: 'denied' });
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'denied' } : r));
  };

  // Process Payment
  const handlePayment = async (id) => {
    if (!window.confirm('Are you sure you want to process payment for this request?')) return;
    
    setProcessingPayment(id);
    try {
      const res = await axios.post(`/asset-requests/${id}/pay`);
      setRequests(requests.map(r => r.id === id ? { 
        ...r, 
        payment_status: 'paid',
        receipt_number: res.data.receipt_number,
        amount_paid: res.data.amount_paid,
        paid_at: new Date().toISOString()
      } : r));
      
      // Show success message with receipt details
      alert(`Payment processed successfully!\nReceipt Number: ${res.data.receipt_number}\nAmount: ₱${res.data.amount_paid}`);
      
      // Generate and download receipt
      generateReceipt(res.data.asset_request, res.data.receipt_number, res.data.amount_paid);
      
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to process payment');
    } finally {
      setProcessingPayment(null);
    }
  };

  // Generate Receipt
  const generateReceipt = (assetRequest, receiptNumber, amount) => {
    const receiptContent = `
      ========================================
      BARANGAY ASSET RENTAL RECEIPT
      ========================================
      
      Receipt Number: ${receiptNumber}
      Date: ${new Date().toLocaleDateString()}
      Time: ${new Date().toLocaleTimeString()}
      
      Resident: ${assetRequest.user?.name || 'N/A'}
      Resident ID: ${assetRequest.resident?.residents_id || 'N/A'}
      
      ========================================
      ITEMS RENTED:
      ========================================
      ${assetRequest.items?.map(item => `
        Asset: ${item.asset?.name || 'N/A'}
        Quantity: ${item.quantity}
        Request Date: ${item.request_date}
        Price: ₱${item.asset?.price || 0}
        Subtotal: ₱${(item.asset?.price || 0) * item.quantity}
      `).join('\n')}
      
      ========================================
      TOTAL AMOUNT: ₱${amount}
      ========================================
      
      Payment Status: PAID
      Payment Date: ${new Date().toLocaleDateString()}
      
      ========================================
      Thank you for using our service!
      ========================================
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getStatusCount = (status) => {
    return requests.filter(request => request.status === status).length;
  };

  const getPaymentStatusCount = (status) => {
    return requests.filter(request => request.payment_status === status).length;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <BuildingOfficeIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              GMAC
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Gabay sa Mamamayan Action Center - Comprehensive management system for barangay asset rental requests with real-time tracking and payment processing.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Requests"
              value={requests.length}
              icon={<BuildingOfficeIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
            />
            <StatCard
              label="Approved"
              value={getStatusCount('approved')}
              icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />}
              iconBg="bg-emerald-100"
            />
            <StatCard
              label="Pending"
              value={getStatusCount('pending')}
              icon={<ClockIcon className="w-6 h-6 text-yellow-600" />}
              iconBg="bg-yellow-100"
            />
            <StatCard
              label="Paid"
              value={getPaymentStatusCount('paid')}
              icon={<CurrencyDollarIcon className="w-6 h-6 text-blue-600" />}
              iconBg="bg-blue-100"
            />
          </div>

          {/* Enhanced Search and Add Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex gap-3">
                <Link to="/admin/assets-management">
                  <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                    <BuildingOfficeIcon className="w-5 h-5" />
                    Go to Assets Management
                  </button>
                </Link>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                  <PlusIcon className="w-5 h-5" />
                  Create New Request
                </button>
              </div>

              <div className="flex gap-3 items-center w-full max-w-md">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                    placeholder="Search by name, ID, or asset..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                </div>
                <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300">
                  <FunnelIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* CREATE/UPDATE FORM */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">{editingId ? 'Edit Request' : 'Create New Request'}</h2>
            <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Asset</label>
                  <select 
                    name="asset_id" 
                    value={form.asset_id} 
                    onChange={handleFormChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" 
                    required
                  >
                    <option value="">Select Asset</option>
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>{asset.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Request Date</label>
                  <input 
                    name="request_date" 
                    type="date" 
                    value={form.request_date} 
                    onChange={handleFormChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select 
                    name="status" 
                    value={form.status} 
                    onChange={handleFormChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => { setEditingId(null); setForm(initialForm); }} 
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5" />
                Asset Rental Requests
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Resident ID</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Resident Name</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Asset</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Request Date</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Payment Status</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <BuildingOfficeIcon className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">No asset rental requests found</p>
                          <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-green-50 transition-all duration-200 group">
                        <td className="px-6 py-4">
                          <span className="font-mono text-green-600 bg-green-50 px-2 py-1 rounded text-xs">
                            {request.resident ? request.resident.residents_id || '' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {request.resident && request.resident.profile
                              ? `${request.resident.profile.first_name || ''} ${request.resident.profile.last_name || ''}`.trim()
                              : request.user
                                ? request.user.name
                                : ''}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-700">
                          {request.asset ? request.asset.name || '' : ''}
                        </td>
                        <td className="px-4 py-4 text-gray-700">
                          {formatDate(request.request_date)}
                        </td>
                        <td className="px-4 py-4">
                          {badge(
                            request.status.charAt(0).toUpperCase() + request.status.slice(1), 
                            getStatusColor(request.status), 
                            getStatusIcon(request.status)
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {badge(
                            request.payment_status ? request.payment_status.charAt(0).toUpperCase() + request.payment_status.slice(1) : 'Unpaid',
                            getPaymentStatusColor(request.payment_status),
                            getPaymentStatusIcon(request.payment_status)
                          )}
                          {request.receipt_number && (
                            <div className="text-xs text-gray-600 mt-1">
                              Receipt: {request.receipt_number}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-green-600">
                            ₱{request.total_amount ? request.total_amount.toFixed(2) : '0.00'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(request.id)}
                                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                                >
                                  <CheckCircleIcon className="w-3 h-3" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDecline(request.id)}
                                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                                >
                                  <ExclamationTriangleIcon className="w-3 h-3" />
                                  Decline
                                </button>
                              </>
                            )}
                            {request.status === 'approved' && request.payment_status !== 'paid' && (
                              <button
                                onClick={() => handlePayment(request.id)}
                                disabled={processingPayment === request.id}
                                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                              >
                                <CurrencyDollarIcon className="w-3 h-3" />
                                {processingPayment === request.id ? 'Processing...' : 'Pay'}
                              </button>
                            )}
                            {request.payment_status === 'paid' && (
                              <button
                                onClick={() => generateReceipt(request, request.receipt_number, request.amount_paid)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                              >
                                <DocumentTextIcon className="w-3 h-3" />
                                Download Receipt
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(request)}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                            >
                              <PencilIcon className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(request.id)}
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                            >
                              <XMarkIcon className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default InventoryAssets;