using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using ECommerceWeb.Application.DTOs.ProductDTOs;
using ECommerceWeb.Domain.Models;
using ECommerceWeb.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;

namespace ECommerceWeb.Application.Test.ControllerTest
{
    public class ProductControllerEndpointsTest : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;

        public ProductControllerEndpointsTest(CustomWebApplicationFactory factory)
        {
            _factory = factory;
        }

        private HttpClient CreateClient()
        {
            return _factory.CreateClient();
        }

        private async Task ClearDbAsync(ApplicationDbContext db)
        {
            db.Product.RemoveRange(db.Product);
            db.Category.RemoveRange(db.Category);
            await db.SaveChangesAsync();
        }

        private async Task<int> SeedProductAsync(ApplicationDbContext db, string name, decimal price, int vendorId, string categoryName = "Electronics")
        {
            var category = db.Category.FirstOrDefault(c => c.Name == categoryName);
            if (category == null)
            {
                category = new Category { Name = categoryName };
                db.Category.Add(category);
                await db.SaveChangesAsync();
            }

            var product = new Product
            {
                Name = name,
                Price = price,
                VendorId = vendorId,
                Description = "Sample",
                CategoryId = category.Id
            };
            db.Product.Add(product);
            await db.SaveChangesAsync();
            return product.Id;
        }

        [Fact]
        public async Task CreateAsync_ValidProduct_ReturnsOk()
        {
            var client = CreateClient();

            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Clear previous data
            db.Product.RemoveRange(db.Product);
            db.Category.RemoveRange(db.Category);
            await db.SaveChangesAsync();

            // Ensure category exists
            var category = new Category { Id = 1, Name = "Electronics" };
            db.Category.Add(category);
            await db.SaveChangesAsync();

            // Prepare DTO
            var dto = new CreateProductDTO
            {
                Name = "New Laptop",
                Price = 1000,
                Description = "High end laptop",
                CategoryId = category.Id
            };

            // Use MultipartFormDataContent for [FromForm]
            using var content = new MultipartFormDataContent();
            content.Add(new StringContent(dto.Name), nameof(dto.Name));
            content.Add(new StringContent(dto.Price.ToString()), nameof(dto.Price));
            content.Add(new StringContent(dto.Description), nameof(dto.Description));
            content.Add(new StringContent(dto.CategoryId.ToString()), nameof(dto.CategoryId));

            // Act
            var response = await client.PostAsync("/api/Product/create", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var product = await response.Content.ReadFromJsonAsync<UpdateProductDTO>();
            product.Name.Should().Be(dto.Name);
        }


        [Fact]
        public async Task EditAsync_OwnProduct_ReturnsUpdatedProduct()
        {
            var client = CreateClient();
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await ClearDbAsync(db);

            int productId = await SeedProductAsync(db, "Old Name", 100, 1);

            var updateDto = new UpdateProductDTO
            {
                Id = productId,
                Name = "Updated Name",
                Price = 150,
                Description = "Updated Description",
                CategoryId = 1
            };

            using var content = new MultipartFormDataContent();
            content.Add(new StringContent(updateDto.Id.ToString()), nameof(updateDto.Id));
            content.Add(new StringContent(updateDto.Name), nameof(updateDto.Name));
            content.Add(new StringContent(updateDto.Price.ToString()), nameof(updateDto.Price));
            content.Add(new StringContent(updateDto.Description), nameof(updateDto.Description));
            content.Add(new StringContent(updateDto.CategoryId.ToString()), nameof(updateDto.CategoryId));

            var response = await client.PutAsync("/api/Product/edit", content);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<UpdateProductDTO>();
            result.Name.Should().Be("Updated Name");
            result.Price.Should().Be(150);
        }

        [Fact]
        public async Task GetByIdAsync_ReturnsProduct()
        {
            var client = CreateClient();
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await ClearDbAsync(db);

            int productId = await SeedProductAsync(db, "Gadget", 50, 1);

            var response = await client.GetAsync($"/api/Product/GetProductByID?productId={productId}");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var product = await response.Content.ReadFromJsonAsync<UpdateProductDTO>();
            product.Id.Should().Be(productId);
        }

        [Fact]
        public async Task GetAllProductsAsync_ReturnsProducts()
        {
            var client = CreateClient();
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await ClearDbAsync(db);

            await SeedProductAsync(db, "Product1", 100, 1);

            var response = await client.GetAsync("/api/Product/GetAllProducts");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var products = await response.Content.ReadFromJsonAsync<UpdateProductDTO[]>();
            products.Length.Should().Be(1);
        }

        [Fact]
        public async Task GetProductsByCategoryAsync_ReturnsFilteredProducts()
        {
            var client = CreateClient();
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await ClearDbAsync(db);

            await SeedProductAsync(db, "Phone", 500, 1, "Electronics");
            await SeedProductAsync(db, "Book", 20, 1, "Books");

            var response = await client.GetAsync("/api/Product/GetProductByCategory?category=Electronics");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var products = await response.Content.ReadFromJsonAsync<UpdateProductDTO[]>();
            products.Length.Should().Be(1);
            products[0].Name.Should().Be("Phone");
        }

        [Fact]
        public async Task GetProductsByVendorAsync_ReturnsVendorProducts()
        {
            var client = CreateClient();
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await ClearDbAsync(db);

            await SeedProductAsync(db, "Laptop", 1000, 1);
            await SeedProductAsync(db, "Tablet", 500, 2);

            var response = await client.GetAsync("/api/Product/GetProductByVendor?vendorId=1");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var products = await response.Content.ReadFromJsonAsync<UpdateProductDTO[]>();
            products.Length.Should().Be(1);
            products.All(p => p.Id > 0).Should().BeTrue();
        }

        [Fact]
        public async Task DeleteAsync_OwnProduct_ReturnsOk()
        {
            var client = CreateClient();
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await ClearDbAsync(db);

            int productId = await SeedProductAsync(db, "DeleteMe", 100, 1);

            var response = await client.DeleteAsync($"/api/Product/delete?id={productId}");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var message = await response.Content.ReadAsStringAsync();
            message.Should().Contain("Product deleted successfully");
        }
    }
}
