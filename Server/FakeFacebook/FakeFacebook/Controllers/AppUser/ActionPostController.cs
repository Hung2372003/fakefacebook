using FakeFacebook.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FakeFacebook.Controllers.AppUser
{

    [ApiController]
    [Route("api/ActionPost")]
    public class ActionPostController :ControllerBase
    {
        private readonly FakeFacebookDbContext _context;

        public ActionPostController(FakeFacebookDbContext context)
        {
            _context = context;
        }
        [HttpPost("ok")]
        public JsonResult Post([FromBody] SensorData data)
        {
            if (data == null)
            {
                return new JsonResult("");
            }

            // Log dữ liệu nhận được
            Console.WriteLine($"Received data: Temperature = {data.Temperature}, Humidity = {data.Humidity}");

            // Trả phản hồi cho ESP32
            return new JsonResult("");
        }

        public class SensorData
        {
            public float Temperature { get; set; }
            public int Humidity { get; set; }
        }
    }
}
