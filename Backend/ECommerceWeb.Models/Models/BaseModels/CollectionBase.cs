using System.ComponentModel.DataAnnotations;


namespace ECommerceWeb.Domain.Models.BaseModels
{
    public abstract class CollectionBase
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int UserId { get; set; }
        public virtual Customer? Customer { get; set; }

        public decimal TotalAmount { get; set; }
    }
}
