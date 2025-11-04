using System.ComponentModel.DataAnnotations;

namespace ECommerceWeb.Models.DTOs
{
    public class UserDTO
    {
        public int Id { get; set; }
        [Required]
        public string? Name { get; set; }
        public string? Password { get; set; }

    }
}
