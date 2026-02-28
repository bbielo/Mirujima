<template>
  <div style="max-width:600px; margin:40px auto; font-family:sans-serif;">
    <h1>Todo List</h1>

    <!-- 로그인 / 회원가입 -->
    <section style="border:1px solid #eee; padding:12px; border-radius:8px; margin:16px 0;">
      <h3>로그인 / 회원가입</h3>

      <div style="display:flex; gap:8px; margin-bottom:8px;">
        <input v-model.trim="authUsername" placeholder="아이디" style="flex:1; padding:8px;" />
        <input v-model="authPassword" type="password" placeholder="비밀번호"
              style="flex:1; padding:8px;" />
      </div>

      <div style="display:flex; gap:8px; align-items:center;">
        <button @click="register" :disabled="authLoading">회원가입</button>
        <button @click="login" :disabled="authLoading">로그인</button>

        <div style="margin-left:auto; display:flex; align-items:center; gap:8px;">
          <span v-if="isLoggedIn" style="color:green;">
            로그인됨: {{ loggedInUser }}
          </span>

          <!-- 세션 카운트 -->
          <span v-if="isLoggedIn" style="color:#555;">
            ⏳ {{ remainingTimeFormatted }}
          </span>

          <!-- 60분 리셋 버튼 -->
          <button v-if="isLoggedIn" @click="resetSessionTimer" title="세션 60분으로 연장">⟲</button>

          <button v-if="isLoggedIn" @click="logout">로그아웃</button>
        </div>
      </div>

      <p v-if="authError" style="color:red; margin-top:8px;">{{ authError }}</p>
      <p v-if="authInfo" style="color:green; margin-top:8px;">{{ authInfo }}</p>
    </section>

    <!-- Todo 입력 -->
    <form @submit.prevent="addTodo" style="display:flex; gap:8px;">
      <input v-model.trim="newTitle" :disabled="!isLoggedIn"
            placeholder="할 일 입력" style="flex:1; padding:8px;" />
      <button type="submit" :disabled="!isLoggedIn">추가</button>
    </form>

    <p v-if="!isLoggedIn" style="color:#666; margin-top:10px;">
      로그인 후 Todo 사용 가능
    </p>

    <!-- Todo 목록 -->
    <ul v-else style="margin-top:20px; padding:0; list-style:none;">
      <li v-for="todo in todoList" :key="todo._id"
          style="display:flex; align-items:center; gap:8px; padding:6px 0;">
        <input type="checkbox" :checked="todo.done" @change="toggleTodo(todo)" />

        <span :style="{ textDecoration: todo.done ? 'line-through' : 'none' }">
          {{ todo.title }}
        </span>

        <button style="margin-left:auto;" @click="deleteTodo(todo._id)">
          삭제
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const todoList = ref([]);
const newTitle = ref("");

const API_TODOLIST = "http://localhost:5000/api/todoList";
const API_AUTH = "http://localhost:5000/api/auth";

const authUsername = ref("");
const authPassword = ref("");
const authError = ref("");
const authInfo = ref("");
const authLoading = ref(false);

const token = ref(sessionStorage.getItem("token") || "");
const loggedInUser = ref(sessionStorage.getItem("username") || "");

const isLoggedIn = computed(() => Boolean(token.value));

// 세션 60분으로 셋팅
const remainingSeconds = ref(0);
let countdownTimer = null;

const remainingTimeFormatted = computed(() => {
  const sec = Math.max(0, remainingSeconds.value);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
});

function startSessionTimer() {
  remainingSeconds.value = 60 * 60;

  if (countdownTimer) clearInterval(countdownTimer);

  countdownTimer = setInterval(() => {
    remainingSeconds.value--;

    if (remainingSeconds.value <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      logoutWithMessage("세션이 만료되어 자동 로그아웃되었습니다.");
    }
  }, 1000);
}

function resetSessionTimer() {
  if (!isLoggedIn.value) return;
  remainingSeconds.value = 60 * 60;
  setAuthMessage({ info: "세션이 60분으로 연장되었습니다.", error: "" });
}

function setAuthMessage({ error = "", info = "" } = {}) {
  authError.value = error;
  authInfo.value = info;
}

function authHeader() {
  return token.value ? { Authorization: `Bearer ${token.value}` } : {};
}

// 로그아웃
function logoutWithMessage(msg) {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = null;
  remainingSeconds.value = 0;

  token.value = "";
  loggedInUser.value = "";
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("username");

  todoList.value = [];
  newTitle.value = "";

  setAuthMessage({ error: msg, info: "" });
}

function logout() {
  logoutWithMessage("로그아웃되었습니다.");
}

// 권한
async function register() {
  setAuthMessage({});
  authLoading.value = true;

  try {
    const res = await fetch(`${API_AUTH}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: authUsername.value.trim(),
        password: authPassword.value,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 409 && data.code === "USERNAME_TAKEN") {
      return setAuthMessage({ error: "이미 사용 중인 아이디입니다." });
    }

    if (!res.ok) return setAuthMessage({ error: data.message || "회원가입 실패" });

    setAuthMessage({ info: "회원가입 성공! 로그인해주세요." });
  } catch {
    setAuthMessage({ error: "네트워크 오류(서버 켜져있는지 확인)" });
  } finally {
    authLoading.value = false;
  }
}

async function login() {
  setAuthMessage({});
  authLoading.value = true;

  try {
    const res = await fetch(`${API_AUTH}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: authUsername.value.trim(),
        password: authPassword.value,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) return setAuthMessage({ error: data.message || "로그인 실패" });

    token.value = data.token;
    loggedInUser.value = data.username || authUsername.value.trim();

    sessionStorage.setItem("token", token.value);
    sessionStorage.setItem("username", loggedInUser.value);

    startSessionTimer();
    setAuthMessage({ info: "로그인 성공!" });

    await loadTodoList();
  } catch {
    setAuthMessage({ error: "네트워크 오류(서버 켜져있는지 확인)" });
  } finally {
    authLoading.value = false;
  }
}

async function loadTodoList() {
  if (!token.value) {
    todoList.value = [];
    return;
  }

  const res = await fetch(API_TODOLIST, {
    headers: authHeader(),
  });

  if (res.status === 401) return logoutWithMessage("세션이 만료되었습니다. 다시 로그인해주세요.");
  if (!res.ok) {
    todoList.value = [];
    return;
  }

  todoList.value = await res.json();
}

async function addTodo() {
  if (!token.value) return;

  const res = await fetch(API_TODOLIST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({ title: newTitle.value }),
  });

  if (res.status === 401) return logoutWithMessage("세션이 만료되었습니다. 다시 로그인해주세요.");

  newTitle.value = "";
  loadTodoList();
}

async function toggleTodo(todo) {
  const res = await fetch(`${API_TODOLIST}/${todo._id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({ done: !todo.done }),
  });

  if (res.status === 401) return logoutWithMessage("세션이 만료되었습니다. 다시 로그인해주세요.");

  loadTodoList();
}

async function deleteTodo(id) {
  const res = await fetch(`${API_TODOLIST}/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });

  if (res.status === 401) return logoutWithMessage("세션이 만료되었습니다. 다시 로그인해주세요.");

  loadTodoList();
}

onMounted(() => {
  // sessionStorage에 token이 있으면 새로고침 시 유지됨 (창 닫으면 삭제됨)
  if (token.value) {
    startSessionTimer();
    loadTodoList();
  }
});

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>