using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Domain.Models;
using ECommerceWeb.Infrastructure.Data;

namespace ECommerceWeb.Infrastructure.Repositories
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
