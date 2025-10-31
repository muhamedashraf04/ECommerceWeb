    // In: ECommercerWEb.DataAccess/Data/ApplicationDbContext.cs
using ECommerceWeb.Models.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerceWeb.DataAccess.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public DbSet<Product> Product { get; set; }

    }
}