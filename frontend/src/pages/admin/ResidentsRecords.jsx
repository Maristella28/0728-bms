import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import axiosInstance from "../../utils/axiosConfig";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  UserIcon,
  XMarkIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  DocumentTextIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  HeartIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  HeartIcon as HeartSolidIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

// BADGE FUNCTION (restored)
const badge = (text, color, icon = null) => (
  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${color} inline-flex items-center gap-1 shadow-sm transition-all duration-200 hover:shadow-md`}>
    {icon && icon}
    {text}
  </span>
);

// AVATAR COMPONENT (use this everywhere for avatars)
const AvatarImg = ({ avatarPath }) => {
  const getAvatarUrl = (path) =>
    path && typeof path === 'string' && path.trim() !== '' && path.trim().toLowerCase() !== 'avatar' && path.trim().toLowerCase() !== 'avatars/'
      ? `http://localhost:8000/storage/${path}`
      : null;

  const avatarUrl = getAvatarUrl(avatarPath);
  const [imgSrc, setImgSrc] = useState(avatarUrl || '/default-avatar.png');

  useEffect(() => {
    setImgSrc(avatarUrl || '/default-avatar.png');
  }, [avatarUrl]);

  return (
    <img
      src={imgSrc}
      alt="avatar"
      className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-white"
      onError={() => setImgSrc('/default-avatar.png')}
    />
  );
};

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

