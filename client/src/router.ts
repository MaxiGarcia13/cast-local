import { createRouter, createWebHistory } from 'vue-router';
import PickApp from '@/components/pick-app.vue';
import RoomGuestView from '@/views/room-guest-view.vue';
import RoomHostView from '@/views/room-host-view.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: PickApp },
    { path: '/room/:id', name: 'room-host', component: RoomHostView },
    { path: '/room/:id/join', name: 'room-guest', component: RoomGuestView },
  ],
});
