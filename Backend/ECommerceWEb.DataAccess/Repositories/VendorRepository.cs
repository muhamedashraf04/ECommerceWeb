using ECommerceWeb.DataAccess.Data;
using ECommerceWeb.DataAccess.Repositories.Interfaces;
using ECommerceWeb.Models.Models;

namespace ECommerceWeb.DataAccess.Repositories
{
    public class VendorRepository : BaseRepository<Vendor>, IVendorRepository
    {
        ApplicationDbContext _dbContext;
        public VendorRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
