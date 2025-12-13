namespace ECommerceWeb.Application.Interfaces
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

        ICartItemRepository CartItemRepository { get; }
        Task<bool> SaveChangesAsync();
    }
}
