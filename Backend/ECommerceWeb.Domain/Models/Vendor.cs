using System.ComponentModel.DataAnnotations;


namespace ECommerceWeb.Domain.Models
{
    public class Vendor : BaseModels.BaseUser
    {
        [Required]
        public string? CompanyName { get; set; }
        [Url]
        public string? NationalIdImage { get; set; }
        public virtual ICollection<Product> VendorProducts { get; set; } = new List<Product>();
    }
}
