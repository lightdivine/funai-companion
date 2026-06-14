/**
 * FUNAI Student Companion Portal - On-Device Cryptographic Vault
 * Securely encrypts and persists student credentials locally using Web Crypto API (AES-GCM).
 * ABSOLUTE RULE: Zero network transmission. Credentials stay sandboxed in device memory.
 */

const STORAGE_KEY = "funai_vault_secure_data";
const FINGERPRINT_KEY = "funai_vault_device_fingerprint";

interface EncryptedPayload {
  iv: string;
  salt: string;
  ciphertext: string;
}

export interface StudentCredentials {
  matricNumber: string;
  portalPassword: string;
}

/**
 * Generates or recovers a stable pseudo-device fingerprint key.
 * Combines hardware properties with a persisted hardware-locked random seed.
 */
function getDeviceFingerprintBase(): string {
  if (typeof window === "undefined") return "server-side-safe-fallback";

  let deviceSeed = localStorage.getItem(FINGERPRINT_KEY);
  if (!deviceSeed) {
    // Generate a high-entropy cryptographically secure random string as a hardware token
    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    deviceSeed = Array.from(array, (dec) => dec.toString(16).padStart(8, "0")).join("");
    localStorage.setItem(FINGERPRINT_KEY, deviceSeed);
  }

  const screenMetrics = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const hardwareConcurrency = window.navigator.hardwareConcurrency || 4;
  
  return `${deviceSeed}-${screenMetrics}-${hardwareConcurrency}`;
}

/**
 * Derives a secure cryptographic key using PBKDF2 from the device fingerprint base.
 */
async function deriveKey(saltBuffer: Uint8Array): Promise<CryptoKey> {
  const passwordString = getDeviceFingerprintBase();
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(passwordString),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts student credentials and stores them directly in localStorage.
 */
export async function saveCredentials(credentials: StudentCredentials): Promise<void> {
  try {
    if (typeof window === "undefined") return;

    const encoder = new TextEncoder();
    const dataToEncrypt = encoder.encode(JSON.stringify(credentials));

    // Generate random IV and Salt for derivation
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const salt = window.crypto.getRandomValues(new Uint8Array(16));

    const cryptoKey = await deriveKey(salt);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      cryptoKey,
      dataToEncrypt
    );

    const payload: EncryptedPayload = {
      iv: btoa(String.fromCharCode(...Array.from(iv))),
      salt: btoa(String.fromCharCode(...Array.from(salt))),
      ciphertext: btoa(String.fromCharCode(...Array.from(new Uint8Array(ciphertextBuffer)))),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Vault encryption failure:", error);
    throw new Error("We couldn't lock your details safely on this phone. Please check your storage settings and try again.");
  }
}

/**
 * Decrypts and reads the stored student credentials from local storage.
 * Returns null if no credentials exist or if verification fails.
 */
export async function getCredentials(): Promise<StudentCredentials | null> {
  try {
    if (typeof window === "undefined") return null;

    const rawPayload = localStorage.getItem(STORAGE_KEY);
    if (!rawPayload) return null;

    const payload: EncryptedPayload = JSON.parse(rawPayload);

    // Convert base64 strings back to Uint8Arrays
    const iv = new Uint8Array(atob(payload.iv).split("").map((c) => c.charCodeAt(0)));
    const salt = new Uint8Array(atob(payload.salt).split("").map((c) => c.charCodeAt(0)));
    const ciphertext = new Uint8Array(atob(payload.ciphertext).split("").map((c) => c.charCodeAt(0)));

    const cryptoKey = await deriveKey(salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      cryptoKey,
      ciphertext
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decryptedBuffer)) as StudentCredentials;
  } catch (error) {
    console.warn("Vault decryption failure (likely device fingerprint variance or database reset):", error);
    return null;
  }
}

/**
 * Wipes out credentials completely from storage. Use case: Logout or security reset.
 */
export function clearCredentials(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if secure credentials currently exist on device.
 */
export function hasCredentialsSaved(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}