const ResidentsRecords = () => {
  const [residents, setResidents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedResident, setSelectedResident] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});

  const [showSelectModal, setShowSelectModal] = useState(false);
  const [usersWithoutProfiles, setUsersWithoutProfiles] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectLoading, setSelectLoading] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const res = await axiosInstance.get("/admin/residents");
      setResidents(res.data.residents);
      setFiltered(res.data.residents);
    } catch (err) {
      console.error("Error loading residents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFiltered(
      residents.filter((r) =>
        `${r.first_name} ${r.last_name}`.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, residents]);

  const handleShowDetails = async (residentId) => {
    if (selectedResident?.id === residentId) {
      setSelectedResident(null);
      return;
    }

    setDetailLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/residents/${residentId}`);
      setSelectedResident(res.data.resident);
    } catch (err) {
      console.error("Failed to fetch resident", err);
      setSelectedResident(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdate = (resident) => {
    setEditData({
      id: resident.id,
      user_id: resident.user_id,
      first_name: resident.first_name,
      middle_name: resident.middle_name || "",
      last_name: resident.last_name,
      name_suffix: resident.name_suffix || "",
      birth_date: resident.birth_date,
      birth_place: resident.birth_place,
      age: resident.age,
      nationality: resident.nationality || "",
      email: resident.email,
      contact_number: resident.contact_number,
      sex: resident.sex,
      civil_status: resident.civil_status,
      religion: resident.religion,
      full_address: resident.full_address,
      years_in_barangay: resident.years_in_barangay,
      voter_status: resident.voter_status,
      household_no: resident.household_no,
      avatar: null,

      housing_type: resident.housing_type || "",
      classified_sector: resident.classified_sector || "",
      educational_attainment: resident.educational_attainment || "",
      occupation_type: resident.occupation_type || "",
      business_name: resident.business_name || "",
      business_type: resident.business_type || "",
      business_address: resident.business_address || "",

      special_categories: resident.special_categories || [],
      head_of_family: resident.head_of_family === 1,
      business_outside_barangay: resident.business_outside_barangay === 1,

      vaccination_status: resident.vaccination_status || "",
      vaccine_received: resident.vaccine_received || [],
      year_vaccinated: resident.year_vaccinated || "",
      other_vaccine: resident.other_vaccine || "",
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "special_categories") {
      setEditData((prev) => {
        const prevCategories = prev.special_categories || [];
        return {
          ...prev,
          special_categories: checked
            ? [...prevCategories, value]
            : prevCategories.filter((item) => item !== value),
        };
      });
    } else if (type === "radio" && name === "vaccine_received") {
      setEditData((prev) => ({
        ...prev,
        vaccine_received: value === "None" ? ["None"] : [value],
      }));
    } else {
      setEditData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // ✅ Check profile existence before creation
  const checkIfProfileExists = async (userId) => {
    try {
      const res = await axiosInstance.get(`/admin/users/${userId}/has-profile`);
      return res.data.exists;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      if (Array.isArray(editData.vaccine_received)) {
        let vaccines = [...editData.vaccine_received];
        if (vaccines.includes("None")) {
          vaccines = ["None"];
        } else {
          vaccines = vaccines.filter((v) => v !== "None");
        }
        vaccines.forEach((v) => formData.append("vaccine_received[]", v));
      }
      // Ensure household_no is always present and not null/undefined
      const safeEditData = { ...editData, household_no: editData.household_no ?? "" };
      Object.entries(safeEditData).forEach(([key, value]) => {
        if (key === "vaccine_received" || key === "avatar") return;
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item !== null && item !== "") {
              formData.append(`${key}[]`, item);
            }
          });
        } else if (typeof value === "boolean") {
          formData.append(key, value ? "1" : "0");
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      if (editData.avatar && editData.avatar instanceof File) {
        formData.append('avatar', editData.avatar);
      }
      let response;
      if (editData.id) {
        response = await axiosInstance.post(
          `/admin/residents/${editData.id}?_method=PUT`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else if (editData.user_id) {
        const alreadyExists = await checkIfProfileExists(editData.user_id);
        if (alreadyExists) {
          alert("❌ This user already has a resident profile.");
          return;
        }
        response = await axiosInstance.post(
          "/residents/complete-profile",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }
      alert("✅ Resident profile saved successfully.");
      setShowModal(false);
      fetchResidents();
    } catch (err) {
      // Enhanced error display for validation errors
      const errorMsg = err.response?.data?.message || err.message;
      let errorDetails = "No error details provided.";
      if (err.response?.data?.errors) {
        errorDetails = Object.entries(err.response.data.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join('\n');
      } else if (err.response?.data?.error) {
        errorDetails = err.response.data.error;
      }
      console.error("❌ Save failed:", err.response?.data || err);
      alert(`❌ Failed to save resident.\n${errorMsg}\nDetails:\n${errorDetails}`);
    }
  };

  const handleAddResidentClick = async () => {
    const users = await fetchUsersWithoutProfiles();
    if (users.length > 0) {
      setUsersWithoutProfiles(users);
      setSelectedUserId("");
      setShowSelectModal(true);
    } else {
      alert("✅ All users already have resident profiles.");
    }
  };

  const fetchUsersWithoutProfiles = async () => {
    try {
      setSelectLoading(true);
      const res = await axiosInstance.get("/admin/users-without-profiles");
      return res.data.users;
    } catch (err) {
      console.error("Failed to fetch users without profiles:", err);
      return [];
    } finally {
      setSelectLoading(false);
    }
  };

  const handleConfirmSelection = async () => {
    if (!selectedUserId) {
      alert("❌ Please select a user.");
      return;
    }

    try {
      const res = await axiosInstance.get(`/user/${selectedUserId}`);
      const user = res.data.user;

      setEditData({
        user_id: user.id,
        first_name: "",
        middle_name: "",
        last_name: "",
        name_suffix: "",
        birth_date: "",
        birth_place: "",
        age: "",
        nationality: "",
        email: user.email || "",
        contact_number: "",
        sex: "",
        civil_status: "",
        religion: "",
        full_address: "",
        years_in_barangay: "",
        voter_status: "",
        household_no: "",
        avatar: null,

        housing_type: "",
        classified_sector: "",
        educational_attainment: "",
        occupation_type: "",
        business_name: "",
        business_type: "",
        business_address: "",

        special_categories: [],
        head_of_family: false,
        business_outside_barangay: false,

        vaccination_status: "",
        vaccine_received: [],
        year_vaccinated: "",
        other_vaccine: "",
      });

      setShowSelectModal(false);
      setShowModal(true);
    } catch (err) {
      console.error("❌ Failed to load selected user:", err);
      alert("❌ Could not load user information.");
    }
  };

  // Utility to check if avatar path is valid (not empty, not null, not just 'avatar' or 'avatars/')
  const isValidAvatarPath = (path) => {
    if (!path) return false;
    if (typeof path !== 'string') return false;
    if (path.trim() === '' || path.trim().toLowerCase() === 'avatar' || path.trim().toLowerCase() === 'avatars/') return false;
    return true;
  };

  // Returns the full URL for the avatar if valid, otherwise null
  const getAvatarUrl = (path) =>
    isValidAvatarPath(path) ? `http://localhost:8000/storage/${path}` : null;

  // Render avatar with fallback to default image if missing or fails to load
  const renderAvatar = (r) => {
    const avatarUrl = getAvatarUrl(r.avatar);
    // Use React state to handle image error fallback
    const [imgSrc, setImgSrc] = useState(avatarUrl || '/default-avatar.png');
    React.useEffect(() => {
      setImgSrc(avatarUrl || '/default-avatar.png');
    }, [avatarUrl]);
    return (
      <img
        src={imgSrc}
        alt="avatar"
        className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-white"
        onError={() => setImgSrc('/default-avatar.png')}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Enhanced color functions for badges
  const getCivilStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'single':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'married':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'widowed':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'divorced':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'separated':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    }
  };

  const getGenderColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'female':
        return 'bg-pink-100 text-pink-800 border border-pink-200';
      default:
        return 'bg-purple-100 text-purple-800 border border-purple-200';
    }
  };

  const getVoterStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'registered':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'unregistered':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
    }
  };

  // Icon helper functions
  const getCivilStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'single':
        return <UserIcon className="w-3 h-3" />;
      case 'married':
        return <HeartSolidIcon className="w-3 h-3" />;
      case 'widowed':
        return <HeartIcon className="w-3 h-3" />;
      case 'divorced':
        return <XCircleIcon className="w-3 h-3" />;
      case 'separated':
        return <ExclamationTriangleIcon className="w-3 h-3" />;
      default:
        return <UserIcon className="w-3 h-3" />;
    }
  };

  const getGenderIcon = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return <UserIcon className="w-3 h-3" />;
      case 'female':
        return <HeartIcon className="w-3 h-3" />;
      default:
        return <UserGroupIcon className="w-3 h-3" />;
    }
  };

  const getVoterStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'registered':
        return <CheckCircleIcon className="w-3 h-3" />;
      case 'unregistered':
        return <XCircleIcon className="w-3 h-3" />;
      case 'pending':
        return <ClockIcon className="w-3 h-3" />;
      case 'active':
        return <CheckCircleIcon className="w-3 h-3" />;
      case 'inactive':
        return <XCircleIcon className="w-3 h-3" />;
      default:
        return <DocumentTextIcon className="w-3 h-3" />;
    }
  };

  // Utility function for formatting resident name
  function formatResidentName(resident) {
    if (!resident) return '';
    const { first_name, middle_name, last_name, name_suffix } = resident;
    return (
      first_name +
      (middle_name ? ` ${middle_name}` : '') +
      (last_name ? ` ${last_name}` : '') +
      (name_suffix && name_suffix.toLowerCase() !== 'none' ? ` ${name_suffix}` : '')
    );
  }

  function toDateInputValue(dateString) {
    if (!dateString) return "";
    // Handles both ISO and already-correct format
    const d = new Date(dateString);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
  }
  
  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Residents Records
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive management system for barangay resident records with detailed profiles and real-time updates.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Residents</p>
                  <p className="text-3xl font-bold text-green-600">{residents.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Voters</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {residents.filter(r => r.voter_status === 'Registered').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Senior Citizens</p>
                  <p className="text-3xl font-bold text-teal-600">
                    {residents.filter(r => r.special_categories?.includes('Senior Citizen')).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <HeartIcon className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">PWD Members</p>
                  <p className="text-3xl font-bold text-lime-600">
                    {residents.filter(r => r.special_categories?.includes('PWD')).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-lime-600" />
                </div>
              </div>
            </div>

            <StatCard
              label="Male Residents"
              value={residents.filter(r => r.sex === 'Male').length}
              icon={<UserIcon className="w-6 h-6 text-blue-600" />}
              iconBg="bg-blue-100"
            />
          </div>

          {/* Enhanced Search and Add Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <button
                onClick={handleAddResidentClick}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <PlusIcon className="w-5 h-5" />
                Add New Resident
              </button>

              <div className="flex gap-3 items-center w-full max-w-md">
                <div className="relative flex-grow">
                                  <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                  placeholder="Search residents by name..."
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
                <DocumentTextIcon className="w-5 h-5" />
                Resident Records
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Profile</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Resident ID</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Age</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Nationality</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Gender</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Voter</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Voter's ID</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-500 font-medium">Loading residents...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <UserIcon className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">No residents found</p>
                          <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <React.Fragment key={r.id}>
                        <tr className="hover:bg-green-50 transition-all duration-200 group">
                          <td className="px-6 py-4"><AvatarImg avatarPath={r.avatar} /></td>
                          <td className="px-4 py-4">
                            <span className="font-mono text-green-600 bg-green-50 px-2 py-1 rounded text-xs">
                              {r.residents_id}
                            </span>
                          </td>
                          <td
                            onClick={() => handleShowDetails(r.id)}
                            className="px-6 py-4 cursor-pointer group-hover:text-green-600 transition-colors duration-200"
                          >
                            <div className="font-semibold text-gray-900">
                              {formatResidentName(r)}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <EyeIcon className="w-3 h-3" />
                              Click to view details
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                              {r.age} years
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-700">{r.nationality || "N/A"}</td>
                          <td className="px-4 py-4">
                            {badge(r.civil_status, getCivilStatusColor(r.civil_status), getCivilStatusIcon(r.civil_status))}
                          </td>
                          <td className="px-4 py-4">
                            {badge(r.sex, getGenderColor(r.sex), getGenderIcon(r.sex))}
                          </td>
                          <td className="px-4 py-4">
                            {badge(r.voter_status, getVoterStatusColor(r.voter_status), getVoterStatusIcon(r.voter_status))}
                          </td>
                          <td className="px-4 py-4 text-gray-700">{r.voters_id_number || "N/A"}</td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => handleUpdate(r)}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                            >
                              <PencilIcon className="w-4 h-4" />
                              Edit
                            </button>
                          </td>
                        </tr>

                        {selectedResident?.id === r.id && (
                          <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <td colSpan="9" className="px-8 py-8">
                              {detailLoading ? (
                                                        <div className="flex justify-center py-8">
                          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                              ) : (
                                <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
                                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                                    {/* Enhanced Avatar Section */}
                                    <div className="flex-shrink-0">
                                      <div className="relative">
                                        <img
                                          src={getAvatarUrl(selectedResident.avatar)}
                                          alt="avatar"
                                          className="w-40 h-40 rounded-2xl object-cover shadow-xl border-4 border-white"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-3 cursor-pointer shadow-lg hover:scale-110 hover:bg-green-700 transition-all duration-200 flex items-center justify-center border-2 border-white">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setEditData((prev) => ({ ...prev, avatar: e.target.files[0] }))}
                                            className="hidden"
                                          />
                                          <PencilIcon className="w-5 h-5" />
                                        </div>
                                      </div>
                                      <div className="mt-4 text-center">
                                        <h3 className="text-xl font-bold text-gray-900">
                                          {formatResidentName(selectedResident)}
                                        </h3>
                                        <p className="text-gray-600 text-sm">Resident ID: {selectedResident.residents_id}</p>
                                      </div>
                                    </div>

                                    {/* Enhanced Info Grid - All Details */}
                                    <div className="flex-1 space-y-6">
                                      {/* Personal Information Card */}
                                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                        <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                                          <UserIcon className="w-5 h-5" /> Personal Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          <div><span className="font-medium text-gray-700">First Name:</span> <span className="text-gray-900">{selectedResident.first_name}</span></div>
                                          <div><span className="font-medium text-gray-700">Middle Name:</span> <span className="text-gray-900">{selectedResident.middle_name || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Last Name:</span> <span className="text-gray-900">{selectedResident.last_name}</span></div>
                                          <div><span className="font-medium text-gray-700">Suffix:</span> <span className="text-gray-900">{selectedResident.name_suffix || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Birth Date:</span> <span className="text-gray-900">{toDateInputValue(selectedResident.birth_date)}</span></div>
                                          <div><span className="font-medium text-gray-700">Birth Place:</span> <span className="text-gray-900">{selectedResident.birth_place}</span></div>
                                          <div><span className="font-medium text-gray-700">Age:</span> <span className="text-gray-900">{selectedResident.age}</span></div>
                                          <div><span className="font-medium text-gray-700">Nationality:</span> <span className="text-gray-900">{selectedResident.nationality || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Religion:</span> <span className="text-gray-900">{selectedResident.religion || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-900">{selectedResident.email || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Contact Number:</span> <span className="text-gray-900">{selectedResident.contact_number || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Full Address:</span> <span className="text-gray-900">{selectedResident.full_address || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Years in Barangay:</span> <span className="text-gray-900">{selectedResident.years_in_barangay || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Household No:</span> <span className="text-gray-900">{selectedResident.household_no || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Relation to Head:</span> <span className="text-gray-900">{selectedResident.relation_to_head || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Housing Type:</span> <span className="text-gray-900">{selectedResident.housing_type || 'N/A'}</span></div>
                                        </div>
                                      </div>

                                      {/* Additional Information Card */}
                                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                        <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                                          <AcademicCapIcon className="w-5 h-5" /> Additional Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          <div><span className="font-medium text-gray-700">Sex:</span> <span className="text-gray-900">{selectedResident.sex}</span></div>
                                          <div><span className="font-medium text-gray-700">Civil Status:</span> <span className="text-gray-900">{selectedResident.civil_status}</span></div>
                                          <div><span className="font-medium text-gray-700">Voter Status:</span> <span className="text-gray-900">{selectedResident.voter_status}</span></div>
                                          <div><span className="font-medium text-gray-700">Educational Attainment:</span> <span className="text-gray-900">{selectedResident.educational_attainment || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Classified Sector:</span> <span className="text-gray-900">{selectedResident.classified_sector || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Occupation Type:</span> <span className="text-gray-900">{selectedResident.occupation_type || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Salary/Income:</span> <span className="text-gray-900">{selectedResident.salary_income || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Business Info:</span> <span className="text-gray-900">{selectedResident.business_info || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Voting Location:</span> <span className="text-gray-900">{selectedResident.voting_location || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Voter's ID Number:</span> <span className="text-gray-900">{selectedResident.voters_id_number || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Head of Family:</span> <span className="text-gray-900">{selectedResident.head_of_family ? 'Yes' : 'No'}</span></div>
                                          <div><span className="font-medium text-gray-700">Business Outside Barangay:</span> <span className="text-gray-900">{selectedResident.business_outside_barangay ? 'Yes' : 'No'}</span></div>
                                        </div>
                                      </div>

                                      {/* Business Information Card */}
                                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                                        <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                                          <BuildingOfficeIcon className="w-5 h-5" /> Business Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          <div><span className="font-medium text-gray-700">Business Name:</span> <span className="text-gray-900">{selectedResident.business_name || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Business Type:</span> <span className="text-gray-900">{selectedResident.business_type || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Business Address:</span> <span className="text-gray-900">{selectedResident.business_address || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Business Location:</span> <span className="text-gray-900">{selectedResident.business_location || 'N/A'}</span></div>
                                          </div>
                                      </div>

                                      {/* Vaccination Information Card */}
                                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                        <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                                          <HeartIcon className="w-5 h-5" /> Vaccination Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          <div><span className="font-medium text-gray-700">Vaccination Status:</span> <span className="text-gray-900">{selectedResident.vaccination_status || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Year Vaccinated:</span> <span className="text-gray-900">{selectedResident.year_vaccinated || 'N/A'}</span></div>
                                          <div><span className="font-medium text-gray-700">Other Vaccine:</span> <span className="text-gray-900">{selectedResident.other_vaccine || 'N/A'}</span></div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-700">Vaccines Received:</span>
                                            <span className="text-gray-900">
                                              {selectedResident.vaccine_received && selectedResident.vaccine_received.length > 0
                                                ? selectedResident.vaccine_received.join(', ')
                                                : 'N/A'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Special Categories */}
                                      {selectedResident.special_categories?.length > 0 && (
                                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                                          <h4 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                                            <ShieldCheckIcon className="w-5 h-5" /> Special Categories
                                          </h4>
                                          <div className="flex flex-wrap gap-2">
                                            {selectedResident.special_categories.map((cat, index) => (
                                              <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                                                {cat}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Enhanced Select User Modal */}
        {showSelectModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <UserIcon className="w-6 h-6" />
                    Select User
                  </h2>
                  <button
                    onClick={() => setShowSelectModal(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-blue-100 mt-2">Choose a user without a resident profile</p>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Available Users:
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">-- Select a user --</option>
                    {usersWithoutProfiles.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowSelectModal(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSelection}
                    disabled={!selectedUserId}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      selectedUserId
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl shadow-2xl border border-green-100 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-slideInUp">
              {/* Sticky Modal Header with Stepper */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-3xl p-8 sticky top-0 z-10 flex flex-col gap-2 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight drop-shadow-lg">
                    <PencilIcon className="w-7 h-7" />
                    {editData.user_id ? "Create Resident Profile" : "Edit Resident"}
                  </h2>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200 text-2xl font-bold"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
                {/* Stepper - Enhanced Green Theme */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex flex-col items-center">
                    <UserIcon className="w-6 h-6 text-white bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1 shadow-lg ring-2 ring-green-400" />
                    <span className="text-xs font-semibold text-green-100 mt-1">Personal</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-green-200 to-emerald-300 rounded-full shadow-sm" />
                  <div className="flex flex-col items-center">
                    <AcademicCapIcon className="w-6 h-6 text-white bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1 shadow-lg" />
                    <span className="text-xs font-semibold text-green-100 mt-1">Additional</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-green-200 to-emerald-300 rounded-full shadow-sm" />
                  <div className="flex flex-col items-center">
                    <ShieldCheckIcon className="w-6 h-6 text-white bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1 shadow-lg" />
                    <span className="text-xs font-semibold text-green-100 mt-1">Special</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-green-200 to-emerald-300 rounded-full shadow-sm" />
                  <div className="flex flex-col items-center">
                    <HeartIcon className="w-6 h-6 text-white bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1 shadow-lg" />
                    <span className="text-xs font-semibold text-green-100 mt-1">Vaccine</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-green-200 to-emerald-300 rounded-full shadow-sm" />
                  <div className="flex flex-col items-center">
                    <UserIcon className="w-6 h-6 text-white bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1 shadow-lg" />
                    <span className="text-xs font-semibold text-green-100 mt-1">Photo</span>
                  </div>
                </div>
              </div>

              <div className="p-10 space-y-10 bg-gradient-to-br from-white/80 to-green-50/80 rounded-b-3xl animate-fadeIn">
                {/* Avatar Preview */}
                <div className="flex justify-center mb-8 animate-fadeIn">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <img
                      src={editData.avatar ? URL.createObjectURL(editData.avatar) : (editData.avatar_url || "https://ui-avatars.com/api/?name=" + (editData.first_name || "R") + "+" + (editData.last_name || "P"))}
                      alt="avatar preview"
                      className="w-36 h-36 rounded-full object-cover border-4 border-emerald-400 shadow-xl bg-green-50"
                    />
                    <label className="absolute bottom-2 right-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full p-3 cursor-pointer shadow-lg hover:scale-110 hover:bg-green-700 transition-all duration-200 flex items-center justify-center border-2 border-white">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditData((prev) => ({ ...prev, avatar: e.target.files[0] }))}
                        className="hidden"
                      />
                      <PencilIcon className="w-5 h-5" />
                    </label>
                  </div>
                </div>

                {/* Section Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-green-100 p-6 space-y-4 animate-fadeIn">
                    <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-2">
                      <UserIcon className="w-5 h-5" /> Personal Information
                    </h3>
                    {["first_name", "middle_name", "last_name", "name_suffix", "birth_date", "birth_place", "age", "nationality", "religion", "email", "contact_number", "full_address", "years_in_barangay", "household_no", "relation_to_head", "housing_type"].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-green-700 mb-1 capitalize">
                          {field.replaceAll("_", " ")}
                        </label>
                        <input
                          type={field === "birth_date" ? "date" : "text"}
                          name={field}
                          value={field === "birth_date" ? toDateInputValue(editData[field]) : (editData[field] || "")}
                          onChange={handleInputChange}
                          className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-green-300 text-green-900 hover:shadow-md"
                          placeholder={field.replaceAll("_", " ")}
                          required={field === "household_no"}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Additional Information Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-green-100 p-6 space-y-4 animate-fadeIn">
                    <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-2">
                      <AcademicCapIcon className="w-5 h-5" /> Additional Information
                    </h3>
                    {/* Sex */}
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Sex</label>
                      <select 
                        name="sex" 
                        value={editData.sex || ""} 
                        onChange={handleInputChange} 
                        className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-green-900 hover:shadow-md"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    {/* Civil Status */}
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Civil Status</label>
                      <select 
                        name="civil_status" 
                        value={editData.civil_status || ""} 
                        onChange={handleInputChange} 
                        className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-green-900 hover:shadow-md"
                      >
                        <option value="">Select</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    </div>
                    {/* Voter Status */}
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Voter Status</label>
                                              <input
                          type="text"
                          name="voter_status"
                          value={editData.voter_status || ""}
                          onChange={handleInputChange}
                        className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-green-900 hover:shadow-md"
                        placeholder="Voter Status"
                        />
                    </div>
                    {/* Work & Education */}
                    {["educational_attainment", "classified_sector", "occupation_type", "salary_income", "business_info", "business_type", "business_location", "voting_location", "voters_id_number", "year_vaccinated", "other_vaccine"].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-green-700 mb-1 capitalize">
                          {field.replaceAll("_", " ")}
                        </label>
                        <input
                          type="text"
                          name={field}
                          value={editData[field] || ""}
                          onChange={handleInputChange}
                          className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-green-900 hover:shadow-md"
                          placeholder={field.replaceAll("_", " ")}
                        />
                      </div>
                    ))}
                    {/* Boolean Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Head of Family</label>
                        <select 
                          name="head_of_family" 
                          value={editData.head_of_family ? "1" : "0"} 
                          onChange={handleInputChange} 
                          className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-green-900 hover:shadow-md"
                        >
                          <option value="0">No</option>
                          <option value="1">Yes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Business Outside Barangay</label>
                        <select 
                          name="business_outside_barangay" 
                          value={editData.business_outside_barangay ? "1" : "0"} 
                          onChange={handleInputChange} 
                          className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-green-900 hover:shadow-md"
                        >
                          <option value="0">No</option>
                          <option value="1">Yes</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vaccination Information */}
                <div className="bg-white/90 rounded-2xl shadow-lg border border-green-100 p-6 animate-fadeIn">
                  <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-2">
                    <HeartIcon className="w-5 h-5" /> Vaccination Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["Pfizer-BioNTech", "Oxford-AstraZeneca", "Sputnik V", "Janssen", "Sinovac", "None"].map((vaccine) => (
                      <label key={vaccine} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors duration-200 shadow-sm cursor-pointer">
                        <input
                          type="checkbox"
                          name="vaccine_received"
                          value={vaccine}
                          checked={editData.vaccine_received?.includes(vaccine)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setEditData((prev) => {
                              const current = prev.vaccine_received || [];
                              const updated = checked
                                ? [...current, vaccine]
                                : current.filter((v) => v !== vaccine);
                              return { ...prev, vaccine_received: updated };
                            });
                          }}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-green-700">{vaccine}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Special Categories */}
                <div className="bg-white/90 rounded-2xl shadow-lg border border-green-100 p-6 animate-fadeIn">
                  <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-2">
                    <ShieldCheckIcon className="w-5 h-5" /> Special Categories
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["Solo Parent", "Solo Parent w/ ID", "Senior Citizen", "Senior Citizen w/ ID", "Senior Citizen w/ Pension", "Indigenous people", "4P's Member", "PWD", "PWD w/ ID"].map((cat) => (
                      <label key={cat} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors duration-200 shadow-sm cursor-pointer">
                        <input
                          type="checkbox"
                          name="special_categories"
                          value={cat}
                          checked={editData.special_categories?.includes(cat) || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setEditData((prev) => {
                              const prevCats = prev.special_categories || [];
                              const updated = checked
                                ? [...prevCats, cat]
                                : prevCats.filter((c) => c !== cat);
                              return { ...prev, special_categories: updated };
                            });
                          }}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-green-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-green-100 sticky bottom-0 bg-gradient-to-r from-green-50 to-emerald-50 z-10 rounded-b-3xl animate-fadeIn">
                  <button 
                    onClick={() => setShowModal(false)} 
                    className="px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave} 
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Saving...</span>
                    ) : (
                      <><CheckCircleIcon className="w-5 h-5" /> Save Changes</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default ResidentsRecords;