using ECommerceWeb.DataAccess.Data;
using ECommerceWeb.DataAccess.Repositories.Interfaces;
using ECommerceWeb.Models.Models;

namespace ECommerceWeb.DataAccess.Repositories
{
    public class OrderItemRepository : BaseRepository<OrderItem>, IOrderItemRepository
    {
        ApplicationDbContext _dbContext;
        public OrderItemRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
