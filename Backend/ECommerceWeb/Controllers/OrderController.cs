using System.Security.Claims;
using ECommerceWeb.Application.DTOs.CartDTOs;
using ECommerceWeb.Application.Service.OrderService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly OrderService _orderService;

        public OrderController(OrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet("ShowOrder")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> ShowOrder()
        {
            var userIdClaimValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaimValue) || !int.TryParse(userIdClaimValue, out var userId))
            {
                return BadRequest("User ID claim is missing or invalid.");
            }

            var order = await _orderService.ShowOrder(userId);
            if (order == null)
            {
                return NotFound("No active order found.");
            }

            return Ok(order);
        }

        [HttpPost("PlaceOrder")]
        [Authorize]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderDTO address)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("User identity could not be verified.");
            }

            try
            {
                await _orderService.PlaceOrderAsync(userId, address);
                return Ok("Order placed successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("CancelOrder")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CancelOrder()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var success = await _orderService.CancelOrder(userId);
            if (!success)
            {
                return BadRequest("Could not cancel order.");
            }

            return Ok("Order cancelled successfully");
        }

        [Authorize(Roles = "Vendor")]
        [HttpGet("GetAllOrdersForVendor")]
        public async Task<IActionResult> GetAllOrdersForVendor()
        {
            var vendorIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(vendorIdClaim) || !int.TryParse(vendorIdClaim, out var vendorId))
            {
                return Unauthorized();
            }

            var orders = await _orderService.GetAllOrdersForVendor(vendorId);
            return Ok(orders);
        }

        [Authorize(Roles = "Vendor")]
        [HttpPatch("AcceptOrder/{orderId}")]
        public async Task<IActionResult> AcceptOrder(int orderId)
        {
            var vendorIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(vendorIdClaim) || !int.TryParse(vendorIdClaim, out var vendorId))
            {
                return Unauthorized();
            }

            var result = await _orderService.AcceptOrder(vendorId, orderId);
            if (result)
            {
                return Ok("Accepted successfully");
            }

            return BadRequest("Failed to accept order.");
        }

        [Authorize(Roles = "Vendor")]
        [HttpPatch("RejectOrder/{orderId}")]
        public async Task<IActionResult> RejectOrder(int orderId)
        {
            var result = await _orderService.RejectOrder(orderId);
            if (result)
            {
                return Ok("Rejected successfully");
            }

            return BadRequest("Failed to reject order.");
        }
    }
}
