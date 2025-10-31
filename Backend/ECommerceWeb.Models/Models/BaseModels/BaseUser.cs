using System.ComponentModel.DataAnnotations;

namespace ECommerceWeb.Models.Models.BaseModels
{
    public abstract class BaseUser
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string? FirstName { get; set; }
        [Required]
        public string? LastName {  get; set; }
        [EmailAddress]
        [Required]
        public string? Email { get; set; }
        [Required]
        public string? Password { get; set; }
        [Phone]
        [Required]
        public string? Phone { get; set; }
        public string? Address { get; set; } = string.Empty;
    }
}
