import { ref, computed, onBeforeUnmount } from "vue";

export function useSessionTimer({ onExpired }) {
    const remainingSeconds = ref(0);
    let timer = null;

    const remainingTimeFormatted = computed(() => {
        const sec = Math.max(0, remainingSeconds.value);
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    });

    function stop() {
        if (timer) clearInterval(timer);
        timer = null;
        remainingSeconds.value = 0;
    }

    function start(seconds = 60 * 60) {
        remainingSeconds.value = seconds;
        if (timer) clearInterval(timer);

        timer = setInterval(() => {
        remainingSeconds.value--;
        if (remainingSeconds.value <= 0) {
            stop();
            onExpired?.();
        }
        }, 1000);
    }

    function reset(seconds = 60 * 60) {
        remainingSeconds.value = seconds;
    }

    onBeforeUnmount(() => stop());

    return {
        remainingSeconds,
        remainingTimeFormatted,
        start,
        stop,
        reset,
    };
}