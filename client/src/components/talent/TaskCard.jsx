import { claimTask } from '../../api/talent';

const STATUS_CLASS = {
  Open:      'status-badge-Open',
  Claimed:   'status-badge-Claimed',
  Submitted: 'status-badge-Submitted',
  Approved:  'status-badge-Approved',
  Completed: 'status-badge-Completed',
  Rejected:  'status-badge-Rejected',
};

const TaskCard = ({ task, showClaimButton = false, onClaimed }) => {

  const handleClaim = async () => {
    try {
      await claimTask(task._id);
      if (onClaimed) onClaimed();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim task');
    }
  };


  return (
    <div className="bg-bg-card border border-border/60 rounded-2xl p-6 flex flex-col gap-4 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.3)] hover:border-border-light hover:-translate-y-1 transition-all duration-300 ease-out cursor-default">
      
      {/* Category (if available) */}
      {task.category && (
        <div className="flex">
          <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-wider uppercase">
            {task.category}
          </span>
        </div>
      )}

      {/* Header: title + status */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[16px] font-bold text-text-primary leading-tight">{task.title || 'Untitled Task'}</h3>
        {task.status && (
          <span className={`shrink-0 inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${STATUS_CLASS[task.status] || ''}`}>
            {task.status}
          </span>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-[14px] text-text-muted leading-relaxed">{task.description}</p>
      )}

      {/* Meta row */}
      <div className="flex items-end justify-between flex-wrap gap-3 mt-auto pt-4 border-t border-border/40">
        <div className="flex flex-col gap-1.5">
          {(task.reward || task.bounty) && (
            <span className="text-[14px] font-bold text-green-400">
              {task.reward || task.bounty}
            </span>
          )}
          {task.createdAt && (
            <span className="text-[12px] text-text-faint font-medium">
              Posted: {new Date(task.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          )}
          <span className="text-[12px] text-text-faint font-medium">
            {task.dueDate ? `Due: ${task.dueDate}` : 'No due date'}
          </span>
        </div>
        {task.createdBy?.name && (
          <span className="text-[12px] text-text-faint font-medium">By {task.createdBy.name}</span>
        )}
      </div>

      {showClaimButton && (
        <button onClick={handleClaim}
          className="w-full mt-2 py-3 rounded-xl border-none text-[14px] font-bold text-white cursor-pointer btn-gradient shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all font-sans">
          Claim Task →
        </button>
      )}
    </div>
  );
};

export default TaskCard;
