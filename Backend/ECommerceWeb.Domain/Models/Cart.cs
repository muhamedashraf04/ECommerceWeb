namespace ECommerceWeb.Domain.Models
{
    public class Cart : BaseModels.CollectionBase
    {
        public virtual ICollection<CartItem>? CartItems { get; set; } = new List<CartItem>();
        public int NumOfItems { get; set; }
    }
}
