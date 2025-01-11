using FakeFacebook.Commom;
using FakeFacebook.Data;
using FakeFacebook.Models;
using FakeFacebook.ModelViewControllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


namespace FakeFacebook.Controllers.Post
{
    [ApiController]
    [Route("api/PostManagement")]
    [Authorize]
    public class PostManagementController:ControllerBase
    {
        private readonly FakeFacebookDbContext _context;
        public PostManagementController(FakeFacebookDbContext context)
        {
            _context = context;
        }

        [HttpGet("GetPost")]
        public IActionResult GetPost()
        {
            var msg = new message() { Title = "", Error = false, Object = new List<object>() };
            var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            try
            {
                var GetPostCheck = from a in _context.Posts.Where(x => (x.Status == "PUBLIC" || x.Status == "FRIEND") && x.IsDeleted == false)
                                .OrderByDescending(x => x.Id)
                                .Take(30)

                                   join b in _context.UserInformations
                                   on a.CreatedBy equals b.Id
                                   join c in _context.FileInformations
                                   on b.FileCode equals c.Id
                                   join g in _context.FileInformations
                                   on a.Id equals g.Code into g1
                                   from g in g1.DefaultIfEmpty()
                                   group new { g, a, b, c }
                                   by new
                                   {
                                       a.Id,
                                       a.Content,
                                       a.CreatedBy,
                                       a.CreatedTime,
                                       a.Status,
                                       a.CommentNumber,
                                       a.LikeNumber,
                                       Like = (_context.FeelingPosts.FirstOrDefault(x=>x.CreatedBy==StaticUser && x.PostId==a.Id).Like == true)?true:false,
                                       b.Name,
                                       Avatar = Request.Scheme + "://" + Request.Host + "/" + c.Path,

                                   } into e 
                               select new
                               {
                                   e.Key.Id,
                                   e.Key.Content,
                                   e.Key.CreatedBy,
                                   e.Key.CreatedTime,
                                   e.Key.Status,
                                   e.Key.LikeNumber,
                                   e.Key.CommentNumber,
                                   e.Key.Like,
                                   e.Key.Avatar,
                                   e.Key.Name,
                                   ListFile = e.Where(x => x.g != null).Select(x => new
                                   {
                                       x.g.Id,
                                       Path = Request.Scheme + "://" + Request.Host + "/" + x.g.Path,
                                       x.g.Type
                                   }).ToList()
                               };

                var GetPost = GetPostCheck.ToList();
            for (int i = 0; i < GetPost.Count; i++)
            {
                if (GetPost[i].Status == "FRIEND")
                {
                    var check = _context.FriendDoubles.FirstOrDefault(x =>
                                                        (x.UserCode1 == GetPost[i].CreatedBy && x.UserCode2 == StaticUser)
                                                        || (x.UserCode2 == GetPost[i].CreatedBy && x.UserCode1 == StaticUser));
                    if (check == null)
                    {
                        GetPost.Remove(GetPost[i]);
                    }
                }
            }
            msg.Object = GetPost.OrderByDescending(x => x.Id);
        }
            catch (Exception ex) { 
                msg.Title = ex.Message;
                msg.Error = true;
            
            }
            return new JsonResult(msg);

        }
        [HttpPost("GetPostComment")]
        public IActionResult GetPostComment([FromBody] int id) {
            var msg = new message() { Title = "", Error = false, Object = "" };
            var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            try
            {
                var data = from a in _context.PostComments.Where(x => x.PostCode == id && x.IsDeleted == false).OrderByDescending(x => x.Id).Take(30)
                           join b in _context.UserInformations
                           on a.CreatedBy equals b.Id
                           join c in _context.FileInformations
                           on b.FileCode equals c.Id
                           select new
                           {
                               a.Id,
                               a.CreatedTime,
                               a.CreatedBy,
                               a.Content,
                               b.Name,
                               Avatar = $"{Request.Scheme}://{Request.Host}/{c.Path}",
                           };
                msg.Object = data.OrderByDescending(x => x.Id).ToList();
            }catch(Exception e)
            {
                msg.Title = e.Message;
                msg.Error = true;
            }
            return new JsonResult(msg);
        }


