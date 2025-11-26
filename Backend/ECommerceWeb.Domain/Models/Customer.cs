
namespace ECommerceWeb.Domain.Models
{
    public class Customer : BaseModels.BaseUser
    {
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public Cart? Cart { get; set; }
    }
}
