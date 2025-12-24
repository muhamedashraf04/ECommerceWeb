using ECommerceWeb.Application.DTOs;
using ECommerceWeb.Domain.Models;
using ECommerceWeb.Domain.Models.BaseModels;
using ECommerceWeb.Infrastructure.Data;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json; // Required for PostAsJsonAsync
using System.Threading.Tasks;
using ECommerceWeb.Application.DTOs.AuthDTOs;
using Xunit;

namespace ECommerceWeb.Application.Test.ControllerTest
{
    public class AuthControllerEndpointsTest : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;

        public AuthControllerEndpointsTest(CustomWebApplicationFactory factory)
        {
            _factory = factory;
        }

        private HttpClient CreateClient()
        {
            return _factory.CreateClient();
        }

        private async Task ClearDbAsync(ApplicationDbContext db)
        {
            db.Customer.RemoveRange(db.Customer);
            db.Vendor.RemoveRange(db.Vendor);
            await db.SaveChangesAsync();
        }

        [Fact]
        public async Task Register_ValidCustomer_ReturnsOk()
        {
            var client = CreateClient();
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await ClearDbAsync(db);

            // Arrange
            var registerDto = new UserRegisterDTO
            {
                Name = "New Customer",
                Email = "customer@example.com",
                Password = "Password123!",
                Phone = "01000000000",
                Address = "Cairo, Egypt",
                Role = "Customer"
            };

            // Act: MUST use MultipartFormData because Controller has [FromForm]
            using var content = new MultipartFormDataContent();
            content.Add(new StringContent(registerDto.Name), nameof(registerDto.Name));
            content.Add(new StringContent(registerDto.Email), nameof(registerDto.Email));
            content.Add(new StringContent(registerDto.Password), nameof(registerDto.Password));
            content.Add(new StringContent(registerDto.Phone), nameof(registerDto.Phone));
            content.Add(new StringContent(registerDto.Address), nameof(registerDto.Address));
            content.Add(new StringContent(registerDto.Role), nameof(registerDto.Role));

            var response = await client.PostAsync("/api/auth/register", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var user = await response.Content.ReadFromJsonAsync<Customer>();
            user.Email.Should().Be(registerDto.Email);
        }

        [Fact]
        public async Task Register_ValidVendor_ReturnsOk()
        {
            var client = CreateClient();
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await ClearDbAsync(db);

            // Arrange
            var registerDto = new UserRegisterDTO
            {
                Name = "New Vendor",
                Email = "vendor@example.com",
                Password = "Password123!",
                Phone = "01111111111",
                Address = "Giza, Egypt",
                Role = "Vendor",
                CompanyName = "Tech Corp"
            };

            // Act: use MultipartFormDataContent
            using var content = new MultipartFormDataContent();
            content.Add(new StringContent(registerDto.Name), nameof(registerDto.Name));
            content.Add(new StringContent(registerDto.Email), nameof(registerDto.Email));
            content.Add(new StringContent(registerDto.Password), nameof(registerDto.Password));
            content.Add(new StringContent(registerDto.Phone), nameof(registerDto.Phone));
            content.Add(new StringContent(registerDto.Address), nameof(registerDto.Address));
            content.Add(new StringContent(registerDto.Role), nameof(registerDto.Role));
            content.Add(new StringContent(registerDto.CompanyName), nameof(registerDto.CompanyName));

            var response = await client.PostAsync("/api/auth/register", content);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var user = await response.Content.ReadFromJsonAsync<Vendor>();
            user.Email.Should().Be(registerDto.Email);
            user.CompanyName.Should().Be("Tech Corp");
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsJwtToken()
        {
            // 1. Setup: We need a user in the DB first to log in
            var client = CreateClient();
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await ClearDbAsync(db);

            var passwordHasher = new PasswordHasher<BaseUser>();
            var customer = new Customer
            {
                Name = "Login User",
                Email = "login@example.com",
                Phone = "123456",
                Address = "Test Address"
            };
            customer.PasswordHash = passwordHasher.HashPassword(customer, "MySecurePassword");
            db.Customer.Add(customer);
            await db.SaveChangesAsync();

            // 2. Act: Send JSON (Login endpoint expects JSON body)
            var loginDto = new UserLoginDTO
            {
                Email = "login@example.com",
                Password = "MySecurePassword"
            };

            var response = await client.PostAsJsonAsync("/api/auth/login", loginDto);

            // 3. Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var token = await response.Content.ReadAsStringAsync();
            token.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async Task Login_WrongPassword_ReturnsBadRequest()
        {
            // 1. Setup
            var client = CreateClient();
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await ClearDbAsync(db);

            var passwordHasher = new PasswordHasher<BaseUser>();
            var customer = new Customer
            {
                Name = "Login User",
                Email = "login@example.com",
                Phone = "123456"
            };
            customer.PasswordHash = passwordHasher.HashPassword(customer, "CorrectPassword");
            db.Customer.Add(customer);
            await db.SaveChangesAsync();

            // 2. Act
            var loginDto = new UserLoginDTO
            {
                Email = "login@example.com",
                Password = "WrongPassword"
            };

            var response = await client.PostAsJsonAsync("/api/auth/login", loginDto);

            // 3. Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }
    }
}