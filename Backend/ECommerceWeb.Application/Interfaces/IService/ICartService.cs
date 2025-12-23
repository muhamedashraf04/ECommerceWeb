using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ECommerceWeb.Application.DTOs.CartDTOs;


namespace ECommerceWeb.Application.Interfaces.IService
{
    public interface ICartService
    {
        Task<CartDTO> GetCartByUserIdAsync(int userId);
        Task<string> AddItemToCartAsync(CartItemDTO item, int userId);
        Task RemoveItemFromCartAsync(int userId, int productId);
        Task ClearCartAsync(int userId);
    }
}
