namespace ECommerceWeb.Domain.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public virtual ICollection<Product> SameCategoryProducts { get; set; } = new List<Product>();
    }
}
