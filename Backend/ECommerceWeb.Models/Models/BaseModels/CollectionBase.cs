using System.ComponentModel.DataAnnotations;

namespace ECommerceWeb.Models.Models.BaseModels
{
    public class CollectionBase
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int UserId { get; set; }
        public virtual Customer? Customer { get; set; }

        public decimal TotalAmount { get; set; }
    }
}
