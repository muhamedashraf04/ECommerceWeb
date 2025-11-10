using ECommerceWeb.Infrastructure.Data;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Domain.Models;

namespace ECommerceWeb.Infrastructure.Repositories
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
