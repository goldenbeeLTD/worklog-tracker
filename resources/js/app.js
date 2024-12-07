import './bootstrap';
import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import Skeleton from 'primevue/skeleton';
import Button from "primevue/button";

const app = createApp(App)

app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.component('Skeleton', Skeleton);
app.component('Button', Button);
app.use(PrimeVue);
app.use(router);
app.mount('#app')