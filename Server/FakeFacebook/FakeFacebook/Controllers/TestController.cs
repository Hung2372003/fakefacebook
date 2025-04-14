using FakeFacebook.AES;
using FakeFacebook.Commom;
using FakeFacebook.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FakeFacebook.Controllers
{
    [ApiController]
    [Route("api/TestController")]
    public class TestController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly FakeFacebookDbContext _context;
        private readonly string? _keyAES;
        public TestController(IConfiguration configuration, FakeFacebookDbContext context)
        {
            _configuration = configuration;
            _context = context;
            _keyAES = Environment.GetEnvironmentVariable("MASTER_KEY", EnvironmentVariableTarget.Machine);
        }

        [HttpGet("TestAES")]
        public IActionResult TestAES(string String)
        {
            var key = _configuration["AESKeyTest:AESKey"];
            var NewString = AESEncryption.Encryption(String, key);
            return new JsonResult(new { success = true, encryptedData = NewString });
        }
        [HttpGet("DecryptAES")]
        public IActionResult DecryptAES(string encryptedHex)
        {
            try
            {
                var decryptedData = AESDecryptioncs.Decryption(encryptedHex, _keyAES);
                return new JsonResult(new { success = true, decryptedData = decryptedData });
            }
            catch (Exception ex)
            {
                return new JsonResult(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("EncryptionDatabase")]
        public IActionResult EncryptionDatabase()
        {
            var DataInFor = _context.UserInformations.Where(x => x.IsDeleted == false && x.IsEncryption != true).ToList();
            DataInFor.ForEach(x =>
            {
                x.Address = AESEncryption.Encryption(x.Address, _keyAES);
                x.Email = AESEncryption.Encryption(x.Email, _keyAES);
                x.PhoneNumber = AESEncryption.Encryption(x.PhoneNumber, _keyAES);
                x.IsEncryption = true;
            });
            var DataAcc = _context.UserAccounts.Where(x => x.IsDeleted == false && x.IsEncryption != true).ToList();
            DataAcc.ForEach(x =>
            {
                x.UserPassword = AESEncryption.Encryption(x.UserPassword, _keyAES);
                x.UserName = AESEncryption.Encryption(x.UserName, _keyAES);
                x.IsEncryption = true;
            });
            _context.SaveChanges();
            return new JsonResult(new { dataIn = DataInFor, dataAc = DataAcc });
        }
        [HttpGet("DecryptionDatabase")]
        public IActionResult DecryptionDatabase()
        {
            var DataInFor = _context.UserInformations.Where(x => x.IsDeleted == false && x.IsEncryption == true).ToList();
            DataInFor.ForEach(x =>
            {
                x.Address = AESDecryptioncs.Decryption(x.Address, _keyAES);
                x.Email = AESDecryptioncs.Decryption(x.Email, _keyAES);
                x.PhoneNumber = AESDecryptioncs.Decryption(x.PhoneNumber, _keyAES);
                x.Birthday = AESDecryptioncs.Decryption(x.Birthday, _keyAES);
            });
            var DataAcc = _context.UserAccounts.Where(x => x.IsDeleted == false && x.IsEncryption == true).ToList();
            DataAcc.ForEach(x =>
            {
                x.UserPassword = AESDecryptioncs.Decryption(x.UserPassword, _keyAES);
                x.UserName = AESDecryptioncs.Decryption(x.UserName, _keyAES);
            });
            return new JsonResult(new { dataIn = DataInFor, dataAc = DataAcc });
        }
        public static string GenerateRandomString(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            var stringChars = new char[length];
            for (int i = 0; i < length; i++)
            {
                stringChars[i] = chars[random.Next(chars.Length)];
            }
            return new string(stringChars);
        }


        [HttpPost("InforAllAccount")]
        [Authorize]
        public JsonResult InforAllAccount([FromBody] string KeyRSA)
        {
            var msg = new message() { Id = null, Title = "", Error = false, Object = "" };
            var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var roleClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
            var role = roleClaim?.Value;
            var data = new List<UserInfoDto>();
            data = (from a in _context.UserInformations.Where(x => x.IsDeleted == false && x.IsEncryption == true)
                    join b in _context.UserAccounts.Where(x => x.IsDeleted == false && x.IsEncryption == true)
                    on a.Id equals b.UserCode
                    select new UserInfoDto
                    {
                        UserCode = a.Id,
                        Name = a.Name,
                        UserName = AESDecryptioncs.Decryption(b.UserName, _keyAES),
                        UserPassword = AESDecryptioncs.Decryption(b.UserPassword, _keyAES),
                        Address = AESDecryptioncs.Decryption(a.Address, _keyAES),
                        PhoneNumber = AESDecryptioncs.Decryption(a.PhoneNumber, _keyAES),
                        Email = AESDecryptioncs.Decryption(a.Email, _keyAES),
                        Birthday = AESDecryptioncs.Decryption(a.Birthday, _keyAES),
                        Status = (a.Id == StaticUser || role == "Admin") ? GenerateRandomString(16) : "",

                    }).ToList();
            foreach (var item in data)
            {
                if (item.Status != null && item.Status != "")
                {
                    item.UserName = AESEncryption.Encryption(item.UserName, item.Status);
                    item.UserPassword = AESEncryption.Encryption(item.UserPassword, item.Status);
                    item.Address = AESEncryption.Encryption(item.Address, item.Status);
                    item.PhoneNumber = AESEncryption.Encryption(item.PhoneNumber, item.Status);
                    item.Email = AESEncryption.Encryption(item.Email, item.Status);
                    item.Birthday = AESEncryption.Encryption(item.Birthday, item.Status);
                    item.Status = RsaKeyManager.EncryptAESKeyWithRSA(item.Status, KeyRSA);
                }
                else
                {
                    item.UserName = AESEncryption.Encryption(item.UserName, GenerateRandomString(16));
                    item.UserPassword = AESEncryption.Encryption(item.UserPassword, GenerateRandomString(16));
                    item.Address = AESEncryption.Encryption(item.Address, GenerateRandomString(16));
                    item.PhoneNumber = AESEncryption.Encryption(item.PhoneNumber, GenerateRandomString(16));
                    item.Email = AESEncryption.Encryption(item.Email, GenerateRandomString(16));
                    item.Birthday = AESEncryption.Encryption(item.Birthday, GenerateRandomString(16));
                }

            }
            var target = data.FirstOrDefault(x => x.UserCode == StaticUser);
            data.Remove(target);
            data.Insert(0, target);
            msg.Object = data;
            return new JsonResult(msg);
        }

        //[HttpGet("updent")]
        //public IActionResult ok()
        //{
        //    var b = _context.UserInformations.Where(x=>x.IsDeleted==false).ToList();
        //    foreach (var item in b)
        //    {
        //        item.Avatar = _context.FileInformations.FirstOrDefault(x => x.Id == item.FileCode)?.Path;
        //        _context.UserInformations.Update(item);
        //        _context.SaveChanges();
        //    }

        //    return null;
        //}
        public class UserInfoDto
        {
            public int UserCode { get; set; }
            public string Name { get; set; }
            public string UserName { get; set; }
            public string UserPassword { get; set; }
            public string Address { get; set; }
            public string PhoneNumber { get; set; }
            public string Email { get; set; }
            public string Birthday { get; set; }
            public string Status { get; set; }
        }

    }
}

