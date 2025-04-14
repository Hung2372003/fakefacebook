using FakeFacebook.Commom;
using FakeFacebook.Data;
using FakeFacebook.Models;
using FakeFacebook.ModelViewControllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Text;
using FakeFacebook.AES;

namespace FakeFacebook.Controllers.AppUser
{
    [ApiController]

    [Route("api/PersonalAction")]
    [Authorize]
    public class PersonalActionController:ControllerBase
    {
        private readonly FakeFacebookDbContext _context;
        private readonly IConfiguration _configuration;

        public PersonalActionController(FakeFacebookDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("GetPersonalInformation")]
        public JsonResult GetInformation([FromBody] int userCode)
        {
            var msg = new message() { Title = "", Error = false, Object = ""};
            var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var KeyAES = _configuration["AESKeyTest:AESKey"];
        
            try
            {
                var get = _context.UserInformations.FirstOrDefault(x => x.Id == userCode && x.IsDeleted == false);
                var checkFriend = _context.FriendDoubles.FirstOrDefault(x => ((x.UserCode1 == StaticUser && x.UserCode2 == userCode)
                                                                        || (x.UserCode2 == StaticUser && x.UserCode1 == userCode))
                                                                        && x.Status == "ALREADY_FRIENDS" && x.IsDeleted==false)?.Id;

                if (userCode == StaticUser)
                {
                    msg.Object = new
                    {
                        get.Id,
                        get.Name,
                        Address=AESDecryptioncs.Decryption(get.Address,KeyAES),
                        PhoneNumber=AESDecryptioncs.Decryption(get.PhoneNumber,KeyAES),
                        Email=AESDecryptioncs.Decryption(get?.Email,KeyAES),
                        IsFriend = checkFriend != null ? true : false,
                        Avatar = $"{Request.Scheme}://{Request.Host}/{get.Avatar}",
                    };
                }
                else
                {
                    msg.Object = new
                    {
                        get.Id,
                        get.Name,
                        get.Address,
                        get.PhoneNumber,
                        get.Email,
                        IsFriend = checkFriend != null ? true : false,
                        Avatar = $"{Request.Scheme}://{Request.Host}/{get.Avatar}",
                    };

                }

            }

            catch (Exception e)
            {
                msg.Error = true;
                msg.Title = "Có lỗi sảy ra :" + e;
            }
            return new JsonResult(msg);
        }

        [HttpGet("ListFrendRequest")]
        public JsonResult GetListFriendRequest()
        {
            //var check = HttpContext.User.Identity.Name;
            var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var friends = from a in _context.FriendDoubles.Where(x => (x.UserCode1 == StaticUser
                                                                || x.UserCode2 == StaticUser)
                                                                && x.IsDeleted == false
                                                                && x.Status == "WAITING_FRIENDED"
                                                                && x.CreatedBy != StaticUser
                                                                ).Take(20)
                          where (1 == 1)
                          select new
                          {
                              UserCode = a.UserCode2 == StaticUser ? a.UserCode1 : a.UserCode2,
                          };


            var friendList = friends.ToList();
            var cout = new List<MutualFriend>();
            foreach (var item in friendList)
            {
                var x = (from a in _context.FriendDoubles.Where(x => (x.UserCode1 == item.UserCode
                                                                || x.UserCode2 == item.UserCode)
                                                                && x.IsDeleted == false
                                                                && x.Status == "ALREADY_FRIENDS")
                        where (1 == 1)
                        select new
                        {
                            UserCode = a.UserCode2 == item.UserCode ? a.UserCode1 : a.UserCode2,
                        }).ToList();

                var commonElements = x.Intersect(friendList).ToList();
                cout.Add(new MutualFriend
                {
                    UserCode = item.UserCode,
                    CoutMutualFriend = commonElements.Count

                });

            }
            var ListFriends = from a in friendList
                              join b in _context.UserInformations
                              on a.UserCode equals b.Id
                              join d in cout
                              on a.UserCode equals d.UserCode
                              select new
                              {
                                  a.UserCode,
                                  b.Name,
                                  MutualFriend = d.CoutMutualFriend,
                                  Avatar = (b.Avatar == null) ?
                                        $"{Request.Scheme}://{Request.Host}/Images/Avatar/mostavatar.png" :
                                        $"{Request.Scheme}://{Request.Host}/{b.Avatar}"

                              };
          return new JsonResult(ListFriends.ToList());
        }

