using FakeFacebook.Commom;
using FakeFacebook.Data;
using FakeFacebook.ModelViewControllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Any;
using System.Security.Claims;

namespace FakeFacebook.Controllers.ChatBoxManagerment
{
    [ApiController]
    [Route("api/ActionMessage")]
    [Authorize]
    public class ActionMessageController:ControllerBase
    {
        private readonly FakeFacebookDbContext _context;
        public ActionMessageController(FakeFacebookDbContext context)
        {
            _context = context;
        }
        [HttpGet("GetAllMessageGroups")]
        public JsonResult GetAllMessageGroups()
        {
            var msg = new message() { Title = "", Error = false, Object ="" };
            var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            try
            {
                var GetGroup = _context.GroupMembers.Where(x => x.MemberCode == StaticUser && x.IsDeleted == false).ToList();
                List<NewMessageEachGroupModelViews> ListMessage = new List<NewMessageEachGroupModelViews>();
                for (int i = 0; i < GetGroup.Count; i++)
                {
                    var check = _context.ChatContents.OrderByDescending(x=>x.Id).FirstOrDefault(x => x.GroupChatId == GetGroup[i].GroupChatId && x.IsDeleted == false);
                    if (check!=null)
                    { 
                        check.Content=(check.Content==null)? "Tệp đính kèm" : check.Content;
                        check.Content =(check.CreatedBy==StaticUser)? ("Bạn: "+check.Content) : check.Content;
                        var InforGroup =  _context.ChatGroups.FirstOrDefault(x => x.IsDeleted == false && x.Id == GetGroup[i].GroupChatId);
                        var ListUser = (from a in _context.GroupMembers.Where(x => x.IsDeleted == false && x.GroupChatId == InforGroup.Id)
                                       join b in _context.UserInformations.Where(x => x.IsDeleted == false && x.Id!=StaticUser)
                                       on a.MemberCode equals b.Id
                                       join c in _context.FileInformations
                                       on b.FileCode equals c.Id
                                       select new UserOfNewMessage
                                       {
                                           UserCode= b.Id,
                                           Name=b.Name,
                                           Avatar= c.Path,
                                       }).ToList();


                        ListMessage.Add(new NewMessageEachGroupModelViews
                        {
                            GroupChatId=InforGroup.Id,
                            GroupAvatar= (InforGroup.GroupDouble == false) ?
                                        $"{Request.Scheme}://{Request.Host}/{InforGroup.GroupAvartar}":
                                        $"{Request.Scheme}://{Request.Host}/{ListUser[0].Avatar}",
                            GroupName = (InforGroup.GroupDouble==false)? InforGroup.GroupName: ListUser[0].Name,                      
                            ListUser = ListUser,
                            Status = GetGroup[i].Status,
                            NewMessage = new NewMessage
                            {
                                Id= check.Id,
                                Content = (ListUser.Any(a=>a.UserCode==check.CreatedBy) && check.CreatedBy!=StaticUser && InforGroup.GroupDouble == false) ?
                                          (ListUser.Find(a=>a.UserCode==check.CreatedBy).Name + ": " + check.Content) : check.Content,
                                CreatedBy= check.CreatedBy,
                                CreatedTime = check.CreatedTime,
                            },
                            
                        });                      
                    }  
                }
                msg.Object = ListMessage.OrderByDescending(x=>x.NewMessage.Id).ToList();
                msg.Title = "Lấy Danh sách tin nhắn các nhóm thành công";
            }
            catch(Exception e)
            {
                msg.Error = true;
                msg.Title = "có lỗi xảy ra: " + e.Message;

            }
            return new JsonResult(msg);
        }

        [HttpPost("SetStatusReadMessage")]
        public JsonResult SetStatusReadMessage([FromBody] int GroupChatId)
        {
            var msg = new message() { Title = "", Error = false, Object = "" };
            var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            try
            {
                var check = _context.GroupMembers.FirstOrDefault(x => x.MemberCode == StaticUser && x.GroupChatId == GroupChatId && x.IsDeleted == false);
                check.Status = true;
                _context.SaveChanges();

            }catch(Exception e)
            {
                msg.Error = true;
                msg.Title = "Lỗi: " + e.Message;
            }
            return new JsonResult(msg);
        }

    }
}