        [HttpPost("AddNewPost")]
        public JsonResult AddNewPost([FromForm] PostManagementModelViews data)
        {
            var msg = new message() { Title = "", Error = false, Object = "" };
            var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            try
            {
              
                var add = new Posts();
                add.Content =data.Content;
                add.CreatedTime= DateTime.Now;
                add.CreatedBy = StaticUser;
                add.Status=data.Status;
                add.IsDeleted = false;
                _context.Posts.Add(add);
                _context.SaveChanges();

                if (data.Files != null)
                {
                    foreach (var file in data.Files)
                    {
                        var addfile =new FileInformation();
                        addfile.Name = file.Name;
                        addfile.Path = "PostFile/" + file.FileName;
                        addfile.Type=file.ContentType;
                        addfile.Code = add.Id;
                        addfile.CreatedTime = DateTime.Now;
                        addfile.CreatedBy = StaticUser;
                        addfile.IsDeleted = false;
                        _context.FileInformations.Add(addfile);
                        _context.SaveChanges();

                        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/PostFile", file.FileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                    }
                }
                msg.Object = add;
                msg.Title = "Đăng bài thành công";

            }
            catch (Exception e) 
            {

                msg.Title = "Có lỗi xảy ra: " + e;
                msg.Error = true;
            }
            return new JsonResult(msg);
        }


        [HttpPost("AddComment")]
        public JsonResult AddComment(CommentModelViews data)
        {
            var msg = new message() { Title = "", Error = false, Object = "" };
            var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            try
            {
                var post = _context.Posts.FirstOrDefault(x => x.Id == data.PostCode && x.IsDeleted == false);
                
                post.CommentNumber = post.CommentNumber + 1;
                var addNew = new PostComment();
                addNew.PostCode=data.PostCode;
                addNew.Content = data.Content;
                addNew.CreatedBy = StaticUser;
                addNew.IsDeleted = false;
                addNew.CreatedTime = DateTime.Now;

                _context.PostComments.Add(addNew);
                _context.SaveChanges();

                var user = _context.UserInformations.FirstOrDefault(x => x.Id == addNew.CreatedBy);
                var avatar = _context.FileInformations.FirstOrDefault(x => x.Id == user.FileCode).Path;
                msg.Title = "Bình luận Thành công";
                msg.Object = new {

                    CreatedTime=addNew.CreatedTime,
                    CreatedBy=addNew.CreatedBy,
                    Content=addNew.Content,
                    Name= user.Name,
                    Avatar = $"{Request.Scheme}://{Request.Host}/{avatar}",
                };
            }
            catch (Exception ex)
            {
                msg.Error= true;
                msg.Title= ex.Message;
            }
            return new JsonResult(msg);

        }

        [HttpPost("FeelPost")]
        public JsonResult FeelPost([FromBody] int id)
        {
            var StaticUser = Convert.ToInt32(HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var msg = new message() { Title = "", Error = false, Object = "" };
            try
            {
                var check = _context.FeelingPosts.FirstOrDefault(x => x.CreatedBy == StaticUser && x.PostId == id);
                
                if (check != null)
                {
                    check.Like = !check.Like;
                    _context.SaveChanges();
                    if (check.Like == true)
                    {
                        var post = _context.Posts.FirstOrDefault(x => x.Id == id);
                        post.LikeNumber = post.LikeNumber + 1;
                    }
                    else
                    {
                        var post = _context.Posts.FirstOrDefault(x => x.Id == id);
                        post.LikeNumber = post.LikeNumber - 1;
                    }
                    _context.SaveChanges();
                }
                else
                {
                    var add = new FeelingPost();
                    add.PostId = id;
                    add.Like = true;
                    add.CreatedBy = StaticUser;
                    _context.FeelingPosts.Add(add);

                    var post = _context.Posts.FirstOrDefault(x => x.Id == id);
                    post.LikeNumber = post.LikeNumber + 1;
                    _context.SaveChanges();

                }
                msg.Title = "like ok";
                
            }
            catch (Exception e)
            {

            }
            return new JsonResult(msg);
        }

    }
}
