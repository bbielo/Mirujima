<template>
    <div class="panel">
        <div class="panel-head">
        <div class="panel-title">Todo</div>
        <div class="panel-sub">{{ selectedDate }}</div>
        </div>

        <form class="todo-form" @submit.prevent="$emit('add')">
        <InputBase v-model="titleModel" placeholder="할 일 입력" />
        <ButtonBase variant="primary" @click="$emit('add')">+</ButtonBase>
        </form>

        <ul class="todo-list">
        <li v-for="todo in todoList" :key="todo._id" class="todo-item">
            <input type="checkbox" :checked="todo.done" @change="$emit('toggle', todo)" />

            <template v-if="editId !== todo._id">
            <span class="todo-text" :class="{ done: todo.done }">{{ todo.title }}</span>

            <div class="todo-actions">
                <button class="link-btn" @click="$emit('startEdit', todo)" type="button">수정</button>
                <button class="link-btn danger" @click="$emit('remove', todo._id)" type="button">삭제</button>
            </div>
            </template>

            <template v-else>
            <InputBase v-model="editModel" />
            <div class="todo-actions">
                <button class="link-btn" type="button" @click="$emit('save', todo._id)">저장</button>
                <button class="link-btn" type="button" @click="$emit('cancel')">취소</button>
            </div>
            </template>
        </li>
        </ul>
    </div>
</template>

<script setup>
import { computed } from "vue";
import InputBase from "../common/input/InputBase.vue";
import ButtonBase from "../common/button/ButtonBase.vue";

const props = defineProps({
    todoList: { type: Array, default: () => [] },
    newTitle: { type: String, default: "" },
    editTitle: { type: String, default: "" },
    editId: { type: [String, Number, null], default: null },
    selectedDate: { type: String, default: "" },
});

const emit = defineEmits([
    "update:newTitle",
    "update:editTitle",
    "add",
    "toggle",
    "remove",
    "startEdit",
    "save",
    "cancel",
]);

const titleModel = computed({
    get: () => props.newTitle,
    set: (v) => emit("update:newTitle", v),
});

const editModel = computed({
    get: () => props.editTitle,
    set: (v) => emit("update:editTitle", v),
});
</script>