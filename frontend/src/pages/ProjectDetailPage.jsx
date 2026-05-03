import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import {
  ArrowLeft, Plus, Users, Settings, Loader2, Trash2, UserPlus,
  UserMinus, Calendar, Flag, Clock, CheckCircle2, Circle, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import './ProjectDetailPage.css';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form state
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedToId: ''
  });
  const [saving, setSaving] = useState(false);

  const isAdmin = project?.createdBy?.id === user?.id;

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      const [projRes, tasksRes, membersRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
        api.get(`/projects/${id}/members`),
        api.get('/users'),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setMembers(membersRes.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  // === Task CRUD ===
  const handleCreateTask = async (e) => {
    e?.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || null,
        assignedToId: taskForm.assignedToId ? Number(taskForm.assignedToId) : null,
      };
      await api.post(`/projects/${id}/tasks`, payload);
      toast.success('Task created!');
      setShowCreateTask(false);
      resetTaskForm();
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e?.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || null,
        assignedToId: taskForm.assignedToId ? Number(taskForm.assignedToId) : null,
      };
      await api.put(`/projects/${id}/tasks/${selectedTask.id}`, payload);
      toast.success('Task updated!');
      setShowEditTask(false);
      setSelectedTask(null);
      resetTaskForm();
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await api.patch(`/projects/${id}/tasks/${task.id}/status`, { status: newStatus });
      toast.success(`Moved to ${newStatus.replace('_', ' ')}`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`);
      toast.success('Task deleted');
      setShowEditTask(false);
      setSelectedTask(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  // === Members ===
  const handleAddMember = async (email) => {
    try {
      await api.post(`/projects/${id}/members`, { email });
      toast.success('Member added!');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const openEditTask = (task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate || '',
      assignedToId: task.assignedTo?.id?.toString() || '',
    });
    setShowEditTask(true);
  };

  const resetTaskForm = () => {
    setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedToId: '' });
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const avatarGradients = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #3b82f6, #06b6d4)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #ef4444, #f87171)',
    'linear-gradient(135deg, #ec4899, #f472b6)',
  ];

  const getAvatarGradient = (name) => {
    if (!name) return avatarGradients[0];
    return avatarGradients[name.charCodeAt(0) % avatarGradients.length];
  };

  const columns = [
    { key: 'TODO', label: 'To Do', icon: Circle, color: '#6366f1' },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: Clock, color: '#f59e0b' },
    { key: 'DONE', label: 'Done', icon: CheckCircle2, color: '#10b981' },
  ];

  const priorityClass = (p) => {
    switch (p) {
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return '';
    }
  };

  const priorityBadge = (p) => {
    switch (p) {
      case 'HIGH': return 'badge-danger';
      case 'MEDIUM': return 'badge-warning';
      case 'LOW': return 'badge-success';
      default: return 'badge-info';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader2 size={32} className="spin-icon" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  const TaskFormFields = () => (
    <>
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          className="form-input"
          placeholder="Task title"
          value={taskForm.title}
          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          autoFocus
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          placeholder="Task description..."
          value={taskForm.description}
          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          rows={3}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select
            className="form-select"
            value={taskForm.priority}
            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input
            type="date"
            className="form-input"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Assign To</label>
        <select
          className="form-select"
          value={taskForm.assignedToId}
          onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
        >
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
          ))}
        </select>
      </div>
    </>
  );

  return (
    <div className="project-detail animate-fade-in">
      {/* Header */}
      <div className="project-detail-header">
        <div className="project-detail-header-left">
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/projects')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{project?.name}</h1>
            {project?.description && (
              <p className="page-subtitle">{project.description}</p>
            )}
          </div>
        </div>
        <div className="project-detail-header-actions">
          <button className="btn btn-secondary" onClick={() => setShowMembers(true)}>
            <Users size={16} /> Members ({members.length})
          </button>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => { resetTaskForm(); setShowCreateTask(true); }}>
              <Plus size={16} /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* Role Banner */}
      <div className={`role-banner ${isAdmin ? 'role-banner-admin' : 'role-banner-member'}`}>
        <div className="role-banner-left">
          <span className="role-banner-icon">{isAdmin ? '👑' : '👤'}</span>
          <div>
            <span className="role-banner-title">
              {isAdmin ? 'Project Admin' : 'Member'}
            </span>
            <span className="role-banner-desc">
              {isAdmin
                ? 'You can create, edit, delete tasks and manage project members'
                : 'You can view all tasks and update the status of tasks assigned to you'}
            </span>
          </div>
        </div>
        <div className="role-banner-permissions">
          {isAdmin ? (
            <>
              <span className="perm-chip perm-allowed">✓ Create Tasks</span>
              <span className="perm-chip perm-allowed">✓ Edit Tasks</span>
              <span className="perm-chip perm-allowed">✓ Delete Tasks</span>
              <span className="perm-chip perm-allowed">✓ Manage Members</span>
            </>
          ) : (
            <>
              <span className="perm-chip perm-allowed">✓ View Tasks</span>
              <span className="perm-chip perm-allowed">✓ Update Assigned Task Status</span>
              <span className="perm-chip perm-denied">✗ Create / Edit Tasks</span>
              <span className="perm-chip perm-denied">✗ Manage Members</span>
            </>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div className="kanban-column" key={col.key}>
              <div className="kanban-column-header">
                <div className="kanban-column-title" style={{ color: col.color }}>
                  <col.icon size={16} />
                  {col.label}
                </div>
                <span className="kanban-column-count">{colTasks.length}</span>
              </div>
              <div className="kanban-cards">
                {colTasks.length === 0 ? (
                  <div className="kanban-empty">
                    <p>No tasks</p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      className={`kanban-card ${task.overdue ? 'kanban-card-overdue' : ''}`}
                      key={task.id}
                      onClick={() => openEditTask(task)}
                    >
                      <div className="kanban-card-title">{task.title}</div>
                      <div className="kanban-card-meta">
                        <div className="flex items-center gap-2">
                          <span className={`priority-dot ${priorityClass(task.priority)}`} />
                          <span className={`badge ${priorityBadge(task.priority)}`} style={{ fontSize: '0.6rem' }}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.dueDate && (
                            <span className={`kanban-card-date ${task.overdue ? 'overdue-text' : ''}`}>
                              <Calendar size={12} />
                              {task.dueDate}
                            </span>
                          )}
                          {task.assignedTo && (
                            <div
                              className="avatar avatar-sm"
                              style={{ background: 'var(--gradient-primary)', fontSize: '0.55rem' }}
                              title={task.assignedTo.name}
                            >
                              {getInitials(task.assignedTo.name)}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Quick status buttons */}
                      <div className="kanban-card-actions" onClick={(e) => e.stopPropagation()}>
                        {col.key !== 'TODO' && (
                          <button
                            className="kanban-status-btn"
                            title="Move to To Do"
                            onClick={() => handleStatusChange(task, 'TODO')}
                          >
                            <Circle size={14} />
                          </button>
                        )}
                        {col.key !== 'IN_PROGRESS' && (
                          <button
                            className="kanban-status-btn"
                            title="Move to In Progress"
                            onClick={() => handleStatusChange(task, 'IN_PROGRESS')}
                          >
                            <Clock size={14} />
                          </button>
                        )}
                        {col.key !== 'DONE' && (
                          <button
                            className="kanban-status-btn"
                            title="Mark as Done"
                            onClick={() => handleStatusChange(task, 'DONE')}
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        title="Create Task"
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCreateTask(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreateTask} disabled={saving}>
              {saving ? <Loader2 size={16} className="spin-icon" /> : 'Create Task'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateTask}>
          <TaskFormFields />
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={showEditTask}
        onClose={() => { setShowEditTask(false); setSelectedTask(null); }}
        title="Task Details"
        size="lg"
        footer={
          <>
            {isAdmin && selectedTask && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteTask(selectedTask.id)}
                style={{ marginRight: 'auto' }}
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => { setShowEditTask(false); setSelectedTask(null); }}>Cancel</button>
            {isAdmin && (
              <button className="btn btn-primary" onClick={handleUpdateTask} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin-icon" /> : 'Save Changes'}
              </button>
            )}
          </>
        }
      >
        {isAdmin ? (
          <form onSubmit={handleUpdateTask}>
            <TaskFormFields />
          </form>
        ) : (
          <div className="task-view-only">
            <div className="task-view-field">
              <span className="form-label">Title</span>
              <p className="task-view-value">{selectedTask?.title}</p>
            </div>
            {selectedTask?.description && (
              <div className="task-view-field">
                <span className="form-label">Description</span>
                <p className="task-view-value">{selectedTask.description}</p>
              </div>
            )}
            <div className="task-view-row">
              <div className="task-view-field">
                <span className="form-label">Priority</span>
                <span className={`badge ${priorityBadge(selectedTask?.priority)}`}>{selectedTask?.priority}</span>
              </div>
              <div className="task-view-field">
                <span className="form-label">Status</span>
                <span className="badge badge-primary">{selectedTask?.status?.replace('_', ' ')}</span>
              </div>
            </div>
            {selectedTask?.dueDate && (
              <div className="task-view-field">
                <span className="form-label">Due Date</span>
                <p className="task-view-value">{selectedTask.dueDate}</p>
              </div>
            )}
            {selectedTask?.assignedTo && (
              <div className="task-view-field">
                <span className="form-label">Assigned To</span>
                <p className="task-view-value">{selectedTask.assignedTo.name}</p>
              </div>
            )}
            {/* Status update for members */}
            {selectedTask?.assignedTo?.id === user?.id && (
              <div className="task-view-field">
                <span className="form-label">Update Status</span>
                <div className="flex gap-2">
                  {['TODO', 'IN_PROGRESS', 'DONE'].map((s) => (
                    <button
                      key={s}
                      className={`btn btn-sm ${selectedTask?.status === s ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => { handleStatusChange(selectedTask, s); setShowEditTask(false); }}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Members Modal */}
      <Modal
        isOpen={showMembers}
        onClose={() => { setShowMembers(false); setUserSearch(''); }}
        title="Project Members"
        size="lg"
      >
        {/* Current Members Section */}
        <div className="members-section-label">Current Members ({members.length})</div>
        <div className="members-list mb-section">
          {members.map((m) => (
            <div className="member-item" key={m.id}>
              <div className="flex items-center gap-3">
                <div className="avatar avatar-md" style={{ background: getAvatarGradient(m.name) }}>
                  {getInitials(m.name)}
                </div>
                <div>
                  <div className="member-name">{m.name}</div>
                  <div className="member-email">{m.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {m.id === project?.createdBy?.id
                  ? <span className="badge badge-warning">👑 Admin</span>
                  : <span className="badge badge-primary">Member</span>
                }
                {isAdmin && m.id !== project?.createdBy?.id && (
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => handleRemoveMember(m.id)}
                    title="Remove member"
                  >
                    <UserMinus size={16} style={{ color: 'var(--color-danger)' }} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Members Section — Admin only */}
        {isAdmin && (() => {
          const memberIds = new Set(members.map(m => m.id));
          const available = allUsers.filter(u =>
            !memberIds.has(u.id) &&
            (u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
             u.email.toLowerCase().includes(userSearch.toLowerCase()))
          );
          return (
            <>
              <div className="members-section-label" style={{ marginTop: 20 }}>
                Add People
              </div>
              <div className="member-search-box">
                <input
                  className="form-input"
                  placeholder="🔍  Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="available-users-list">
                {available.length === 0 ? (
                  <div className="empty-state" style={{ padding: '20px' }}>
                    <p className="empty-state-text">
                      {userSearch ? 'No users match your search' : 'All registered users are already members'}
                    </p>
                  </div>
                ) : (
                  available.map((u) => (
                    <div className="available-user-item" key={u.id}>
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-md" style={{ background: getAvatarGradient(u.name) }}>
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <div className="member-name">{u.name}</div>
                          <div className="member-email">{u.email}</div>
                        </div>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAddMember(u.email)}
                      >
                        <UserPlus size={14} /> Add
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          );
        })()}
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
