import { createRouter, createWebHistory } from 'vue-router';
import JoinApp from '@/components/join-app.vue';
import PickApp from '@/components/pick-app.vue';
import RoomView from '@/views/room-view.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: PickApp },
    { path: '/join', name: 'join', component: JoinApp },
    { path: '/room/:id', name: 'room-host', component: RoomView },
    { path: '/room/:id/join', name: 'room-guest', component: RoomView },
  ],
});
