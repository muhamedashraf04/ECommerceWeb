using ECommerceWeb.Application.DTOs.CartDTOs;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Domain.Models;

namespace ECommerceWeb.Application.Service.CartS
{
    public class CartService
    {
        private readonly IUnitOfWork _uow;

        public CartService(IUnitOfWork uow)
        {
            _uow = uow;
        }
        public bool ConfirmUser(int Id)
        {
            var user = _uow.CustomerRepository.GetAsync(u => u.Id == Id).Result;
            if (user == null)
            {
                return false;
            }
            return true;
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


        public async Task AddItemToCartAsync(CartItemDTO item, int userId)
        {
            var customer = await _uow.CustomerRepository.GetAsync(c => c.Id == userId);
            if (customer == null)
                throw new Exception("Customer not found");

            var cart = await _uow.CartRepository.GetAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    CartItems = new List<CartItem>()
                };
                await _uow.CartRepository.CreateAsync(cart);
                await _uow.SaveChangesAsync();
            }

            cart.CartItems ??= new List<CartItem>();

            var existing = cart.CartItems.FirstOrDefault(ci => ci.ProductId == item.ProductId);
            if (existing != null)
                throw new Exception("Product already exists in cart");

            cart.CartItems.Add(new CartItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                CartId = cart.Id
            });

            cart.NumOfItems = cart.CartItems.Sum(ci => ci.Quantity);

            await _uow.CartRepository.EditAsync(cart);
            await _uow.SaveChangesAsync();
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
            cart.NumOfItems = 0;

            await _uow.CartRepository.EditAsync(cart);
            await _uow.SaveChangesAsync();
        }
    }
}
