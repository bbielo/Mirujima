import { ref, computed } from "vue";
import { loginApi, registerApi } from "../configs/auth";

export function useAuth() {
    const token = ref(sessionStorage.getItem("token") || "");
    const loggedInUser = ref(sessionStorage.getItem("username") || "");

    const authUsername = ref("");
    const authPassword = ref("");
    const authLoading = ref(false);
    const authError = ref("");
    const authInfo = ref("");

    const isLoggedIn = computed(() => !!token.value);

    function setAuthMessage({ error = "", info = "" } = {}) {
        authError.value = error;
        authInfo.value = info;
    }

    function authHeader() {
        return token.value ? { Authorization: `Bearer ${token.value}` } : {};
    }

    async function register() {
        setAuthMessage({});
        authLoading.value = true;
        try {
        await registerApi(authUsername.value.trim(), authPassword.value);
        setAuthMessage({ info: "회원가입 성공! 로그인해주세요." });
        } catch (e) {
        setAuthMessage({ error: e?.message || "회원가입 실패" });
        throw e;
        } finally {
        authLoading.value = false;
        }
    }

    async function login() {
        setAuthMessage({});
        authLoading.value = true;
        try {
        const data = await loginApi(authUsername.value.trim(), authPassword.value);
        token.value = data.token;
        loggedInUser.value = data.username || authUsername.value.trim();

        sessionStorage.setItem("token", token.value);
        sessionStorage.setItem("username", loggedInUser.value);

        setAuthMessage({ info: "" });
        return { token: token.value, username: loggedInUser.value };
        } catch (e) {
        setAuthMessage({ error: e?.message || "로그인 실패" });
        throw e;
        } finally {
        authLoading.value = false;
        }
    }

    function clearAuth() {
        token.value = "";
        loggedInUser.value = "";
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
    }

    return {
        token,
        loggedInUser,
        authUsername,
        authPassword,
        authLoading,
        authError,
        authInfo,
        isLoggedIn,
        setAuthMessage,
        authHeader,
        register,
        login,
        clearAuth,
    };
}