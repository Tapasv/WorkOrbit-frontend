import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  Filter,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react';

const AdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTeam, setExpandedTeam] = useState(null);

  useEffect(() => {
    fetchAllTeams();
  }, []);

  useEffect(() => {
    filterTeams();
  }, [teams, searchTerm]);

  const fetchAllTeams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/team/admin/all');
      setTeams(response.data.teams || []);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const filterTeams = () => {
    let filtered = teams;

    if (searchTerm) {
      filtered = filtered.filter(
        (team) =>
          team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.manager?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTeams(filtered);
  };

  const toggleExpand = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const stats = {
    totalTeams: teams.length,
    totalManagers: new Set(teams.map(t => t.manager?._id)).size,
    totalMembers: teams.reduce((sum, team) => sum + team.members.length, 0),
    avgTeamSize: teams.length > 0 
      ? (teams.reduce((sum, team) => sum + team.members.length, 0) / teams.length).toFixed(1)
      : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Teams Overview</h1>
          <p className="text-gray-600">View and monitor all teams across the organization</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTeams}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Managers</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalManagers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalMembers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Team Size</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.avgTeamSize}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by team name or manager..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        {/* Teams List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredTeams.length > 0 ? (
          <div className="space-y-4">
            {filteredTeams.map((team) => (
              <div key={team._id} className="card overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(team._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
                        <span className="badge bg-blue-100 text-blue-700">
                          {team.members.length} {team.members.length === 1 ? 'Member' : 'Members'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Manager:</span>
                          <span>{team.manager?.username || 'Unknown'}</span>
                          <span className="text-gray-400">({team.manager?.email})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      {expandedTeam === team._id ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedTeam === team._id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6 animate-fade-in">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h4>

                    {team.members.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {team.members.map((member) => (
                          <div
                            key={member._id}
                            className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-sm">
                                  {member.username?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {member.username}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  {member.role || 'Employee'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No members in this team yet</p>
                      </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">Team ID</p>
                          <p className="font-mono text-xs text-gray-900 break-all">{team._id}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Created At</p>
                          <p className="text-gray-900">{new Date(team.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Last Updated</p>
                          <p className="text-gray-900">{new Date(team.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Teams Found</h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'No teams have been created yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTeams;