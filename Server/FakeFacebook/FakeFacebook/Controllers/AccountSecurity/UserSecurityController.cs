using FakeFacebook.Commom;
using FakeFacebook.Data;
using FakeFacebook.Models;
using FakeFacebook.ModelViewControllers.AccountSecurity;

using Microsoft.AspNetCore.Mvc;

using Microsoft.IdentityModel.Tokens;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
namespace FakeFacebook.Controllers.AccountSecurity
{
    [ApiController]
    [Route("api/Security")]
   
    public class UserSecurityController : ControllerBase
    {

        private readonly string? _key;
        private readonly FakeFacebookDbContext _context;

        public UserSecurityController(IConfiguration configuration, FakeFacebookDbContext context) {
            _key = configuration["JwtSettings:SecretKey"];
            _context = context;
        }

        // Đăng nhập
        [HttpPost("UserLogin")]
        public JsonResult UserLogin([FromBody] LoginModelViews loginModel) 
        {
            var msg = new message() { Id=null,Title = "", Error = false, Object = "" };
            try {
                var CheckUser = _context.UserAccounts.FirstOrDefault(x => x.UserName == loginModel.UserName);
                if ( CheckUser!=null && CheckUser.UserPassword == loginModel.Password ) {
                    var token = GenerateJwtToken(CheckUser.UserCode);
                    Response.Cookies.Append("token", token, new CookieOptions
                    {
                        Expires = DateTimeOffset.UtcNow.AddHours(24),
                        SameSite = SameSiteMode.None,
                        Secure = false
                    });
                    msg.Title = "đăng nhập thành công";
                    msg.Object = token;
                    msg.Id = CheckUser.UserCode;
                    return new JsonResult(msg);
                }
                else if (  CheckUser != null && CheckUser.UserPassword != loginModel.Password )
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

        // tạo Token
        private string GenerateJwtToken(int usercode)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_key);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, usercode.ToString() ) }),
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        //Đăng ký
        [HttpPost("RegisterAcc")]
        public JsonResult RegisterAcc([FromBody] RegisterAccModelViews RegAcc)
        {
            var msg = new message() { Id = null, Title = "", Error = false, Object = "" };
            try
            {
                var check = _context.UserAccounts.FirstOrDefault(x => x.UserName == RegAcc.UserAccout);
                if (check != null) {
                    msg.Error = true;
                    msg.Title = "Tên tài khoản đã tồn tại";
                    return new JsonResult(msg);
                }

                var AddAvatar = new FileInformation();
                AddAvatar.CreatedTime = DateTime.Now;
                AddAvatar.IsDeleted = false;
                AddAvatar.Path = "/Images/Avatar/mostavatar.png";
                _context.Add(AddAvatar);
                _context.SaveChanges();

                var AddInfor = new UserInformation();
                AddInfor.IsDeleted = false;
                AddInfor.Name = RegAcc.FirstName + " " + RegAcc.LastName;
                AddInfor.Email = RegAcc.Email;
                AddInfor.PhoneNumber= RegAcc.PhoneNumber;
                AddInfor.Address = RegAcc.Address;
                AddInfor.FileCode = AddAvatar.Id;
                _context.UserInformations.Add(AddInfor);
                _context.SaveChanges();

                var AddAcc = new UserAccount();
                AddAcc.UserCode = AddInfor.Id;
                AddAcc.IsDeleted = false;
                AddAcc.UserName = RegAcc.UserAccout;
                AddAcc.UserPassword = RegAcc.Password;
                AddAcc.CreatedTime = DateTime.Now;
                AddAcc.UpdatedTime= DateTime.Now;
                _context.UserAccounts.Add(AddAcc);
                _context.SaveChanges();



                var token = GenerateJwtToken(AddAcc.UserCode);
                Response.Cookies.Append("token", token, new CookieOptions
                {
                    HttpOnly = false, // Thay đổi thành true nếu bạn không cần truy cập cookie từ JavaScript
                    Secure = false,   // Đặt thành true khi chạy trên HTTPS
                    SameSite = SameSiteMode.None, // Cho phép cookie được gửi từ cross-origin
                    Expires = DateTimeOffset.UtcNow.AddHours(24)
                });
                msg.Object = token;
                msg.Title = "Chào mừng bạn đến với FakeFaceBook";
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
