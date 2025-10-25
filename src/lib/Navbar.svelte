<script>
  import { signOut } from 'firebase/auth';
  import { auth } from '../firebase';
  import authStore from '../stores/authStore';
  import { goto } from '$app/navigation';
  let dropdownRef;
  let menuOpen = false;

  async function logout() {
    try {
      console.log('Logging out...');
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Update authStore
      authStore.set({
        isLoggedIn: false,
        firebaseControlled: true,
        user: null
      });
      
      console.log('Logout successful, redirecting to login...');
      
      // Redirect to login page
      await goto('/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  }

  function navTo(path) {
    goto(path);
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }

  function handleWindowClick(event) {
    if (dropdownRef && !dropdownRef.contains(event.target)) {
      menuOpen = false;
    }
  }
</script>

<svelte:window on:click={handleWindowClick} />

<nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
  <div class="container">
    <button 
      class="navbar-brand fw-bold btn btn-link p-0 text-white text-decoration-none" 
      on:click={() => navTo('/')}
      type="button"
    >
      <i class="bi bi-speedometer2 me-2"></i>
      My Dashboard
    </button>
    
    <button 
      class="navbar-toggler" 
      type="button" 
      data-bs-toggle="collapse" 
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav me-auto">
        <li class="nav-item">
          <button 
            class="nav-link btn btn-link text-white text-decoration-none" 
            on:click={() => navTo('/')}
            type="button"
          >
            <i class="bi bi-house me-1"></i>
            Dashboard
          </button>
        </li>
        <li class="nav-item">
          <button 
            class="nav-link btn btn-link text-white text-decoration-none" 
            on:click={() => navTo('/analytics')}
            type="button"
          >
            <i class="bi bi-graph-up me-1"></i>
            Analytics
          </button>
        </li>
        <li class="nav-item">
          <button 
            class="nav-link btn btn-link text-white text-decoration-none" 
            on:click={() => navTo('/profile')}
            type="button"
          >
            <i class="bi bi-person me-1"></i>
            Profile
          </button>
        </li>
      </ul>
      
      <div class="navbar-nav">
        <div class="nav-item dropdown" bind:this={dropdownRef} class:show={menuOpen}>
          <button 
            class="nav-link btn btn-link text-white text-decoration-none d-flex align-items-center dropdown-toggle"
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            on:click={toggleMenu}
          >
            <i class="bi bi-person-circle me-1"></i>
            {$authStore.user?.email || 'User'}
          </button>
          <ul class="dropdown-menu dropdown-menu-end" class:show={menuOpen}>
            <li>
              <button 
                class="dropdown-item" 
                on:click={() => { closeMenu(); navTo('/profile'); }}
                type="button"
              >
                <i class="bi bi-person me-2"></i>
                Profile Settings
              </button>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <button 
                class="dropdown-item" 
                on:click={() => { closeMenu(); logout(); }}
                type="button"
              >
                <i class="bi bi-box-arrow-right me-2"></i>
                Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</nav>

<style>
  .btn-link {
    border: none;
    background: none;
    cursor: pointer;
  }
  
  .btn-link:hover {
    opacity: 0.8;
  }
  
  .nav-link.btn-link {
    padding: 0.5rem 1rem;
  }
  
  .dropdown-item {
    cursor: pointer;
  }
</style>