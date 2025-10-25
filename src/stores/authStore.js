import { writable } from 'svelte/store';

const authStore = writable({
  isLoggedIn: false,
  firebaseControlled: false,
  user: null
});

export default authStore;