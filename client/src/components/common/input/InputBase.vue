<template>
    <input
        class="input"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)"
        @keydown.enter="$emit('enter')"
    />
</template>

<script setup>
defineProps({
    modelValue: { type: String, default: "" },
    type: { type: String, default: "text" },
    placeholder: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
});

defineEmits(["update:modelValue", "enter"]);
</script>