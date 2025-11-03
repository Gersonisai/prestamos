import { HTMLCanvasElement, HTMLElement } from 'react';

export interface StorageInterface {
  get(key: string): Promise<{ value: string }>;
  set(key: string, value: string): Promise<void>;
  list(prefix: string): Promise<{ keys: string[] }>;
  remove(key: string): Promise<void>;
}

export interface Html2CanvasOptions {
  scale?: number;
  backgroundColor?: string;
  logging?: boolean;
  useCORS?: boolean;
  allowTaint?: boolean;
}

declare global {
  interface Window {
    storage: StorageInterface;
    html2canvas?: (element: HTMLElement, options?: Html2CanvasOptions) => Promise<HTMLCanvasElement>;
  }
}