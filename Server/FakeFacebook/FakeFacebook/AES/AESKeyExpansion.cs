namespace FakeFacebook.AES
{
    public class AESKeyExpansion
    {
        private static readonly byte[] Rcon = new byte[]
        {
            0x00, // KHÔNG DÙNG
            0x01, 0x02, 0x04, 0x08,
            0x10, 0x20, 0x40, 0x80,
            0x1B, 0x36
        };

        public static byte[,] ExpandKey(byte[] key)
        {
            const int Nb = 4;
            const int Nk = 4;
            const int Nr = 10;

            if (key == null || key.Length != 16)
                throw new ArgumentException("Key length must be exactly 16 bytes for AES-128.");

            byte[,] w = new byte[Nb * (Nr + 1), 4]; // 44 words (4 bytes each)

            // Copy original key
            for (int i = 0; i < Nk; i++)
            {
                for (int j = 0; j < 4; j++)
                    w[i, j] = key[4 * i + j];
            }

            for (int i = Nk; i < Nb * (Nr + 1); i++)
            {
                byte[] temp = new byte[4];

                for (int j = 0; j < 4; j++)
                    temp[j] = w[i - 1, j];

                if (i % Nk == 0)
                {
                    temp = SubWord(RotWord(temp));
                    temp[0] ^= Rcon[i / Nk];
                }

                for (int j = 0; j < 4; j++)
                    w[i, j] = (byte)(w[i - Nk, j] ^ temp[j]);
            }

            return w;
        }

        private static byte[] RotWord(byte[] word)
        {
            return new byte[] { word[1], word[2], word[3], word[0] };
        }

        private static byte[] SubWord(byte[] word)
        {
            byte[] result = new byte[4];
            for (int i = 0; i < 4; i++)
                result[i] = SBoxTable.SubByte(word[i]);

            return result;
        }
    }
}
