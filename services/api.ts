// frontend/src/services/api.ts
// ============================
// Handles all API calls safely (no more JSON parse errors)

import type { User } from '../types';

// Dynamic base URL setup
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const API_BASE_URL = import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`;

console.log('🔗 Using API base:', API_BASE_URL);

// --- Helper: safely parse JSON ---
async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON returned from server (status ${res.status})`);
  }
}

// --- Helper: handle failed responses ---
function handleError(res: Response, data: any, defaultMsg: string) {
  const msg = data?.error || data?.message || defaultMsg;
  throw new Error(msg);
}

// ------------------ AUTH ------------------
export async function register(
  name: string,
  email: string,
  password: string,
  skills: string[],
  bio: string
) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, skills, bio }),
  });

  const data = await safeJson(res);

  if (!res.ok) handleError(res, data, 'Registration failed');
  if (!data) throw new Error('Empty response from server during registration');

  return data;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await safeJson(res);

  if (!res.ok) handleError(res, data, 'Login failed');
  if (!data) throw new Error('Empty response from server during login');

  return data;
}

// ------------------ USERS ------------------
export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/users`);
  const data = await safeJson(res);
  if (!res.ok) handleError(res, data, 'Failed to fetch users');
  return data;
}

export async function getUserById(id: number): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/${id}`);
  const data = await safeJson(res);
  if (!res.ok) handleError(res, data, 'Failed to fetch user');
  return data;
}

export async function toggleUserAvailability(id: number): Promise<{ available: boolean }> {
  const res = await fetch(`${API_BASE_URL}/users/${id}/availability`, { method: 'PATCH' });
  const data = await safeJson(res);
  if (!res.ok) handleError(res, data, 'Failed to toggle availability');
  return data;
}

// ------------------ PROJECTS ------------------
export async function getProjects() {
  const res = await fetch(`${API_BASE_URL}/projects`);
  const data = await safeJson(res);
  if (!res.ok) handleError(res, data, 'Failed to fetch projects');
  return data.map((p: any) => ({
    ...p,
    creatorId: p.creator_id || p.creatorId,
    requiredSkills: p.requiredSkills || [],
  }));
}

export async function createProject(
  title: string,
  description: string,
  requiredSkills: string[],
  token: string
) {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description, requiredSkills }),
  });

  const data = await safeJson(res);
  if (!res.ok) handleError(res, data, 'Failed to create project');
  return data;
}
