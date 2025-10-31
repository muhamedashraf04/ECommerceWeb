using System.ComponentModel.DataAnnotations;
using ECommerceWeb.Models.Models.BaseModels;

namespace ECommerceWeb.Models.Models
{
    public class CartItem : BaseItem
    {
        [Required]
        public int CartId { get; set; }
        public virtual Cart? Cart { get; set; }
    }
}
