using System.Security.Claims;
using ECommerceWeb.Application.DTOs.CartDTOs;
using ECommerceWeb.Application.Service.CartS;
using ECommerceWeb.Application.Service.OrderService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceWeb.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        OrderService _OrderService;
        public OrderController(OrderService OrderService)
        {
            _OrderService = OrderService;
        }

        [HttpGet("ShowOrder")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> ShowOrder()
        {
            var userIdClaimValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaimValue))
            {
                return BadRequest("User ID claim is missing or invalid.");
            }
            var userIdClaim = int.Parse(userIdClaimValue);
            var Order = await _OrderService.ShowOrder(userIdClaim);
            return Ok(Order);
        }
        [HttpPost("PlaceOrder")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> PlaceOrder(PlaceOrderDTO address)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _OrderService.PlaceOrderAsync(userId, address);
            return Ok("Order placed successfully");
        }
        [HttpDelete("CancelOrder")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CancelOrder()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var success = await _OrderService.CancelOrder(userId);
            return Ok(success);
        }
        [Authorize(Roles = "Vendor")]
        [HttpGet("GetAllOrdersForVendor")]
        public async Task<IActionResult> GetAllOrdersForVendor()
        {
            var vendorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var orders = await _OrderService.GetAllOrdersForVendor(vendorId);
            return Ok(orders);
        }
        [HttpPatch("AcceptOrder/{orderId}")]
        public async Task<IActionResult> AcceptOrder(int orderId)
        {
            var vendorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _OrderService.AcceptOrder(vendorId, orderId);
            if (result)
            {
                return Ok("Accepted Succefully");
            }
            return Ok("something went wrong :( ");
        }
        [HttpPatch("RejectOrder/{orderId}")]
        public async Task<IActionResult> RejectOrder(int orderId)
        {
            var result = await _OrderService.RejectOrder(orderId);
            if(result)
            {
                return Ok("Rejected Succefully");
            }
            return Ok("something went wrong :( ");
        }
    }
}
