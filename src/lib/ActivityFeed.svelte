<script>
  import { onMount, onDestroy } from 'svelte';
  import { collection, query, where, getDocs } from 'firebase/firestore';
  import { db } from '../firebase';
  import authStore from '../stores/authStore';
  
  let activities = [];
  let unsubscribe = null;
  let loading = true;
  let error = '';
  
  async function loadActivities() {
    if (!$authStore.user) return;
    
    try {
      loading = true;
      error = '';
      
      // Simple query without orderBy to avoid index issues
      const q = query(
        collection(db, 'activities'),
        where('userId', '==', $authStore.user.uid)
      );
      
      const snapshot = await getDocs(q);
      
      activities = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || data.createdAt?.toDate() || new Date()
        };
      });
      
      // Sort client-side
      activities.sort((a, b) => b.timestamp - a.timestamp);
      
      // Limit to 10
      activities = activities.slice(0, 10);
      
      console.log('Activities loaded:', activities);
      loading = false;
      
    } catch (err) {
      console.error('Error fetching activities:', err);
      error = err.message;
      loading = false;
    }
  }
  
  onMount(() => {
    loadActivities();
    
    // Refresh every 5 seconds to pick up new activities
    const interval = setInterval(loadActivities, 5000);
    
    return () => clearInterval(interval);
  });
  
  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
  
  function formatTime(timestamp) {
    if (!timestamp) return '';
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
</script>

<div class="card h-100 shadow-sm border-0">
  <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
    <h5 class="card-title mb-0">
      <i class="bi bi-activity me-2"></i>
      Recent Activity
    </h5>
    <button class="btn btn-sm btn-outline-secondary" on:click={loadActivities} disabled={loading}>
      <i class="bi bi-arrow-clockwise"></i>
    </button>
  </div>
  <div class="card-body p-0">
    {#if error}
      <div class="alert alert-danger m-3" role="alert">
        <strong>Error:</strong> {error}
        <br><small>Check console for details</small>
      </div>
    {/if}
    
    {#if loading}
      <div class="text-center py-4">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    {:else if activities.length > 0}
      <div class="list-group list-group-flush">
        {#each activities as activity}
          <div class="list-group-item border-0">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h6 class="mb-1">{activity.title}</h6>
                <p class="mb-1 text-muted small">{activity.description || 'No description'}</p>
              </div>
              <small class="text-muted">{formatTime(activity.timestamp)}</small>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center py-4">
        <i class="bi bi-inbox fs-1 text-muted"></i>
        <p class="text-muted mt-2">No recent activity</p>
        <p class="text-muted small">Add your first activity using Quick Actions</p>
      </div>
    {/if}
  </div>
</div>