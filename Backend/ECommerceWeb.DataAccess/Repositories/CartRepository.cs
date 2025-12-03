using ECommerceWeb.DataAccess.Data;
using ECommerceWeb.DataAccess.Repositories.Interfaces;
using ECommerceWeb.Models.Models;

namespace ECommerceWeb.DataAccess.Repositories
{
    public class CartRepository : BaseRepository<Cart>, ICartRepository
    {
        ApplicationDbContext _dbContext;
        public CartRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
