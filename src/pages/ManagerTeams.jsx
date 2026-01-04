import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  UserPlus,
  UserMinus,
  Save,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const ManagerTeams = () => {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    members: []
  });

  useEffect(() => {
    fetchTeams();
    fetchEmployees();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching teams from /api/team/my-teams');
      const response = await api.get('/team/my-teams');
      console.log('✅ Teams response:', response.data);
      setTeams(response.data.teams || []);
    } catch (error) {
      console.error('❌ Failed to fetch teams:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      console.log('🔍 Fetching employees from /api/team/users/employees');
      const response = await api.get('/team/users/employees');
      console.log('✅ Employees response:', response.data);
      const employeeList = response.data.users || [];
      console.log(`📊 Found ${employeeList.length} employees`);
      setEmployees(employeeList);
      
      if (employeeList.length === 0) {
        toast.error('No employees found in the system. Please add employees first.');
      }
    } catch (error) {
      console.error('❌ Failed to fetch employees:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load employees');
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    try {
      console.log('📤 Creating team with data:', formData);
      const response = await api.post('/team/create-team', formData);
      console.log('✅ Team created:', response.data);
      toast.success('Team created successfully!');
      setShowCreateModal(false);
      setFormData({ name: '', members: [] });
      fetchTeams();
    } catch (error) {
      console.error('❌ Failed to create team:', error);
      toast.error(error.response?.data?.message || 'Failed to create team');
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    try {
      console.log('📤 Updating team with data:', formData);
      await api.put(`/team/${selectedTeam._id}`, formData);
      toast.success('Team updated successfully!');
      setShowEditModal(false);
      setSelectedTeam(null);
      setFormData({ name: '', members: [] });
      fetchTeams();
    } catch (error) {
      console.error('❌ Failed to update team:', error);
      toast.error(error.response?.data?.message || 'Failed to update team');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      await api.delete(`/team/${teamId}`);
      toast.success('Team deleted successfully!');
      fetchTeams();
    } catch (error) {
      console.error('❌ Failed to delete team:', error);
      toast.error(error.response?.data?.message || 'Failed to delete team');
    }
  };

  const openEditModal = (team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      members: team.members.map(m => m._id)
    });
    setShowEditModal(true);
  };

  const toggleMember = (memberId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(memberId)
        ? prev.members.filter(id => id !== memberId)
        : [...prev.members, memberId]
    }));
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Teams</h1>
            <p className="text-gray-600">Manage your teams and members</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Team
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full sm:w-96"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{teams.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {teams.reduce((sum, team) => sum + team.members.length, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Employees</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{employees.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* No Employees Warning */}
        {!loadingEmployees && employees.length === 0 && (
          <div className="card p-6 mb-6 border-l-4 border-orange-500">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">No Employees Available</h3>
                <p className="text-sm text-gray-600">
                  There are no employees registered in the system. You need employees to create teams. 
                  Please contact your administrator to add employees to the system.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Teams List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div key={team._id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{team.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Created {new Date(team.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(team)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">Team Members</p>
                    <span className="badge bg-blue-100 text-blue-700">{team.members.length}</span>
                  </div>

                  {team.members.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {team.members.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {member.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {member.username}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No members yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Teams Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Create your first team to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary inline-flex items-center gap-2"
                disabled={employees.length === 0}
              >
                <Plus className="w-5 h-5" />
                Create Team
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Create New Team</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ name: '', members: [] });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="Enter team name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Members ({formData.members.length} selected)
                </label>
                {loadingEmployees ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : employees.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
                    {employees.map((employee) => (
                      <label
                        key={employee._id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.members.includes(employee._id)}
                          onChange={() => toggleMember(employee._id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {employee.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{employee.username}</p>
                          <p className="text-xs text-gray-500">{employee.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="border border-orange-200 bg-orange-50 rounded-lg p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">No Employees Available</p>
                    <p className="text-xs text-gray-600">
                      Please ask your administrator to add employees to the system before creating teams.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', members: [] });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={employees.length === 0}
                >
                  <Save className="w-5 h-5" />
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Team</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTeam(null);
                  setFormData({ name: '', members: [] });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateTeam} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="Enter team name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Members ({formData.members.length} selected)
                </label>
                {loadingEmployees ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : employees.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
                    {employees.map((employee) => (
                      <label
                        key={employee._id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.members.includes(employee._id)}
                          onChange={() => toggleMember(employee._id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {employee.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{employee.username}</p>
                          <p className="text-xs text-gray-500">{employee.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="border border-orange-200 bg-orange-50 rounded-lg p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">No Employees Available</p>
                    <p className="text-xs text-gray-600">
                      Please ask your administrator to add employees to the system.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTeam(null);
                    setFormData({ name: '', members: [] });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={employees.length === 0}
                >
                  <Save className="w-5 h-5" />
                  Update Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTeams;