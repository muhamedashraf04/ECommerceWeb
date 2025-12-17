using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using ECommerceWeb.Application.DTOs.ProductDTOs; // Ensure this contains ProductDTO, CreateProductDTO, and UpdateProductDTO
using ECommerceWeb.Domain.Models;
using ECommerceWeb.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;

namespace ECommerceWeb.Application.Test.ControllerTest
{
    public class ProductControllerEndpointsTest : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory _factory;

        public ProductControllerEndpointsTest(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task CreateAsync_ValidProduct_ReturnsOk()
        {
            // Arrange - Use the CREATE DTO
            var dto = new CreateProductDTO
            {
                Name = "New Laptop",
                Price = 1000,
                Description = "High end laptop",
                CategoryId = 1
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/Product/create", dto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task EditAsync_OwnProduct_ReturnsUpdatedProduct()
        {
            // 1. Arrange - Seed product belonging to Vendor 1
            int productId = await SeedProductAsync("Old Name", 100, 1);

            // Use the UPDATE DTO
            var updateDto = new UpdateProductDTO
            {
                Id = productId,
                Name = "Updated Name",
                Price = 150,
                Description = "Updated Description"
            };

            // 2. Act
            var response = await _client.PutAsJsonAsync("/api/Product/edit", updateDto);

            // 3. Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Read as the DTO your Service returns (usually a Read/View DTO)
            var result = await response.Content.ReadFromJsonAsync<UpdateProductDTO>();
            result.Name.Should().Be("Updated Name");
        }

        [Fact]
        public async Task GetByIdAsync_ReturnsProduct()
        {
            // Arrange
            int productId = await SeedProductAsync("Gadget", 50, 1);

            // Act
            var response = await _client.GetAsync($"/api/Product/GetProductByID?productId={productId}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // If you don't have a 'ProductDTO', you can read as dynamic or the Update DTO
            var product = await response.Content.ReadFromJsonAsync<UpdateProductDTO>();
            product.Id.Should().Be(productId);
        }

        private async Task<int> SeedProductAsync(string name, decimal price, int vendorId)
        {
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var product = new Product
            {
                Name = name,
                Price = price,
                VendorId = vendorId,
                Description = "Sample",
                CategoryId = 1
            };
            db.Product.Add(product);
            await db.SaveChangesAsync();
            return product.Id;
        }
    }
}