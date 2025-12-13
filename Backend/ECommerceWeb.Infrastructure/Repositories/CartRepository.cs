using System.Linq.Expressions;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Domain.Models;
using ECommerceWeb.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;


namespace ECommerceWeb.Infrastructure.Repositories
{
    public class CartRepository : BaseRepository<Cart>, ICartRepository
    {
        ApplicationDbContext _dbContext;
        public CartRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Cart?> GetAsync(Expression<Func<Cart, bool>> predicate)
        {
            return await _dbContext.Cart
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(predicate);
        }
    }
}
