const { db, newId, now, validationError } = require('../Settings/database');

const STATUSES = ['PENDING', 'INPROGRESS', 'COMPLETED'];

// Turns a DB row into the same shape the API returned with Mongoose.
function toTask(row) {
    if (!row) return null;
    const task = { ...row, status: JSON.parse(row.status), __v: 0 };
    if (task.description === null) delete task.description;
    if (task.dueDate === null) delete task.dueDate;
    return task;
}

function normaliseStatus(status) {
    const list = Array.isArray(status) ? status : [status];
    const invalid = list.find((s) => !STATUSES.includes(s));
    if (invalid !== undefined) {
        throw validationError({ status: `\`${invalid}\` is not a valid enum value for path \`status\`.` });
    }
    return list;
}

function normaliseDueDate(dueDate) {
    if (dueDate === undefined || dueDate === null || dueDate === '') return null;
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) {
        throw validationError({ dueDate: `Cast to date failed for value "${dueDate}" at path "dueDate"` });
    }
    return date.toISOString();
}

const createNewTask = async (newTask, next) => {
    try {
        const errors = {};
        if (!newTask.id) errors.createdBy = 'user reference is required';
        if (typeof newTask.title !== 'string' || newTask.title === '') errors.title = 'Title field is required';
        if (Object.keys(errors).length) throw validationError(errors);

        const timestamp = now();
        const task = {
            _id: newId(),
            createdBy: String(newTask.id),
            title: newTask.title,
            description: newTask.description === undefined ? null : String(newTask.description),
            dueDate: normaliseDueDate(newTask.dueDate),
            status: JSON.stringify(newTask.status === undefined ? ['PENDING'] : normaliseStatus(newTask.status)),
            assignedTo: '',
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        db.prepare(`
            INSERT INTO tasks (_id, createdBy, title, description, dueDate, status, assignedTo, createdAt, updatedAt)
            VALUES (@_id, @createdBy, @title, @description, @dueDate, @status, @assignedTo, @createdAt, @updatedAt)
        `).run(task);

        return toTask(task);
    } catch (e) {
        return next(e);
    }
}

const getAllUserTasks = async (userId, next) => {
    try {
        const rows = db.prepare('SELECT * FROM tasks WHERE createdBy = ? ORDER BY createdAt DESC, rowid DESC').all(String(userId));
        return rows.map(toTask);
    } catch (e) {
        next(e);
    }
}

const getAllTasks = async (next) => {
    try {
        const rows = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC, rowid DESC').all();
        return rows.map(toTask);
    } catch (e) {
        next(e);
    }
}

const getOneUserTask = async (taskId, next) => {
    try {
        const row = db.prepare('SELECT * FROM tasks WHERE _id = ?').get(String(taskId));
        return toTask(row);
    } catch (e) {
        next(e);
    }
}

// Updates only the fields that were sent. Returns the number of tasks changed (0 or 1).
function updateFields(taskId, fields) {
    const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
    if (!entries.length) return 0;
    const setClause = entries.map(([key]) => `${key} = @${key}`).join(', ');
    const result = db.prepare(`UPDATE tasks SET ${setClause}, updatedAt = @updatedAt WHERE _id = @taskId`)
        .run({ ...Object.fromEntries(entries), updatedAt: now(), taskId: String(taskId) });
    return result.changes;
}

const updateOneTask = async (task, next) => {
    try {
        const { taskId, title, description, dueDate, status } = task;
        return updateFields(taskId, {
            title,
            description: description === undefined ? undefined : String(description),
            dueDate: dueDate === undefined ? undefined : normaliseDueDate(dueDate),
            status: status === undefined ? undefined : JSON.stringify(normaliseStatus(status)),
        });
    } catch (e) {
        next(e);
    }
}

const updateTaskStatus = async (task, next) => {
    try {
        const { taskId, status } = task;
        return updateFields(taskId, {
            status: status === undefined ? undefined : JSON.stringify(normaliseStatus(status)),
        });
    } catch (e) { next(e) }
}

const deleteTask = async (taskId, next) => {
    try {
        return db.prepare('DELETE FROM tasks WHERE _id = ?').run(String(taskId)).changes;
    } catch (e) { next(e) }
}

// Filters by status and/or dueDate; an empty or missing criterion is ignored.
const filterUserTaskPerCriteria = async (userId, filterStatus, filterDueDate, next) => {
    try {
        const conditions = [];
        const params = {};
        if (filterStatus) {
            conditions.push('EXISTS (SELECT 1 FROM json_each(tasks.status) WHERE json_each.value = @status)');
            params.status = filterStatus;
        }
        if (filterDueDate) {
            conditions.push('dueDate = @dueDate');
            params.dueDate = normaliseDueDate(filterDueDate);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const rows = db.prepare(`SELECT _id, title, description, dueDate, status FROM tasks ${where} ORDER BY createdAt DESC, rowid DESC`).all(params);
        return rows.map((row) => {
            const task = toTask(row);
            delete task.__v;
            return task;
        });
    } catch (e) {
        next(e);
    }
}

const assignTaskTo = async (data, next) => {
    try {
        const { taskId, userAssignedTo } = data;
        return updateFields(taskId, { assignedTo: userAssignedTo === undefined ? undefined : String(userAssignedTo) });
    } catch (e) {
        return next(e);
    }
}

module.exports = {
    createNewTask,
    getAllUserTasks,
    getOneUserTask,
    updateOneTask,
    updateTaskStatus,
    deleteTask,
    filterUserTaskPerCriteria,
    assignTaskTo,
    getAllTasks
}
