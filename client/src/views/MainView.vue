<template>
    <div class="dash-card">
        <header class="dash-top">
            <div class="dash-title">
                <span class="dash-title-accent">미루지마</span>
            </div>

            <div class="session">
                <span class="session-user">{{ loggedInUser }} 님</span>
                <span class="session-time">⏳ {{ remainingTimeFormatted }}</span>
                <button class="icon-btn" @click="extendSession" title="세션 60분으로 연장">⟲</button>
                <button class="ghost-btn" @click="onLogout">로그아웃</button>
            </div>
        </header>

        <div class="dash-body">
            <aside class="dash-left">
                <MainCalendar
                    v-model:selectedDateObj="selectedDateObj"
                    :calendarPage="calendarPage"
                    @update:calendarPage="(p) => (calendarPage = p)"
                    :calendar-attrs="calendarAttrs"
                    :selected-date="selectedDate"
                    :remaining="remainingForSelectedDate"
                />
            </aside>

            <main class="dash-right">
                <MainList
                    :todo-list="todoList"
                    v-model:newTitle="newTitle"
                    v-model:editTitle="editTitle"
                    :edit-id="editId"
                    :selected-date="selectedDate"
                    @add="addTodo"
                    @toggle="toggleTodo"
                    @remove="deleteTodo"
                    @startEdit="startEdit"
                    @save="saveEdit"
                    @cancel="cancelEdit"
                />
            </main>
        </div>

        <p v-if="authError" class="dash-msg error">{{ authError }}</p>
        <p v-if="authInfo && authInfo.length" class="dash-msg info">{{ authInfo }}</p>
    </div>
</template>

<script setup>
import { useRouter } from "vue-router";

import MainCalendar from "../components/main/MainCalendar.vue";
import MainList from "../components/main/MainList.vue";

import { useAuth } from "../composables/useAuth";
import { useSessionTimer } from "../composables/useSessionTimer";
import { useTodos } from "../composables/useTodos";

const router = useRouter();

const {
    token,
    loggedInUser,
    authError,
    authInfo,
    setAuthMessage,
    authHeader,
    clearAuth,
} = useAuth();

function unauthorizedLogout() {
    setAuthMessage({ error: "세션이 만료되었습니다. 다시 로그인해주세요.", info: "" });
    timer.stop();
    clearAuth();
    router.replace("/auth");
}

const timer = useSessionTimer({
    onExpired: () => {
        setAuthMessage({ error: "세션이 만료되어 자동 로그아웃되었습니다.", info: "" });
        clearAuth();
        router.replace("/auth");
    },
});

const {
    todoList,
    newTitle,

    editId,
    editTitle,
    startEdit,
    cancelEdit,
    saveEdit,

    selectedDateObj,
    calendarPage,
    selectedDate,
    calendarAttrs,
    remainingForSelectedDate,

    addTodo,
    toggleTodo,
    deleteTodo,

    loadTodoList,
    loadMonthSummary,
} = useTodos({
    tokenRef: token,
    authHeaderFn: authHeader,
    onUnauthorized: unauthorizedLogout,
});

// 🔥 화면에서 쓰는 값/함수 노출
const { remainingTimeFormatted } = timer;

if (token.value) {
    timer.start();
    loadTodoList();
    loadMonthSummary(new Date().toISOString().slice(0, 7));
}

function extendSession() {
    timer.reset(60 * 60);
    setAuthMessage({ info: "세션이 60분으로 연장되었습니다.", error: "" });
}

function onLogout() {
    timer.stop();
    clearAuth();
    setAuthMessage({ error: "로그아웃되었습니다.", info: "" });
    router.replace("/auth");
}
</script>