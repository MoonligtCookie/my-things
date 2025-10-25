<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { collection, query, where, getDocs } from 'firebase/firestore';
  import { db } from '../firebase';
  import authStore from '../stores/authStore';
  import Navbar from '$lib/Navbar.svelte';
  import DashboardCard from '$lib/DashboardCard.svelte';
  import ActivityFeed from '$lib/ActivityFeed.svelte';
  import QuickActions from '$lib/QuickActions.svelte';

  let stats = {
    totalActivities: 0,
    thisMonth: 0,
    completedTasks: 0,
    activeProjects: 3
  };

  let loading = true;
  let activityFeedKey = 0; // Key to force re-render

  onMount(async () => {
    // Redirect if not logged in
    if (!$authStore.isLoggedIn) {
      await goto('/login');
      return;
    }

    if ($authStore?.user) {
      await loadDashboardData();
    }
    loading = false;
  });

  async function loadDashboardData() {
    try {
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', '==', $authStore.user.uid)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);

      stats.totalActivities = activitiesSnapshot.size;

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      stats.thisMonth = activitiesSnapshot.docs.filter(doc => {
        const timestamp = doc.data().timestamp?.toDate();
        return timestamp && timestamp >= thisMonth;
      }).length;

      stats.completedTasks = Math.floor(stats.totalActivities * 0.7);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }
  
  function handleActivityAdded() {
    console.log('Activity added, refreshing...');
    loadDashboardData();
    activityFeedKey += 1; // Force ActivityFeed to reload
  }
</script>

<svelte:head>
  <title>My Dashboard</title>
</svelte:head>

{#if !$authStore.isLoggedIn}
  <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
{:else}
  <Navbar />

  <main class="container-fluid py-4">
    {#if loading}
      <div class="d-flex justify-content-center align-items-center" style="height: 50vh;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    {:else}

      <div class="row mb-4">
        <div class="col-12">
          <div class="bg-gradient bg-primary text-white rounded-3 p-4">
            <h1 class="display-6 fw-bold mb-2">
              Welcome back, {$authStore.user?.email?.split('@')[0] || 'User'}! 👋
            </h1>
            <p class="lead mb-0">Here's what's happening with your projects today.</p>
          </div>
        </div>
      </div>
      
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <DashboardCard 
            title="Total Activities"
            value={stats.totalActivities.toString()}
            icon="activity"
            color="primary"
            trend={{ direction: 'up', percentage: 12 }}
          />
        </div>
        <div class="col-md-3">
          <DashboardCard 
            title="This Month"
            value={stats.thisMonth.toString()}
            icon="calendar-month"
            color="success"
            trend={{ direction: 'up', percentage: 8 }}
          />
        </div>
        <div class="col-md-3">
          <DashboardCard 
            title="Completed Tasks"
            value={stats.completedTasks.toString()}
            icon="check-circle"
            color="info"
            trend={{ direction: 'down', percentage: 3 }}
          />
        </div>
        <div class="col-md-3">
          <DashboardCard 
            title="Active Projects"
            value={stats.activeProjects.toString()}
            icon="folder"
            color="warning"
          />
        </div>
      </div>
      
      <div class="row g-4">
        <div class="col-lg-8">
          {#key activityFeedKey}
            <ActivityFeed />
          {/key}
        </div>
        <div class="col-lg-4">
          <QuickActions on:activityAdded={handleActivityAdded} />
        </div>
      </div>
      
      <div class="row g-4 mt-4">
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-transparent">
              <h5 class="card-title mb-0">
                <i class="bi bi-graph-up me-2"></i>
                Performance Overview
              </h5>
            </div>
            <div class="card-body">
              <div class="text-center py-5">
                <i class="bi bi-bar-chart fs-1 text-muted"></i>
                <p class="text-muted mt-2">Charts and analytics coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </main>

  <style>
    .bg-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .card {
      transition: transform 0.2s ease-in-out;
    }

    .card:hover {
      transform: translateY(-2px);
    }

    main {
      background-color: #f8f9fa;
      min-height: calc(100vh - 76px);
    }
  </style>
{/if}