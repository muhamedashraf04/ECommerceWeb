using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace ECommerceWeb.Application.DTOs.AuthDTOs
{
    public class UserRegisterDTO
    {
        [Required]
        public string? Name { get; set; }
        [Required]
        [EmailAddress]
        public string? Email { get; set; }
        [Required]
        public string? Password { get; set; }
        [Required]
        public string? Phone { get; set; }
        public string? Address { get; set; }
        [Required]
        public required string Role { get; set; }

        // Vendor-specific
        public string? CompanyName { get; set; }
        public IFormFile? NationalIdImage { get; set; }    }
}
