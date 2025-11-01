using System.ComponentModel.DataAnnotations;

namespace ECommerceWeb.Models.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string? Name { get; set; }
        public virtual ICollection<Product> SameCategoryProducts { get; set; } = new List<Product>();
    }
}
