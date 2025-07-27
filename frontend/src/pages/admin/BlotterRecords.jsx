import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import axios from "../../utils/axiosConfig";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  XMarkIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon as AlertIcon,
  ShieldExclamationIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from 'react-router-dom';
import NewComplaint from "./modules/Blotter/NewComplaint";

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

const getComplaintTypeColor = (type) => {
  switch (type) {
    case 'Physical Injury':
      return 'bg-red-100 text-red-800';
    case 'Verbal Abuse':
      return 'bg-orange-100 text-orange-800';
    case 'Property Damage':
      return 'bg-yellow-100 text-yellow-800';
    case 'Theft':
      return 'bg-purple-100 text-purple-800';
    case 'Noise Complaint':
      return 'bg-blue-100 text-blue-800';
    case 'Other':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getComplaintTypeIcon = (type) => {
  switch (type) {
    case 'Physical Injury':
      return <AlertIcon className="w-3 h-3" />;
    case 'Verbal Abuse':
      return <ChatBubbleLeftRightIcon className="w-3 h-3" />;
    case 'Property Damage':
      return <ShieldExclamationIcon className="w-3 h-3" />;
    case 'Theft':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    case 'Noise Complaint':
      return <DocumentTextIcon className="w-3 h-3" />;
    case 'Other':
      return <DocumentTextIcon className="w-3 h-3" />;
    default:
      return <DocumentTextIcon className="w-3 h-3" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Scheduled':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    case 'Completed':
      return 'bg-blue-100 text-blue-800';
    case 'No Show':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Scheduled':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'Pending':
      return <ClockIcon className="w-3 h-3" />;
    case 'Cancelled':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    case 'Completed':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'No Show':
      return <XMarkIcon className="w-3 h-3" />;
    default:
      return <ClockIcon className="w-3 h-3" />;
  }
};

const BlotterRecords = () => {
  const [blotterRecords, setBlotterRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch blotter records from new API endpoint
    setLoading(true);
    axios.get("/blotter-records")
      .then(res => {
        setBlotterRecords(res.data.records);
        setFilteredRecords(res.data.records);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFilteredRecords(
      blotterRecords.filter((record) =>
        (record.complainant_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (record.respondent_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (record.complaint_type || "").toLowerCase().includes(search.toLowerCase()) ||
        (record.resident && `${record.resident.first_name} ${record.resident.last_name}`.toLowerCase().includes(search.toLowerCase()))
      )
    );
  }, [search, blotterRecords]);

  const handleShowDetails = (record) => {
    if (selectedRecord?.id === record.id) {
      setSelectedRecord(null);
    } else {
      setSelectedRecord(record);
    }
  };

  const handleEdit = (record) => {
    setEditData(record);
    setShowModal(true);
  };

  const handleSchedule = (record) => {
    setScheduleData(record);
    setShowScheduleModal(true);
  };

  const handleSave = () => {
    // Handle save logic here
    setShowModal(false);
    setEditData({});
  };

  const handleScheduleSave = () => {
    // Handle schedule save logic here
    setShowScheduleModal(false);
    setScheduleData({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusCount = (status) => {
    return blotterRecords.filter(record => record.status === status).length;
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
              <ShieldExclamationIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Blotter Records & Appointments
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive management system for barangay blotter complaints and appointment scheduling with real-time tracking.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Complaints"
              value={blotterRecords.length}
              icon={<ShieldExclamationIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
            />
            <StatCard
              label="Scheduled"
              value={getStatusCount('Scheduled')}
              icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />}
              iconBg="bg-emerald-100"
            />
            <StatCard
              label="Pending"
              value={getStatusCount('Pending')}
              icon={<ClockIcon className="w-6 h-6 text-yellow-600" />}
              iconBg="bg-yellow-100"
            />
            <StatCard
              label="Completed"
              value={getStatusCount('Completed')}
              icon={<ClockIcon className="w-6 h-6 text-blue-600" />}
              iconBg="bg-blue-100"
            />
          </div>

          {/* Enhanced Search and Add Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex gap-3">
                <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                  <ShieldExclamationIcon className="w-5 h-5" />
                  View All Complaints
                </button>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                  <CalendarIcon className="w-5 h-5" />
                  Schedule Appointments
                </button>
                <button
                  onClick={() => navigate('/admin/modules/Blotter/NewComplaint')}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <PlusIcon className="w-5 h-5" />
                  New Complaint
                </button>
                <button
                  onClick={() => navigate('/admin/modules/Blotter/BlotterRequest')}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <ShieldExclamationIcon className="w-5 h-5" />
                  View All Blotter Requests
                </button>
              </div>

              <div className="flex gap-3 items-center w-full max-w-md">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                    placeholder="Search by name, ID, or complaint type..."
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

          {/* Enhanced Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <ShieldExclamationIcon className="w-5 h-5" />
                Blotter Records
              </h3>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700">ID</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700">Case Number</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700">Complainant</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700">Respondent</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700">Complaint Type</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700">Incident Date</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700">Resident Name</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <ShieldExclamationIcon className="w-12 h-12 text-gray-300" />
                            <p className="text-gray-500 font-medium">No blotter records found</p>
                            <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-green-50 transition-all duration-200 group">
                          <td className="px-4 py-4">{record.id}</td>
                          <td className="px-4 py-4">{record.case_number}</td>
                          <td className="px-4 py-4">{record.complainant_name}</td>
                          <td className="px-4 py-4">{record.respondent_name}</td>
                          <td className="px-4 py-4">{record.complaint_type}</td>
                          <td className="px-4 py-4">{record.incident_date}</td>
                          <td className="px-4 py-4">{record.resident ? `${record.resident.first_name} ${record.resident.last_name}` : ''}</td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => handleShowDetails(record)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                            >
                              <EyeIcon className="w-3 h-3" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl shadow-2xl border border-green-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-3xl p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <PencilIcon className="w-6 h-6" />
                    Edit Blotter Record
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-green-200 transition-colors duration-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Complaint Type</label>
                    <select
                      value={editData.complaint_type || ''}
                      onChange={(e) => setEditData({...editData, complaint_type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select Complaint Type</option>
                      <option value="Physical Injury">Physical Injury</option>
                      <option value="Verbal Abuse">Verbal Abuse</option>
                      <option value="Property Damage">Property Damage</option>
                      <option value="Theft">Theft</option>
                      <option value="Noise Complaint">Noise Complaint</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={editData.status || ''}
                      onChange={(e) => setEditData({...editData, status: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="No Show">No Show</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Complaint Details</label>
                    <textarea
                      value={editData.complaint_details || ''}
                      onChange={(e) => setEditData({...editData, complaint_details: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter complaint details"
                      rows="3"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                    <input
                      type="text"
                      value={editData.remarks || ''}
                      onChange={(e) => setEditData({...editData, remarks: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter remarks"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await axios.put(`/admin/blotter-requests/${editData.id}`, editData);
                      setShowModal(false);
                      setEditData({});
                      // Refresh list
                      setLoading(true);
                      const res = await axios.get("/admin/blotter-requests");
                      setBlotterRecords(res.data);
                      setFilteredRecords(res.data);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Appointment Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-green-50 via-white to-green-100 rounded-3xl shadow-2xl border border-green-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-3xl p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6" />
                    Schedule Appointment
                  </h2>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="text-white hover:text-green-200 transition-colors duration-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Resident Information</h4>
                  <p className="text-sm text-gray-700"><span className="font-medium">Name:</span> {scheduleData.resident?.name}</p>
                  <p className="text-sm text-gray-700"><span className="font-medium">Complaint:</span> {scheduleData.complaint_type}</p>
                  <p className="text-sm text-gray-700"><span className="font-medium">Preferred Time:</span> {scheduleData.preferred_time}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Date</label>
                    <input
                      type="date"
                      value={scheduleData.appointment_date || ''}
                      onChange={(e) => setScheduleData({...scheduleData, appointment_date: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Time</label>
                    <select
                      value={scheduleData.appointment_time || ''}
                      onChange={(e) => setScheduleData({...scheduleData, appointment_time: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select Time</option>
                      <option value="08:00 AM">08:00 AM</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                    <textarea
                      value={scheduleData.remarks || ''}
                      onChange={(e) => setScheduleData({...scheduleData, remarks: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter any additional notes for the appointment"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await axios.put(`/admin/blotter-requests/${scheduleData.id}`, scheduleData);
                      setShowScheduleModal(false);
                      setScheduleData({});
                      // Refresh list
                      setLoading(true);
                      const res = await axios.get("/admin/blotter-requests");
                      setBlotterRecords(res.data);
                      setFilteredRecords(res.data);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Schedule Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add New Complaint Modal */}
      </main>
    </>
  );
};

export default BlotterRecords;
