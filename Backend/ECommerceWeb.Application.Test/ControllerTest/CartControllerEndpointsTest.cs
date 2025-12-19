using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using ECommerceWeb.Application.DTOs.CartDTOs;

namespace ECommerceWeb.Application.Test.ControllerTest
{
    public class CartControllerEndpointsTest : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public CartControllerEndpointsTest(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task ShowCart_ReturnsCartWithItems()
        {
            var response = await _client.GetAsync("/api/Cart/ShowCart");
            response.EnsureSuccessStatusCode();

            var cart = await response.Content.ReadFromJsonAsync<CartDTO>();
            cart.Should().NotBeNull();
            cart.UserId.Should().Be(1);
            cart.CartItems.Should().NotBeEmpty();
        }

        [Fact]
        public async Task AddItemToCart_AddsNewItem()
        {
            var newItem = new CartItemDTO { ProductId = 2, Quantity = 1 };
            var response = await _client.PostAsJsonAsync("/api/Cart/add", newItem);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadAsStringAsync();
            result.Should().Contain("Item added to cart");
        }

        [Fact]
        public async Task RemoveItemFromCart_RemovesItem()
        {
            int productId = 1; // exists in seeded Cart
            var response = await _client.DeleteAsync($"/api/Cart/remove/{productId}");
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadAsStringAsync();
            result.Should().Contain("Item removed from cart");
        }

        [Fact]
        public async Task ClearCart_RemovesAllItems()
        {
            var response = await _client.DeleteAsync("/api/Cart/clear");
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadAsStringAsync();
            result.Should().Contain("Cart cleared");
        }
    }
}
