const { db, newId, now, validationError } = require('../Settings/database');
const { validateFieldNotNull, noNullKeyValues } = require('../util/validations/validateModel');
const { encryptPassword } = require('../util/encryptPassword');

const ROLES = ['taskManager', 'taskWorker'];
const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}|:"<>?`~\-=\[\];',./]).{8,}$/;

const isBlank = (value) => typeof value !== 'string' || !validateFieldNotNull(value);

// Full user row, including the password hash. Only for internal use (login).
function toUser(row) {
    if (!row) return null;
    return { ...row, role: JSON.parse(row.role), __v: 0 };
}

// User row without the password hash, for API responses.
function toUserWithoutPassword(row) {
    if (!row) return null;
    const { password, ...user } = toUser(row);
    return user;
}

function toPublicUser(row) {
    if (!row) return null;
    const { _id, username, email, role } = row;
    return { _id, username, email, role: JSON.parse(role) };
}

function normaliseRole(role) {
    if (role === undefined || role === null || role === '') return ['taskWorker'];
    return Array.isArray(role) ? role : [role];
}

function validateUser(user) {
    const errors = {};
    if (isBlank(user.username)) errors.username = 'Username is required';

    if (isBlank(user.email)) errors.email = 'Email is required';
    else if (!EMAIL_REGEX.test(user.email)) errors.email = 'Email provided is invalid';

    if (isBlank(user.password)) errors.password = 'Password is required';
    else if (user.password.length < 8) errors.password = 'Password should be at least 8 characters long';
    else if (!PASSWORD_REGEX.test(user.password)) errors.password = 'Password must meet specified criteria';

    const invalidRole = user.role.find((r) => !ROLES.includes(r));
    if (invalidRole !== undefined) errors.role = `\`${invalidRole}\` is not a valid enum value for path \`role\`.`;

    if (Object.keys(errors).length) throw validationError(errors);
}

// Validates the user with the plain-text password, then stores a bcrypt hash of the password.
async function createAUser(user, next) {
    try {
        const timestamp = now();
        const newUser = {
            _id: newId(),
            username: user.username,
            email: typeof user.email === 'string' ? user.email.trim().toLowerCase() : user.email,
            password: user.password,
            role: normaliseRole(user.role),
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        validateUser(newUser);
        newUser.password = await encryptPassword(newUser.password);

        db.prepare(`
            INSERT INTO users (_id, username, email, password, role, createdAt, updatedAt)
            VALUES (@_id, @username, @email, @password, @role, @createdAt, @updatedAt)
        `).run({ ...newUser, role: JSON.stringify(newUser.role) });

        const { password, ...createdUser } = newUser;
        return { ...createdUser, __v: 0 };
    } catch (e) { next(e) }
}

async function getOneUser(userId, next) {
    try {
        const row = db.prepare('SELECT * FROM users WHERE _id = ?').get(String(userId));
        return toPublicUser(row);
    } catch (e) { next(e) };
}

async function findOneUser(userEmail, next) {
    try {
        if (typeof userEmail !== 'string') return null;
        const row = db.prepare('SELECT * FROM users WHERE email = ?').get(userEmail.trim().toLowerCase());
        return toUser(row);
    } catch (e) { next(e) };
}

async function updateUsername(data, next) {
    try {
        const { username, id } = data;
        if (username !== undefined) {
            if (isBlank(username)) throw validationError({ username: 'Username is required' });
            db.prepare('UPDATE users SET username = ?, updatedAt = ? WHERE _id = ?').run(username, now(), String(id));
        }
        return true;
    } catch (e) {
        next(e);
    }
}

async function getAllUsers(data, next) {
    try {
        const rows = db.prepare('SELECT * FROM users ORDER BY createdAt DESC, rowid DESC').all();
        return rows.map(toUserWithoutPassword);
    } catch (e) {
        return next(e)
    }
}

function hasSameProps(obj1, obj2) {
    return Object.keys(obj1).every(function (prop) {
        return obj2.hasOwnProperty(prop);
    })
}

function checkRegisterDataformat(data, next) {
    try {
        if (!(noNullKeyValues(data))) return false;
        const idealStructure = { username: String, email: String, password: String };
        return hasSameProps(idealStructure, data)
    } catch (e) {
        next(e);
    }
}

function checkLoginDataformat(data, next) {
    try {
        if (!(noNullKeyValues(data))) return false;
        const idealStructure = { email: String, password: String };
        return hasSameProps(idealStructure, data)
    } catch (e) {
        next(e);
    }
}

// Returns { _id } when the user exists, otherwise null (callers compare against null).
async function checkIfUserExists(userId) {
    const row = db.prepare('SELECT _id FROM users WHERE _id = ?').get(String(userId));
    return row || null;
}

module.exports = { createAUser, getOneUser, findOneUser, getAllUsers, checkRegisterDataformat, checkLoginDataformat, updateUsername, checkIfUserExists }
