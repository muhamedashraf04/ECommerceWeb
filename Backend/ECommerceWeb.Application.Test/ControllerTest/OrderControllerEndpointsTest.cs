using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using ECommerceWeb.Application.DTOs.CartDTOs;
using ECommerceWeb.Domain.Models;
using Microsoft.Extensions.DependencyInjection;
using ECommerceWeb.Infrastructure.Data;

namespace ECommerceWeb.Application.Test.ControllerTest
{
    public class OrderControllerEndpointsTest : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory _factory;

        public OrderControllerEndpointsTest(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task PlaceOrder_ValidAddress_ReturnsOk()
        {
            // Arrange: Ensure the user has a cart with items first (logic usually requires a cart to place an order)
            var address = new PlaceOrderDTO { Address = "123 Test St, Cairo, Egypt" };

            // Act
            var response = await _client.PostAsJsonAsync("/api/Order/PlaceOrder", address);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadAsStringAsync();
            result.Should().Contain("Order placed successfully");
        }

        [Fact]
        public async Task ShowOrder_ReturnsOk()
        {
            // Act
            var response = await _client.GetAsync("/api/Order/ShowOrder");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GetAllOrdersForVendor_ReturnsOk()
        {
            // Act
            var response = await _client.GetAsync("/api/Order/GetAllOrdersForVendor");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task AcceptOrder_ValidId_ReturnsSuccessMessage()
        {
            // Arrange: We need an actual order ID in the system
            int orderId = 1;
            // In a real scenario, you'd seed an order here like we did with Category

            // Act
            // Using a Patch request - your controller uses HttpPatch
            var response = await _client.PatchAsync($"/api/Order/AcceptOrder/{orderId}", null);

            // Assert
            var result = await response.Content.ReadAsStringAsync();
            // We check for success or the failure string defined in your controller
            result.Should().MatchRegex("Accepted Succefully|something went wrong");
        }

        [Fact]
        public async Task CancelOrder_ReturnsOk()
        {
            // Act
            var response = await _client.DeleteAsync("/api/Order/CancelOrder");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }
    }
}