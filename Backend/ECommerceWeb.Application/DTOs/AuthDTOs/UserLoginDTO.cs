using System.ComponentModel.DataAnnotations;

namespace ECommerceWeb.Application.DTOs.AuthDTOs
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
