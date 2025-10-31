using System.ComponentModel.DataAnnotations;

namespace ECommerceWeb.Models.Models
{
    public class OrderItem : BaseModels.BaseItem
    {
        [Required]
        public int OrderId { get; set; }
        public virtual Order? Order { get; set; }
        [Required]
        public decimal? PriceATM { get; set; }
    }
}
