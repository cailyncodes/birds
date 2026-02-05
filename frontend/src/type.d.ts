export {};

declare global {
  interface Window {
    cookieStore: any; // or specify a more precise type if known
  }
}
