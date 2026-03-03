<template>
  <div class="panel">
    <div class="panel-head">
      <div class="panel-title">캘린더</div>
      <div class="panel-sub">
        <strong>선택 날짜</strong>
        <span style="color:#555;">{{ selectedDate }}</span>
      </div>
    </div>

    <div class="calendar-wrap">
      <VDatePicker
        v-model="dateProxy"
        mode="date"
        is-required
        :columns="1"
        :attributes="calendarAttrs"
        :initial-page="initialPage"
        @update:pages="onUpdatePages"
      />
    </div>

    <div class="panel-foot">
      남은 할 일 <strong>{{ remaining }}</strong>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  selectedDateObj: { type: [Date, String, Number], required: true },
  selectedDate: { type: String, default: "" },
  remaining: { type: Number, default: 0 },
  calendarAttrs: { type: Array, default: () => [] },
  // 초기 표시 월(선택 날짜 기준으로 맞추고 싶을 때)
  initialPage: {
    type: Object,
    default: () => {
      const d = new Date();
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    },
  },
});

const emit = defineEmits(["update:selectedDateObj", "monthChange"]);

const dateProxy = computed({
  get: () => props.selectedDateObj,
  set: (v) => emit("update:selectedDateObj", v),
});

// 같은 월이면 중복 호출 방지
const lastEmittedMonth = ref("");

function toMonthStr(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

// v-calendar 3.x: 월 이동/네비게이션 변화는 update:pages로 감지
function onUpdatePages(pages) {
  if (!Array.isArray(pages) || pages.length === 0) return;

  const first = pages[0];
  const monthStr = toMonthStr(first.year, first.month);

  if (monthStr === lastEmittedMonth.value) return;
  lastEmittedMonth.value = monthStr;

  emit("monthChange", monthStr);
}
</script>