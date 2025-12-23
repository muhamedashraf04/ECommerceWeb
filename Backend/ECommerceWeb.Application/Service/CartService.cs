using ECommerceWeb.Application.DTOs.CartDTOs;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Application.Interfaces.IService;
using ECommerceWeb.Domain.Models;

namespace ECommerceWeb.Application.Service
{
    public class CartService : ICartService 
    {
        private readonly IUnitOfWork _uow;

        public CartService(IUnitOfWork uow)
        {
            _uow = uow;
        }
        public async Task<bool> ConfirmUserAsync(int id)
        {
            var user = await _uow.CustomerRepository.GetAsync(u => u.Id == id);
            return user != null;
        }
        public async Task<CartDTO> GetCartByUserIdAsync(int userId)
        {
            var cart = await _uow.CartRepository.GetAsync(c => c.UserId == userId);
            if (cart == null)
                return new CartDTO { UserId = userId };

            return new CartDTO
            {
                UserId = cart.UserId,
                NumOfItems = cart.NumOfItems,
                CartItems = cart.CartItems?.Select(ci => new CartItemDTO
                {
                    ProductId = ci.ProductId,
                    Quantity = ci.Quantity
                }).ToList() ?? new List<CartItemDTO>()
            };
        }


        public async Task<string> AddItemToCartAsync(CartItemDTO item, int userId)
        {
            // Get the product
            var product = await _uow.ProductRepository.GetAsync(p => p.Id == item.ProductId);
            if (product == null)
                return "Product not found";

            if (product.Quantity < item.Quantity)
                return "Can't order this item";

            // Get the cart
            var cart = await _uow.CartRepository.GetAsync(c => c.UserId == userId);

            if (cart == null)
            {
                // Create a new cart if it doesn't exist
                cart = new Cart
                {
                    UserId = userId,
                    CartItems = new List<CartItem>()
                };
                await _uow.CartRepository.CreateAsync(cart);
                await _uow.SaveChangesAsync();
            }
            else
            {
                // Initialize CartItems if null
                if (cart.CartItems == null)
                    cart.CartItems = new List<CartItem>();
            }

            // Check if item already exists in cart
            var existing = cart.CartItems.FirstOrDefault(ci => ci.ProductId == item.ProductId);

            if (existing != null)
            {
                existing.Quantity += item.Quantity;
            }
            else
            {
                cart.CartItems.Add(new CartItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    CartId = cart.Id
                });
            }

            // Reduce product stock
            product.Quantity -= item.Quantity;

            // Update number of items
            cart.NumOfItems = cart.CartItems.Sum(ci => ci.Quantity);

            // Recalculate total amount
            cart.TotalAmount = 0;
            foreach (var ci in cart.CartItems)
            {
                var prod = await _uow.ProductRepository.GetAsync(p => p.Id == ci.ProductId);
                if (prod != null)
                    cart.TotalAmount += prod.Price * ci.Quantity;
            }

            // Save cart changes
            await _uow.CartRepository.EditAsync(cart);
            await _uow.SaveChangesAsync();

            // Return a consistent message
            return "Item added to cart";
        }


        public async Task RemoveItemFromCartAsync(int userId, int productId)
        {
            var customer = await _uow.CustomerRepository.GetAsync(c => c.Id == userId);
            if (customer == null)
                throw new Exception("Customer not found");

            var cart = await _uow.CartRepository.GetAsync(c => c.UserId == userId);
            if (cart == null)
                throw new Exception("Cart not found");

            if (cart.CartItems == null)
                throw new Exception("No cart items found");

            var item = cart.CartItems.FirstOrDefault(ci => ci.ProductId == productId);
            if (item == null)
                throw new Exception("Product not found in cart");

            cart.CartItems.Remove(item);
            cart.NumOfItems = cart.CartItems.Sum(ci => ci.Quantity);

            await _uow.CartRepository.EditAsync(cart);
            await _uow.SaveChangesAsync();
        }
        public async Task ClearCartAsync(int userId)
        {
            var cart = await _uow.CartRepository.GetAsync(c => c.UserId == userId);
            if (cart == null || cart.CartItems == null || !cart.CartItems.Any())
                return;

            foreach (var item in cart.CartItems.ToList())
            {
                await _uow.CartItemRepository.RemoveAsync(item.Id);
            }

            cart.CartItems.Clear();
            cart.TotalAmount = 0;
            cart.NumOfItems = 0;

            await _uow.CartRepository.EditAsync(cart);
            await _uow.SaveChangesAsync();
        }
    }
}
