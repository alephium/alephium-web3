import blake from 'blakejs'

export function blakeHash(raw: Uint8Array) {
    return blake.blake2b(raw, undefined, 32)
}

export function djbIntHash(bytes: Buffer): number {
    let hash = 5381
    bytes.forEach((byte) => {
        hash = ((hash << 5) + hash) + (byte & 0xff)
    })
    return hash
}
