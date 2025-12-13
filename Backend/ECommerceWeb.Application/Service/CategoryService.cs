using ECommerceWeb.Application.DTOs.CategoryDTOs;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Domain.Models;

namespace ECommerceWeb.Application.Service;

public class CategoryService
{
    
    private readonly IUnitOfWork _uow;
    public CategoryService(IUnitOfWork uow)
    {
        _uow = uow;
    }
    public async Task<bool> CreateCategoryAsync(CategoryDTO dto)
    {
        var Category = new Category
        {
            Name = dto.Name
        };
        
        var created = await _uow.CategoryRepository.CreateAsync(Category);
        return created;
    }
    public async Task<Category?> GetCategoryByIdAsync(int CatID)
    {
        return await _uow.CategoryRepository.GetAsync(p => p.Id == CatID) ;
    }
    public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
    {
        return await _uow.CategoryRepository.GetAllAsync();
    }
    public async Task<bool> EditCategoryAsync(CategoryDTO dto)
    {
        var category = await _uow.CategoryRepository.GetAsync(p => p.Id == dto.Id);
        if (category == null)
        {
            return false;
        }
        category.Name = dto.Name ?? category.Name;
        return(await _uow.CategoryRepository.EditAsync(category));
    }
    public async Task<bool> DeleteCategoryAsync(int CatID)
    {
        var category = await _uow.CategoryRepository.GetAsync(p => p.Id == CatID);
        if (category == null)
        {
            return false;
        }
        var products= await _uow.ProductRepository.GetAllAsync(p => p.CategoryId == category.Id);
        if (products.Any())
        {
            return false;
        }

        return await _uow.CategoryRepository.RemoveAsync(category.Id);
    }

}