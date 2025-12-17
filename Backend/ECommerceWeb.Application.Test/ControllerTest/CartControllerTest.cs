using System.Net.Http.Json;
using Xunit;
using FluentAssertions;
using ECommerceWeb.Application.DTOs.CartDTOs;

namespace ECommerceWeb.Application.Test.ControllerTest
{
    public class CartControllerTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public CartControllerTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task ShowCart_ReturnsCartWithItems()
        {
            // Call the API endpoint
            var response = await _client.GetAsync("/api/Cart/ShowCart");

            response.EnsureSuccessStatusCode();

            var cart = await response.Content.ReadFromJsonAsync<CartDTO>();

            cart.Should().NotBeNull();
            cart.UserId.Should().Be(1);
            cart.CartItems.Should().NotBeEmpty();
        }
    }
}