        [HttpPost("UpdatePersonalInfor")]
        public JsonResult UpdateAvatar([FromForm] UserInformationModelViews infor)
        {
            var msg = new message() { Error = false, Title = "", Object = "" };
            var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            try
            {
                var check = _context.UserInformations.FirstOrDefault(x => x.Id == StaticUser && x.IsDeleted == false);
                if (infor.Avatar != null)
                {
                    check.Avatar = "Images/Avatar/" + infor.Avatar?.FileName;
                    _context.SaveChanges();
                    var FilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/Images/Avatar", infor.Avatar.FileName);
                    using (var stream = new FileStream(FilePath, FileMode.Create))
                    {
                        infor.Avatar.CopyTo(stream);
                    }
                    msg.Object = $"{Request.Scheme}://{Request.Host}/{check.Avatar}";
                }
                check.Email = (infor.Email != "" && infor.Email !=null) ? infor.Email : check.Email;
                check.Name = (infor.Name != "" && infor.Name!=null)? infor.Name:check.Name;
                check.PhoneNumber = (infor.PhoneNumber !="" && infor.PhoneNumber!=null)?infor.PhoneNumber:check.PhoneNumber;
                check.Address = (infor.Address != "" && infor.Address!=null)? infor.Address:check.Address;
                check.UpdatedTime = DateTime.Now;
                check.UpdatedBy = StaticUser;
                _context.SaveChanges();

                msg.Object = new {

                    Id=check.Id,
                    Name=check.Name,
                    Address=check.Address,
                    PhoneNumber=check.PhoneNumber,
                    Email=check.Email,
                    IsFriend=false,
                    Avatar = $"{Request.Scheme}://{Request.Host}/{check.Avatar}",
                };
               
                msg.Title = "Cập nhật thành công";
            }
            catch(Exception e)
            {
                msg.Error = true;
                msg.Title = "Có lỗi sảy ra: " + e; 
            }
            return new JsonResult(msg);
        }

        [HttpPost("FriendRequest")]
        public IActionResult FriendRequest([FromBody] int FriendCode)
        {
           var msg=new message() { Title="",Error = false,Object=""};
           var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            try
            {
                var check =_context.FriendDoubles.FirstOrDefault(x => 
                                                                (x.UserCode1 == FriendCode&&x.UserCode2==StaticUser) 
                                                                || (x.UserCode1==StaticUser&&x.UserCode2==FriendCode)
                                                                && x.IsDeleted==false);
                if (check == null) {
                    var Add = new FriendDouble();
                    Add.UserCode1 = StaticUser;
                    Add.UserCode2 = FriendCode;
                    Add.CreatedBy = StaticUser;
                    Add.Status = "WAITING_FRIENDED";
                    Add.IsDeleted = false;
                    _context.FriendDoubles.Add(Add);
                    _context.SaveChanges();
                }
                else
                {
                    check.CreatedBy = StaticUser;
                    check.Status = "WAITING_FRIENDED";
                    _context.FriendDoubles.Update(check);
                    _context.SaveChanges();
                }
                msg.Title = "Đã gửi lời mời kết bạn";

              
            }
            catch (Exception e) {
                msg.Title="Lỗi: "+e.Message;
                msg.Error = true;
            
            }
            return new JsonResult(msg);
        }

        [HttpPost("FriendAccept")]
        public IActionResult FriendAccept([FromBody] int FriendCode)
        {
            var msg = new message() { Title = "", Error = false, Object = "" };
            var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            try
            {
                var check = _context.FriendDoubles.FirstOrDefault(x =>
                                                              (x.UserCode1 == FriendCode && x.UserCode2 == StaticUser)
                                                              || (x.UserCode1 == StaticUser && x.UserCode2 == FriendCode)
                                                              && x.IsDeleted == false);

                check.Status = "ALREADY_FRIENDS";
                _context.SaveChanges();
                msg.Title = "Kết bạn thành công";
            }
            catch(Exception e)
            {
                msg.Error=true;
                msg.Title = "Lỗi: " + e.Message;
            }
            return new JsonResult(msg);
        }

