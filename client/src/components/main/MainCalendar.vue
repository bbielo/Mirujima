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
            v-model="dateModel"
            :page="calendarPage"
            @update:page="onUpdatePage"
            mode="date"
            is-required
            :columns="1"
            :attributes="calendarAttrs"
        />
        </div>

        <div class="panel-foot">
        남은 할 일 <strong>{{ remaining }}</strong>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    selectedDateObj: { type: [Date, String, Number], required: true },
    calendarPage: { type: Object, required: true },
    calendarAttrs: { type: Array, default: () => [] },
    selectedDate: { type: String, default: "" },
    remaining: { type: Number, default: 0 },
});

const emit = defineEmits(["update:selectedDateObj", "update:calendarPage"]);

const dateModel = computed({
    get: () => props.selectedDateObj,
    set: (v) => emit("update:selectedDateObj", v),
});

function onUpdatePage(p) {
    emit("update:calendarPage", { year: p.year, month: p.month });
}
</script>