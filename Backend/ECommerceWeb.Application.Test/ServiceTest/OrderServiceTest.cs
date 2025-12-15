using Xunit;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ECommerceWeb.Application.Service.OrderService;
using ECommerceWeb.Application.DTOs.CartDTOs;
using ECommerceWeb.Application.DTOs.OrderDTOs;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Domain.Models;
using ECommerceWeb.Application.Service.CartS;

public class OrderServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly Mock<CartService> _mockCartService;
    private readonly OrderService _service;

    public OrderServiceTests()
    {
        _mockUow = new Mock<IUnitOfWork>();
        _mockCartService = new Mock<CartService>(null);
        _service = new OrderService(_mockUow.Object, _mockCartService.Object);
    }

    [Fact]
    public async Task ShowOrder_ReturnsOrderDto_WhenOrderExists()
    {
        var userId = 1;
        var order = new Order { Id = 10, UserId = userId, OrderStatus = "Pending" };
        var orderItems = new List<OrderItem>
        {
            new OrderItem { ProductId = 100, Quantity = 2 }
        };

        _mockUow.Setup(u => u.OrderRepository.GetAsync(o => o.UserId == userId))
            .ReturnsAsync(order);
        _mockUow.Setup(u => u.OrderItemRepository.GetAllAsync(oi => oi.OrderId == order.Id))
            .ReturnsAsync(orderItems);

        var result = await _service.ShowOrder(userId);

        Assert.NotNull(result);
        Assert.Equal(order.Id, result.OrderId);
        Assert.Equal(order.OrderStatus, result.OrderStatus);
        Assert.Single(result.Items);
        Assert.Equal(100, result.Items[0].ProductId);
    }

    [Fact]
    public async Task PlaceOrderAsync_ClearsCart_WhenOrderPlaced()
    {
        var userId = 1;
        var cart = new Cart { Id = 1, UserId = userId };
        var cartItems = new List<CartItem>
    {
        new CartItem { CartId = 1, ProductId = 10, Quantity = 2 }
    };
        var product = new Product { Id = 10, Price = 50 };

        _mockUow.Setup(u => u.CartRepository.GetAsync(c => c.UserId == userId)).ReturnsAsync(cart);
        _mockUow.Setup(u => u.CartItemRepository.GetAllAsync(ci => ci.CartId == cart.Id)).ReturnsAsync(cartItems);

        // FIX: Use It.IsAny for expression
        _mockUow.Setup(u => u.ProductRepository.GetAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Product, bool>>>()))
                .ReturnsAsync(product);

        _mockUow.Setup(u => u.OrderRepository.CreateAsync(It.IsAny<Order>())).ReturnsAsync(true);
        _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(true);

        await _service.PlaceOrderAsync(userId, new PlaceOrderDTO { Address = "123 Street" });

        _mockCartService.Verify(c => c.ClearCartAsync(userId), Times.Once);
    }


    [Fact]
    public async Task CancelOrder_ReturnsTrue_WhenOrderPending()
    {
        var userId = 1;
        var order = new Order { Id = 1, UserId = userId, OrderStatus = "Pending" };

        _mockUow.Setup(u => u.OrderRepository.GetAsync(o => o.UserId == userId)).ReturnsAsync(order);
        _mockUow.Setup(u => u.OrderRepository.RemoveAsync(order.Id)).ReturnsAsync(true);

        var result = await _service.CancelOrder(userId);

        Assert.True(result);
    }

    [Fact]
    public async Task GetAllOrdersForVendor_ReturnsOrders()
    {
        var vendorId = 1;
        var orders = new List<Order>
        {
            new Order
            {
                Id = 1,
                OrderItems = new List<OrderItem>
                {
                    new OrderItem { Product = new Product { VendorId = vendorId } }
                }
            }
        };

        _mockUow.Setup(u => u.OrderRepository.GetAllAsync(o => o.OrderItems.Any(oi => oi.Product.VendorId == vendorId)))
            .ReturnsAsync(orders);

        var result = await _service.GetAllOrdersForVendor(vendorId);

        Assert.Single(result);
        Assert.Equal(1, result.First().Id);
    }

    [Fact]
    public async Task AcceptOrder_ReturnsTrue_WhenOrderExists()
    {
        var vendorId = 1;
        var orderId = 1;
        var order = new Order { Id = orderId, OrderStatus = "Pending" };

        _mockUow.Setup(u => u.OrderRepository.GetAsync(o => o.Id == orderId)).ReturnsAsync(order);
        _mockUow.Setup(u => u.OrderRepository.EditAsync(order)).ReturnsAsync(true);

        var result = await _service.AcceptOrder(vendorId, orderId);

        Assert.True(result);
        Assert.Equal("Accepted", order.OrderStatus);
    }

    [Fact]
    public async Task RejectOrder_ReturnsTrue_WhenOrderExists()
    {
        var orderId = 1;
        var order = new Order { Id = orderId, OrderStatus = "Pending" };

        _mockUow.Setup(u => u.OrderRepository.GetAsync(o => o.Id == orderId)).ReturnsAsync(order);
        _mockUow.Setup(u => u.OrderRepository.EditAsync(order)).ReturnsAsync(true);

        var result = await _service.RejectOrder(orderId);

        Assert.True(result);
        Assert.Equal("Rejected", order.OrderStatus);
    }
}
