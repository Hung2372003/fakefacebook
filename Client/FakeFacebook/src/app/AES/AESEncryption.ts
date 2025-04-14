
import { SBoxTable } from "./SBoxTable";
import { AESKeyExpansion } from "./AESKeyExpansion";
export class AESEncryption {
    static encryption(stringToEncode: string, key: string): string {
        const keyBytes = new TextEncoder().encode(key);
        const keyBytesArray: number[] = Array.from(keyBytes); // Chuyển đổi từ Uint8Array sang number[]
        const keyExpansion = AESKeyExpansion.expandKey(keyBytesArray);
        
        const stringBytes1 = new TextEncoder().encode(stringToEncode);
        const stringBytes: number[] = Array.from(stringBytes1); // Chuyển đổi từ Uint8Array sang number[]
        
        let stringEncoded = "";

        const fullBlockCount =  Math.floor(stringBytes.length / 16);
        const remainingBytes = stringBytes.length % 16;

        // Mã hóa các block đầy đủ


        for (let i = 0; i < fullBlockCount; i++) {
        let state4x4: number[][] = [];
        for (let col = 0; col < 4; col++) {
            state4x4[col] = [];  // Khởi tạo mảng con cho mỗi cột
            for (let row = 0; row < 4; row++) {
                const index = i * 16 + (col * 4 + row);
                state4x4[col][row] = stringBytes[index];  // Gán giá trị vào mảng con của cột
            }
        }
        stringEncoded += AESEncryption.blockEncryption(state4x4, keyExpansion);
        }
        

        // Xử lý phần dư cuối hoặc trường hợp vừa đủ block
        let lastBlock: number[] | null = null;

        if (remainingBytes === 0) {
            lastBlock = new Array(16).fill(16); // padding bằng 0x10
        } else {
        lastBlock = new Array(16).fill(0); // Tạo mảng 16 phần tử với giá trị mặc định là 0
        lastBlock.splice(0, remainingBytes, ...stringBytes.slice(fullBlockCount * 16, fullBlockCount * 16 + remainingBytes));
        
        // Thêm padding
        const paddingValue = 16 - remainingBytes;
        for (let i = remainingBytes; i < 16; i++) {
            lastBlock[i] = paddingValue;
        }
        }

        // Mã hóa block cuối cùng
        let lastState4x4: number[][] = Array.from({ length: 4 }, () => new Array(4).fill(0));
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                const index = col * 4 + row;
                lastState4x4[row][col] = lastBlock[index];
            }
        }


        stringEncoded += AESEncryption.blockEncryption(lastState4x4, keyExpansion);



        return stringEncoded;
    }

    static blockEncryption(stringBytes: number[][], keyExpansion: number[][]): string {
        let firstRound: number[][] = Array.from({ length: 4 }, () => new Array(4).fill(0));

        for (let col = 0; col < 4; col++) {
            firstRound[0][col] = keyExpansion[col][0];
            firstRound[1][col] = keyExpansion[col][1];
            firstRound[2][col] = keyExpansion[col][2];
            firstRound[3][col] = keyExpansion[col][3];
        }
        

        AESEncryption.addRoundKey(stringBytes, firstRound);

        for (let round = 1; round <= 10; round++) {
            let keyRound: number[][] = Array.from({ length: 4 }, () => new Array(4).fill(0));
            for (let col = 0; col < 4; col++) {
                let columnNumber = round * 4 + col;
                keyRound[0][col] = keyExpansion[columnNumber][0];
                keyRound[1][col] = keyExpansion[columnNumber][1];
                keyRound[2][col] = keyExpansion[columnNumber][2];
                keyRound[3][col] = keyExpansion[columnNumber][3];
            }
            

            AESEncryption.subBytes(stringBytes);
            AESEncryption.shiftRows(stringBytes);

            if (round < 10) {
                AESEncryption.mixColumns(stringBytes);
            }

            AESEncryption.addRoundKey(stringBytes, keyRound);
        }

        return AESEncryption.getHexFromState(stringBytes);
    }

    static getHexFromState(state: number[][]): string {
        let hexString = '';
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                hexString += state[row][col].toString(16).padStart(2, '0').toUpperCase();
            }
        }
        return hexString;
    }

    static gfMul(a: number, b: number): number {
        let p = 0;
        for (let counter = 0; counter < 8; counter++) {
            if ((b & 1) !== 0) {
                p ^= a;
            }
            const hiBitSet = (a & 0x80) !== 0;
            a <<= 1;
            if (hiBitSet) {
                a ^= 0x1B;
            }
            b >>= 1;
        }
        return p & 0xFF; // Đảm bảo kết quả nằm trong phạm vi byte
    }


    static mixColumns(state: number[][]): void {
        for (let col = 0; col < 4; col++) {
            let s0 = state[0][col];
            let s1 = state[1][col];
            let s2 = state[2][col];
            let s3 = state[3][col];

            state[0][col] = AESEncryption.gfMul(0x02, s0) ^ AESEncryption.gfMul(0x03, s1) ^ s2 ^ s3;
            state[1][col] = s0 ^ AESEncryption.gfMul(0x02, s1) ^ AESEncryption.gfMul(0x03, s2) ^ s3;
            state[2][col] = s0 ^ s1 ^ AESEncryption.gfMul(0x02, s2) ^ AESEncryption.gfMul(0x03, s3);
            state[3][col] = AESEncryption.gfMul(0x03, s0) ^ s1 ^ s2 ^ AESEncryption.gfMul(0x02, s3);
        }
    }

    static subBytes(state: number[][]): void {
        for (let col = 0; col < 4; col++) {
            state[0][col] = SBoxTable.subByte(state[0][col]);
            state[1][col] = SBoxTable.subByte(state[1][col]);
            state[2][col] = SBoxTable.subByte(state[2][col]);
            state[3][col] = SBoxTable.subByte(state[3][col]);
        }
    }

    static shiftRows(state: number[][]): void {
        let temp;
        // Row 1: shift left 1 time
        temp = state[1][0];
        state[1][0] = state[1][1];
        state[1][1] = state[1][2];
        state[1][2] = state[1][3];
        state[1][3] = temp;

        // Row 2: shift left 2 times
        const temp1 = state[2][0];
        const temp2 = state[2][1];

        state[2][0] = state[2][2];
        state[2][1] = state[2][3];
        state[2][2] = temp1;
        state[2][3] = temp2;

        // Row 3: shift left 3 times (or right 1 time)
        temp = state[3][3];
        state[3][3] = state[3][2];
        state[3][2] = state[3][1];
        state[3][1] = state[3][0];
        state[3][0] = temp;
    }

    static addRoundKey(state: number[][], roundKey: number[][]): void {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                state[row][col] ^= roundKey[row][col];
            }
        }
    }
}
