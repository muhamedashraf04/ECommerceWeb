using Xunit;
using Moq;
using FluentAssertions;
using ECommerceWeb.Application.Service.CartS;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Domain.Models;
using ECommerceWeb.Application.DTOs.CartDTOs;
using System.Linq.Expressions;

namespace ECommerceWeb.Application.Test.ServiceTest
{
    public class CartServiceTests
    {
        private readonly Mock<IUnitOfWork> _uowMock;
        private readonly Mock<ICartRepository> _cartRepoMock;
        private readonly Mock<ICustomerRepository> _customerRepoMock;
        private readonly Mock<ICartItemRepository> _cartItemRepoMock;
        private readonly CartService _cartService;

        public CartServiceTests()
        {
            _cartRepoMock = new Mock<ICartRepository>();
            _customerRepoMock = new Mock<ICustomerRepository>();
            _cartItemRepoMock = new Mock<ICartItemRepository>();
            _uowMock = new Mock<IUnitOfWork>();

            // Return repository mocks from the unit of work
            _uowMock.Setup(u => u.CartRepository).Returns(_cartRepoMock.Object);
            _uowMock.Setup(u => u.CustomerRepository).Returns(_customerRepoMock.Object);
            _uowMock.Setup(u => u.CartItemRepository).Returns(_cartItemRepoMock.Object);
            _uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(true);

            // Mock repository methods returning Task<bool>
            _cartRepoMock.Setup(r => r.EditAsync(It.IsAny<Cart>())).ReturnsAsync(true);
            _cartRepoMock.Setup(r => r.CreateAsync(It.IsAny<Cart>())).ReturnsAsync(true);
            _cartItemRepoMock.Setup(r => r.RemoveAsync(It.IsAny<int>())).ReturnsAsync(true);

            _cartService = new CartService(_uowMock.Object);
        }

        [Fact]
        public async Task ConfirmUserAsync_ReturnsFalse_WhenUserNotFound()
        {
            _customerRepoMock
                .Setup(r => r.GetAsync(It.IsAny<Expression<Func<Customer, bool>>>()))
                .ReturnsAsync((Customer)null);

            var result = await _cartService.ConfirmUserAsync(1);

            result.Should().BeFalse();
        }

        [Fact]
        public async Task ConfirmUserAsync_ReturnsTrue_WhenUserExists()
        {
            _customerRepoMock
                .Setup(r => r.GetAsync(It.IsAny<Expression<Func<Customer, bool>>>()))
                .ReturnsAsync(new Customer { Id = 1 });

            var result = await _cartService.ConfirmUserAsync(1);

            result.Should().BeTrue();
        }


        [Fact]
        public async Task GetCartByUserIdAsync_ReturnsEmptyCart_WhenCartNotFound()
        {
            _cartRepoMock
                .Setup(r => r.GetAsync(It.IsAny<Expression<Func<Cart, bool>>>()))
                .ReturnsAsync((Cart)null);

            var result = await _cartService.GetCartByUserIdAsync(1);

            result.UserId.Should().Be(1);
            result.CartItems.Should().BeEmpty();
        }

        [Fact]
        public async Task AddItemToCartAsync_AddsItem_WhenCartExists()
        {
            var cart = new Cart { UserId = 1, CartItems = new List<CartItem>() };

            _customerRepoMock
                .Setup(r => r.GetAsync(It.IsAny<Expression<Func<Customer, bool>>>()))
                .ReturnsAsync(new Customer { Id = 1 });

            _cartRepoMock
                .Setup(r => r.GetAsync(It.IsAny<Expression<Func<Cart, bool>>>()))
                .ReturnsAsync(cart);

            var itemDto = new CartItemDTO { ProductId = 100, Quantity = 2 };

            await _cartService.AddItemToCartAsync(itemDto, 1);

            cart.CartItems.Count.Should().Be(1);
            cart.CartItems.First().ProductId.Should().Be(100);
            cart.NumOfItems.Should().Be(2);
        }

        [Fact]
        public async Task RemoveItemFromCartAsync_RemovesItem_WhenExists()
        {
            var cartItem = new CartItem { ProductId = 100, Quantity = 2 };
            var cart = new Cart { UserId = 1, CartItems = new List<CartItem> { cartItem }, NumOfItems = 2 };

            _customerRepoMock
                .Setup(r => r.GetAsync(It.IsAny<Expression<Func<Customer, bool>>>()))
                .ReturnsAsync(new Customer { Id = 1 });

            _cartRepoMock
                .Setup(r => r.GetAsync(It.IsAny<Expression<Func<Cart, bool>>>()))
                .ReturnsAsync(cart);

            await _cartService.RemoveItemFromCartAsync(1, 100);

            cart.CartItems.Should().BeEmpty();
            cart.NumOfItems.Should().Be(0);
        }

        [Fact]
        public async Task ClearCartAsync_ClearsAllItems()
        {
            var cartItems = new List<CartItem>
            {
                new CartItem { ProductId = 100, Quantity = 1 },
                new CartItem { ProductId = 101, Quantity = 2 }
            };
            var cart = new Cart { UserId = 1, CartItems = cartItems, NumOfItems = 3 };

            _cartRepoMock
                .Setup(r => r.GetAsync(It.IsAny<Expression<Func<Cart, bool>>>()))
                .ReturnsAsync(cart);

            await _cartService.ClearCartAsync(1);

            cart.CartItems.Should().BeEmpty();
            cart.NumOfItems.Should().Be(0);
        }
    }
}
