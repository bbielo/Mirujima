<template>
    <div class="auth-form">
        <div class="field">
        <label>아이디</label>
        <InputBase v-model="u" placeholder="아이디" :disabled="loading" />
        </div>

        <div class="field">
        <label>비밀번호</label>
        <InputBase v-model="p" type="password" placeholder="비밀번호" :disabled="loading" @enter="$emit('register')" />
        </div>

        <div class="actions">
        <ButtonBase variant="primary" :disabled="loading" @click="$emit('register')">회원가입</ButtonBase>
        </div>

        <p v-if="error" class="msg error">{{ error }}</p>
        <p v-if="info" class="msg info">{{ info }}</p>
    </div>
</template>

<script setup>
import { computed } from "vue";
import InputBase from "../common/input/InputBase.vue";
import ButtonBase from "../common/button/ButtonBase.vue";

const props = defineProps({
    username: { type: String, default: "" },
    password: { type: String, default: "" },
    loading: { type: Boolean, default: false },
    error: { type: String, default: "" },
    info: { type: String, default: "" },
});

const emit = defineEmits(["update:username", "update:password", "register"]);

const u = computed({
    get: () => props.username,
    set: (v) => emit("update:username", v),
});
const p = computed({
    get: () => props.password,
    set: (v) => emit("update:password", v),
});
</script>