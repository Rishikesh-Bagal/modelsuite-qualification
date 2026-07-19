import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import TasksTable from '../../components/admin/TasksTable';
import CreateTaskModal from '../../components/admin/CreateTaskModal';
import EditTaskModal from '../../components/admin/EditTaskModal';
import { fetchAllTasks } from '../../api/tasks';

/* ── Search icon ── */
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8.5" cy="8.5" r="5.5"/>
    <path d="M17 17l-4-4"/>
  </svg>
);

/* ── Plus icon ── */
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M10 4v12M4 10h12"/>
  </svg>
);

const AdminDashboard = () => {
  const [tasks, setTasks]           = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask]     = useState(null);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Pagination & Stats State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState({ total: 0, open: 0, submitted: 0, completed: 0 });

  const loadTasks = useCallback(async () => {
    try {
      const { data } = await fetchAllTasks({ page, limit, search, status: statusFilter });
      setTasks(data.tasks || []);
      if (data.page) {
        setPagination({
          page: data.page,
          totalPages: data.totalPages,
          totalItems: data.totalItems,
          hasNextPage: data.hasNextPage,
          hasPreviousPage: data.hasPreviousPage
        });
        setStats(data.stats);
      } else {
        // Fallback if backend isn't returning pagination (shouldn't happen with our update)
        setPagination(null);
      }
    } catch {
      alert('Failed to load tasks');
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    const delay = setTimeout(() => {
      loadTasks();
    }, 300);
    return () => clearTimeout(delay);
  }, [loadTasks]);

  const statCards = [
    { label: 'Total Tasks', value: stats.total,     colorClass: 'stat-card-default', valueColor: '#E5E2E1' },
    { label: 'Open',        value: stats.open,      colorClass: 'stat-card-blue',    valueColor: '#60A5FA' },
    { label: 'Submitted',   value: stats.submitted, colorClass: 'stat-card-info',    valueColor: '#60A5FA' },
    { label: 'Completed',   value: stats.completed, colorClass: 'stat-card-green',   valueColor: '#34D399' },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: '#050505' }}>
      <Sidebar />

      <main className="ml-[240px] flex-1 px-8 py-8" style={{ maxWidth: 'calc(100vw - 240px)' }}>

        {/* Page header */}
        <div className="flex items-center justify-between mb-7 page-section">
          <div>
            <h1 className="font-display text-[22px] font-semibold tracking-tight"
              style={{ color: '#F0F0F0', fontFamily: 'Poppins, sans-serif' }}>
              Task Management
            </h1>
            <p className="mt-0.5 text-[13px]" style={{ color: '#6B7280' }}>
              Create, assign, and track all tasks across your talent pool.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="btn-gradient flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold cursor-pointer font-sans">
            <IconPlus />
            Create Task
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-4 mb-6 page-section">
          {statCards.map(({ label, value, colorClass, valueColor }) => (
            <div key={label} className={`stat-card ${colorClass}`}>
              <span className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] mb-3"
                style={{ color: '#4B5563', fontFamily: 'Inter, sans-serif' }}>
                {label}
              </span>
              <span className="block text-[32px] font-bold leading-none"
                style={{ color: valueColor, fontFamily: 'Poppins, sans-serif' }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Tasks table */}
        <div className="tasks-container page-section">
          {/* Table toolbar */}
          <div className="table-header-bar">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold"
                style={{ color: '#E5E2E1', fontFamily: 'Poppins, sans-serif' }}>
                All Tasks
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: '#6B7280',
                  border: '1px solid rgba(255,255,255,0.09)',
                  fontFamily: 'Inter, sans-serif',
                }}>
                {pagination ? pagination.totalItems : tasks.length} task{(!pagination || pagination.totalItems !== 1) && 's'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search */}
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#4B5563' }}>
                  <IconSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search tasks…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="search-input-glass"
                  style={{ minWidth: '180px' }}
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="search-input-glass custom-select"
                style={{ paddingLeft: '12px', cursor: 'pointer' }}>
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="Claimed">Claimed</option>
                <option value="Submitted">Submitted</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <TasksTable tasks={tasks} onEdit={setEditTask} onRefresh={loadTasks} />

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 0 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <span className="text-[13px]" style={{ color: '#6B7280' }}>
                Showing {tasks.length} of {pagination.totalItems} tasks
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded-md text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#E5E2E1', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Previous
                </button>
                <span className="text-[13px] font-medium mx-2" style={{ color: '#E5E2E1' }}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded-md text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#E5E2E1', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <CreateTaskModal onClose={() => setShowCreate(false)} onCreated={loadTasks} />
      )}
      {editTask && (
        <EditTaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onUpdated={() => { loadTasks(); setEditTask(null); }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
