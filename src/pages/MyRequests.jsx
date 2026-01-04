import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import {
  FileText,
  Send,
  XCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  User,
  MoreVertical,
} from 'lucide-react';

const MyRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/request/myrequests');
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (id) => {
    try {
      await api.post(`/request/${id}/submit`);
      toast.success('Request submitted successfully!');
      fetchRequests();
      setShowActionMenu(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleWithdraw = async (id) => {
    try {
      await api.post(`/request/${id}/withdraw`);
      toast.success('Request withdrawn successfully!');
      fetchRequests();
      setShowActionMenu(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to withdraw request');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: FileText, label: 'Draft' },
      SUBMITTED: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Clock, label: 'Submitted' },
      APPROVED: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle, label: 'Approved' },
      REJECTED: { color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle, label: 'Rejected' },
      WITHDRAWN: { color: 'bg-orange-100 text-orange-700 border-orange-300', icon: AlertCircle, label: 'Withdrawn' },
      CLOSED: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: XCircle, label: 'Closed' },
      REOPENED: { color: 'bg-purple-100 text-purple-700 border-purple-300', icon: TrendingUp, label: 'Reopened' },
    };
    return configs[status] || configs.DRAFT;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Requests</h1>
          <p className="text-gray-600">View and manage all your submitted requests</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => {
              const statusConfig = getStatusConfig(request.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={request._id}
                  className="card p-6 cursor-pointer"
                  onClick={() => setSelectedRequest(selectedRequest === request._id ? null : request._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`badge ${statusConfig.color} border flex items-center gap-1.5`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusConfig.label}</span>
                        </div>
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
                              <h4 className="font-semibold text-gray-900 mb-3">Request Details</h4>
                              <div className="flex items-start">
                                <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Created By</p>
                                  <p className="text-sm text-gray-600">{user?.Username}</p>
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
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Actions</h4>
                              <div className="space-y-2">
                                {request.status === 'DRAFT' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSubmit(request._id);
                                    }}
                                    className="w-full btn-primary text-sm flex items-center justify-center gap-2"
                                  >
                                    <Send className="w-4 h-4" />
                                    Submit Request
                                  </button>
                                )}

                                {request.status === 'SUBMITTED' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleWithdraw(request._id);
                                    }}
                                    className="w-full btn-danger text-sm flex items-center justify-center gap-2"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Withdraw Request
                                  </button>
                                )}

                                {request.status === 'WITHDRAWN' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSubmit(request._id);
                                    }}
                                    className="w-full btn-primary text-sm flex items-center justify-center gap-2"
                                  >
                                    <Send className="w-4 h-4" />
                                    Submit Again
                                  </button>
                                )}

                                {(request.status === 'APPROVED' || request.status === 'REJECTED' || request.status === 'CLOSED') && (
                                  <div className="text-center py-4">
                                    <p className="text-sm text-gray-600">
                                      No actions available for {statusConfig.label.toLowerCase()} requests
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionMenu(showActionMenu === request._id ? null : request._id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>

                      {showActionMenu === request._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10 animate-fade-in">
                          {request.status === 'DRAFT' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubmit(request._id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                            >
                              <Send className="w-4 h-4" />
                              Submit
                            </button>
                          )}

                          {request.status === 'SUBMITTED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWithdraw(request._id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Withdraw
                            </button>
                          )}

                          {request.status === 'WITHDRAWN' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubmit(request._id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                            >
                              <Send className="w-4 h-4" />
                              Submit Again
                            </button>
                          )}
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Yet</h3>
            <p className="text-gray-600 mb-6">You haven't created any requests yet</p>
            <button
              onClick={() => window.location.href = '/employee'}
              className="btn-primary"
            >
              Create Your First Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;