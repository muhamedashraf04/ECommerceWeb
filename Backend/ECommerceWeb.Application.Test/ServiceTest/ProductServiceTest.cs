using Xunit;
using Moq;
using ECommerceWeb.Application.Service.ProductService;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Application.DTOs.ProductDTOs;
using ECommerceWeb.Domain.Models;
using System.Linq.Expressions;

public class ProductServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly Mock<IProductRepository> _mockProductRepo;
    private readonly Mock<IBlobService> _mockBlobService;
    private readonly ProductService _service;

    public ProductServiceTests()
    {
        _mockUow = new Mock<IUnitOfWork>();
        _mockProductRepo = new Mock<IProductRepository>();

        _mockUow.Setup(u => u.ProductRepository)
                .Returns(_mockProductRepo.Object);
        _mockBlobService = new Mock<IBlobService>();
        _service = new ProductService(_mockUow.Object , _mockBlobService.Object);
    }

    [Fact]
    public async Task CreateProductAsync_ReturnsProduct_WhenCreated()
    {
        var dto = new CreateProductDTO
        {
            Name = "TestProduct",
            Description = "Desc",
            Price = 100,
            CategoryId = 1,
            Quantity = 5
        };

        _mockProductRepo
            .Setup(r => r.CreateAsync(It.IsAny<Product>()))
            .ReturnsAsync(true);

        _mockUow
            .Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(true);

        var result = await _service.CreateProductAsync(dto, 1);

        Assert.NotNull(result);
        Assert.Equal("TestProduct", result.Name);

        _mockProductRepo.Verify(
            r => r.CreateAsync(It.IsAny<Product>()),
            Times.Once);
    }

    [Fact]
    public async Task GetProductByIdAsync_ReturnsProduct_WhenExists()
    {
        var product = new Product { Id = 1, Name = "Prod1" };

        _mockProductRepo
            .Setup(r => r.GetAsync(p => p.Id == 1))
            .ReturnsAsync(product);

        var result = await _service.GetProductByIdAsync(1);

        Assert.Equal(product, result);
    }

    [Fact]
    public async Task EditProductAsync_ReturnsTrue_WhenEdited()
    {
        var dto = new UpdateProductDTO
        {
            Id = 1,
            Name = "NewName",
            Description = "NewDesc",
            Price = 200,
            CategoryId = 2,
            Quantity = 10
        };

        var product = new Product
        {
            Id = 1,
            Name = "OldName",
            Description = "OldDesc",
            Price = 100,
            CategoryId = 1,
            Quantity = 5
        };

        _mockProductRepo
            .Setup(r => r.GetAsync(It.IsAny<Expression<Func<Product, bool>>>()))
            .ReturnsAsync(product);

        _mockProductRepo
            .Setup(r => r.EditAsync(product))
            .ReturnsAsync(true);

        _mockUow
            .Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(true);

        var result = await _service.EditProductAsync(dto);

        Assert.True(result);
        Assert.Equal("NewName", product.Name);
        Assert.Equal("NewDesc", product.Description);
        Assert.Equal(200, product.Price);
        Assert.Equal(2, product.CategoryId);
        Assert.Equal(10, product.Quantity);
    }

    [Fact]
    public async Task DeleteProductAsync_ReturnsTrue_WhenDeleted()
    {
        var product = new Product { Id = 1 };

        _mockProductRepo
            .Setup(r => r.GetAsync(p => p.Id == 1))
            .ReturnsAsync(product);

        _mockProductRepo
            .Setup(r => r.RemoveAsync(1))
            .ReturnsAsync(true);

        _mockUow
            .Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(true);

        var result = await _service.DeleteProductAsync(1);

        Assert.True(result);

        _mockProductRepo.Verify(
            r => r.RemoveAsync(1),
            Times.Once);
    }

    [Fact]
    public async Task DeleteProductAsync_ReturnsFalse_WhenProductNotFound()
    {
        _mockProductRepo
            .Setup(r => r.GetAsync(It.IsAny<Expression<Func<Product, bool>>>()))
            .ReturnsAsync((Product)null);

        var result = await _service.DeleteProductAsync(1);

        Assert.False(result);
    }

    [Fact]
    public async Task GetProductsAsync_ReturnsAllProducts()
    {
        var products = new List<Product>
        {
            new Product { Id = 1 },
            new Product { Id = 2 }
        };

        _mockProductRepo
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(products);

        var result = await _service.GetProductsAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetProductsByCategoryAsync_ReturnsFilteredProducts()
    {
        var products = new List<Product>
        {
            new Product { Id = 1, Category = new Category { Name = "Cat1" } },
            new Product { Id = 2, Category = new Category { Name = "Cat2" } }
        };

        _mockProductRepo
            .Setup(r => r.GetAllAsync(It.IsAny<Expression<Func<Product, bool>>>()))
            .ReturnsAsync(products.Where(p => p.Category!.Name == "Cat1"));

        var result = await _service.GetProductsByCategoryAsync("Cat1");

        Assert.Single(result);
        Assert.Equal("Cat1", result.First().Category!.Name);
    }

    [Fact]
    public async Task GetProductsByVendorAsync_ReturnsFilteredProducts()
    {
        var products = new List<Product>
        {
            new Product { Id = 1, VendorId = 1 },
            new Product { Id = 2, VendorId = 2 }
        };

        _mockProductRepo
            .Setup(r => r.GetAllAsync(It.IsAny<Expression<Func<Product, bool>>>()))
            .ReturnsAsync(products.Where(p => p.VendorId == 1));

        var result = await _service.GetProductsByVendorAsync(1);

        Assert.Single(result);
        Assert.Equal(1, result.First().VendorId);
    }
}
