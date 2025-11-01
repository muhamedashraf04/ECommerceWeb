using System.ComponentModel.DataAnnotations;

namespace ECommerceWeb.Models.Models
{
    public class OrderItem
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }
        [Required]
        public int Quantity { get; set; }
        [Required]
        public int OrderId { get; set; }
        public virtual Order? Order { get; set; }
        [Required]
        public decimal PriceATM { get; set; }
    }
}
