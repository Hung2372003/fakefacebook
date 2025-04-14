
import { SBoxTable } from "./SBoxTable";
export class AESKeyExpansion {
  private static readonly Rcon: number[] = [
      0x00, // KHÔNG DÙNG
      0x01, 0x02, 0x04, 0x08,
      0x10, 0x20, 0x40, 0x80,
      0x1B, 0x36
  ];

  public static expandKey(key: number[]): number[][] {
      const Nb = 4;
      const Nk = 4;
      const Nr = 10;

      if (!key || key.length !== 16) {
          throw new Error("Key length must be exactly 16 bytes for AES-128.");
      }

      const w: number[][] = Array.from({ length: Nb * (Nr + 1) }, () => new Array(4));

      // Copy original key
      for (let i = 0; i < Nk; i++) {
          for (let j = 0; j < 4; j++) {
              w[i][j] = key[4 * i + j];
          }
      }

      for (let i = Nk; i < Nb * (Nr + 1); i++) {
          let temp: number[] = Array(4);
          for (let j = 0; j < 4; j++) {
              temp[j] = w[i - 1][j];
          }

          if (i % Nk === 0) {
              temp = this.subWord(this.rotWord(temp));
              temp[0] ^= this.Rcon[Math.floor(i / Nk)];
          }

          for (let j = 0; j < 4; j++) {
              w[i][j] = w[i - Nk][j] ^ temp[j];
          }
      }

      return w;
  }

  private static rotWord(word: number[]): number[] {
      return [word[1], word[2], word[3], word[0]];
  }

  private static subWord(word: number[]): number[] {
      let result: number[] = [];
      for (let i = 0; i < 4; i++) {
          result[i] = SBoxTable.subByte(word[i]);
      }
      return result;
  }
}
