<script>
  import { signInWithEmailAndPassword } from 'firebase/auth';
  import { auth } from '../firebase';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import authStore from '../stores/authStore';

  let email = "";
  let password = "";
  let loading = false;
  let error = "";
  let redirecting = false;

  // Check if already logged in on mount
  onMount(() => {
    if ($authStore.isLoggedIn) {
      goto('/');
    }
  });

  async function login() {
    // Reset error at the start
    error = "";
    
    email = email.trim();
    password = password.trim();

    loading = true;
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.email);
      
      // Update auth store immediately
      authStore.set({
        isLoggedIn: true,
        firebaseControlled: true,
        user: userCredential.user
      });
      
      // Show redirecting message
      redirecting = true;
      
      // Redirect to dashboard
      setTimeout(() => {
        goto('/');
      }, 500);
      
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        error = "Invalid email or password. Please try again.";
      } else if (err.code === 'auth/invalid-email') {
        error = "Please enter a valid email address.";
      } else {
        error = "Failed to log in. Please try again.";
      }
      console.error('Login error:', err);
      loading = false;
    }
  }
  
  function goToSignup() {
    goto('/signup');
  }
</script>

<svelte:head>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
</svelte:head>

<!-- Login Form UI -->
<div class="container d-flex justify-content-center align-items-center min-vh-100">
  <div class="card shadow-lg" style="width: 28rem;">
    <div class="card-body p-5">
      <div class="text-center mb-4">
        <h2 class="card-title fw-bold">Welcome Back</h2>
        <p class="card-text text-muted">Please log in to continue to your dashboard</p>
      </div>
      
      {#if error}
        <!-- Error message alert -->
        <div class="alert alert-danger" role="alert" aria-live="assertive">
          {error}
        </div>
      {/if}
      
      {#if redirecting}
        <div class="alert alert-success" role="alert">
          Login successful! Redirecting to dashboard...
        </div>
      {/if}
      
      <!-- Login form -->
      <form on:submit|preventDefault={login}>
        <!-- Email Input -->
        <div class="mb-3">
          <label for="emailInput" class="form-label">Email address</label>
          <input 
            bind:value={email} 
            type="email" 
            class="form-control form-control-lg" 
            id="emailInput" 
            placeholder="Enter your email"
            autocomplete="email"
            autofocus
            required
            disabled={loading || redirecting}
          />
        </div>

        <!-- Password Input -->
        <div class="mb-3">
          <label for="passwordInput" class="form-label">Password</label>
          <input
            bind:value={password}
            type="password"
            class="form-control form-control-lg"
            id="passwordInput"
            placeholder="Enter your password"
            autocomplete="current-password"
            required
            disabled={loading || redirecting}
          />
        </div>

        <div class="form-text mb-3">
          Your password must be at least 6 characters long.
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          class="btn btn-primary btn-lg w-100 mb-3"
          disabled={loading || redirecting}
        >
          {#if redirecting}
            Redirecting...
          {:else if loading}
            Signing in...
          {:else}
            Sign In
          {/if}
        </button>
      </form>
    </div>

    <!-- Footer Link -->
    <div class="card-footer text-center bg-light">
      <small class="text-muted">
        First time? 
        <button 
          class="btn btn-link p-0 text-decoration-none" 
          on:click={goToSignup}
          type="button"
          disabled={loading || redirecting}
        >
          Create an account
        </button>
      </small>
    </div>
  </div>
</div>