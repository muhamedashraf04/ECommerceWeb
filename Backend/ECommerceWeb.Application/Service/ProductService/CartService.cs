using ECommerceWeb.Application.DTOs.CartDTOs;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Domain.Models;

namespace ECommerceWeb.Application.Service.CartService
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
        public async Task<ICollection<CartItem>> GetCartByUserIdAsync(int userId)
        {
            var cart = await _uow.CartRepository.GetAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return new List<CartItem>();
            }
            return cart.CartItems ?? new List<CartItem>();
        }

        public async Task AddItemToCartAsync(AddItemDTO item, int userId)
        {
            var customer = await _uow.CustomerRepository.GetAsync(c => c.Id == userId);
            if (customer == null)
            {
                throw new Exception("Customer not found");
            }
            if (customer.Cart == null)
            {
                customer.Cart = new Cart
                {
                    UserId = userId,
                    CartItems = new List<CartItem>()
                };
                await _uow.CartRepository.CreateAsync(customer.Cart);
                await _uow.SaveChangesAsync();
            }
            var cart = customer.Cart;

            var existing = cart.CartItems!.FirstOrDefault(ci => ci.ProductId == item.ProductId);
            if (existing != null)
            {
                throw new Exception("Product already exists in cart");
            }
            cart.CartItems?.Add(new CartItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                CartId = cart.Id
            });
            if (cart.CartItems == null)
            {
                cart.CartItems = new List<CartItem>();
            }
            cart.NumOfItems = cart.CartItems.Sum(ci => ci.Quantity);

            await _uow.CartRepository.EditAsync(cart);
            await _uow.SaveChangesAsync();
        }
        public async Task RemoveItemFromCartAsync(int userId, int productId)
        {
            var customer = await _uow.CustomerRepository.GetAsync(c => c.Id == userId);
            if (customer?.Cart == null)
            {
                throw new Exception("Cart not found");
            }

            var cart = customer.Cart;
            var item = cart.CartItems!.FirstOrDefault(ci => ci.ProductId == productId);
            if (item == null)
            {
                throw new Exception("Product not found in cart");
            }
            if (cart.CartItems == null)
            {
                cart.CartItems = new List<CartItem>();
            }
            cart.CartItems.Remove(item);
            cart.NumOfItems = cart.CartItems.Sum(ci => ci.Quantity);

            await _uow.CartRepository.EditAsync(cart);
            await _uow.SaveChangesAsync();
        }
        public async Task ClearCartAsync(int userId)
        {
            var customer = await _uow.CustomerRepository.GetAsync(c => c.Id == userId);
            if (customer?.Cart == null) return;

            customer.Cart.CartItems.Clear();
            customer.Cart.NumOfItems = 0;

            await _uow.CartRepository.EditAsync(customer.Cart);
            await _uow.SaveChangesAsync();
        }
    }
}
