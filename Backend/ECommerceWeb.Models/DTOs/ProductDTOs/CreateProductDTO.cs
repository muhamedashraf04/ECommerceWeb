namespace ECommerceWeb.Models.DTOs.ProductDTOs
{
    public class CreateProductDTO
    {

        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public int Quantity { get; set; }
        public string? ImageUrl { get; set; }
    }
}