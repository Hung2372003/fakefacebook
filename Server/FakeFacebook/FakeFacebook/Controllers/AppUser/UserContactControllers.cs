using FakeFacebook.Data;
using FakeFacebook.ModelViewControllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FakeFacebook.Controllers.AppUser
{
    [ApiController]
   
    [Route("api/ContactUser")]
    public class UserContactControllers : ControllerBase
    {
        private readonly FakeFacebookDbContext _context;

        public UserContactControllers(FakeFacebookDbContext context)
        {
            _context = context;
        }

        [HttpGet("ListFrends")]
        [Authorize]
        public JsonResult GetListFriends() {
            //var check = HttpContext.User.Identity.Name;
            var check = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var friends = from a in _context.FriendDoubles.Where(x => (x.UserCode1 == check 
                                                                || x.UserCode2 == check)
                                                                && x.IsDeleted == false 
                                                                && x.Status == "ALREADY_FRIENDS").Take(20)
                          where (1 == 1)
                          select new {
                              UserCode = a.UserCode2 == check ? a.UserCode1 : a.UserCode2,
                          };

            var friendList = friends.ToList();
            var cout= new List<MutualFriend>();
            foreach (var item in friendList) {
                var x = from a in _context.FriendDoubles.Where(x => (x.UserCode1 == item.UserCode
                                                                || x.UserCode2 == item.UserCode)
                                                                && x.IsDeleted == false
                                                                && x.Status == "ALREADY_FRIENDS")

                        where (1 == 1)
                        select new
                        {
                            UserCode = a.UserCode2 == item.UserCode ? a.UserCode1 : a.UserCode2,
                        };

                var commonElements = x.ToList().Intersect(friendList).ToList();
                cout.Add(new MutualFriend
                {
                    UserCode = item.UserCode,
                    CoutMutualFriend=commonElements.Count

                });

            }
            var ListFriends = from a in friends.ToList()
                              join b in _context.UserInformations
                              on a.UserCode equals b.Id
                              join d in cout
                              on a.UserCode equals d.UserCode
                              join c in _context.FileInformations
                              on b.FileCode equals c.Id into c1
                              from c in c1.DefaultIfEmpty()
                             select new
                             {
                                 a.UserCode,
                                 b.Name,
                                 MutualFriend=d.CoutMutualFriend,
                                 Path = (c==null) ?
                                       $"{Request.Scheme}://{Request.Host}/Images/Avatar/mostavatar.png" :
                                       $"{Request.Scheme}://{Request.Host}/{c.Path}"

                             };     
            
            return new JsonResult(ListFriends.ToList());   
        }

       
    }
}
