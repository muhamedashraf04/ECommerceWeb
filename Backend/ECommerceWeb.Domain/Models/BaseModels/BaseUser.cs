using System.ComponentModel.DataAnnotations;


namespace ECommerceWeb.Domain.Models.BaseModels
{
    public abstract class BaseUser
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string? Name { get; set; }
        [EmailAddress]
        [Required]
        public string? Email { get; set; }
        [Required]
        public string? PasswordHash { get; set; }
        [Phone]
        [Required]
        public string? Phone { get; set; }
        public string? Address { get; set; } = string.Empty;
    }
}
