// A QR code encoder (ISO/IEC 18004), with no dependencies: numeric, alphanumeric or UTF-8 byte mode, versions 1–40,
// levels L, M, Q and H, Reed–Solomon error correction over GF(256), and the mask with the lowest standard penalty.
import type { QRLevel, QROptions } from "./QRCode.types";

const LEVELS: QRLevel[] = ["L", "M", "Q", "H"];
// Error correction codewords per block, then the number of blocks, for each level (L, M, Q, H) and version (1–40),
// one character each: its code minus 40.
const ECC_PER_BLOCK =
    "/27<B:<@F:<@BF>@DFDDDDFFBDFFFFFFFFFFFFFF28B:@8:>>BF>>@@DDBBBBDDDDDDDDDDDDDDDDDDD5>:B:@:><@DB@<F@DDBFDFFFFDFFFFFFFFFFFFFF9D>8>DBB@D@D>@@FDDBDF@FFFFFFFFFFFFFFFFFF";
const BLOCKS =
    ")))))****,,,,,..../0011244456789:;;<=>@A)))**,,,---01122356899:<=?ABDEGIKMNPSUWY))**,,..000248498:=<??ACEJJKNPSUX[]`cfil))*,,,-.003388:8;=AAAJFHKMPRUX[^adgjnruy";
const ALPHANUMERIC = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

const table = (data: string, level: number, version: number) => data.charCodeAt(level * 40 + version - 1) - 40;

/** Multiplies in GF(256), modulo x⁸ + x⁴ + x³ + x² + 1. */
function multiply(x: number, y: number) {
    let z = 0;
    for (let i = 7; i >= 0; i--) {
        z = (z << 1) ^ ((z >>> 7) * 0x11d);
        z ^= ((y >>> i) & 1) * x;
    }
    return z;
}

/** The Reed–Solomon error correction codewords for one block of data. */
function errorCorrection(data: number[], degree: number) {
    // The generator polynomial (x − 2⁰)(x − 2¹)…(x − 2^(degree−1)), without its leading 1.
    const divisor = Array<number>(degree).fill(0);
    divisor[degree - 1] = 1;
    for (let i = 0, root = 1; i < degree; i++, root = multiply(root, 2)) {
        for (let j = 0; j < degree; j++) divisor[j] = multiply(divisor[j]!, root) ^ (divisor[j + 1] ?? 0);
    }
    const result = Array<number>(degree).fill(0);
    for (const byte of data) {
        const factor = byte ^ result.shift()!;
        result.push(0);
        divisor.forEach((coefficient, i) => (result[i]! ^= multiply(coefficient, factor)));
    }
    return result;
}

/** How many modules carry data, error correction and the remainder bits, in a symbol of this version. */
function rawModules(version: number) {
    let result = (16 * version + 128) * version + 64;
    if (version >= 2) {
        const count = Math.floor(version / 7) + 2;
        result -= (25 * count - 10) * count - 55;
        if (version >= 7) result -= 36;
    }
    return result;
}

