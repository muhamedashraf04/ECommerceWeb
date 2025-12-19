using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using ECommerceWeb.Application.DTOs.CartDTOs;
using ECommerceWeb.Application.DTOs.OrderDTOs;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Application.Service;
using ECommerceWeb.Application.Service.OrderService;
using ECommerceWeb.Domain.Models;
using FluentAssertions;
using Moq;
using Xunit;

namespace ECommerceWeb.Application.Test.ServiceTest
{
    public class OrderServiceTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly Mock<CartService> _cartServiceMock;
        private readonly OrderService _orderService;

        public OrderServiceTests()
        {
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _cartServiceMock = new Mock<CartService>(_unitOfWorkMock.Object); // Pass required dependency

            _orderService = new OrderService(_unitOfWorkMock.Object, _cartServiceMock.Object);
        }

        [Fact]
        public async Task ShowOrder_ReturnsNull_WhenNoOrder()
        {
            _unitOfWorkMock.Setup(u => u.OrderRepository.GetAsync(It.IsAny<Expression<Func<Order, bool>>>()))
                .ReturnsAsync((Order)null);

            var result = await _orderService.ShowOrder(1);

            result.Should().BeNull();
        }

        [Fact]
        public async Task ShowOrder_ReturnsOrderDto_WhenOrderExists()
        {
            var order = new Order { Id = 1, UserId = 1, OrderStatus = "Pending" };
            var items = new List<OrderItem> { new OrderItem { ProductId = 1, Quantity = 2 } };

            _unitOfWorkMock.Setup(u => u.OrderRepository.GetAsync(It.IsAny<Expression<Func<Order, bool>>>()))
                .ReturnsAsync(order);

            _unitOfWorkMock.Setup(u => u.OrderItemRepository.GetAllAsync(It.IsAny<Expression<Func<OrderItem, bool>>>()))
                .ReturnsAsync(items);

            var result = await _orderService.ShowOrder(1);

            result.Should().NotBeNull();
            result.OrderId.Should().Be(order.Id);
            result.Items.Count.Should().Be(1);
        }

        [Fact]
        public async Task PlaceOrderAsync_ThrowsException_WhenCartNotFound()
        {
            _unitOfWorkMock.Setup(u => u.CartRepository.GetAsync(It.IsAny<Expression<Func<Cart, bool>>>()))
                .ReturnsAsync((Cart)null);

            await Assert.ThrowsAsync<Exception>(() => _orderService.PlaceOrderAsync(1, new PlaceOrderDTO()));
        }

        [Fact]
        public async Task CancelOrder_ReturnsFalse_WhenNoOrder()
        {
            _unitOfWorkMock.Setup(u => u.OrderRepository.GetAsync(It.IsAny<Expression<Func<Order, bool>>>()))
                .ReturnsAsync((Order)null);

            var result = await _orderService.CancelOrder(1);

            result.Should().BeFalse();
        }

        [Fact]
        public async Task CancelOrder_ReturnsTrue_WhenOrderPending()
        {
            var order = new Order { Id = 1, UserId = 1, OrderStatus = "Pending" };
            _unitOfWorkMock.Setup(u => u.OrderRepository.GetAsync(It.IsAny<Expression<Func<Order, bool>>>()))
                .ReturnsAsync(order);
            _unitOfWorkMock.Setup(u => u.OrderRepository.RemoveAsync(order.Id))
                .ReturnsAsync(true);

            var result = await _orderService.CancelOrder(order.UserId);

            result.Should().BeTrue();
        }

        [Fact]
        public async Task AcceptOrder_ReturnsTrue_WhenOrderExistsAndNotRejected()
        {
            var order = new Order { Id = 1, OrderStatus = "Pending" };
            _unitOfWorkMock.Setup(u => u.OrderRepository.GetAsync(It.IsAny<Expression<Func<Order, bool>>>()))
                .ReturnsAsync(order);
            _unitOfWorkMock.Setup(u => u.OrderRepository.EditAsync(order)).ReturnsAsync(true);

            var result = await _orderService.AcceptOrder(1, order.Id);

            result.Should().BeTrue();
            order.OrderStatus.Should().Be("Accepted");
        }

        [Fact]
        public async Task RejectOrder_ReturnsTrue_WhenOrderExistsAndNotAccepted()
        {
            var order = new Order { Id = 1, OrderStatus = "Pending" };
            _unitOfWorkMock.Setup(u => u.OrderRepository.GetAsync(It.IsAny<Expression<Func<Order, bool>>>()))
                .ReturnsAsync(order);
            _unitOfWorkMock.Setup(u => u.OrderRepository.EditAsync(order)).ReturnsAsync(true);

            var result = await _orderService.RejectOrder(order.Id);

            result.Should().BeTrue();
            order.OrderStatus.Should().Be("Rejected");
        }

        [Fact]
        public async Task GetAllOrdersForVendor_ReturnsOrders()
        {
            var orders = new List<Order>
            {
                new Order { Id = 1, OrderItems = new List<OrderItem> { new OrderItem { Product = new Product { VendorId = 1 } } } }
            };

            _unitOfWorkMock.Setup(u => u.OrderRepository.GetAllAsync(It.IsAny<Expression<Func<Order, bool>>>()))
                .ReturnsAsync(orders);

            var result = await _orderService.GetAllOrdersForVendor(1);

            result.Should().HaveCount(1);
        }
    }
}
