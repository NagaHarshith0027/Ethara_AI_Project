import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import {
  Plus, FolderKanban, Users, ListTodo, Loader2, Trash2, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import './ProjectsPage.css';

const ProjectsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    setCreating(true);
    try {
      await api.post('/projects', newProject);
      toast.success('Project created!');
      setShowCreate(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, projectId) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isAdmin = (project) => project.createdBy?.id === user?.id;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader2 size={32} className="spin-icon" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div className="projects-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="glass-card-static empty-state">
          <FolderKanban size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No projects yet</h3>
          <p className="empty-state-text">Create your first project to start managing tasks with your team.</p>
          <button className="btn btn-primary mt-4" onClick={() => setShowCreate(true)}>
            <Plus size={18} /> Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid stagger-children">
          {projects.map((project) => (
            <div
              className="project-card glass-card"
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="project-card-header">
                <div className="project-card-icon">
                  <FolderKanban size={20} />
                </div>
                <div className="project-card-actions">
                  {isAdmin(project) && (
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={(e) => handleDelete(e, project.id)}
                      title="Delete project"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="project-card-name">{project.name}</h3>
              {project.description && (
                <p className="project-card-desc">{project.description}</p>
              )}
              <div className="project-card-meta">
                <div className="project-card-stat">
                  <ListTodo size={14} />
                  <span>{project.taskCount || 0} tasks</span>
                </div>
                <div className="project-card-stat">
                  <Users size={14} />
                  <span>{project.members?.length || 0} members</span>
                </div>
                <div className="project-card-stat">
                  <Calendar size={14} />
                  <span>{formatDate(project.createdAt)}</span>
                </div>
              </div>
              <div className="project-card-footer">
                <div className="project-members-avatars">
                  {project.members?.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      className="avatar avatar-sm"
                      style={{ background: 'var(--gradient-secondary)' }}
                      title={m.name}
                    >
                      {getInitials(m.name)}
                    </div>
                  ))}
                  {project.members?.length > 4 && (
                    <div className="avatar avatar-sm" style={{ background: 'var(--bg-glass)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>
                {isAdmin(project) && (
                  <span className="badge badge-primary">Admin</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Project"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 size={16} className="spin-icon" /> : 'Create Project'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input
              className="form-input"
              placeholder="My Awesome Project"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              autoFocus
            />
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Description (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Brief description of the project..."
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              rows={3}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
