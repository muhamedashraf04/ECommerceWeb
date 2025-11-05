using ECommerceWeb.DataAccess.Data;
using ECommerceWeb.DataAccess.Repositories.Interfaces;
using ECommerceWeb.Models.Models;

namespace ECommerceWeb.DataAccess.Repositories
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
