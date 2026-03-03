import { ref, computed, watch, onMounted } from "vue";
import {
    fetchTodosApi,
    addTodoApi,
    toggleTodoApi,
    deleteTodoApi,
    editTodoApi,
    fetchMonthSummaryApi,
} from "../configs/todo";

function toMonthStr(year, month) {
    return `${year}-${String(month).padStart(2, "0")}`;
}

function getYMFromDate(d) {
    const date = d instanceof Date ? d : new Date(d);
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function useTodos({ tokenRef, authHeaderFn, onUnauthorized }) {
    const todoList = ref([]);
    const newTitle = ref("");

    const editId = ref(null);
    const editTitle = ref("");

    const selectedDateObj = ref(new Date());

    // 현재 달력에서 보고 있는 월(YYYY-MM)
    const currentMonth = ref(toMonthStr(new Date().getFullYear(), new Date().getMonth() + 1));

    // summary map: YYYY-MM-DD -> { total, remaining }
    const monthRemainingMap = ref({});

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

    const remainingForSelectedDate = computed(() => {
        return monthRemainingMap.value[selectedDate.value]?.remaining ?? 0;
    });

    // dot + popover
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
            dot: { color: remaining === 0 ? "green" : "red" },
            popover: { label: remaining === 0 ? "모두 완료" : `${remaining}개 남음` },
        });
        }

        return attrs;
    });

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

    // monthStr = YYYY-MM
    async function loadMonthSummary(monthStr) {
        if (!tokenRef.value) return;

        currentMonth.value = monthStr;

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

    // CRUD
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
        const res = await deleteTodoApi({
        id,
        authHeader: authHeaderFn(),
        });

        if (res?.__unauthorized) return onUnauthorized?.();

        await loadTodoList();
        await loadMonthSummary(currentMonth.value);
    }

    function startEdit(todo) {
        editId.value = todo._id;
        editTitle.value = todo.title;
    }

    function cancelEdit() {
        editId.value = null;
        editTitle.value = "";
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

    // ===== watchers =====
    // 날짜 바뀌면 해당 날짜 todo 다시 로드
    watch(selectedDateObj, () => {
        if (!tokenRef.value) return;
        loadTodoList();
    });

    // 초기 진입: 선택 날짜의 달을 currentMonth로 맞추고 summary 로드
    onMounted(async () => {
        if (!tokenRef.value) return;

        const { year, month } = getYMFromDate(selectedDateObj.value);
        const initMonth = toMonthStr(year, month);

        await loadTodoList();
        await loadMonthSummary(initMonth);
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
        selectedDate,
        calendarAttrs,
        remainingForSelectedDate,

        // month summary (MainCalendar monthChange에서 호출)
        loadMonthSummary,

        // actions
        addTodo,
        toggleTodo,
        deleteTodo,
    };
}