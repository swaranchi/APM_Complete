// src/crypto.js

// Convert text to ArrayBuffer
function enc(str) {
  return new TextEncoder().encode(str);
}

// Convert base64 to ArrayBuffer
function b64ToBuf(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

// Convert ArrayBuffer to base64
function bufToB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export async function deriveKey(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc(password), { name: "PBKDF2" }, false, ["deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-CBC", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptItem(masterPassword, dataObj) {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(masterPassword, salt);

  const plaintext = enc(JSON.stringify(dataObj));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, plaintext);

  return {
    encrypted_blob: bufToB64(ciphertext),
    enc_iv: bufToB64(iv),
    kdf_params: { salt: bufToB64(salt), iterations: 100000, hash: "SHA-256" }
  };
}
