using FakeFacebook.AES;
using FakeFacebook.Commom;
using FakeFacebook.Data;
using FakeFacebook.Models;
using FakeFacebook.ModelViewControllers.AccountSecurity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Security.Claims;
namespace FakeFacebook.Controllers.AccountSecurity
{
    [ApiController]
    [Route("api/Security")]
   
    public class UserSecurityController : ControllerBase
    {
        private readonly string? _key;
        private readonly string? _keyAES;
        private readonly FakeFacebookDbContext _context;
        private readonly JwtTokenService _jwtService;
        private readonly RsaKeyManager _keyManager;
        public UserSecurityController(IConfiguration configuration, FakeFacebookDbContext context, JwtTokenService jwtService, RsaKeyManager keyManager) {
            _key = configuration["JwtSettings:SecretKey"];
            _context = context;
            _keyAES = Environment.GetEnvironmentVariable("MASTER_KEY", EnvironmentVariableTarget.Machine);
            _jwtService = jwtService;
            _keyManager = keyManager;
        }

        [HttpPost("GetKeyAES")]
        public JsonResult GetKeyAES([FromBody] string publicKey)
        {
            var msg = new message() { Id = null, Title = "", Error = false, Object = "" };
            string encryptedAESKey = RsaKeyManager.EncryptAESKeyWithRSA(_keyAES, publicKey);
            msg.Object = encryptedAESKey;
            return new JsonResult(msg);
        }

        [HttpGet("GetPublicRSAKey")]
        public JsonResult GetPublicRSAKey()
        {
            var msg = new message() { Title = "", Error = false, Object = "" };
            var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            RSA rsa = RSA.Create(2048);
            string publicKeyPem = _keyManager.ExportPublicKeyToPem();
            msg.Object = publicKeyPem;
            return new JsonResult(msg);
        }

        // Đăng nhập
        [HttpPost("UserLogin")]
        public JsonResult UserLogin([FromBody] LoginModelViews loginModel) 
        {
            var msg = new message() { Id=null,Title = "", Error = false, Object = "" };
            try {
                string privateKey = _keyManager.ExportPrivateKeyToPem();
                string AESKey = RsaKeyManager.DecryptWithPrivateKey(privateKey, loginModel.Key);
                loginModel.UserName = AESDecryptioncs.Decryption(loginModel.UserName, AESKey);
                loginModel.Password = AESDecryptioncs.Decryption(loginModel.Password, AESKey);
                var CheckUser = _context.UserAccounts.FirstOrDefault(x => x.UserName == AESEncryption.Encryption(loginModel.UserName,_keyAES) && x.IsEncryption == true);
                if ( CheckUser!=null && CheckUser.UserPassword == AESEncryption.Encryption(loginModel.Password,_keyAES) ) {
                    var token = _jwtService.GenerateJwtToken(CheckUser.UserCode, CheckUser.Role, CheckUser.Permission);
                    msg.Title = "Đăng nhập thành công";
                    msg.Object = token;
                    msg.Id = CheckUser.UserCode;
                    return new JsonResult(msg);
                }
                else if (  CheckUser != null && CheckUser.UserPassword != AESEncryption.Encryption(loginModel.Password,_keyAES))
                {
                    msg.Error = true;
                    msg.Title = "PassFalse";
                }    
                else {
                    msg.Error = true;
                    msg.Title = "UserFalse";
                }
            }
            catch(Exception e) {
                msg.Error = true;
                msg.Title = " Có lỗi xảy ra khi đăng nhập: " + e.Message;
                
            }
            return new JsonResult(msg);
        }
        //Đăng ký
        [HttpPost("RegisterAcc")]
        public JsonResult RegisterAcc([FromBody] RegisterAccModelViews RegAcc)
        { 
            var msg = new message() { Id = null, Title = "", Error = false, Object = "" };
            try
            {
                string privateKey = _keyManager.ExportPrivateKeyToPem();
                string AESKey = RsaKeyManager.DecryptWithPrivateKey(privateKey, RegAcc.Key);
                RegAcc.Email = AESDecryptioncs.Decryption(RegAcc.Email, AESKey);
                RegAcc.Address = AESDecryptioncs.Decryption(RegAcc.Address, AESKey);
                RegAcc.PhoneNumber = AESDecryptioncs.Decryption(RegAcc.PhoneNumber, AESKey);
                RegAcc.UserAccout = AESDecryptioncs.Decryption(RegAcc.UserAccout, AESKey);
                RegAcc.Password = AESDecryptioncs.Decryption(RegAcc.Password, AESKey);
                RegAcc.Birthday = AESDecryptioncs.Decryption(RegAcc.Birthday, AESKey);
                var check = _context.UserAccounts.FirstOrDefault(x => AESEncryption.Encryption(x.UserName,_keyAES) == RegAcc.UserAccout && x.IsEncryption==true);
                if (check != null) {
                    msg.Error = true;
                    msg.Title = "Tên tài khoản đã tồn tại";
                    return new JsonResult(msg);
                }

                var AddInfor = new UserInformation();
                AddInfor.IsDeleted = false;
                AddInfor.Name = RegAcc.FirstName + " " + RegAcc.LastName;
                AddInfor.Email = AESEncryption.Encryption(RegAcc.Email,_keyAES);
                AddInfor.PhoneNumber= AESEncryption.Encryption(RegAcc.PhoneNumber, _keyAES);
                AddInfor.Address = AESEncryption.Encryption(RegAcc.Address, _keyAES);
                AddInfor.Birthday= AESEncryption.Encryption(RegAcc.Birthday,_keyAES);
                AddInfor.Avatar= "/Images/Avatar/mostavatar.png";
                AddInfor.IsEncryption = true;
                _context.UserInformations.Add(AddInfor);
                _context.SaveChanges();

                var AddAcc = new UserAccount();
                AddAcc.UserCode = AddInfor.Id;
                AddAcc.IsDeleted = false;
                AddAcc.UserName = AESEncryption.Encryption(RegAcc.UserAccout, _keyAES);
                AddAcc.UserPassword = AESEncryption.Encryption(RegAcc.Password, _keyAES);
                AddAcc.CreatedTime = DateTime.Now;
                AddAcc.UpdatedTime= DateTime.Now;
                AddAcc.CreatedBy = AddInfor.Id;
                AddAcc.IsEncryption = true;
                AddAcc.Role = "User";
                AddAcc.Permission = "NOT";
                _context.UserAccounts.Add(AddAcc);
                _context.SaveChanges();

                var token = _jwtService.GenerateJwtToken(AddAcc.UserCode, AddAcc.Role, AddAcc.Permission);
                Response.Cookies.Append("token", token, new CookieOptions
                {
                    HttpOnly = false, 
                    Secure = false,   
                    SameSite = SameSiteMode.None, 
                    Expires = DateTimeOffset.UtcNow.AddHours(24)
                });
                msg.Object = token;
                msg.Id = AddAcc.UserCode;

                return new JsonResult(msg);
            }
            catch (Exception e) 
            {
                msg.Title="có lỗi xảy ra khi tạo tài khoản: " + e.Message;
                msg.Error = true;
                return new JsonResult(msg);
            }
           
        }

    }
}
