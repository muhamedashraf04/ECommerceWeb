    // In: ECommercerWEb.DataAccess/Data/ApplicationDbContext.cs
using ECommerceWeb.Models.Models;
using ECommerceWeb.Models.Models.BaseModels;
using Microsoft.EntityFrameworkCore;

namespace ECommerceWeb.DataAccess.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public DbSet<Product> Product { get; set; }
        public DbSet<Customer> Customer { get; set; }
        public DbSet<Vendor> Vendor { get; set; }
        public DbSet<Category> Category { get; set; }
        public DbSet<Cart> Cart { get; set; }
        public DbSet<CartItem> CartItem { get; set; }
        public DbSet<Order> Order { get; set; }
        public DbSet<OrderItem> OrderItem { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 🔗 Customer ↔ Cart (1-to-1)
            modelBuilder.Entity<Customer>()
                .HasOne(c => c.Cart)
                .WithOne(cart => cart.Customer)
                .HasForeignKey<Cart>(cart => cart.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔗 Customer ↔ Orders (1-to-many)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Customer)
                .WithMany(c => c.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔗 Cart ↔ CartItems (1-to-many)
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cart)
                .WithMany(c => c.CartItems)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔗 Order ↔ OrderItems (1-to-many)
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔗 Vendor ↔ Products (1-to-many)
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Vendor)
                .WithMany(v => v.VendorProducts)
                .HasForeignKey(p => p.VendorId)
                .OnDelete(DeleteBehavior.Restrict);

            // 🔗 Category ↔ Products (1-to-many)
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.SameCategoryProducts)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // 🧩 Dummy Data
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Electronics" },
                new Category { Id = 2, Name = "Clothing" }
            );

            modelBuilder.Entity<Vendor>().HasData(
                new Vendor
                {
                    Id = 1,
                    FirstName = "John",
                    LastName = "Vendor",
                    Email = "vendor@example.com",
                    Password = "1234",
                    Phone = "01000000001",
                    Address = "Vendor Street 1",
                    CompanyName = "TechVendor",
                    NationalIdImage = "https://example.com/nationalid.jpg"
                }
            );

            modelBuilder.Entity<Customer>().HasData(
                new Customer
                {
                    Id = 1,
                    FirstName = "Omar",
                    LastName = "Shoulkamy",
                    Email = "omar@example.com",
                    Password = "1234",
                    Phone = "01000000002",
                    Address = "Cairo, Egypt"
                }
            );

            modelBuilder.Entity<Product>().HasData(
                new Product
                {
                    Id = 1,
                    Name = "Laptop",
                    Description = "Gaming Laptop",
                    Price = 1500,
                    Quantity = 5,
                    VendorId = 1,
                    CategoryId = 1,
                    Discount = 0.1m,
                    Ratings = 4.8m,
                    ImageUrl = "https://example.com/laptop.jpg"
                },
                new Product
                {
                    Id = 2,
                    Name = "T-Shirt",
                    Description = "Cotton T-Shirt",
                    Price = 20,
                    Quantity = 50,
                    VendorId = 1,
                    CategoryId = 2,
                    Discount = 0,
                    Ratings = 4.5m,
                    ImageUrl = "https://example.com/tshirt.jpg"
                }
            );

            modelBuilder.Entity<Cart>().HasData(
                new Cart { Id = 1, UserId = 1, TotalAmount = 0 }
            );

            modelBuilder.Entity<CartItem>().HasData(
                new CartItem { Id = 1, ProductId = 1, CartId = 1, Quantity = 1 }
            );

            modelBuilder.Entity<Order>().HasData(
                new Order
                {
                    Id = 1,
                    UserId = 1,
                    Address = "Cairo, Egypt",
                    OrderStatus = "Pending",
                    TotalAmount = 1500
                }
            );

            modelBuilder.Entity<OrderItem>().HasData(
                new OrderItem
                {
                    Id = 1,
                    ProductId = 1,
                    OrderId = 1,
                    Quantity = 1,
                    PriceATM = 1500
                }
            );
        }

    }
}