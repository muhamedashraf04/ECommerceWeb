using System.Linq.Expressions;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Domain.Models;
using ECommerceWeb.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ECommerceWeb.Infrastructure.Repositories
{
    public class ProductRepository : BaseRepository<Product>, IProductRepository
    {
        private readonly ApplicationDbContext _dbContext;
        public ProductRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }

        public override async Task<IEnumerable<Product>> GetAllAsync(Expression<Func<Product, bool>>? filter = null)
        {
            IQueryable<Product> query = _dbContext.Product.Include(p => p.Category);
            if (filter != null)
            {
                query = query.Where(filter);
            }
            return await query.ToListAsync();
        }

        public override async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _dbContext.Product.Include(p => p.Category).ToListAsync();
        }

        public override async Task<Product?> GetAsync(Expression<Func<Product, bool>> filter)
        {
            return await _dbContext.Product.Include(p => p.Category).FirstOrDefaultAsync(filter);
        }
    }
}
