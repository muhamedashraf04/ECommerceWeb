using System.ComponentModel.DataAnnotations;

namespace ECommerceWeb.Models.DTOs
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
        public string Role { get; set; } // "Customer" or "Vendor"

        // Vendor-specific
        public string? CompanyName { get; set; }
        public string? NationalIdImage { get; set; }
    }
}
