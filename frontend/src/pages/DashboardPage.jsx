import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  ListTodo,
  Loader2,
  FolderKanban,
  TrendingUp,
  CalendarClock
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader2 size={32} className="spin-icon" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  const statusData = [
    { name: 'To Do', value: data?.todoTasks || 0, color: '#6366f1' },
    { name: 'In Progress', value: data?.inProgressTasks || 0, color: '#f59e0b' },
    { name: 'Done', value: data?.doneTasks || 0, color: '#10b981' },
  ].filter(d => d.value > 0);

  const userData = data?.tasksByUser
    ? Object.entries(data.tasksByUser).map(([name, count]) => ({ name, tasks: count }))
    : [];

  const stats = [
    {
      label: 'Total Tasks',
      value: data?.totalTasks || 0,
      icon: CheckSquare,
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      bg: 'rgba(99, 102, 241, 0.12)',
    },
    {
      label: 'To Do',
      value: data?.todoTasks || 0,
      icon: ListTodo,
      gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
      bg: 'rgba(59, 130, 246, 0.12)',
    },
    {
      label: 'In Progress',
      value: data?.inProgressTasks || 0,
      icon: Clock,
      gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
      bg: 'rgba(245, 158, 11, 0.12)',
    },
    {
      label: 'Done',
      value: data?.doneTasks || 0,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #10b981, #34d399)',
      bg: 'rgba(16, 185, 129, 0.12)',
    },
    {
      label: 'Overdue',
      value: data?.overdueTasks || 0,
      icon: AlertTriangle,
      gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
      bg: 'rgba(239, 68, 68, 0.12)',
    },
    {
      label: 'Projects',
      value: data?.totalProjects || 0,
      icon: FolderKanban,
      gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
      bg: 'rgba(6, 182, 212, 0.12)',
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="chart-tooltip">
          <span className="chart-tooltip-label">{payload[0].name || payload[0].payload?.name}</span>
          <span className="chart-tooltip-value">{payload[0].value} tasks</span>
        </div>
      );
    }
    return null;
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const priorityClass = (p) => {
    switch (p) {
      case 'HIGH': return 'badge-danger';
      case 'MEDIUM': return 'badge-warning';
      case 'LOW': return 'badge-success';
      default: return 'badge-info';
    }
  };

  return (
    <div className="dashboard animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name} 👋</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid stagger-children">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label} style={{ '--stat-gradient': stat.gradient }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: stat.gradient, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }} />
            <div className="stat-card-icon" style={{ background: stat.bg }}>
              <stat.icon size={22} style={{ color: stat.gradient.includes('#ef4444') ? '#ef4444' : stat.gradient.includes('#10b981') ? '#10b981' : stat.gradient.includes('#f59e0b') ? '#f59e0b' : stat.gradient.includes('#3b82f6') ? '#3b82f6' : stat.gradient.includes('#06b6d4') ? '#06b6d4' : '#6366f1' }} />
            </div>
            <div className="stat-card-value">{stat.value}</div>
            <div className="stat-card-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Pie Chart */}
        <div className="glass-card-static chart-card">
          <h3 className="chart-title">Tasks by Status</h3>
          {statusData.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {statusData.map((d) => (
                  <div className="chart-legend-item" key={d.name}>
                    <span className="chart-legend-dot" style={{ background: d.color }} />
                    <span>{d.name}</span>
                    <span className="chart-legend-value">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <p className="empty-state-text">No tasks yet</p>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="glass-card-static chart-card">
          <h3 className="chart-title">Tasks per User</h3>
          {userData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={userData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tasks" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <p className="empty-state-text">No assignments yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent + Overdue */}
      <div className="charts-row">
        {/* Recent Tasks */}
        <div className="glass-card-static chart-card">
          <h3 className="chart-title">
            <CalendarClock size={18} style={{ marginRight: 8, opacity: 0.7 }} />
            Recent Tasks
          </h3>
          {data?.recentTasks?.length > 0 ? (
            <div className="task-list">
              {data.recentTasks.map((task) => (
                <div className="task-list-item" key={task.id}>
                  <div className="task-list-left">
                    <span className={`badge ${priorityClass(task.priority)}`} style={{ fontSize: '0.6rem' }}>{task.priority}</span>
                    <span className="task-list-title">{task.title}</span>
                  </div>
                  <div className="task-list-right">
                    <span className={`badge ${task.status === 'DONE' ? 'badge-success' : task.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-primary'}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    {task.assignedTo && (
                      <div className="avatar avatar-sm" style={{ background: 'var(--gradient-secondary)', fontSize: '0.55rem' }}>
                        {getInitials(task.assignedTo.name)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '32px 20px' }}>
              <p className="empty-state-text">No recent tasks</p>
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="glass-card-static chart-card">
          <h3 className="chart-title">
            <AlertTriangle size={18} style={{ marginRight: 8, color: '#ef4444', opacity: 0.8 }} />
            Overdue Tasks
          </h3>
          {data?.overDueTaskList?.length > 0 ? (
            <div className="task-list">
              {data.overDueTaskList.map((task) => (
                <div className="task-list-item overdue" key={task.id}>
                  <div className="task-list-left">
                    <span className={`badge ${priorityClass(task.priority)}`} style={{ fontSize: '0.6rem' }}>{task.priority}</span>
                    <span className="task-list-title">{task.title}</span>
                  </div>
                  <div className="task-list-right">
                    <span className="task-list-date">{task.dueDate}</span>
                    <span className="badge badge-danger" style={{ fontSize: '0.6rem' }}>OVERDUE</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '32px 20px' }}>
              <p className="empty-state-text" style={{ color: '#6ee7b7' }}>🎉 No overdue tasks!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
