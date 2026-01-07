import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  FileText,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);

useEffect(() => {
  if (user) {
    fetchAllRequests();
  }
}, [user]);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/request/pending');
      console.log('🔍 Manager API Response:', response.data);
      console.log('📊 Total requests fetched:', response.data.requests?.length || 0);
      const fetchedRequests = response.data.requests || [];
      setRequests(fetchedRequests);
      setFilteredRequests(fetchedRequests); // SET FILTERED IMMEDIATELY
    } catch (error) {
      console.error('❌ Failed to fetch requests:', error);
      toast.error('Failed to load requests');
      setRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.createdBy?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((req) => req.status === filterStatus);
    }

    setFilteredRequests(filtered);
  };

  // Run filter whenever search or filter changes
  useEffect(() => {
    filterRequests();
  }, [searchTerm, filterStatus]);

  const handleApprove = async (id) => {
    try {
      await api.post(`/request/${id}/approve`);
      toast.success('Request approved successfully!');
      fetchAllRequests();
      setSelectedRequest(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/request/${id}/reject`);
      toast.success('Request rejected successfully!');
      fetchAllRequests();
      setSelectedRequest(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      SUBMITTED: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Clock, label: 'Pending Review' },
      APPROVED: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle, label: 'Approved' },
      REJECTED: { color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle, label: 'Rejected' },
    };
    return configs[status] || configs.SUBMITTED;
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'SUBMITTED').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manager Dashboard</h1>
          <p className="text-gray-600">Review and manage employee requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, description, or employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field pl-10 pr-8 appearance-none cursor-pointer w-full"
              >
                <option value="ALL">All Status</option>
                <option value="SUBMITTED">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const statusConfig = getStatusConfig(request.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={request._id}
                  className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedRequest(selectedRequest === request._id ? null : request._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`badge ${statusConfig.color} border flex items-center gap-1.5`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusConfig.label}</span>
                        </div>
                        
                        {request.createdBy && (
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-1" />
                            {request.createdBy.username || 'Unknown User'}
                          </div>
                        )}

                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(request.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{request.title}</h3>
                      <p className="text-gray-600 mb-4">{request.description}</p>

                      {selectedRequest === request._id && (
                        <div className="mt-6 pt-6 border-t border-gray-200 animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900 mb-3">Request Information</h4>
                              <div className="flex items-start">
                                <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Submitted By</p>
                                  <p className="text-sm text-gray-600">
                                    {request.createdBy?.username || 'Unknown User'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {request.createdBy?.email || 'No email'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Role: {request.createdBy?.role || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Submitted On</p>
                                  <p className="text-sm text-gray-600">
                                    {new Date(request.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Last Updated</p>
                                  <p className="text-sm text-gray-600">
                                    {new Date(request.updatedAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Decision Actions</h4>
                              {request.status === 'SUBMITTED' ? (
                                <div className="space-y-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApprove(request._id);
                                    }}
                                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                    Approve Request
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReject(request._id);
                                    }}
                                    className="w-full btn-danger flex items-center justify-center gap-2"
                                  >
                                    <XCircle className="w-5 h-5" />
                                    Reject Request
                                  </button>
                                </div>
                              ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-lg">
                                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">
                                    This request has already been {request.status.toLowerCase()}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {request.status === 'APPROVED' 
                                      ? 'You approved this request on ' + new Date(request.updatedAt).toLocaleDateString()
                                      : 'You rejected this request on ' + new Date(request.updatedAt).toLocaleDateString()
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filterStatus === 'ALL' ? 'No Requests Found' : `No ${filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()} Requests`}
            </h3>
            <p className="text-gray-600">
              {requests.length === 0 
                ? 'No employee has submitted any requests yet' 
                : 'Try adjusting your search or filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;