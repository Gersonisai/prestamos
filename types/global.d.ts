interface Storage {
  get(key: string): Promise<{ value: string }>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  list(prefix: string): Promise<{ keys: string[] }>;
}

interface Window {
  storage: Storage;
  html2canvas?: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
}

declare global {
  interface Window {
    storage: Storage;
    html2canvas?: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  }
}