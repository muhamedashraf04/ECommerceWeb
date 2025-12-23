using System.Security.Claims;
using ECommerceWeb.Application.DTOs.CartDTOs;
using ECommerceWeb.Application.Interfaces.IService;
using ECommerceWeb.Application.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceWeb.Controllers
{

    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartService _CartService;

        public CartController(ICartService cartService)
        {
            _CartService = cartService;
        }
        [HttpGet("ShowCart")]
        public async Task<IActionResult> ShowCart()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var cart = await _CartService.GetCartByUserIdAsync(userId);
            return Ok(cart);
        }
        [HttpPost("add")]
        public async Task<IActionResult> UpsertToCart(CartItemDTO item)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            string x = await _CartService.AddItemToCartAsync(item, userId);

            return Ok(x);
        }
        [HttpDelete("remove/{productId}")]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _CartService.RemoveItemFromCartAsync(userId, productId);
            return Ok("Item removed from cart");
        }
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _CartService.ClearCartAsync(userId);
            return Ok("Cart cleared");
        }
        
    }
}