        [HttpPost("Unfriend")]
        public IActionResult Unfriend([FromBody] int FriendCode) {

            var msg = new message() { Title = "", Error = false, Object = "" };
            var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            try
            {
                var check = _context.FriendDoubles.FirstOrDefault(x =>
                                                            (x.UserCode1 == FriendCode && x.UserCode2 == StaticUser)
                                                            || (x.UserCode1 == StaticUser && x.UserCode2 == FriendCode)
                                                            && x.IsDeleted == false);

                _context.FriendDoubles.Remove(check);
                _context.SaveChanges();
                msg.Title = "Đã hủy kết bạn";
            }
            catch (Exception e) { 
                msg.Error=true;
                msg.Title="Lỗi: "+e.Message;
            }
            return new JsonResult(msg);

        }

        [HttpPost("SeachPeople")]
        public JsonResult SeachPeople([FromBody] string text) 
        {
            var msg = new message() { Title = "", Error = false, Object = "" };
            var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var friends = from a in _context.FriendDoubles.Where(x => (x.UserCode1 == StaticUser
                                                                || x.UserCode2 == StaticUser)
                                                                && x.Status == "ALREADY_FRIENDS"
                                                                && x.IsDeleted == false
                                                               ).Take(20)
                          where (1 == 1)
                          select new
                          {
                              UserCode = a.UserCode2 == StaticUser ? a.UserCode1 : a.UserCode2,
                          };
            var friendList = friends.ToList();

            var user = (from a in _context.UserInformations.Where(x => x.IsDeleted == false).Take(10).ToList()
                        .Where(x => ContainsCharIgnoreCaseAndDiacritics(x.Name, text) || Convert.ToString(x.Id)==text).ToList()
                       select new
                       {
                           a.Id,
                           a.Name,
                           a.Address,
                           a.Email,
                           a.PhoneNumber,
                           Status=_context.FriendDoubles.FirstOrDefault(x=> (x.UserCode1 == a.Id && x.UserCode2 == StaticUser) 
                                                                            || (x.UserCode2 == a.Id && x.UserCode1 == StaticUser)
                                                                            &&x.IsDeleted==false)?.Status,                                              
                           Avatar= (a.Avatar!=null)? $"{Request.Scheme}://{Request.Host}/{a.Avatar}"
                                                 : $"{Request.Scheme}://{Request.Host}/Images/Avatar/mostavatar.png",
                       }).ToList();
            var cout = new List<MutualFriend>();
            foreach (var item in user)
            {
                var x = (from a in _context.FriendDoubles.Where(x => (x.UserCode1 == item.Id
                                                                || x.UserCode2 == item.Id)
                                                                && x.IsDeleted == false
                                                                && x.Status== "ALREADY_FRIENDS")

                         where (1 == 1)
                         select new
                         {
                             UserCode = a.UserCode2 == item.Id ? a.UserCode1 : a.UserCode2,
                         }).ToList();

                var commonElements = x.Intersect(friendList).ToList();
                cout.Add(new MutualFriend
                {
                    UserCode = item.Id,
                    CoutMutualFriend = commonElements.Count

                });

            }
            var ListUser = (from a in user
                              join d in cout
                              on a.Id equals d.UserCode
                              select new
                              {
                                  a.Id,
                                  a.Name,
                                  a.PhoneNumber,
                                  a.Email,
                                  a.Address,
                                  a.Avatar,
                                  a.Status,
                                  MutualFriend = d.CoutMutualFriend,
                                
                              }).ToList();

            return new JsonResult(ListUser);
        }

        static bool ContainsCharIgnoreCaseAndDiacritics(string input, string character)
        {
            // Chuẩn hóa chuỗi và ký tự để loại bỏ dấu
            string normalizedInput = RemoveDiacritics(input.ToLower());
            string normalizedCharacter = RemoveDiacritics(character.ToLower());

            // Kiểm tra sự tồn tại của ký tự trong chuỗi
            return normalizedInput.Contains(normalizedCharacter);
        }

        static string RemoveDiacritics(string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return text;
            }

            // Chuẩn hóa thành dạng NFD (Normalization Form Decomposition)
            string normalizedText = text.Normalize(NormalizationForm.FormD);

            // Loại bỏ các ký tự dấu (thuộc dải Unicode từ U+0300 đến U+036F)
            Regex regex = new Regex(@"\p{Mn}");
            return regex.Replace(normalizedText, string.Empty);
        }

    }
}
