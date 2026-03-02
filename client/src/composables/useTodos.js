import { ref, computed, watch, onMounted } from "vue";
import {
    fetchTodosApi,
    addTodoApi,
    toggleTodoApi,
    deleteTodoApi,
    editTodoApi,
    fetchMonthSummaryApi,
} from "../configs/todo";

export function useTodos({ tokenRef, authHeaderFn, onUnauthorized }) {
    const todoList = ref([]);
    const newTitle = ref("");

    // edit
    const editId = ref(null);
    const editTitle = ref("");

    // calendar state
    const selectedDateObj = ref(new Date());
    const calendarPage = ref({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const todayStr = new Date().toISOString().slice(0, 10);

    const selectedDate = computed(() => {
        const raw = selectedDateObj.value;
        const d = raw instanceof Date ? raw : new Date(raw);
        if (isNaN(d)) return new Date().toISOString().slice(0, 10);

        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    });

    const currentMonth = ref(new Date().toISOString().slice(0, 7));
    const monthRemainingMap = ref({});

    const remainingForSelectedDate = computed(() => {
        return monthRemainingMap.value[selectedDate.value]?.remaining ?? 0;
    });

    const calendarAttrs = computed(() => {
        const attrs = [
            {
            key: "today",
            dates: new Date(todayStr + "T00:00:00"),
            highlight: { outline: true },
            },
            {
            key: "selected",
            dates:
                selectedDateObj.value instanceof Date
                ? selectedDateObj.value
                : new Date(selectedDateObj.value),
            highlight: true,
            },
        ];

        for (const [dateStr, v] of Object.entries(monthRemainingMap.value)) {
            const total = v?.total ?? 0;
            const remaining = v?.remaining ?? 0;
            if (total <= 0) continue;

            attrs.push({
                key: `rem-${dateStr}`,
                dates: new Date(dateStr + "T00:00:00"),
                dot: {
                    color: remaining === 0 ? "green" : "red",
                },
                popover: {
                    label: remaining === 0 ? "모두 완료" : `${remaining}개 남음`,
                },
            });
        }

        return attrs;
        });

    function cancelEdit() {
        editId.value = null;
        editTitle.value = "";
    }

    function startEdit(todo) {
        editId.value = todo._id;
        editTitle.value = todo.title;
    }

    async function loadTodoList() {
        if (!tokenRef.value) {
        todoList.value = [];
        return;
        }

        const res = await fetchTodosApi({
        date: selectedDate.value,
        authHeader: authHeaderFn(),
        });

        if (res?.__unauthorized) return onUnauthorized?.();
        todoList.value = Array.isArray(res) ? res : [];
    }

    async function loadMonthSummary(monthStr) {
        if (!tokenRef.value) return;

        const data = await fetchMonthSummaryApi({
        monthStr,
        authHeader: authHeaderFn(),
        });

        if (data?.__unauthorized) return onUnauthorized?.();

        const map = {};
        (Array.isArray(data) ? data : []).forEach((row) => {
        map[row.date] = { total: row.total, remaining: row.remaining };
        });
        monthRemainingMap.value = map;
    }

    async function addTodo() {
        if (!tokenRef.value) return;
        const title = newTitle.value.trim();
        if (!title) return;

        const res = await addTodoApi({
        title,
        date: selectedDate.value,
        authHeader: authHeaderFn(),
        });

        if (res?.__unauthorized) return onUnauthorized?.();

        newTitle.value = "";
        await loadTodoList();
        await loadMonthSummary(currentMonth.value);
    }

    async function toggleTodo(todo) {
        const res = await toggleTodoApi({
        id: todo._id,
        done: !todo.done,
        authHeader: authHeaderFn(),
        });

        if (res?.__unauthorized) return onUnauthorized?.();

        await loadTodoList();
        await loadMonthSummary(currentMonth.value);
    }

    async function deleteTodo(id) {
        const res = await deleteTodoApi({ id, authHeader: authHeaderFn() });
        if (res?.__unauthorized) return onUnauthorized?.();

        await loadTodoList();
        await loadMonthSummary(currentMonth.value);
    }

    async function saveEdit(id) {
        const title = editTitle.value.trim();
        if (!title) return;

        const res = await editTodoApi({
        id,
        title,
        authHeader: authHeaderFn(),
        });

        if (res?.__unauthorized) return onUnauthorized?.();
        if (!res.ok) return;

        cancelEdit();
        await loadTodoList();
        await loadMonthSummary(currentMonth.value);
    }

    async function loadMonthSummary(monthStr) {
    if (!tokenRef.value) return;

    const data = await fetchMonthSummaryApi({ monthStr, authHeader: authHeaderFn() });
    if (data?.__unauthorized) return onUnauthorized?.();

    const next = { ...monthRemainingMap.value };
    (Array.isArray(data) ? data : []).forEach((row) => {
        next[row.date] = { total: row.total, remaining: row.remaining };
    });
    
    monthRemainingMap.value = next;
    }

    // watchers
    watch(selectedDateObj, () => {
        if (tokenRef.value) loadTodoList();
    });

    watch(() => [calendarPage.value.year, calendarPage.value.month],
    ([year, month]) => {
        const m = String(month).padStart(2, "0");
        currentMonth.value = `${year}-${m}`;
        loadMonthSummary(currentMonth.value);
    },
    { immediate: true }
    );

    onMounted(() => {
        if (tokenRef.value) {
        loadTodoList();
        loadMonthSummary(currentMonth.value);
        }
    });

    return {
        // list
        todoList,
        newTitle,

        // edit
        editId,
        editTitle,
        startEdit,
        cancelEdit,
        saveEdit,

        // calendar
        selectedDateObj,
        calendarPage,
        selectedDate,
        calendarAttrs,
        remainingForSelectedDate,

        // actions
        loadTodoList,
        loadMonthSummary,
        addTodo,
        toggleTodo,
        deleteTodo,
    };
}