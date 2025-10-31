using System.ComponentModel.DataAnnotations;

namespace ECommerceWeb.Models.Models.BaseModels
{
    public class BaseItem
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }
        [Required]
        public int Quantity { get; set; }
    }
}
