<script>
  import { addDoc, collection, Timestamp } from 'firebase/firestore';
  import { db } from '../firebase';
  import authStore from '../stores/authStore';
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let showModal = false;
  let actionTitle = '';
  let actionDescription = '';
  let loading = false;
  let error = '';
  let success = false;
  
  async function addQuickAction() {
    if (!actionTitle.trim()) {
      error = 'Please enter a title';
      return;
    }
    
    if (!$authStore.user) {
      error = 'You must be logged in to add activities';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'activities'), {
        userId: $authStore.user.uid,
        title: actionTitle.trim(),
        description: actionDescription.trim(),
        timestamp: Timestamp.fromDate(now),
        type: 'quick_action',
        createdAt: now
      });
      
      console.log('Activity added successfully with ID:', docRef.id);
      
      // Show success message
      success = true;
      
      // Dispatch event to refresh activity feed
      dispatch('activityAdded');
      
      // Reset form
      actionTitle = '';
      actionDescription = '';
      
      // Close modal after a short delay
      setTimeout(() => {
        showModal = false;
        success = false;
      }, 1000);
      
    } catch (err) {
      console.error('Error adding activity:', err);
      error = `Failed to add activity: ${err.message}`;
    }
    
    loading = false;
  }
  
  function closeModal() {
    showModal = false;
    actionTitle = '';
    actionDescription = '';
    error = '';
    success = false;
  }
</script>

<div class="card h-100 shadow-sm border-0">
  <div class="card-header bg-transparent">
    <h5 class="card-title mb-0">
      <i class="bi bi-lightning me-2"></i>
      Quick Actions
    </h5>
  </div>
  <div class="card-body">
    <div class="d-grid gap-2">
      <button 
        class="btn btn-outline-primary" 
        on:click={() => showModal = true}
        type="button"
      >
        <i class="bi bi-plus-circle me-2"></i>
        Add Activity
      </button>
      <button class="btn btn-outline-success" type="button">
        <i class="bi bi-file-earmark-plus me-2"></i>
        Create Report
      </button>
      <button class="btn btn-outline-info" type="button">
        <i class="bi bi-gear me-2"></i>
        Settings
      </button>
    </div>
  </div>
</div>

{#if showModal}
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add New Activity</h5>
          <button 
            type="button" 
            class="btn-close" 
            on:click={closeModal}
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          {#if error}
            <div class="alert alert-danger" role="alert">
              {error}
            </div>
          {/if}
          
          {#if success}
            <div class="alert alert-success" role="alert">
              Activity added successfully!
            </div>
          {/if}
          
          <form on:submit|preventDefault={addQuickAction}>
            <div class="mb-3">
              <label for="actionTitle" class="form-label">Title <span class="text-danger">*</span></label>
              <input 
                type="text" 
                class="form-control" 
                id="actionTitle"
                bind:value={actionTitle}
                placeholder="Enter activity title"
                required
                disabled={loading || success}
                autofocus
              />
            </div>
            <div class="mb-3">
              <label for="actionDescription" class="form-label">Description</label>
              <textarea 
                class="form-control" 
                id="actionDescription"
                rows="3"
                bind:value={actionDescription}
                placeholder="Enter activity description (optional)"
                disabled={loading || success}
              ></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            on:click={closeModal}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            on:click={addQuickAction}
            disabled={loading || success || !actionTitle.trim()}
          >
            {#if success}
              <i class="bi bi-check-circle me-1"></i> Added!
            {:else if loading}
              <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Adding...
            {:else}
              <i class="bi bi-plus-circle me-1"></i> Add Activity
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}