using System.ComponentModel.DataAnnotations;

namespace ECommerceWeb.Models.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string? Name { get; set; }

        [Required]
        public string? Description { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int VendorId { get; set; }
        public Vendor? Vendor { get; set; }
        [Required]
        public int CategoryId { get; set; }
        public Category? Category { get; set; }

        public decimal Discount { get; set; }
        [Required]
        public int Quantity { get; set; }
        public decimal Ratings { get; set; } = 0;
        [Url]
        public string? ImageUrl { get; set; }
    }
}
