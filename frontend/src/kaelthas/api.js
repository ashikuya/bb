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
