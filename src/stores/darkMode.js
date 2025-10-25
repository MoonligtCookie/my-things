import { writable } from 'svelte/store';

export const darkMode = writable(false);

// In your component
function toggleDarkMode() {
  darkMode.update(mode => {
    const newMode = !mode;
    document.documentElement.setAttribute('data-bs-theme', newMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', newMode.toString());
    return newMode;
  });
}