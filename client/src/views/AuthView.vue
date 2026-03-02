<template>
    <div class="auth-card">
        <div class="auth-left">
        <h1 class="brand-title">
            <span class="accent">미루지마!</span>
        </h1>

        <div class="auth-tabs">
            <button class="tab" :class="{ active: mode === 'login' }" @click="mode = 'login'">
            로그인
            </button>
            <button class="tab" :class="{ active: mode === 'register' }" @click="mode = 'register'">
            회원가입
            </button>
        </div>

        <LoginForm
            v-if="mode === 'login'"
            v-model:username="authUsername"
            v-model:password="authPassword"
            :loading="authLoading"
            :error="authError"
            :info="authInfo"
            @login="onLogin"
        />

        <RegisterForm
            v-else
            v-model:username="authUsername"
            v-model:password="authPassword"
            :loading="authLoading"
            :error="authError"
            :info="authInfo"
            @register="onRegister"
        />
        </div>

        <div class="auth-right">
        <div class="auth-right-overlay"></div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";

import LoginForm from "../components/auth/LoginForm.vue";
import RegisterForm from "../components/auth/RegisterForm.vue";

const router = useRouter();
const mode = ref("login");

const {
    authUsername,
    authPassword,
    authLoading,
    authError,
    authInfo,
    register,
    login,
    } = useAuth();

    async function onLogin() {
    await login();
    router.replace("/main");
    }

    async function onRegister() {
    await register();
    mode.value = "login";
}
</script>