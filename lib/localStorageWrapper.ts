const localStorageWrapper = {
  async get(key: string) {
    try {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  async set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  async list(prefix: string) {
    try {
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith(prefix));
      return { keys };
    } catch (error) {
      console.error('Error listing keys from localStorage:', error);
      return { keys: [] };
    }
  }
};

if (typeof window !== 'undefined') {
  window.storage = localStorageWrapper;
}

export default localStorageWrapper;