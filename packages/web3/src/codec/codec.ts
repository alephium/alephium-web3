import { Parser } from 'binary-parser'

export interface Codec<T> {
    parser: Parser;
    encode(input: T): Buffer;
    decode(input: Buffer): T;
}