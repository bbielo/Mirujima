<template>
  <button
    class="btn"
    :class="[variantClass, { disabled }]"
    :disabled="disabled"
    :type="type"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: { type: String, default: "default" },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: "button" },
});

defineEmits(["click"]);

const variantClass = computed(() => {
  if (props.variant === "primary") return "primary";
  if (props.variant === "ghost") return "ghost";
  return "default";
});
</script>