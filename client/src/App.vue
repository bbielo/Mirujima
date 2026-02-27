<template>
  <div style="max-width:600px; margin:40px auto; font-family:sans-serif;">
    <h1>Todo List</h1>
    <section style="border:1px solid #eee; padding:12px; border-radius:8px; margin:16px 0;">
      <h3 style="margin:0 0 8px;">로그인 / 회원가입</h3>

      <div style="display:flex; gap:8px; margin-bottom:8px;">
        <input
          v-model.trim="authUsername"
          placeholder="아이디(username)"
          style="flex:1; padding:8px;"
          autocomplete="username"
        />
        <input
          v-model="authPassword"
          placeholder="비밀번호(6자 이상)"
          type="password"
          style="flex:1; padding:8px;"
          autocomplete="current-password"
        />
      </div>

      <div style="display:flex; gap:8px; align-items:center;">
        <button @click="register" :disabled="authLoading">회원가입</button>
        <button @click="login" :disabled="authLoading">로그인</button>

        <div style="margin-left:auto; font-size:14px;">
          <span v-if="isLoggedIn" style="color:green;">
            로그인됨: {{ meUsername }}
          </span>
          <button v-if="isLoggedIn" @click="logout" style="margin-left:8px;">
            로그아웃
          </button>
        </div>
      </div>

      <!-- 에러메세지 -->
      <p v-if="authError" style="color:#d00; margin:8px 0 0;">
        {{ authError }}
      </p>
      <p v-if="authInfo" style="color:#0a0; margin:8px 0 0;">
        {{ authInfo }}
      </p>
    </section>

    <!-- todo 입력 -->
    <form @submit.prevent="addTodo" style="display:flex; gap:8px;">
      <input
        v-model.trim="newTitle"
        placeholder="할 일 입력"
        style="flex:1; padding:8px;"
        :disabled="!isLoggedIn"
      />
      <button type="submit" :disabled="!isLoggedIn">추가</button>
    </form>

    <p v-if="!isLoggedIn" style="color:#666; margin-top:10px;">
      Todo를 보려면 먼저 로그인해줘.
    </p>

    <ul v-else style="margin-top:20px; padding:0; list-style:none;">
      <li
        v-for="todo in todoList"
        :key="todo._id"
        style="display:flex; align-items:center; gap:8px; padding:6px 0;"
      >
        <input type="checkbox" :checked="todo.done" @change="toggleTodo(todo)" />

        <span :style="{ textDecoration: todo.done ? 'line-through' : 'none' }">
          {{ todo.title }}
        </span>

        <button style="margin-left:auto;" @click="deleteTodo(todo._id)">삭제</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const todoList = ref([]);
const newTitle = ref("");

const API_TODOS = "http://localhost:5000/api/todoList";
const API_AUTH = "http://localhost:5000/api/auth";

const authUsername = ref("");
const authPassword = ref("");
const authError = ref("");
const authInfo = ref("");
const authLoading = ref(false);

const token = ref(localStorage.getItem("token") || "");
const meUsername = ref(localStorage.getItem("username") || "");

const isLoggedIn = computed(() => Boolean(token.value));

function setAuthMessage({ error = "", info = "" }) {
  authError.value = error;
  authInfo.value = info;
}

function authHeader() {
  return token.value ? { Authorization: `Bearer ${token.value}` } : {};
}

// 권한
async function register() {
  setAuthMessage({ error: "", info: "" });

  const username = authUsername.value.trim();
  const password = authPassword.value;

  if (!username || !password) {
    return setAuthMessage({ error: "아이디와 비밀번호를 입력해줘." });
  }

  authLoading.value = true;
  try {
    const res = await fetch(`${API_AUTH}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 409 && data.code === "USERNAME_TAKEN") {
      return setAuthMessage({ error: "이미 사용 중인 아이디야. 다른 아이디로 해줘!" });
    }

    if (!res.ok) {
      return setAuthMessage({ error: data.message || "회원가입 실패" });
    }

    setAuthMessage({ info: "회원가입 성공! 이제 로그인 해줘." });
  } catch (e) {
    setAuthMessage({ error: "네트워크 오류(서버 켜져있는지 확인)" });
  } finally {
    authLoading.value = false;
  }
}

async function login() {
  setAuthMessage({ error: "", info: "" });

  const username = authUsername.value.trim();
  const password = authPassword.value;

  if (!username || !password) {
    return setAuthMessage({ error: "아이디와 비밀번호를 입력해줘." });
  }

  authLoading.value = true;
  try {
    const res = await fetch(`${API_AUTH}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return setAuthMessage({ error: data.message || "로그인 실패" });
    }

    token.value = data.token;
    meUsername.value = data.username || username;

    localStorage.setItem("token", token.value);
    localStorage.setItem("username", meUsername.value);

    setAuthMessage({ info: "로그인 성공!" });

    // 로그인 후 user의 todo가져오기
    await loadTodoList();
  } catch (e) {
    setAuthMessage({ error: "네트워크 오류(서버 켜져있는지 확인)" });
  } finally {
    authLoading.value = false;
  }
}

function logout() {
  token.value = "";
  meUsername.value = "";
  localStorage.removeItem("token");
  localStorage.removeItem("username");

  todoList.value = [];
  newTitle.value = "";

  setAuthMessage({ info: "로그아웃 됨" });
}

// todolist가져오기
async function loadTodoList() {
  if (!token.value) {
    todoList.value = [];
    return;
  }

  const res = await fetch(API_TODOS, {
    headers: { ...authHeader() },
  });

  if (!res.ok) {
    todoList.value = [];
    return;
  }

  todoList.value = await res.json();
}

async function addTodo() {
  if (!isLoggedIn.value) return setAuthMessage({ error: "로그인 후에 Todo를 추가할 수 있어." });
  if (!newTitle.value) return;

  await fetch(API_TODOS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({ title: newTitle.value }),
  });

  newTitle.value = "";
  loadTodoList();
}

async function toggleTodo(todo) {
  if (!isLoggedIn.value) return setAuthMessage({ error: "로그인 후에 수정할 수 있어." });

  await fetch(`${API_TODOS}/${todo._id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({ done: !todo.done }),
  });

  loadTodoList();
}

async function deleteTodo(id) {
  if (!isLoggedIn.value) return setAuthMessage({ error: "로그인 후에 삭제할 수 있어." });

  await fetch(`${API_TODOS}/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });

  loadTodoList();
}

// ✅ 앱 시작 시: 토큰 있으면 자동으로 내 todo 불러오기
onMounted(loadTodoList);
</script>