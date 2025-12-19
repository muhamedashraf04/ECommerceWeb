using Xunit;
using Moq;
using ECommerceWeb.Application.Service;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Application.DTOs.CategoryDTOs;
using ECommerceWeb.Domain.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class CategoryServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly Mock<ICategoryRepository> _mockCategoryRepo;
    private readonly Mock<IProductRepository> _mockProductRepo;
    private readonly CategoryService _service;

    public CategoryServiceTests()
    {
        // Assign class-level fields
        _mockUow = new Mock<IUnitOfWork>();
        _mockCategoryRepo = new Mock<ICategoryRepository>();
        _mockProductRepo = new Mock<IProductRepository>();

        // Setup UoW to return these mocks
        _mockUow.Setup(u => u.CategoryRepository).Returns(_mockCategoryRepo.Object);
        _mockUow.Setup(u => u.ProductRepository).Returns(_mockProductRepo.Object);

        // Create the service
        _service = new CategoryService(_mockUow.Object);
    }


    [Fact]
    public async Task CreateCategoryAsync_ReturnsTrue_WhenCreated()
    {
        // Arrange
        _mockCategoryRepo.Setup(r => r.CreateAsync(It.IsAny<Category>())).ReturnsAsync(true);
        var dto = new CategoryDTO { Name = "TestCategory" };

        // Act
        var result = await _service.CreateCategoryAsync(dto);

        // Assert
        Assert.True(result);
        _mockCategoryRepo.Verify(r => r.CreateAsync(It.Is<Category>(c => c.Name == "TestCategory")), Times.Once);
    }

    [Fact]
    public async Task GetCategoryByIdAsync_ReturnsCategory_WhenExists()
    {
        // Arrange
        var category = new Category { Id = 1, Name = "Cat1" };
        _mockCategoryRepo.Setup(r => r.GetAsync(c => c.Id == 1)).ReturnsAsync(category);

        // Act
        var result = await _service.GetCategoryByIdAsync(1);

        // Assert
        Assert.Equal(category, result);
    }

    [Fact]
    public async Task GetAllCategoriesAsync_ReturnsAllCategories()
    {
        // Arrange
        var categories = new List<Category> { new Category { Id = 1 }, new Category { Id = 2 } };
        _mockCategoryRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(categories);

        // Act
        var result = await _service.GetAllCategoriesAsync();

        // Assert
        Assert.Equal(2, result.Count());
        Assert.Contains(result, c => c.Id == 1);
        Assert.Contains(result, c => c.Id == 2);
    }

    [Fact]
    public async Task EditCategoryAsync_ReturnsFalse_WhenCategoryNotFound()
    {
        // Arrange
        _mockCategoryRepo.Setup(r => r.GetAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<Category, bool>>>())).ReturnsAsync((Category)null);
        var dto = new CategoryDTO { Id = 1, Name = "NewName" };

        // Act
        var result = await _service.EditCategoryAsync(dto);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task EditCategoryAsync_ReturnsTrue_WhenEdited()
    {
        // Arrange
        var category = new Category { Id = 1, Name = "OldName" };
        _mockCategoryRepo.Setup(r => r.GetAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<Category, bool>>>())).ReturnsAsync(category);
        _mockCategoryRepo.Setup(r => r.EditAsync(category)).ReturnsAsync(true);
        var dto = new CategoryDTO { Id = 1, Name = "NewName" };

        // Act
        var result = await _service.EditCategoryAsync(dto);

        // Assert
        Assert.True(result);
        Assert.Equal("NewName", category.Name);
    }

    [Fact]
    public async Task DeleteCategoryAsync_ReturnsFalse_WhenCategoryNotFound()
    {
        // Arrange
        _mockCategoryRepo.Setup(r => r.GetAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<Category, bool>>>())).ReturnsAsync((Category)null);

        // Act
        var result = await _service.DeleteCategoryAsync(1);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task DeleteCategoryAsync_ReturnsFalse_WhenProductsExist()
    {
        // Arrange
        var category = new Category { Id = 1 };
        var products = new List<Product> { new Product { CategoryId = 1 } };
        _mockCategoryRepo.Setup(r => r.GetAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<Category, bool>>>())).ReturnsAsync(category);
        _mockProductRepo.Setup(r => r.GetAllAsync(p => p.CategoryId == category.Id)).ReturnsAsync(products);

        // Act
        var result = await _service.DeleteCategoryAsync(1);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task DeleteCategoryAsync_ReturnsTrue_WhenNoProducts()
    {
        // Arrange
        var category = new Category { Id = 1 };
        var emptyProducts = new List<Product>();
        _mockCategoryRepo.Setup(r => r.GetAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<Category, bool>>>())).ReturnsAsync(category);
        _mockProductRepo.Setup(r => r.GetAllAsync(p => p.CategoryId == category.Id)).ReturnsAsync(emptyProducts);
        _mockCategoryRepo.Setup(r => r.RemoveAsync(category.Id)).ReturnsAsync(true);

        // Act
        var result = await _service.DeleteCategoryAsync(1);

        // Assert
        Assert.True(result);
        _mockCategoryRepo.Verify(r => r.RemoveAsync(category.Id), Times.Once);
    }
}
