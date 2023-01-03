export const getNewKey = async () => {
    return await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            // Consider using a 4096-bit key for systems that require long-term security
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    )
}

export async function exportPvtKey(pvtKey: CryptoKey) {
    return JSON.stringify(await window.crypto.subtle.exportKey('jwk', pvtKey))
}

export async function exportPubKey(pubKey: CryptoKey){
    return JSON.stringify(await window.crypto.subtle.exportKey('jwk', pubKey))
}

export async function importPvtKey(pvtJwkKey: string) {
    return await window.crypto.subtle.importKey(
        "jwk",
        JSON.parse(pvtJwkKey),
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["decrypt"]
    );
}

export async function importPubKey(pubJwkKey: string): Promise<CryptoKey> {
    return await window.crypto.subtle.importKey(
        "jwk",
        JSON.parse(pubJwkKey),
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );
}

export async function encryptMessage(pubKey: CryptoKey, message: string) {
    let encoded = new TextEncoder().encode(message);
    let buffer =  await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        pubKey,
        encoded
    );
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}
export async function decryptMessage(pvtKey: CryptoKey, base64Str: string) {
    let decrypted = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP",
        },
        pvtKey,
        Uint8Array.from(atob(base64Str), c => c.charCodeAt(0))
    );
    return new TextDecoder().decode(decrypted);
}