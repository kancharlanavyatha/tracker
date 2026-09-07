/**
 * Zero-Knowledge Client-Side Cryptographic Vault
 * Implements AES-GCM-256 encryption with PBKDF2 key derivation (100,000 rounds of SHA-256).
 * All encryption and decryption occurs strictly in the client's browser.
 * Plaintext thoughts, notes, and attached photos NEVER leave the device unencrypted.
 */

export type JournalPayload = {
  title: string;
  body: string;
  mood?: string;
  phase?: string;
  images?: string[]; // Base64 data URLs (e.g. data:image/jpeg;base64,...)
  updatedAt?: string;
};

export type DecryptedJournalEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  tag?: string | null;
  created_at: string;
  updated_at: string;
  raw_cipher: {
    encrypted_payload: string;
    iv: string;
    salt: string;
  };
  payload: JournalPayload;
};

// Binary / Base64 conversions
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives an AES-GCM-256 key from a passphrase and salt using PBKDF2 with 100,000 iterations.
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypts a journal payload client-side into AES-GCM-256 ciphertext.
 */
export async function encryptJournalPayload(
  passphrase: string,
  payload: JournalPayload,
): Promise<{ encrypted_payload: string; iv: string; salt: string }> {
  const enc = new TextEncoder();
  const jsonStr = JSON.stringify(payload);
  const plaintextBytes = enc.encode(jsonStr);

  // Generate random 16-byte salt and 12-byte IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(passphrase, salt);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    plaintextBytes,
  );

  return {
    encrypted_payload: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
  };
}

/**
 * Decrypts an AES-GCM-256 ciphertext blob into a journal payload.
 */
export async function decryptJournalPayload(
  passphrase: string,
  encrypted_payload: string,
  iv: string,
  salt: string,
): Promise<JournalPayload> {
  const saltBytes = base64ToBuffer(salt);
  const ivBytes = base64ToBuffer(iv);
  const cipherBytes = base64ToBuffer(encrypted_payload);

  const key = await deriveKey(passphrase, saltBytes);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBytes,
    },
    key,
    cipherBytes,
  );

  const dec = new TextDecoder();
  const jsonStr = dec.decode(decryptedBuffer);
  return JSON.parse(jsonStr) as JournalPayload;
}

/**
 * Compresses an image file in the browser using HTML5 Canvas.
 * Downscales dimensions to a maximum width/height to ensure rapid encryption and lightweight SQLite storage.
 */
export function compressImageToBase64(
  file: File,
  maxDimension: number = 960,
  quality: number = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image content"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 2D context unavailable"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
