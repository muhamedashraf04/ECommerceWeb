using System.ComponentModel.DataAnnotations;

namespace ECommerceWeb.Models.DTOs
{
    public class UserLoginDTO
    {
        [Required]
        [EmailAddress]
        public string? Email { get; set; }
        [Required]
        public string? Password { get; set; }
    }
}
