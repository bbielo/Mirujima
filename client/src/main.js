import { createApp } from "vue";
import App from "./App.vue";

import "./style.css";
import "v-calendar/style.css";

import VCalendar from "v-calendar";

createApp(App).use(VCalendar, {}).mount("#app");