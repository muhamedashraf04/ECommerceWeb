using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using ECommerceWeb.Application.DTOs;
using ECommerceWeb.Domain.Models;
using Microsoft.Extensions.DependencyInjection;
using ECommerceWeb.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;

namespace ECommerceWeb.Application.Test.ControllerTest
{
    public class AuthControllerEndpointsTest : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory _factory;

        public AuthControllerEndpointsTest(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task Register_NewCustomer_ReturnsOkWithUser()
        {
            // Arrange
            var request = new UserRegisterDTO
            {
                Name = "New Customer",
                Email = "unique_customer@test.com",
                Password = "Password123!",
                Phone = "123456789",
                Role = "Customer",
                Address = "123 Street"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/Auth/register", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var user = await response.Content.ReadFromJsonAsync<Customer>();
            user.Email.Should().Be(request.Email);
            user.Name.Should().Be(request.Name);
        }

        [Fact]
        public async Task Register_DuplicateEmail_ReturnsBadRequest()
        {
            // 1. Arrange: First, ensure a user with this email actually exists in the DB
            string sharedEmail = "duplicate@test.com";
            await SeedUserAsync(sharedEmail, "Password123!");

            // 2. Create a second request with the same email, but ensure ALL other required 
            // fields (like Phone) are present to pass Model Validation
            var request = new UserRegisterDTO
            {
                Name = "Duplicate User",
                Email = sharedEmail,
                Password = "Password123!",
                Phone = "123456789", // MUST be present to pass initial validation
                Role = "Customer",
                Address = "Some Address"
            };

            // 3. Act
            var response = await _client.PostAsJsonAsync("/api/Auth/register", request);

            // 4. Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            var error = await response.Content.ReadAsStringAsync();

            // Now it should contain your custom message instead of the validation error
            error.Should().Contain("already exists");
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsJwtToken()
        {
            // Arrange: 1. Manually seed a user with a hashed password
            string email = "login_test@test.com";
            string password = "SecretPassword123";
            await SeedUserAsync(email, password);

            var loginRequest = new UserLoginDTO
            {
                Email = email,
                Password = password
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/Auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var token = await response.Content.ReadAsStringAsync();
            token.Should().NotBeNullOrEmpty();
            // A JWT token typically has two dots (three parts)
            token.Split('.').Should().HaveCount(3);
        }

        [Fact]
        public async Task Login_WrongPassword_ReturnsBadRequest()
        {
            // Arrange
            var loginRequest = new UserLoginDTO
            {
                Email = "login_test@test.com",
                Password = "WrongPassword"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/Auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            var error = await response.Content.ReadAsStringAsync();
            error.Should().Contain("Wrong password");
        }

        private async Task SeedUserAsync(string email, string password)
        {
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var customer = new Customer
            {
                Name = "Login Test User",
                Email = email,
                Phone = "000000",
                Address = "Test Address"
            };

            var hasher = new PasswordHasher<Customer>();
            customer.PasswordHash = hasher.HashPassword(customer, password);

            db.Customer.Add(customer);
            await db.SaveChangesAsync();
        }
    }
}