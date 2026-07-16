const Task = require('../models/Task');
const User = require('../models/User');

// @desc  Get all tasks
// @route GET /api/tasks
// @access Admin
const getAllTasks = async (req, res) => {
  try {
    if (!req.query.page && !req.query.limit && !req.query.search && !req.query.status) {
      // Backward compatible behavior
      const tasks = await Task.find({})
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
      return res.json(tasks);
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    if (req.query.search) {
      const safeSearch = req.query.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const users = await User.find({ name: { $regex: safeSearch, $options: 'i' } }).select('_id');
      const userIds = users.map(u => u._id);

      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { assignedTo: { $in: userIds } }
      ];
    }

    const totalItems = await Task.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const allTotal = await Task.countDocuments();
    const allOpen = await Task.countDocuments({ status: 'Open' });
    const allSubmitted = await Task.countDocuments({ status: 'Submitted' });
    const allApproved = await Task.countDocuments({ status: 'Approved' });

    res.json({
      tasks,
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      stats: {
        total: allTotal,
        open: allOpen,
        submitted: allSubmitted,
        approved: allApproved,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single task
// @route GET /api/tasks/:id
// @access Admin
const getTaskById = async (req, res) => {
  try {
    // — will throw a CastError from Mongoose instead of a clean 400
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create a task
// @route POST /api/tasks
// @access Admin
const createTask = async (req, res) => {
  const { title, description, status, assignedTo, dueDate } = req.body;

  try {
    const task = await Task.create({
      title,
      description,
      status,
      assignedTo: assignedTo || null,
      dueDate,
      createdBy: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update a task
// @route PUT /api/tasks/:id
// @access Admin
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    // including internal fields like createdBy or __v
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    ).populate('assignedTo', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a task
// @route DELETE /api/tasks/:id
// @access Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    // — orphaned Submission documents remain in DB after task deletion
    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
