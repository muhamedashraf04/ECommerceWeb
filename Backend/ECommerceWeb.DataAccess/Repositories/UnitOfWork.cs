using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Infrastructure.Data;

namespace ECommerceWeb.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        public ICartRepository CartRepository { get; set; }

        public ICategoryRepository CategoryRepository { get; set; }

        public ICustomerRepository CustomerRepository { get; set; }

        public IOrderItemRepository OrderItemRepository { get; set; }

        public IOrderRepository OrderRepository { get; set; }

        public IProductRepository ProductRepository { get; set; }

        public IVendorRepository VendorRepository { get; set; }

        public ApplicationDbContext DbContext { get; set; }

        public UnitOfWork(ApplicationDbContext dbContext)
        {
            DbContext = dbContext;
            CartRepository = new CartRepository(DbContext);
            CategoryRepository = new CategoryRepository(DbContext);
            CustomerRepository = new CustomerRepository(DbContext);
            OrderItemRepository = new OrderItemRepository(DbContext);
            OrderRepository = new OrderRepository(DbContext);
            ProductRepository = new ProductRepository(DbContext);
            VendorRepository = new VendorRepository(DbContext);
        }
        public async Task<bool> SaveChangesAsync()
        {
            return await DbContext.SaveChangesAsync() == 0;
        }

    }
}
