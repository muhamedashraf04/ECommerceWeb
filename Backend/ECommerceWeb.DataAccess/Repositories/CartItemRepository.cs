using ECommerceWeb.DataAccess.Data;
using ECommerceWeb.Models.Models;

namespace ECommerceWeb.DataAccess.Repositories
{
    public class CartItemRepository : BaseRepository<CartItem>
    {
        ApplicationDbContext _dbContext;

        public CartItemRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
