using System.Text.Json.Serialization;

namespace ECommerceWeb.Models.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int VendorId { get; set; }
        public Vendor? Vendor { get; set; }
        public int CategoryId { get; set; }
        [JsonIgnore]
        public Category? Category { get; set; }
        public decimal Discount { get; set; }
        public int Quantity { get; set; }
        public decimal Ratings { get; set; } = 0;
        public string? ImageUrl { get; set; }
    }
}
