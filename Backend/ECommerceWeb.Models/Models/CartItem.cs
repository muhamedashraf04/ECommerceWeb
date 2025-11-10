using System.ComponentModel.DataAnnotations;

namespace ECommerceWeb.Domain.Models
{
    public class CartItem // No more : BaseItem
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }
        [Required]
        public int Quantity { get; set; }
        [Required]
        public int CartId { get; set; }
        public virtual Cart? Cart { get; set; }
    }
}
