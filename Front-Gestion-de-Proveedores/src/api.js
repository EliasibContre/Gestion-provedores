
export const API_BASE = import.meta.env.VITE_API_URL ;

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { 
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  });
  let body = null;
  try { body = await res.json(); } catch (e) { /* ignore non-json */ }
  if (!res.ok) {
    const err = new Error(body?.error || body?.message || `HTTP ${res.status}`);
    err.response = { data: body, status: res.status };
    throw err;
  }
  return body;
}

export async function apiPatch(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  let data = null;
  try { data = await res.json(); } catch (e) { /* ignore non-json */ }
  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `HTTP ${res.status}`);
    err.response = { data, status: res.status };
    throw err;
  }
  return data;
}