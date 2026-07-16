import TaskCard from './TaskCard';

const AvailableTasksList = ({ tasks, onClaimed }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-bg-card border border-dashed border-border rounded-xl py-10 px-6 text-center text-text-faint text-sm">
        🎉 No open tasks right now — check back later!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} showClaimButton onClaimed={onClaimed} />
      ))}
    </div>
  );
};

export default AvailableTasksList;
