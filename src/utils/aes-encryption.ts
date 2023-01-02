const counter = new TextEncoder().encode("xjsmsdfJFA*&()#%JDSFJ").slice(0,16)

export function getJSONMessageEncoding(data: any) {
    let message = JSON.stringify(data);
    let enc = new TextEncoder();
    return enc.encode(message);
}


export async function getNewKey() {
    return window.crypto.subtle.generateKey(
        {
            name: "AES-CTR",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function importKey(jwk: any) {
    return window.crypto.subtle.importKey(
        "jwk",
        jwk,
        {
            name: "AES-CTR",
        },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function getKey(): Promise<CryptoKey> {

    if (!window.localStorage.getItem("aesKey")) {
        let aesKey = await getNewKey()
        let exportKey = await window.crypto.subtle.exportKey('jwk', aesKey)
        let strKey = JSON.stringify(exportKey)
        window.localStorage.setItem("aesKey", strKey)
        return aesKey
    } else {

        return await importKey(JSON.parse(window.localStorage.getItem("aesKey") as string))

    }
}

export async function encryptMessage(jsonData: any) {
    let key = await getKey()
    let encoded = getJSONMessageEncoding(jsonData);
    // The counter block value must never be reused with a given key.
    let ciphertextBuffer = await window.crypto.subtle.encrypt(
        {
            name: "AES-CTR",
            counter,
            length: 64
        },
        key,
        encoded
    );

    console.log("ciphertextBuffer", ciphertextBuffer)
    return btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)))
}

export async function decryptMessage(base64Str: string) {
    let key = await getKey()
    let decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-CTR",
            counter,
            length: 64
        },
        key,
        Uint8Array.from(atob(base64Str), c => c.charCodeAt(0))
    );

    let dec = new TextDecoder();

    let decryptedMessage = dec.decode(decrypted);
    console.log("decryptedMessage", decryptedMessage)
    return JSON.parse(decryptedMessage)
}