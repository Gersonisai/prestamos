declare global {
  interface Window {
    storage: {
      get: (key: string) => Promise<{ value: string } | null>;
      set: (key: string, value: string) => Promise<void>;
      list: (prefix: string) => Promise<{ keys: string[] } | null>;
    };
  }
}

// Implementación del almacenamiento usando localStorage
if (typeof window !== 'undefined') {
  window.storage = {
    async get(key: string) {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    },
    async set(key: string, value: string) {
      localStorage.setItem(key, value);
    },
    async list(prefix: string) {
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith(prefix));
      return { keys };
    }
  };
}

export {};