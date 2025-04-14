using System.Text;

namespace FakeFacebook.AES
{
    public class AESEncryption
    {

        public static string Encryption(string StringToEncoded, string Key)
        {
            byte[] keyBytes = Encoding.UTF8.GetBytes(Key);
            byte[,] KeyExpansion = AESKeyExpansion.ExpandKey(keyBytes);
            byte[] StringBytes = Encoding.UTF8.GetBytes(StringToEncoded);

            var StringEncoded = "";

            int FullBlockCount = StringBytes.Length / 16;
            int RemainingBytes = StringBytes.Length % 16;

            //  Mã hóa các block đầy đủ
            for (int i = 0; i < FullBlockCount; i++)
            {
                byte[,] State4x4 = new byte[4, 4];
                for (int col = 0; col < 4; col++)
                {
                    for (int row = 0; row < 4; row++)
                    {
                        int index = i * 16 + (col * 4 + row);
                        State4x4[row, col] = StringBytes[index];
                    }
                }
                StringEncoded += BlockEncryption(State4x4, KeyExpansion);
            }

            //  Xử lý phần dư cuối hoặc trường hợp vừa đủ block
            byte[] LastBlock = null;

            if (RemainingBytes == 0)
            {
                LastBlock = new byte[16];
                for (int i = 0; i < 16; i++)
                {
                    LastBlock[i] = 16; // 0x10
                }
            }
            else
            {
                // Nếu còn dư byte, copy và thêm ký tự
                LastBlock = new byte[16];
                Array.Copy(StringBytes, FullBlockCount * 16, LastBlock, 0, RemainingBytes);
                byte paddingValue = (byte)(16 - RemainingBytes);
                for (int i = RemainingBytes; i < 16; i++)
                {
                    LastBlock[i] = paddingValue;
                }
            }

            // Mã hóa block cuối cùng
            byte[,] LastState4x4 = new byte[4, 4];
            for (int col = 0; col < 4; col++)
            {
                for (int row = 0; row < 4; row++)
                {
                    int index = col * 4 + row;
                    LastState4x4[row, col] = LastBlock[index];
                }
            }

            StringEncoded += BlockEncryption(LastState4x4, KeyExpansion);

            return StringEncoded;
        }

        // Mã hóa cho 1 block
        public static string BlockEncryption(byte[,] StringBytes, byte[,] KeyExpansion )
        {
            byte[,] FirstRound = new byte[4, 4];
            for (int col = 0; col < 4; col++)
            {
                FirstRound[0, col] = KeyExpansion[col, 0];
                FirstRound[1, col] = KeyExpansion[col, 1];
                FirstRound[2, col] = KeyExpansion[col, 2];
                FirstRound[3, col] = KeyExpansion[col, 3];
            }
            AddRoundKey(StringBytes, FirstRound);
            for(int rod=1;rod <=10; rod++)
            {
                byte[,] KeyRound = new byte[4, 4];
                for(int col = 0; col < 4; col++)
                {
                    int ColumnNumber = rod * 4 + col;
                    KeyRound[0, col] = KeyExpansion[ ColumnNumber, 0];
                    KeyRound[1, col] = KeyExpansion[ ColumnNumber,1];
                    KeyRound[2, col] = KeyExpansion[ ColumnNumber,2];
                    KeyRound[3, col] = KeyExpansion[ ColumnNumber,3];
                }
                SubBytes(StringBytes);
                ShiftRows(StringBytes);
                if (rod<10)
                {
                    MixColumns(StringBytes);
                }        
                AddRoundKey(StringBytes, KeyRound);

            }
            return GetHexFromState(StringBytes);
       

        }

        public static string GetHexFromState(byte[,] state)
        {
            StringBuilder hexString = new StringBuilder();
            int rows = state.GetLength(0);
            int cols = state.GetLength(1);

            for (int col = 0; col < cols; col++)
            {
                for (int row = 0; row < rows; row++)
                {
                    hexString.Append(state[row, col].ToString("X2"));
                }
            }

            return hexString.ToString();
        }


        // Hàm nhân 2 số trong GF(2^8)
        public static byte GFMul(byte a, byte b)
        {
            byte p = 0;
            for (int counter = 0; counter < 8; counter++)
            {
                if ((b & 1) != 0)
                {
                    p ^= a;
                }
                bool hiBitSet = (a & 0x80) != 0;
                a <<= 1;
                if (hiBitSet)
                {
                    a ^= 0x1B;
                }

                b >>= 1;
            }

            return p;
        }

        // Hàm MixColumns, đầu vào là ma trận state 4x4 bytes
        public static void MixColumns(byte[,] state)
        {
            for (int col = 0; col < 4; col++) // Lặp qua từng cột
            {
                byte s0 = state[0, col];
                byte s1 = state[1, col];
                byte s2 = state[2, col];
                byte s3 = state[3, col];

                // Tính toán theo ma trận MixColumns
                state[0, col] = (byte)(GFMul(0x02, s0) ^ GFMul(0x03, s1) ^ s2 ^ s3);
                state[1, col] = (byte)(s0 ^ GFMul(0x02, s1) ^ GFMul(0x03, s2) ^ s3);
                state[2, col] = (byte)(s0 ^ s1 ^ GFMul(0x02, s2) ^ GFMul(0x03, s3));
                state[3, col] = (byte)(GFMul(0x03, s0) ^ s1 ^ s2 ^ GFMul(0x02, s3));
            }
        }

        public static void SubBytes(byte[,] state)
        {
            for (int col = 0; col < 4; col++)
            {
                state[0, col] = SBoxTable.SubByte(state[0, col]);
                state[1, col] = SBoxTable.SubByte(state[1, col]);
                state[2, col] = SBoxTable.SubByte(state[2, col]);
                state[3, col] = SBoxTable.SubByte(state[3, col]);

            }

        }
        public static void ShiftRows(byte[,] state)
        {
            byte temp;

            // Hàng 1: dịch trái 1 lần
            temp = state[1, 0];
            state[1, 0] = state[1, 1];
            state[1, 1] = state[1, 2];
            state[1, 2] = state[1, 3];
            state[1, 3] = temp;

            // Hàng 2: dịch trái 2 lần (hoán đổi đối xứng)
            byte temp1 = state[2, 0];
            byte temp2 = state[2, 1];

            state[2, 0] = state[2, 2];
            state[2, 1] = state[2, 3];
            state[2, 2] = temp1;
            state[2, 3] = temp2;

            // Hàng 3: dịch trái 3 lần (hay dịch phải 1 lần)
            temp = state[3, 3];
            state[3, 3] = state[3, 2];
            state[3, 2] = state[3, 1];
            state[3, 1] = state[3, 0];
            state[3, 0] = temp;
        }

        public static void AddRoundKey(byte[,] state, byte[,] roundKey)
        {
            for (int row = 0; row < 4; row++) // duyệt từng hàng
            {
                for (int col = 0; col < 4; col++) // duyệt từng cột
                {
                    state[row, col] ^= roundKey[row, col]; // XOR giá trị state với khóa tương ứng
                }
            }
        }



    }
}
