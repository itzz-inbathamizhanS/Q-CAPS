// The one place that decides where the main API lives. Every client (services, admin, lesson, WebSocket) imports
// from here.
//
// Development falls back to the local backend. A production build never does: a visitor's own machine is not the
// API. vite.config.ts refuses to build for production without VITE_API_BASE_URL, and if a build somehow lacks it
// the base is empty, so requests fail visibly instead of silently reaching localhost.
const configured: string | undefined = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL: string = (configured || (import.meta.env.PROD ? '' : 'http://localhost:8000/api')).replace(/\/+$/, '');

/** WebSocket base for the same API: http -> ws, https -> wss (no mixed content under HTTPS). */
export const WS_BASE_URL: string = API_BASE_URL.replace(/^http(s?):\/\//i, (_m, s: string) => `ws${s}://`);
