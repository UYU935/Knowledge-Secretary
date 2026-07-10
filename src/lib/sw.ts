import { Workbox } from 'workbox-window'

export function registerServiceWorker() {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js')
    wb.register()
  }
}
