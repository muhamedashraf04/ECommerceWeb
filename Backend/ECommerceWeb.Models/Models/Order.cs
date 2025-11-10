using System.ComponentModel.DataAnnotations;

namespace ECommerceWeb.Domain.Models
{
    public class Order : BaseModels.CollectionBase
    {
        public string? OrderStatus { get; set; }
        public virtual ICollection<OrderItem>? OrderItems { get; set; } = new List<OrderItem>();
        [Required]
        public string? Address { get; set; }
        
    }
}