const MASKS: Array<(x: number, y: number) => boolean> = [
    (x, y) => (x + y) % 2 === 0,
    (_, y) => y % 2 === 0,
    (x) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
    (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

/** The standard penalty for a finished symbol: long runs, 2×2 blocks, finder-like patterns, and the dark/light balance. */
function penalty(modules: boolean[][]) {
    const size = modules.length;
    let points = 0;
    let dark = 0;
    for (let a = 0; a < size; a++) {
        // Rows when `vertical` is false, columns when it's true.
        for (const vertical of [false, true]) {
            let run = 0;
            let bits = 0;
            for (let b = 0; b < size; b++) {
                const module = vertical ? modules[b]![a]! : modules[a]![b]!;
                const previous = b > 0 && (vertical ? modules[b - 1]![a] : modules[a]![b - 1]);
                if (b > 0 && module === previous) run++;
                else {
                    if (run >= 5) points += run - 2;
                    run = 1;
                }
                bits = ((bits << 1) & 0x7ff) | +module;
                if (b >= 10 && (bits === 0x5d0 || bits === 0x05d)) points += 40;
            }
            if (run >= 5) points += run - 2;
        }
        for (let b = 0; b < size; b++) {
            dark += +modules[a]![b]!;
            if (a < size - 1 && b < size - 1) {
                const sum = +modules[a]![b]! + +modules[a]![b + 1]! + +modules[a + 1]![b]! + +modules[a + 1]![b + 1]!;
                if (sum === 0 || sum === 4) points += 3;
            }
        }
    }
    return points + Math.abs(Math.ceil((dark * 100) / (size * size) / 5) - 10) * 10;
}

/**
 * Encodes text as a QR code and returns its modules, row by row: `true` is dark. There is no quiet zone around it. Text
 * of only digits, or only `0–9 A–Z $%*+-./:` and space, uses the denser numeric or alphanumeric mode; anything else is
 * UTF-8 bytes. Picks the smallest version that fits, from `minVersion`, and throws a RangeError when the text is too
 * long even for version 40.
 */
export function encodeQR(text: string, { level = "M", minVersion = 1, mask: forcedMask }: QROptions = {}): boolean[][] {
    const ecl = LEVELS.indexOf(level);
    const mode = /^\d*$/.test(text) ? 0 : /^[\dA-Z $%*+\-./:]*$/.test(text) ? 1 : 2;
    const bytes = mode === 2 ? new TextEncoder().encode(text) : [];
    const length = mode === 2 ? bytes.length : text.length;
    const dataBits = mode === 0 ? Math.ceil((length * 10) / 3) : mode === 1 ? Math.ceil((length * 11) / 2) : length * 8;

    let version = Math.max(1, Math.min(40, Math.round(minVersion)));
    let capacity = 0;
    const countBits = () => [[10, 12, 14], [9, 11, 13], [8, 16, 16]][mode]![version < 10 ? 0 : version < 27 ? 1 : 2]!;
    for (; ; version++) {
        if (version > 40) throw new RangeError("The text is too long for a QR code.");
        capacity = (Math.floor(rawModules(version) / 8) - table(ECC_PER_BLOCK, ecl, version) * table(BLOCKS, ecl, version)) * 8;
        if (4 + countBits() + dataBits <= capacity) break;
    }

    // The data: mode, character count, the characters, a terminator, then padding to fill the capacity.
    const bits: number[] = [];
    const append = (value: number, count: number) => {
        for (let i = count - 1; i >= 0; i--) bits.push((value >>> i) & 1);
    };
    append(1 << mode, 4);
    append(length, countBits());
    if (mode === 0) for (let i = 0; i < length; i += 3) append(+text.slice(i, i + 3), [4, 7, 10][Math.min(3, length - i) - 1]!);
    else if (mode === 1) {
        for (let i = 0; i < length; i += 2) {
            const first = ALPHANUMERIC.indexOf(text[i]!);
            if (i + 1 < length) append(first * 45 + ALPHANUMERIC.indexOf(text[i + 1]!), 11);
            else append(first, 6);
        }
    } else bytes.forEach((byte) => append(byte, 8));
    append(0, Math.min(4, capacity - bits.length));
    append(0, (8 - (bits.length % 8)) % 8);
    for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) append(pad, 8);
    const data: number[] = [];
    for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));

    // Split into blocks, add each block's error correction, and interleave them.
    const blockCount = table(BLOCKS, ecl, version);
    const eccLength = table(ECC_PER_BLOCK, ecl, version);
    const total = Math.floor(rawModules(version) / 8);
    const shortBlocks = blockCount - (total % blockCount);
    const shortLength = Math.floor(total / blockCount);
    const blocks: number[][] = [];
    for (let i = 0, k = 0; i < blockCount; i++) {
        const block = data.slice(k, k + shortLength - eccLength + (i < shortBlocks ? 0 : 1));
        k += block.length;
        const ecc = errorCorrection(block, eccLength);
        if (i < shortBlocks) block.push(0);
        blocks.push(block.concat(ecc));
    }
    const codewords: number[] = [];
    for (let i = 0; i < blocks[0]!.length; i++) {
        blocks.forEach((block, j) => {
            if (i !== shortLength - eccLength || j >= shortBlocks) codewords.push(block[i]!);
        });
    }

    // The function patterns: finders with their separators, alignment patterns, timing, and room for format and version.
    const size = version * 4 + 17;
    const modules = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
    const reserved = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
    const set = (x: number, y: number, dark: boolean) => {
        modules[y]![x] = dark;
        reserved[y]![x] = true;
    };
    for (let i = 0; i < size; i++) {
        set(6, i, i % 2 === 0);
        set(i, 6, i % 2 === 0);
    }
    const alignCount = version === 1 ? 0 : Math.floor(version / 7) + 2;
    const step = version === 1 ? 0 : Math.floor((version * 8 + alignCount * 3 + 5) / (alignCount * 4 - 4)) * 2;
    const align = [6];
    for (let position = size - 7; align.length < alignCount; position -= step) align.splice(1, 0, position);
    align.forEach((cx, i) =>
        align.forEach((cy, j) => {
            const last = alignCount - 1;
            if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
            for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }),
    );
    for (const [cx, cy] of [
        [3, 3],
        [size - 4, 3],
        [3, size - 4],
    ] as const) {
        for (let dy = -4; dy <= 4; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
                const distance = Math.max(Math.abs(dx), Math.abs(dy));
                const x = cx + dx;
                const y = cy + dy;
                if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, distance !== 2 && distance !== 4);
            }
        }
    }

    const drawFormat = (mask: number) => {
        const value = ([1, 0, 3, 2][ecl]! << 3) | mask;
        let remainder = value;
        for (let i = 0; i < 10; i++) remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537);
        const format = ((value << 10) | remainder) ^ 0x5412;
        const bit = (i: number) => ((format >>> i) & 1) === 1;
        for (let i = 0; i < 6; i++) set(8, i, bit(i));
        set(8, 7, bit(6));
        set(8, 8, bit(7));
        set(7, 8, bit(8));
        for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
        for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
        for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
        set(8, size - 8, true);
    };
    drawFormat(0);
    if (version >= 7) {
        let remainder = version;
        for (let i = 0; i < 12; i++) remainder = (remainder << 1) ^ ((remainder >>> 11) * 0x1f25);
        const versionBits = (version << 12) | remainder;
        for (let i = 0; i < 18; i++) {
            const dark = ((versionBits >>> i) & 1) === 1;
            const a = size - 11 + (i % 3);
            const b = Math.floor(i / 3);
            set(a, b, dark);
            set(b, a, dark);
        }
    }

    // The codewords, in two-module columns zigzagging up and down from the bottom right, skipping the timing column.
    let index = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (let vertical = 0; vertical < size; vertical++) {
            for (let j = 0; j < 2; j++) {
                const x = right - j;
                const y = ((right + 1) & 2) === 0 ? size - 1 - vertical : vertical;
                if (!reserved[y]![x] && index < codewords.length * 8) {
                    modules[y]![x] = ((codewords[index >>> 3]! >>> (7 - (index & 7))) & 1) === 1;
                    index++;
                }
            }
        }
    }

    // Try each mask (or the one asked for) and keep the one with the lowest penalty; XOR twice undoes it.
    const applyMask = (mask: number) => {
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!reserved[y]![x] && MASKS[mask]!(x, y)) modules[y]![x] = !modules[y]![x];
    };
    let best = forcedMask ?? 0;
    if (forcedMask === undefined) {
        let lowest = Infinity;
        for (let mask = 0; mask < 8; mask++) {
            applyMask(mask);
            drawFormat(mask);
            const points = penalty(modules);
            if (points < lowest) {
                lowest = points;
                best = mask;
            }
            applyMask(mask);
        }
    }
    applyMask(best);
    drawFormat(best);
    return modules;
}
