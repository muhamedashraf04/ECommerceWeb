namespace ECommerceWeb.Models.Models
{
    public class Cart : BaseModels.CollectionBase
    {
        public virtual ICollection<CartItem>? CartItems { get; set; } = new List<CartItem>();

    }
}
