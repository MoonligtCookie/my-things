<script>
  import { createUserWithEmailAndPassword } from 'firebase/auth';
  import { auth } from '../firebase';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import authStore from '../stores/authStore';

  let email = "";
  let password = "";
  let confirmPassword = "";
  let loading = false;
  let error = "";
  let redirecting = false;

  // Check if already logged in on mount
  onMount(() => {
    if ($authStore.isLoggedIn) {
      goto('/');
    }
  });

  async function register() {
    // Reset error at the start
    error = "";
    
    email = email.trim();
    password = password.trim();
    confirmPassword = confirmPassword.trim();

    if (password !== confirmPassword) {
      error = "Passwords do not match.";
      return;
    }
    
    if (password.length < 6) {
      error = "Password must be at least 6 characters long.";
      return;
    }
    
    loading = true;
    
    try { 
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Account created successfully:', userCredential.user.email);
      
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
      
    } catch(err) {
      if (err.code === 'auth/email-already-in-use') {
        error = "An account with this email already exists.";
      } else if (err.code === 'auth/weak-password') {
        error = "Password is too weak. Please choose a stronger password.";
      } else if (err.code === 'auth/invalid-email') {
        error = "Please enter a valid email address.";
      } else {
        error = "Failed to create account. Please try again.";
      }
      console.error('Signup error:', err);
      loading = false;
    }
  }
  
  function goToLogin() {
    goto('/login');
  }
</script>

<svelte:head>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
</svelte:head>

<div class="container d-flex justify-content-center align-items-center min-vh-100">
  <div class="card shadow-lg" style="width:28rem">
    <div class="card-body p-5">
      <div class="text-center mb-4">
        <h2 class="card-title fw-bold">Create Account</h2>
        <p class="card-text text-muted">Join us and start tracking your progress</p>
      </div>
      
      {#if error}
        <div class="alert alert-danger" role="alert">
          {error}
        </div>
      {/if}
      
      {#if redirecting}
        <div class="alert alert-success" role="alert">
          Account created! Redirecting to dashboard...
        </div>
      {/if}
      
      <form on:submit|preventDefault={register}>
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
        
        <div class="mb-3">
          <label for="passwordInput" class="form-label">Password</label>
          <input
            bind:value={password}
            type="password"
            class="form-control form-control-lg"
            id="passwordInput"
            placeholder="Create a password"
            autocomplete="new-password"
            required
            disabled={loading || redirecting}
          />
        </div>
        
        <div class="mb-3">
          <label for="confirmPasswordInput" class="form-label">Confirm Password</label>
          <input
            bind:value={confirmPassword}
            type="password"
            class="form-control form-control-lg"
            id="confirmPasswordInput"
            placeholder="Confirm your password"
            autocomplete="new-password"
            required
            disabled={loading || redirecting}
          />
        </div>
        
        <div class="form-text mb-3">
          Your password must be at least 6 characters long.
        </div>
        
        <button 
          type="submit" 
          class="btn btn-success btn-lg w-100 mb-3"
          disabled={loading || redirecting}
        >
          {#if redirecting}
            Redirecting...
          {:else if loading}
            Creating Account...
          {:else}
            Create Account
          {/if}
        </button>
      </form>
    </div>
    
    <div class="card-footer text-center bg-light">
      <small class="text-muted">
        Already have an account? 
        <button 
          class="btn btn-link p-0 text-decoration-none" 
          on:click={goToLogin}
          type="button"
          disabled={loading || redirecting}
        >
          Sign in here
        </button>
      </small>
    </div>
  </div>
</div>