<script>
  import { onMount, onDestroy } from 'svelte';
  import { onAuthStateChanged } from 'firebase/auth';
  import { auth } from '../firebase';
  import authStore from '../stores/authStore';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let unsubscribeAuth;
  let currentPath = '/';

  // Subscribe to page changes
  $: if ($page?.url?.pathname) {
    currentPath = $page.url.pathname;
  }

  onMount(() => {
    // Get initial path
    if ($page?.url?.pathname) {
      currentPath = $page.url.pathname;
    }

    unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      const publicPaths = ['/login', '/signup'];
      const isPublicPath = publicPaths.includes(currentPath);

      if (user) {
        // User is logged in
        authStore.set({
          isLoggedIn: true,
          firebaseControlled: true,
          user
        });

        // Redirect to dashboard if on login/signup page
        if (isPublicPath) {
          console.log('User logged in, redirecting to dashboard');
          setTimeout(() => {
            goto('/');
          }, 100);
        }
      } else {
        // User is logged out
        authStore.set({
          isLoggedIn: false,
          firebaseControlled: true,
          user: null
        });

        // Redirect to login if on protected page
        if (!isPublicPath) {
          console.log('User logged out, redirecting to login');
          goto('/login');
        }
      }
    });
  });

  onDestroy(() => {
    if (unsubscribeAuth) unsubscribeAuth();
  });
</script>

<svelte:head>
  <link 
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
    rel="stylesheet"
  >
  <link 
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" 
    rel="stylesheet"
  >
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</svelte:head>

<slot />