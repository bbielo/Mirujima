const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const API_AUTH = `${API}/api/auth`;

async function safeJson(res) {
    try {
        return await res.json();
    } catch {
        return {};
    }
}

export async function registerApi(username, password) {
    const res = await fetch(`${API_AUTH}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await safeJson(res);

    if (res.status === 409 && data.code === "USERNAME_TAKEN") {
        const err = new Error("이미 사용 중인 아이디입니다.");
        err.code = "USERNAME_TAKEN";
        throw err;
    }

    if (!res.ok) {
        throw new Error(data.message || "회원가입 실패");
    }

    return data;
}

export async function loginApi(username, password) {
    const res = await fetch(`${API_AUTH}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await safeJson(res);

    if (!res.ok) {
        throw new Error(data.message || "로그인 실패");
    }

  return data; // { token, username }
}