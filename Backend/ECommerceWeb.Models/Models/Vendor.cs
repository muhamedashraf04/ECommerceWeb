using System.ComponentModel.DataAnnotations;

namespace ECommerceWeb.Models.Models
{
    public class Vendor : BaseModels.BaseUser
    {
        [Required]
        public string? CompanyName { get; set; }
        [Url]
        public string? NationalIdImage { get; set; }
    }
}
