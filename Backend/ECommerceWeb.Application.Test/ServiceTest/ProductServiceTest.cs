using Xunit;
using Moq;
using ECommerceWeb.Application.Service.ProductService;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Application.DTOs.ProductDTOs;
using ECommerceWeb.Domain.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class ProductServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly Mock<IProductRepository> _mockProductRepo;
    private readonly ProductService _service;

    public ProductServiceTests()
    {
        _mockUow = new Mock<IUnitOfWork>();
        _mockProductRepo = new Mock<IProductRepository>();

        _mockUow.Setup(u => u.ProductRepository).Returns(_mockProductRepo.Object);

        _service = new ProductService(_mockUow.Object);
    }

    [Fact]
    public async Task CreateProductAsync_ReturnsProduct_WhenCreated()
    {
        // Arrange
        var dto = new CreateProductDTO
        {
            Name = "Test",
            Description = "Desc",
            Price = 10,
            CategoryId = 1,
            Quantity = 5,
            ImageUrl = "url"
        };
        _mockProductRepo.Setup(r => r.CreateAsync(It.IsAny<Product>())).ReturnsAsync(true);
        _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(true);

        // Act
        var result = await _service.CreateProductAsync(dto, vendorId: 1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dto.Name, result.Name);
        _mockProductRepo.Verify(r => r.CreateAsync(It.IsAny<Product>()), Times.Once);
        _mockUow.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task GetProductByIdAsync_ReturnsProduct_WhenExists()
    {
        // Arrange
        var product = new Product { Id = 1, Name = "Test" };
        _mockProductRepo.Setup(r => r.GetAsync(p => p.Id == 1)).ReturnsAsync(product);

        // Act
        var result = await _service.GetProductByIdAsync(1);

        // Assert
        Assert.Equal(product, result);
    }

    [Fact]
    public async Task EditProductAsync_ReturnsTrue_WhenEdited()
    {
        // Arrange
        var product = new Product { Id = 1, Name = "Old" };
        var dto = new UpdateProductDTO { Id = 1, Name = "New" };

        _mockProductRepo.Setup(r => r.GetAsync(p => p.Id == 1)).ReturnsAsync(product);
        _mockProductRepo.Setup(r => r.EditAsync(product)).ReturnsAsync(true);
        _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(true);

        // Act
        var result = await _service.EditProductAsync(dto);

        // Assert
        Assert.True(result);
        Assert.Equal("New", product.Name);
    }

    [Fact]
    public async Task DeleteProductAsync_ReturnsFalse_WhenProductNotFound()
    {
        // Arrange
        _mockProductRepo.Setup(r => r.GetAsync(p => p.Id == 1)).ReturnsAsync((Product)null);

        // Act
        var result = await _service.DeleteProductAsync(1);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task DeleteProductAsync_ReturnsTrue_WhenProductDeleted()
    {
        // Arrange
        var product = new Product { Id = 1 };
        _mockProductRepo.Setup(r => r.GetAsync(p => p.Id == 1)).ReturnsAsync(product);
        _mockProductRepo.Setup(r => r.RemoveAsync(product.Id)).ReturnsAsync(true);
        _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(true);

        // Act
        var result = await _service.DeleteProductAsync(1);

        // Assert
        Assert.True(result);
        _mockProductRepo.Verify(r => r.RemoveAsync(product.Id), Times.Once);
        _mockUow.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task GetProductsAsync_ReturnsAllProducts()
    {
        // Arrange
        var products = new List<Product> { new Product { Id = 1 }, new Product { Id = 2 } };
        _mockProductRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(products);

        // Act
        var result = await _service.GetProductsAsync();

        // Assert
        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetProductsByCategoryAsync_ReturnsFilteredProducts()
    {
        // Arrange
        var categoryName = "Cat";
        var products = new List<Product>
        {
            new Product { Id = 1, Category = new Category { Name = categoryName } },
            new Product { Id = 2, Category = new Category { Name = "Other" } }
        };
        _mockProductRepo.Setup(r => r.GetAllAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<Product, bool>>>()))
            .ReturnsAsync((System.Linq.Expressions.Expression<System.Func<Product, bool>> predicate) => products.Where(predicate.Compile()));

        // Act
        var result = await _service.GetProductsByCategoryAsync(categoryName);

        // Assert
        Assert.Single(result);
        Assert.Equal(categoryName, result.First().Category.Name);
    }

    [Fact]
    public async Task GetProductsByVendorAsync_ReturnsFilteredProducts()
    {
        // Arrange
        int vendorId = 1;
        var products = new List<Product>
        {
            new Product { Id = 1, VendorId = vendorId },
            new Product { Id = 2, VendorId = 2 }
        };
        _mockProductRepo.Setup(r => r.GetAllAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<Product, bool>>>()))
            .ReturnsAsync((System.Linq.Expressions.Expression<System.Func<Product, bool>> predicate) => products.Where(predicate.Compile()));

        // Act
        var result = await _service.GetProductsByVendorAsync(vendorId);

        // Assert
        Assert.Single(result);
        Assert.Equal(vendorId, result.First().VendorId);
    }
}
