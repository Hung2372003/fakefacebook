using System.Text;

namespace FakeFacebook.AES
{
    public class AESDecryptioncs
    {

        public static string Decryption(string CipherText, string key)
        {
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[,] KeyExpansion = AESKeyExpansion.ExpandKey(keyBytes);

            int blockCount = CipherText.Length / 32;
            var OutputBytes = new List<byte>();

            // Giải mã từng block và gom vào list byte
            for (int i = 0; i < blockCount; i++)
            {
                string blockHex = CipherText.Substring(i * 32, 32);
                byte[] blockBytes = HexStringToByteArray(blockHex);

                byte[,] state = new byte[4, 4];
                for (int col = 0; col < 16; col++)
                {
                    state[col % 4, col / 4] = blockBytes[col];
                }

                byte[] decryptedBlock = BlockDecryption(state, KeyExpansion);

                OutputBytes.AddRange(decryptedBlock);
            }

            //  Xử lý bỏ ký tự thêm ở cuối
            int paddingValue = OutputBytes[OutputBytes.Count - 1];

            if (paddingValue < 1 || paddingValue > 16)
            {
                throw new Exception("ký tự thêm không hợp lệ hoặc dữ liệu bị lỗi!");
            }

            //  Kiểm tra xem có đúng tất cả byte cuối đều là ký tự thêm
            for (int i = 0; i < paddingValue; i++)
            {
                if (OutputBytes[OutputBytes.Count - 1 - i] != paddingValue)
                {
                    throw new Exception("ký tự thêm không hợp lệ!");
                }
            }

            //  Cắt bỏ ký tự thêm
            OutputBytes.RemoveRange(OutputBytes.Count - paddingValue, paddingValue);

            // Trả về string giải mã
            return Encoding.UTF8.GetString(OutputBytes.ToArray());
        }

        public static byte[] BlockDecryption(byte[,] cipherText, byte[,] keyExpansion)
        {
            // Copy round key cuối cùng
            byte[,] lastRoundKey = new byte[4, 4];
            for (int col = 0; col < 4; col++)
            {
                int ColumnNumber = 10 * 4 + col;
                lastRoundKey[0, col] = keyExpansion[ColumnNumber, 0];
                lastRoundKey[1, col] = keyExpansion[ColumnNumber, 1];
                lastRoundKey[2, col] = keyExpansion[ColumnNumber, 2];
                lastRoundKey[3, col] = keyExpansion[ColumnNumber, 3];
            }

            // AddRoundKey với round key cuối cùng
            AESEncryption.AddRoundKey(cipherText, lastRoundKey);

            // 9 vòng lặp từ 9 xuống 1
            for (int round = 9; round >= 1; round--)
            {
                InvShiftRows(cipherText);
                InvSubBytes(cipherText);

                byte[,] roundKey = new byte[4, 4];
                for (int col = 0; col < 4; col++)
                {
                    int ColumnNumber = round * 4 + col;
                    roundKey[0, col] = keyExpansion[ColumnNumber, 0];
                    roundKey[1, col] = keyExpansion[ColumnNumber, 1];
                    roundKey[2, col] = keyExpansion[ColumnNumber, 2];
                    roundKey[3, col] = keyExpansion[ColumnNumber, 3];
                }

                AESEncryption.AddRoundKey(cipherText, roundKey);
                InvMixColumns(cipherText);
            }

            // Lần cuối cùng (round 0)
            InvShiftRows(cipherText);
            InvSubBytes(cipherText);

            byte[,] firstRoundKey = new byte[4, 4];
            for (int col = 0; col < 4; col++)
            {
                firstRoundKey[0, col] = keyExpansion[col, 0];
                firstRoundKey[1, col] = keyExpansion[col, 1];
                firstRoundKey[2, col] = keyExpansion[col, 2];
                firstRoundKey[3, col] = keyExpansion[col, 3];
            }

            AESEncryption.AddRoundKey(cipherText, firstRoundKey);

            byte[] decryptedBlock = new byte[16];

            for (int col = 0; col < 4; col++)
            {
                for (int row = 0; row < 4; row++)
                {
                    decryptedBlock[col * 4 + row] = cipherText[row, col];
                }
            }

            return decryptedBlock;
            //return MatrixToString(cipherText);
        }
        public static void InvShiftRows(byte[,] state)
        {
            byte temp;

            // Row 1: shift right 1
            temp = state[1, 3];
            state[1, 3] = state[1, 2];
            state[1, 2] = state[1, 1];
            state[1, 1] = state[1, 0];
            state[1, 0] = temp;

            // Row 2: shift right 2
            temp = state[2, 0];
            state[2, 0] = state[2, 2];
            state[2, 2] = temp;

            temp = state[2, 1];
            state[2, 1] = state[2, 3];
            state[2, 3] = temp;

            // Row 3: shift right 3 (left 1)
            temp = state[3, 0];
            state[3, 0] = state[3, 1];
            state[3, 1] = state[3, 2];
            state[3, 2] = state[3, 3];
            state[3, 3] = temp;
        }

