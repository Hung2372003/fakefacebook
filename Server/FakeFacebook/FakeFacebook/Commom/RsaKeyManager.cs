using System;
using System.Security.Cryptography;
using System.Text;

namespace FakeFacebook.Commom
{
    public class RsaKeyManager
    {
        public RSAParameters PublicKey { get; private set; }
        public RSAParameters PrivateKey { get; private set; }

        public RsaKeyManager()
        {
            GenerateKeyPair();
        }

        private void GenerateKeyPair()
        {
            using (var rsa = new RSACryptoServiceProvider(2048))
            {
                rsa.PersistKeyInCsp = false;
                PublicKey = rsa.ExportParameters(false);
                PrivateKey = rsa.ExportParameters(true);
            }
        }

        public string ExportPublicKeyToPem()
        {
            using (var rsa = new RSACryptoServiceProvider())
            {
                rsa.ImportParameters(PublicKey);
                return ExportPublicKeyToPem(rsa);
            }
        }

        public string ExportPrivateKeyToPem()
        {
            using (var rsa = new RSACryptoServiceProvider())
            {
                rsa.ImportParameters(PrivateKey);
                return ExportPrivateKeyToPem(rsa);
            }
        }

        private static string ExportPrivateKeyToPem(RSA rsa)
        {
            var privateKey = rsa.ExportRSAPrivateKey();
            return "-----BEGIN RSA PRIVATE KEY-----\n" +
                   Convert.ToBase64String(privateKey, Base64FormattingOptions.InsertLineBreaks) +
                   "\n-----END RSA PRIVATE KEY-----";
        }

        private static string ExportPublicKeyToPem(RSA rsa)
        {
            var publicKey = rsa.ExportRSAPublicKey();
            return "-----BEGIN PUBLIC KEY-----\n" +
                   Convert.ToBase64String(publicKey, Base64FormattingOptions.InsertLineBreaks) +
                   "\n-----END PUBLIC KEY-----";
        }
        public static string EncryptAESKeyWithRSA(string AESKeyEnc, string PublicKeyPem)
        {
            RSA rsa = RSA.Create();
            rsa.ImportFromPem(PublicKeyPem); // Nhập Public Key của client
            byte[] encryptedKey = rsa.Encrypt(Encoding.UTF8.GetBytes(AESKeyEnc), RSAEncryptionPadding.OaepSHA256);
            return Convert.ToBase64String(encryptedKey); // Trả về AES Key đã mã hóa
        }
        public static string DecryptWithPrivateKey(string privateKeyPem, string encryptedData)
        {
            try
            {
                using (RSA rsa = RSA.Create())
                {
                    // Kiểm tra định dạng khóa
                    if (privateKeyPem.Contains("RSA PRIVATE KEY"))
                    {
                        // Nếu là PKCS#1, dùng ImportRSAPrivateKey()
                        privateKeyPem = privateKeyPem.Replace("-----BEGIN RSA PRIVATE KEY-----", "")
                                                     .Replace("-----END RSA PRIVATE KEY-----", "")
                                                     .Replace("\n", "")
                                                     .Replace("\r", "");
                        byte[] privateKeyBytes = Convert.FromBase64String(privateKeyPem);
                        rsa.ImportRSAPrivateKey(privateKeyBytes, out _);
                    }
                    else if (privateKeyPem.Contains("PRIVATE KEY"))
                    {
                        // Nếu là PKCS#8, dùng ImportPkcs8PrivateKey()
                        privateKeyPem = privateKeyPem.Replace("-----BEGIN PRIVATE KEY-----", "")
                                                     .Replace("-----END PRIVATE KEY-----", "")
                                                     .Replace("\n", "")
                                                     .Replace("\r", "");
                        byte[] privateKeyBytes = Convert.FromBase64String(privateKeyPem);
                        rsa.ImportPkcs8PrivateKey(privateKeyBytes, out _);
                    }
                    else
                    {
                        return "Lỗi: Định dạng Private Key không hợp lệ!";
                    }

                    byte[] encryptedBytes = Convert.FromBase64String(encryptedData);
                    byte[] decryptedBytes = rsa.Decrypt(encryptedBytes, RSAEncryptionPadding.OaepSHA256);

                    return Encoding.UTF8.GetString(decryptedBytes);
                }
            }
            catch (Exception ex)
            {
                return "Lỗi giải mã: " + ex.Message;
            }
        }
    }
}
