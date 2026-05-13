'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function decodeBase64Url(base64Url: string): Uint8Array {
  const padded = `${base64Url}${'='.repeat((4 - (base64Url.length % 4)) % 4)}`;
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const bytes = new Uint8Array(raw.length);

  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index);
  }

  return bytes;
}

export function PwaManager() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    let installEvent: BeforeInstallPromptEvent | null = null;
    let isRefreshing = false;

    const handleControllerChange = () => {
      if (isRefreshing) {
        return;
      }

      isRefreshing = true;
      window.location.reload();
    };

    const showUpdateToast = (registration: ServiceWorkerRegistration) => {
      toast.info('A new version is ready.', {
        action: {
          label: 'Update',
          onClick: () => {
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
          },
        },
        duration: 12000,
      });
    };

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

        if (registration.waiting) {
          showUpdateToast(registration);
        }

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;

          if (!worker) {
            return;
          }

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateToast(registration);
            }
          });
        });
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };

    const subscribeToPush = async () => {
      if (!VAPID_PUBLIC_KEY) {
        return;
      }

      if (!('PushManager' in window) || !('Notification' in window)) {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          return;
        }

        const serverKey = Uint8Array.from(decodeBase64Url(VAPID_PUBLIC_KEY));

        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: serverKey,
        });
      } catch (error) {
        console.error('Push subscription failed:', error);
      }
    };

    const installHandler = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      installEvent = promptEvent;

      toast('Install DineFlow for faster access.', {
        action: {
          label: 'Install',
          onClick: async () => {
            if (!installEvent) {
              return;
            }

            await installEvent.prompt();
            installEvent = null;
          },
        },
        duration: 10000,
      });
    };

    registerServiceWorker();
    subscribeToPush();
    window.addEventListener('beforeinstallprompt', installHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', installHandler);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  return null;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}
