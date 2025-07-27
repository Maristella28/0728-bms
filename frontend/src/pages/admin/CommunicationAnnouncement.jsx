import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpOnSquareIcon,
  EyeSlashIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

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
    case 'posted':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'posted':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'draft':
      return <ClockIcon className="w-3 h-3" />;
    default:
      return <ClockIcon className="w-3 h-3" />;
  }
};

const CommunicationAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', image: null });
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { user, loading: authLoading } = useAuth();

  const fetchAnnouncements = async () => {
    try {
      const res = await axiosInstance.get('/admin/announcements');
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError('Failed to load announcements.');
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'image' ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to post.");
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);

    if (form.image instanceof File) {
      formData.append('image', form.image);
    }

    try {
      if (isEditing && selectedAnnouncement) {
        formData.append('_method', 'PUT');
        await axiosInstance.post(`/admin/announcements/${selectedAnnouncement.id}`, formData);
      } else {
        await axiosInstance.post('/admin/announcements', formData);
      }
      await fetchAnnouncements();
      setForm({ title: '', content: '', image: null });
      setShowForm(false);
      setIsEditing(false);
      setSelectedAnnouncement(null);
    } catch (err) {
      console.error("Error submitting announcement:", err);
      setError('Failed to submit announcement.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axiosInstance.patch(`/admin/announcements/${id}/toggle`);
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axiosInstance.delete(`/admin/announcements/${id}`);
        fetchAnnouncements();
      } catch (err) {
        console.error("Error deleting announcement:", err);
      }
    }
  };

  const handleEdit = (announcement) => {
    setForm({ title: announcement.title, content: announcement.content, image: null });
    setSelectedAnnouncement(announcement);
    setShowForm(true);
    setIsEditing(true);
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusCount = (status) => {
    return announcements.filter(announcement => announcement.status === status).length;
  };

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>
  );

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <MegaphoneIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Commmunication & Announcement
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive management system for community announcements with real-time publishing and status tracking.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              label="Total Announcements"
              value={announcements.length}
              icon={<MegaphoneIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
            />
            <StatCard
              label="Published"
              value={getStatusCount('posted')}
              icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />}
              iconBg="bg-emerald-100"
            />
            <StatCard
              label="Drafts"
              value={getStatusCount('draft')}
              icon={<ClockIcon className="w-6 h-6 text-yellow-600" />}
              iconBg="bg-yellow-100"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
              <p className="text-red-600 font-medium flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                {error}
              </p>
            </div>
          )}

          {/* Enhanced Add Announcement Form */}
          {user && showForm && (
            <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl shadow-2xl border border-green-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    {isEditing ? <PencilIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                    {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setIsEditing(false);
                      setSelectedAnnouncement(null);
                      setForm({ title: '', content: '', image: null });
                    }}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Announcement Title
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter announcement title..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Announcement Content
                  </label>
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    placeholder="Enter announcement content..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 resize-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attach Image (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-colors"
                    />
                    {form.image && (
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <CheckCircleIcon className="w-4 h-4" />
                        {form.image.name}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-8 py-3 font-semibold text-white rounded-xl shadow-lg transition-all duration-300 ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        {isEditing ? 'Update Announcement' : 'Publish Announcement'}
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Enhanced Controls Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              {user && (
                <button
                  onClick={() => {
                    setShowForm(prev => !prev);
                    setIsEditing(false);
                    setSelectedAnnouncement(null);
                    setForm({ title: '', content: '', image: null });
                  }}
                  className={`flex items-center gap-3 px-8 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                    showForm 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                  }`}
                >
                  {showForm ? (
                    <>
                      <XMarkIcon className="w-5 h-5" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-5 h-5" />
                      Add Announcement
                    </>
                  )}
                </button>
              )}

              {/* Enhanced Search Bar */}
              <div className="flex gap-3 items-center w-full max-w-md">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Announcements Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MegaphoneIcon className="w-5 h-5" />
                  Announcements ({filteredAnnouncements.length})
                </h3>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  Active: {filteredAnnouncements.filter(a => a.status === 'posted').length}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredAnnouncements.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <MegaphoneIcon className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">No announcements found</p>
                          <p className="text-gray-400 text-sm">Create your first announcement to get started</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAnnouncements.map((announcement) => (
                      <tr key={announcement.id} className="hover:bg-green-50 transition-all duration-200 group">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                                <MegaphoneIcon className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-green-600 transition-colors">
                                {announcement.title}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-2">
                                {announcement.content.substring(0, 100)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {badge(announcement.status, getStatusColor(announcement.status), getStatusIcon(announcement.status))}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedAnnouncement(announcement)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                              title="View Details"
                            >
                              <EyeIcon className="w-3 h-3" />
                              View
                            </button>
                            
                            <button
                              onClick={() => toggleStatus(announcement.id)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105 ${
                                announcement.status === 'posted'
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                              }`}
                              title={announcement.status === 'posted' ? 'Hide Announcement' : 'Publish Announcement'}
                            >
                              {announcement.status === 'posted' ? (
                                <EyeSlashIcon className="w-3 h-3" />
                              ) : (
                                <ArrowUpOnSquareIcon className="w-3 h-3" />
                              )}
                              {announcement.status === 'posted' ? 'Hide' : 'Publish'}
                            </button>
                            
                            <button
                              onClick={() => handleEdit(announcement)}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                              title="Edit Announcement"
                            >
                              <PencilIcon className="w-3 h-3" />
                              Edit
                            </button>
                            
                            <button
                              onClick={() => handleDelete(announcement.id)}
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                              title="Delete Announcement"
                            >
                              <TrashIcon className="w-3 h-3" />
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

        {/* Enhanced Modal Viewer */}
        {selectedAnnouncement && !isEditing && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl shadow-2xl border border-green-100 max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <MegaphoneIcon className="w-5 h-5" />
                    Announcement Details
                  </h2>
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">{selectedAnnouncement.title}</h3>

                {selectedAnnouncement.image && (
                  <div className="w-full mb-6 flex justify-center">
                    <img
                      src={`http://localhost:8000/storage/${selectedAnnouncement.image}`}
                      alt="Announcement"
                      className="rounded-xl object-cover max-w-full max-h-[400px] w-auto shadow-lg"
                    />
                  </div>
                )}

                <div className="prose max-w-none mb-6">
                  <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed">
                    {selectedAnnouncement.content}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Status:</span>
                    {badge(selectedAnnouncement.status, getStatusColor(selectedAnnouncement.status), getStatusIcon(selectedAnnouncement.status))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Posted:</span>
                    <span className="text-sm text-gray-500">
                      {new Date(selectedAnnouncement.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default CommunicationAnnouncement;