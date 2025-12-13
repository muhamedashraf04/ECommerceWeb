using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Domain.Models;
using ECommerceWeb.Infrastructure.Data;
namespace ECommerceWeb.Infrastructure.Repositories
{
    public class CategoryRepository : BaseRepository<Category>, ICategoryRepository
    {
        ApplicationDbContext _dbContext;
        public CategoryRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
