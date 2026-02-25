<template>
    <div style="max-width:600px; margin:40px auto; font-family:sans-serif;">
        <h1>Todo List</h1>

        <form @submit.prevent="addTodo" style="display:flex; gap:8px;">
        <input v-model="newTitle" placeholder="할 일 입력" style="flex:1; padding:8px;" />
        <button type="submit">추가</button>
        </form>

        <ul style="margin-top:20px; padding:0; list-style:none;">
        <li v-for="todo in todos" :key="todo._id"
            style="display:flex; align-items:center; gap:8px; padding:6px 0;">
            
            <input type="checkbox"
                :checked="todo.done"
                @change="toggleTodo(todo)" />

            <span :style="{ textDecoration: todo.done ? 'line-through' : 'none' }">
            {{ todo.title }}
            </span>

            <button style="margin-left:auto;"
                    @click="deleteTodo(todo._id)">
            삭제
            </button>
        </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const todos = ref([]);
const newTitle = ref("");

const API = "http://localhost:5000/api/todos";

async function loadTodos() {
    const res = await fetch(API);
    todos.value = await res.json();
}

async function addTodo() {
    if (!newTitle.value) return;

    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.value })
    });

    newTitle.value = "";
    loadTodos();
}

async function toggleTodo(todo) {
    await fetch(`${API}/${todo._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !todo.done })
    });

    loadTodos();
}

async function deleteTodo(id) {
    await fetch(`${API}/${id}`, {
        method: "DELETE"
    });

    loadTodos();
}

onMounted(loadTodos);
</script>