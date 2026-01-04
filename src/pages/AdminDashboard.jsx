import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  User,
  Calendar,
  Lock,
  Unlock,
  BarChart3,
} from 'lucide-react';
import React from 'react';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchAllRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, filterStatus]);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/request/all');
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast.error('Failed to load requests');
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

  const handleClose = async (id) => {
    try {
      await api.post(`/request/${id}/close`);
      toast.success('Request closed successfully!');
      fetchAllRequests();
      setSelectedRequest(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to close request');
    }
  };

  const handleReopen = async (id) => {
    try {
      await api.post(`/request/${id}/reopen`);
      toast.success('Request reopened successfully!');
      fetchAllRequests();
      setSelectedRequest(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reopen request');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: FileText, label: 'Draft' },
      SUBMITTED: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Clock, label: 'Submitted' },
      APPROVED: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle, label: 'Approved' },
      REJECTED: { color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle, label: 'Rejected' },
      WITHDRAWN: { color: 'bg-orange-100 text-orange-700 border-orange-300', icon: AlertCircle, label: 'Withdrawn' },
      CLOSED: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: Lock, label: 'Closed' },
      REOPENED: { color: 'bg-purple-100 text-purple-700 border-purple-300', icon: TrendingUp, label: 'Reopened' },
    };
    return configs[status] || configs.DRAFT;
  };

  const stats = {
    total: requests.length,
    draft: requests.filter((r) => r.status === 'DRAFT').length,
    submitted: requests.filter((r) => r.status === 'SUBMITTED').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
    closed: requests.filter((r) => r.status === 'CLOSED').length,
    reopened: requests.filter((r) => r.status === 'REOPENED').length,
    withdrawn: requests.filter((r) => r.status === 'WITHDRAWN').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Complete overview and management of all requests</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <div className="card p-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>

          <div className="card p-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">Draft</p>
              <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            </div>
          </div>

          <div className="card p-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">Submitted</p>
              <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
            </div>
          </div>

          <div className="card p-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
          </div>

          <div className="card p-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
          </div>

          <div className="card p-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">Withdrawn</p>
              <p className="text-2xl font-bold text-orange-600">{stats.withdrawn}</p>
            </div>
          </div>

          <div className="card p-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">Closed</p>
              <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
            </div>
          </div>

          <div className="card p-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">Reopened</p>
              <p className="text-2xl font-bold text-purple-600">{stats.reopened}</p>
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
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
                <option value="CLOSED">Closed</option>
                <option value="REOPENED">Reopened</option>
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
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <div className={`badge ${statusConfig.color} border flex items-center gap-1.5`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusConfig.label}</span>
                        </div>

                        {request.createdBy && (
                          <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                            <User className="w-4 h-4 mr-1" />
                            {request.createdBy.username || 'Unknown'}
                            <span className="ml-1 text-xs text-gray-500">
                              ({request.createdBy.role || 'N/A'})
                            </span>
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
                      <p className="text-gray-600">{request.description}</p>

                      {selectedRequest === request._id && (
                        <div className="mt-6 pt-6 border-t border-gray-200 animate-fade-in">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                              <h4 className="font-semibold text-gray-900">Complete Request Details</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start">
                                  <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Created By</p>
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
                                    <p className="text-sm font-medium text-gray-700">Created On</p>
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

                                <div className="flex items-start">
                                  <BarChart3 className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Request ID</p>
                                    <p className="text-xs text-gray-600 font-mono">{request._id}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Admin Actions</h4>
                              <div className="space-y-3">
                                {request.status === 'CLOSED' ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReopen(request._id);
                                    }}
                                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                  >
                                    <Unlock className="w-5 h-5" />
                                    Reopen & Send for Review
                                  </button>
                                ) : (request.status === 'APPROVED' || request.status === 'REJECTED') ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClose(request._id);
                                    }}
                                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                  >
                                    <Lock className="w-5 h-5" />
                                    Close Request
                                  </button>
                                ) : (
                                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">
                                      No admin actions available for {statusConfig.label.toLowerCase()} requests
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Requests must be approved or rejected first
                                    </p>
                                  </div>
                                )}
                              </div>
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
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'ALL'
                ? 'Try adjusting your search or filter'
                : 'No requests have been created yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;