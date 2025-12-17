using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using Xunit;
using FluentAssertions;
using ECommerceWeb.Application.DTOs.CategoryDTOs;
using ECommerceWeb.Infrastructure.Data;
using ECommerceWeb.Domain.Models;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerceWeb.Application.Test.ControllerTest
{
    public class CategoryControllerEndpointsTest : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory _factory; // Store factory here

        public CategoryControllerEndpointsTest(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task CreateAsync_ValidDto_ReturnsOk()
        {
            var dto = new CategoryDTO { Name = "New Test Category" };
            var response = await _client.PostAsJsonAsync("/api/Category", dto);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GetByIdAsync_ExistingId_ReturnsCategory()
        {
            var response = await _client.GetAsync("/api/Category/1");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task DeleteAsync_ExistingId_ReturnsOk()
        {
            // 1. Arrange: Create a fresh category specifically for this test
            // This prevents "400 Bad Request" caused by other tests deleting data first
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var tempCategory = new Category { Name = "Category to Delete" };
            db.Category.Add(tempCategory);
            await db.SaveChangesAsync();

            int idToDelete = tempCategory.Id;

            // 2. Act
            var response = await _client.DeleteAsync($"/api/Category/{idToDelete}");

            // 3. Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var content = await response.Content.ReadAsStringAsync();
            content.Should().Be("Category Deleted");
        }

        [Fact]
        public async Task EditAsync_ExistingCategory_ReturnsOk()
        {
            // Use ID 2 (seeded in factory)
            var dto = new CategoryDTO { Id = 2, Name = "Updated Category Name" };
            var response = await _client.PutAsJsonAsync("/api/Category", dto);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }
    }
}