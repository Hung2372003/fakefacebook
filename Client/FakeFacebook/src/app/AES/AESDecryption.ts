
import { AESKeyExpansion } from "./AESKeyExpansion";
import { AESEncryption } from "./AESEncryption";
import { InvSBoxTable } from "./InverseSBoxTable";
export class AESDecryption {
    static Decryption(CipherText: string, key: string): string {
        const keyBytes = new TextEncoder().encode(key);
        const keyBytesArray: number[] = Array.from(keyBytes); // Chuyển đổi từ Uint8Array sang number[]
        const KeyExpansion = AESKeyExpansion.expandKey(keyBytesArray);

        const blockCount = CipherText.length / 32;
        const OutputBytes: number[] = [];

        // Giải mã từng block và gom vào list byte
        for (let i = 0; i < blockCount; i++) {
          const blockHex = CipherText.substring(i * 32, (i + 1) * 32);
          const blockBytes1 = this.HexStringToByteArray(blockHex);
          const blockBytes: number[] = Array.from(blockBytes1);

          let state: number[][] = [];
          for (let col = 0; col < 4; col++) {
            state[col] = [];
            for (let row = 0; row < 4; row++) {
              state[col][row] = blockBytes[row * 4 + col];
            }
          }

          const decryptedBlock = this.BlockDecryption(state, KeyExpansion);

          OutputBytes.push(...decryptedBlock);
        }

        // Xử lý bỏ ký tự thêm ở cuối
        const paddingValue = OutputBytes[OutputBytes.length - 1];

        if (paddingValue < 1 || paddingValue > 16) {
          throw new Error("Ký tự thêm không hợp lệ hoặc dữ liệu bị lỗi!");
        }

        // Kiểm tra xem có đúng tất cả byte cuối đều là ký tự thêm
        for (let i = 0; i < paddingValue; i++) {
          if (OutputBytes[OutputBytes.length - 1 - i] !== paddingValue) {
            throw new Error("Ký tự thêm không hợp lệ!");
          }
        }

        // Cắt bỏ ký tự thêm
        OutputBytes.splice(OutputBytes.length - paddingValue, paddingValue);

        // Trả về string giải mã
        const decoder = new TextDecoder();
        return decoder.decode(new Uint8Array(OutputBytes));
      }

    static BlockDecryption(cipherText: number[][], keyExpansion: number[][]): number[] {
      // Copy round key cuối cùng
      const lastRoundKey: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));

      for (let col = 0; col < 4; col++) {
          const columnNumber = 10 * 4 + col;
          lastRoundKey[0][col] = keyExpansion[columnNumber][0];
          lastRoundKey[1][col] = keyExpansion[columnNumber][1];
          lastRoundKey[2][col] = keyExpansion[columnNumber][2];
          lastRoundKey[3][col] = keyExpansion[columnNumber][3];
      }
      
      // AddRoundKey với round key cuối cùng
      AESEncryption.addRoundKey(cipherText, lastRoundKey);

      // 9 vòng lặp từ 9 xuống 1
      for (let round = 9; round >= 1; round--) {
        this.InvShiftRows(cipherText);
        this.InvSubBytes(cipherText);

        const roundKey: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
        for (let col = 0; col < 4; col++) {
            const columnNumber = round * 4 + col;
            roundKey[0][col] = keyExpansion[columnNumber][0];
            roundKey[1][col] = keyExpansion[columnNumber][1];
            roundKey[2][col] = keyExpansion[columnNumber][2];
            roundKey[3][col] = keyExpansion[columnNumber][3];
        }

        AESEncryption.addRoundKey(cipherText, roundKey);
        this.InvMixColumns(cipherText);
      }

      // Lần cuối cùng (round 0)
      this.InvShiftRows(cipherText);
      this.InvSubBytes(cipherText);

      const firstRoundKey: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
      for (let col = 0; col < 4; col++) {
          firstRoundKey[0][col] = keyExpansion[col][0];
          firstRoundKey[1][col] = keyExpansion[col][1];
          firstRoundKey[2][col] = keyExpansion[col][2];
          firstRoundKey[3][col] = keyExpansion[col][3];
      }
      
      AESEncryption.addRoundKey(cipherText, firstRoundKey);

      const decryptedBlock: number[] = [];
      for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 4; row++) {
          decryptedBlock[col * 4 + row] = cipherText[row][col];
        }
      }

      return decryptedBlock;
  }

  static InvShiftRows(state: number[][]): void {
    let temp: number;

    // Row 1: shift right 1
    temp = state[1][3];
    state[1][3] = state[1][2];
    state[1][2] = state[1][1];
    state[1][1] = state[1][0];
    state[1][0] = temp;

    // Row 2: shift right 2
    temp = state[2][0];
    state[2][0] = state[2][2];
    state[2][2] = temp;

    temp = state[2][1];
    state[2][1] = state[2][3];
    state[2][3] = temp;

    // Row 3: shift right 3 (left 1)
    temp = state[3][0];
    state[3][0] = state[3][1];
    state[3][1] = state[3][2];
    state[3][2] = state[3][3];
    state[3][3] = temp;
  }

  static InvSubBytes(state: number[][]): void {
    for (let col = 0; col < 4; col++) {
      state[0][col] = InvSBoxTable.subByte(state[0][col]);
      state[1][col] = InvSBoxTable.subByte(state[1][col]);
      state[2][col] = InvSBoxTable.subByte(state[2][col]);
      state[3][col] = InvSBoxTable.subByte(state[3][col]);
    }
  }

  static InvMixColumns(state: number[][]): void {
    for (let col = 0; col < 4; col++) {
      const s0 = state[0][col];
      const s1 = state[1][col];
      const s2 = state[2][col];
      const s3 = state[3][col];

      state[0][col] = AESEncryption.gfMul(s0, 0x0E) ^ AESEncryption.gfMul(s1, 0x0B) ^ AESEncryption.gfMul(s2, 0x0D) ^ AESEncryption.gfMul(s3, 0x09);
      state[1][col] = AESEncryption.gfMul(s0, 0x09) ^ AESEncryption.gfMul(s1, 0x0E) ^ AESEncryption.gfMul(s2, 0x0B) ^ AESEncryption.gfMul(s3, 0x0D);
      state[2][col] = AESEncryption.gfMul(s0, 0x0D) ^ AESEncryption.gfMul(s1, 0x09) ^ AESEncryption.gfMul(s2, 0x0E) ^ AESEncryption.gfMul(s3, 0x0B);
      state[3][col] = AESEncryption.gfMul(s0, 0x0B) ^ AESEncryption.gfMul(s1, 0x0D) ^ AESEncryption.gfMul(s2, 0x09) ^ AESEncryption.gfMul(s3, 0x0E);
    }
  }

  static HexStringToByteArray(hex: string): number[] {
    if (hex.length % 2 !== 0) {
      throw new Error("Hex string must have an even length.");
    }

    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substring(i, i + 2), 16));
    }
    return bytes;
  }
}
