using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace FakeFacebook.Models
{
    [Table("CHAT_GROUP_DOUBLE")]
    public class ChatGroupDouble
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int UserCode1 { get; set; }
        public int UserCode2 { get; set; }
        public bool StatusUser1 { get; set; }
        public bool StatusUser2 { get; set; }
    }
}