        public static void InvSubBytes(byte[,] state)
        {
            for (int col = 0; col < 4; col++)
            {
                state[0, col] = InverseSBoxTable.InSubByte(state[0, col]);
                state[1, col] = InverseSBoxTable.InSubByte(state[1, col]);
                state[2, col] = InverseSBoxTable.InSubByte(state[2, col]);
                state[3, col] = InverseSBoxTable.InSubByte(state[3, col]);
            }
        }

        public static void InvMixColumns(byte[,] state)
        {
            for (int col = 0; col < 4; col++)
            {
                byte s0 = state[0, col];
                byte s1 = state[1, col];
                byte s2 = state[2, col];
                byte s3 = state[3, col];

                state[0, col] = (byte)(AESEncryption.GFMul(s0, 0x0E) ^ AESEncryption.GFMul(s1, 0x0B) ^ AESEncryption.GFMul(s2, 0x0D) ^ AESEncryption.GFMul(s3, 0x09));
                state[1, col] = (byte)(AESEncryption.GFMul(s0, 0x09) ^ AESEncryption.GFMul(s1, 0x0E) ^ AESEncryption.GFMul(s2, 0x0B) ^ AESEncryption.GFMul(s3, 0x0D));
                state[2, col] = (byte)(AESEncryption.GFMul(s0, 0x0D) ^ AESEncryption.GFMul(s1, 0x09) ^ AESEncryption.GFMul(s2, 0x0E) ^ AESEncryption.GFMul(s3, 0x0B));
                state[3, col] = (byte)(AESEncryption.GFMul(s0, 0x0B) ^ AESEncryption.GFMul(s1, 0x0D) ^ AESEncryption.GFMul(s2, 0x09) ^ AESEncryption.GFMul(s3, 0x0E));
            }
        }

        public static string GetStringFromState(byte[,] state)
        {
            StringBuilder plainText = new StringBuilder();

            int rows = state.GetLength(0);
            int cols = state.GetLength(1);

            for (int col = 0; col < cols; col++)
            {
                for (int row = 0; row < rows; row++)
                {
                    plainText.Append((char)state[row, col]);
                }
            }

            return plainText.ToString();
        }
        public static string MatrixToString(byte[,] matrix)
        {
            int rows = matrix.GetLength(0); // 4
            int cols = matrix.GetLength(1); // 4

            List<byte> byteList = new List<byte>();

            // Duyệt theo từng cột, sau đó từng hàng (chuẩn AES là duyệt theo cột)
            for (int col = 0; col < cols; col++)
            {
                for (int row = 0; row < rows; row++)
                {
                    byteList.Add(matrix[row, col]);
                }
            }

            // Chuyển list thành mảng byte
            byte[] bytes = byteList.ToArray();

            // Chuyển mảng byte thành string
            return Encoding.UTF8.GetString(bytes);
        }

        public static byte[] HexStringToByteArray(string hex)
        {
            if (hex.Length % 2 != 0)
                throw new ArgumentException("Hex string must have an even length.");

            byte[] bytes = new byte[hex.Length / 2];
            for (int i = 0; i < hex.Length; i += 2)
            {
                bytes[i / 2] = Convert.ToByte(hex.Substring(i, 2), 16);
            }
            return bytes;
        }

    }
}
