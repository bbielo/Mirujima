const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const API_TODOLIST = `${API}/api/todoList`;

async function safeJson(res) {
    try {
        return await res.json();
    } catch {
        return {};
    }
}

export async function fetchTodosApi({ date, authHeader }) {
    const res = await fetch(`${API_TODOLIST}?date=${date}`, { headers: authHeader });
    if (res.status === 401) return { __unauthorized: true };
    if (!res.ok) return [];
    return await res.json();
}

export async function addTodoApi({ title, date, authHeader }) {
    const res = await fetch(API_TODOLIST, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ title, date }),
    });
    if (res.status === 401) return { __unauthorized: true };
    return { ok: res.ok };
}

export async function toggleTodoApi({ id, done, authHeader }) {
    const res = await fetch(`${API_TODOLIST}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ done }),
    });
    if (res.status === 401) return { __unauthorized: true };
    return { ok: res.ok };
}

export async function deleteTodoApi({ id, authHeader }) {
    const res = await fetch(`${API_TODOLIST}/${id}`, {
        method: "DELETE",
        headers: authHeader,
    });
    if (res.status === 401) return { __unauthorized: true };
    return { ok: res.ok };
}

export async function editTodoApi({ id, title, authHeader }) {
    const res = await fetch(`${API_TODOLIST}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ title }),
    });
    if (res.status === 401) return { __unauthorized: true };
    const data = await safeJson(res);
    return { ok: res.ok, data };
}

export async function fetchMonthSummaryApi({ monthStr, authHeader }) {
    const res = await fetch(`${API_TODOLIST}/summary?month=${monthStr}`, { headers: authHeader });
    if (res.status === 401) return { __unauthorized: true };
    if (!res.ok) return [];
    return await res.json(); // [{date,total,remaining}]
}