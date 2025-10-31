namespace ECommerceWeb.Models.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Vendor_ID { get; set; }
        public int Category_ID { get; set; }
        public decimal Discount { get; set; }
        public decimal PriceDiscount { get; set; }
        public int Quantity { get; set; }
        public decimal ratings { get; set; }
    }
}
