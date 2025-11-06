using ECommerceWeb.DataAccess.Data;

namespace ECommerceWeb.DataAccess.Repositories.Interfaces
{
    public interface IUnitOfWork
    {
        ICartRepository CartRepository { get; }
        ICategoryRepository CategoryRepository { get; }
        ICustomerRepository CustomerRepository { get; }
        IOrderItemRepository OrderItemRepository { get; }
        IOrderRepository OrderRepository { get; }
        IProductRepository ProductRepository { get; }
        IVendorRepository VendorRepository { get; }
        ApplicationDbContext DbContext { get; }
        Task<bool> SaveChangesAsync();
    }
}
