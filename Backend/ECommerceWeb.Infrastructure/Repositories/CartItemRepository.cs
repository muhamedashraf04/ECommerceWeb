using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Domain.Models;
using ECommerceWeb.Infrastructure.Data;

namespace ECommerceWeb.Infrastructure.Repositories
{
    public class CartItemRepository : BaseRepository<CartItem>, ICartItemRepository
    {
        ApplicationDbContext _dbContext;

        public CartItemRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
