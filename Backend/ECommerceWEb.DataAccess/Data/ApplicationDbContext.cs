// In: ECommercerWEb.DataAccess/Data/ApplicationDbContext.cs
using ECommerceWeb.Models.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerceWeb.DataAccess.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public DbSet<Product> Products { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- Configure the Product entity ---
            modelBuilder.Entity<Product>(entity =>
            {
                // 1. Fixes all your decimal precision warnings

                // Use 18 total digits, 2 after the decimal (standard for money)
                entity.Property(p => p.Price).HasPrecision(18, 2);
                entity.Property(p => p.Discount).HasPrecision(18, 2);
                entity.Property(p => p.PriceDiscount).HasPrecision(18, 2);

                // Use 3 total digits, 1 after the decimal (good for ratings like 4.5)
                entity.Property(p => p.ratings).HasPrecision(3, 1);


                // 2. Seeds the Product table with 2 records
                entity.HasData(
                    new Product
                    {
                        Id = 1, // You MUST provide a primary key for seed data
                        Name = "Sample Product 1",
                        Description = "This is the first sample product.",
                        Price = 19.99m,
                        Vendor_ID = 1,     // Note: A Vendor with ID 1 must exist
                        Category_ID = 1,   // Note: A Category with ID 1 must exist
                        Discount = 0m,
                        PriceDiscount = 19.99m,
                        Quantity = 100,
                        ratings = 4.5m
                    },
                    new Product
                    {
                        Id = 2, // Must be unique
                        Name = "Sample Product 2",
                        Description = "This is the second sample product.",
                        Price = 45.50m,
                        Vendor_ID = 1,     // Note: A Vendor with ID 1 must exist
                        Category_ID = 2,   // Note: A Category with ID 2 must exist
                        Discount = 5.00m,
                        PriceDiscount = 40.50m,
                        Quantity = 50,
                        ratings = 4.2m
                    }
                );
            });
        }
    }
}