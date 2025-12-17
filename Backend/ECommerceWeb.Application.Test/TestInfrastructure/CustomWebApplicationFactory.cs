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
            // Force the environment to "Testing"
            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                // 1. Remove the existing SQL Server DbContext registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                // 2. Add a fresh Internal Service Provider for EF In-Memory
                // This is the crucial step to prevent the "Multiple Providers" error
                var internalServiceProvider = new ServiceCollection()
                    .AddEntityFrameworkInMemoryDatabase()
                    .BuildServiceProvider();

                // 3. Add In-Memory DbContext using that internal provider
                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb");
                    options.UseInternalServiceProvider(internalServiceProvider);
                });

                // 4. Setup Fake Authentication
                services.AddAuthentication("Test")
                        .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", options => { });

                // 5. Seed the Database
                var sp = services.BuildServiceProvider();
                using var scope = sp.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                db.Database.EnsureDeleted();
                db.Database.EnsureCreated();

                // Seed a Cart for UserId 1 (matches our TestAuthHandler)
                if (!db.Cart.Any())
                {
                    db.Cart.Add(new Cart
                    {
                        Id = 1,
                        UserId = 1,
                        TotalAmount = 0,
                        NumOfItems = 1,
                        CartItems = new List<CartItem>
                        {
                            new CartItem { Id = 1, ProductId = 1, Quantity = 1 }
                        }
                    });
                    db.SaveChanges();
                }
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
            var claims = new[] {
                new Claim(ClaimTypes.NameIdentifier, "1"), // Matches seeded UserId
                new Claim(ClaimTypes.Name, "TestUser")
            };
            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, "Test");

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}