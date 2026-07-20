using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ECommerceWeb.Application.DTOs.CartDTOs;
using ECommerceWeb.Application.DTOs.OrderDTOs;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Domain.Models;

namespace ECommerceWeb.Application.Service.OrderService
{
    public class OrderService
    {
        private readonly IUnitOfWork _uow;
        private readonly CartService _cartService;

        public OrderService(IUnitOfWork uow, CartService cartService) 
        { 
            _uow = uow;
            _cartService = cartService;
        }

        public async Task<OrderDto?> ShowOrder(int userId)
        {
            var order = await _uow.OrderRepository.GetAsync(o => o.UserId == userId);
            if (order == null)
                return null;

            var items = await _uow.OrderItemRepository
                .GetAllAsync(oi => oi.OrderId == order.Id);

            return new OrderDto
            {
                OrderId = order.Id,
                OrderStatus = order.OrderStatus,
                Items = items.Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    Quantity = i.Quantity
                }).ToList()
            };
        }

        public async Task PlaceOrderAsync(int userId, PlaceOrderDTO placeOrder)
        {
            // 1️⃣ Get the user's cart
            var cart = await _uow.CartRepository.GetAsync(c => c.UserId == userId);
            if (cart == null)
                throw new Exception("Cart not found");

            var cartItems = await _uow.CartItemRepository.GetAllAsync(ci => ci.CartId == cart.Id);
            if (!cartItems.Any())
                throw new Exception("Cart is empty");

            // 2️⃣ Prepare new order items & update product stock
            var orderItems = new List<OrderItem>();
            foreach (var ci in cartItems)
            {
                var product = await _uow.ProductRepository.GetAsync(p => p.Id == ci.ProductId);
                if (product == null)
                    throw new Exception($"Product not found: {ci.ProductId}");

                if (product.Quantity < ci.Quantity)
                    throw new Exception($"Insufficient stock for {product.Name}");

                // Deduct stock on order placement
                product.Quantity -= ci.Quantity;
                await _uow.ProductRepository.EditAsync(product);

                orderItems.Add(new OrderItem
                {
                    ProductId = ci.ProductId,
                    Quantity = ci.Quantity,
                    PriceATM = product.Price
                });
            }

            // 3️⃣ Create new order
            var order = new Order
            {
                UserId = userId,
                Address = placeOrder.Address,
                OrderStatus = "Pending",
                TotalAmount = cart.TotalAmount,
                OrderItems = orderItems
            };

            await _uow.OrderRepository.CreateAsync(order);
            await _uow.SaveChangesAsync();

            // 4️⃣ Clear the cart
            await _cartService.ClearCartAsync(userId);
        }

        public async Task<bool> CancelOrder(int userId)
        {
            var order = await _uow.OrderRepository.GetAsync(o => o.UserId == userId && o.OrderStatus == "Pending");
            if (order == null)
            {
                return false;
            }

            order.OrderStatus = "Cancelled";
            await _uow.OrderRepository.EditAsync(order);
            return await _uow.SaveChangesAsync();
        }

        public async Task<ICollection<Order>> GetAllOrdersForVendor(int vendorId)
        {
            var orders = await _uow.OrderRepository.GetAllAsync(o => o.OrderItems.Any(oi => oi.Product != null && oi.Product.VendorId == vendorId));
            return orders.ToList();
        }

        public async Task<bool> AcceptOrder(int vendorId, int orderId)
        {
            var order = await _uow.OrderRepository.GetAsync(o => o.Id == orderId);
            if (order == null || order.OrderStatus == "Rejected")
            {
                return false;
            }

            order.OrderStatus = "Accepted";
            await _uow.OrderRepository.EditAsync(order);
            return await _uow.SaveChangesAsync();
        }

        public async Task<bool> RejectOrder(int orderId)
        {
            var order = await _uow.OrderRepository.GetAsync(o => o.Id == orderId);
            if (order == null || order.OrderStatus == "Accepted")
            {
                return false;
            }

            order.OrderStatus = "Rejected";
            await _uow.OrderRepository.EditAsync(order);
            return await _uow.SaveChangesAsync();
        }
    }
}
