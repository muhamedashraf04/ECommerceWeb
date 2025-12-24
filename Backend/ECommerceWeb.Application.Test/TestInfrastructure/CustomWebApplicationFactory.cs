using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ECommerceWeb.Infrastructure.Data;
using ECommerceWeb.Domain.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System.Text.Encodings.Web;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore.Storage;

namespace ECommerceWeb.Application.Test
{
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                // 1. Remove the existing SQL Server DbContext registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                // 2. Add a fresh Internal Service Provider for EF In-Memory
                var internalServiceProvider = new ServiceCollection()
                    .AddEntityFrameworkInMemoryDatabase()
                    .BuildServiceProvider();

                // 3. Add In-Memory DbContext
                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb");
                    options.UseInternalServiceProvider(internalServiceProvider);
                });

                // 4. Setup Fake Authentication
                services.AddAuthentication("Test")
                        .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", options => { });

                // 5. Build Service Provider and Seed Database
                var sp = services.BuildServiceProvider();
                using var scope = sp.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                // Ensure a fresh database for every test run
                db.Database.EnsureDeleted();
                db.Database.EnsureCreated();

                // --- SEED CUSTOMERS ---
                // Prevents "Only customers can have a shopping cart" failure
                if (!db.Customer.Any())
                {
                    db.Customer.Add(new Customer 
                    { 
                        Id = 1, 
                        Name = "TestUser", 
                        Email = "test@test.com", 
                        PasswordHash = "fake_hash" 
                    });
                }

                // --- SEED CATEGORIES ---
                if (!db.Category.Any())
                {
                    db.Category.AddRange(new List<Category>
                    {
                        new Category { Id = 1, Name = "Electronics" },
                        new Category { Id = 2, Name = "Books" }
                    });
                }

                // --- SEED PRODUCTS ---
                // Required to fix "Product not found" in Cart and Order tests
                if (!db.Product.Any())
                {
                    db.Product.AddRange(new List<Product>
                    {
                        new Product { Id = 1, Name = "Laptop", Price = 1000, Quantity = 50, CategoryId = 1 },
                        new Product { Id = 2, Name = "Mouse", Price = 25, Quantity = 100, CategoryId = 1 }
                    });
                }

                // --- SEED CARTS & ITEMS ---
                if (!db.Cart.Any())
                {
                    var cart = new Cart { Id = 1, UserId = 1, NumOfItems = 1, TotalAmount = 1000 };
                    db.Cart.Add(cart);
                    
                    // Seeding an item ensures "ShowCart_ReturnsCartWithItems" doesn't return empty
                    db.CartItem.Add(new CartItem { Id = 1, CartId = 1, ProductId = 1, Quantity = 1 });
                }

                db.SaveChanges();
            });
        }
    }

    public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
                               ILoggerFactory logger,
                               UrlEncoder encoder,
                               ISystemClock clock)
            : base(options, logger, encoder, clock) { }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            // We provide both roles so the mock user can test Vendor and Customer features
            var claims = new[] {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim(ClaimTypes.Name, "TestUser"),
                new Claim(ClaimTypes.Role, "Vendor"),
                new Claim(ClaimTypes.Role, "Customer")
            };
            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, "Test");

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}