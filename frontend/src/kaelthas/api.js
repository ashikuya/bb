import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const client = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

async function unwrap(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.error || err?.message || 'Request failed.';
    throw new Error(msg);
  }
}

export const register = (username, email, password) =>
  unwrap(client.post('/register', { username, email, password }));

export const login = (username, password) =>
  unwrap(client.post('/login', { username, password }));

export const logout = () => unwrap(client.post('/logout'));

export async function getMe() {
  try {
    const d = await unwrap(client.get('/me'));
    return d.account;
  } catch {
    return null;
  }
}

export const getCharacters = () => unwrap(client.get('/characters'));

export const changePassword = (newPassword) =>
  unwrap(client.post('/account/password', { newPassword }));

export async function getStatus() {
  try {
    return await unwrap(client.get('/status'));
  } catch {
    return null;
  }
}

export async function getForumCategories() {
  try {
    const d = await unwrap(client.get('/forum/categories'));
    return d.categories;
  } catch {
    return [];
  }
}

export const getForumThreads = (slug, page = 1) =>
  unwrap(client.get(`/forum/categories/${slug}/threads`, { params: { page } }));

export const getForumThread = (id, page = 1) =>
  unwrap(client.get(`/forum/threads/${id}`, { params: { page } }));

export const createThread = (slug, title, content) =>
  unwrap(client.post(`/forum/categories/${slug}/threads`, { title, content }));

export const replyToThread = (threadId, content) =>
  unwrap(client.post(`/forum/threads/${threadId}/posts`, { content }));

export const getForumRoles = async () => {
  try {
    const d = await unwrap(client.get('/forum/roles'));
    return d.roles || [];
  } catch { return []; }
};

// ── Admin ───────────────────────────────────────────────
export const adminListUsers = (q = '', limit = 50) =>
  unwrap(client.get('/admin/users', { params: { q, limit } }));

export const adminGrantRole = (accountId, role) =>
  unwrap(client.post(`/admin/users/${accountId}/roles`, { role }));

export const adminRevokeRole = (accountId, roleSlug) =>
  unwrap(client.delete(`/admin/users/${accountId}/roles/${roleSlug}`));

export const adminUpdateRole = (slug, patch) =>
  unwrap(client.put(`/admin/roles/${slug}`, patch));

export const adminCreateRole = (data) =>
  unwrap(client.post('/admin/roles', data));

export const adminDeleteRole = (slug) =>
  unwrap(client.delete(`/admin/roles/${slug}`));

export const adminPinThread = (id, pinned) =>
  unwrap(client.post(`/admin/threads/${id}/pin`, { pinned }));

export const adminLockThread = (id, locked) =>
  unwrap(client.post(`/admin/threads/${id}/lock`, { locked }));

export const adminDeleteThread = (id) =>
  unwrap(client.delete(`/admin/threads/${id}`));

export const adminDeletePost = (id) =>
  unwrap(client.delete(`/admin/posts/${id}`));

// ── Profile / Avatar ───────────────────────────────────
export const updateProfile = (data) =>
  unwrap(client.post('/account/profile', data));

export const removeAvatar = () =>
  unwrap(client.delete('/account/avatar'));

export async function uploadAvatar(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await client.post('/account/avatar', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
