using System.Security.Claims;
using ECommerceWeb.Application.DTOs.CategoryDTOs;
using ECommerceWeb.Application.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceWeb.Controllers;

[Route("api/[controller]")]
[ApiController]

public class CategoryController : ControllerBase
{
    private readonly CategoryService _CategoryService;
    public CategoryController(CategoryService categoryService)
    {
        _CategoryService = categoryService;
    }
    [Authorize(Roles = "Vendor")]
    [HttpPost]
    public async Task<IActionResult> CreateAsync(CategoryDTO dto)
    {
        var category = await _CategoryService.CreateCategoryAsync(dto);
        if (category == false)
        {
            return BadRequest("Could not create category.");
        }
        return Ok("Category created successfully.");
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetByIdAsync(int id)
    {
        var category = await _CategoryService.GetCategoryByIdAsync(id);
        if(category == null)
        {
            return NotFound("Category not found.");
        }
        return Ok(category);
    }
    [HttpGet]
    public async Task<IActionResult> GetAllCategoriesAsync()
    {
        var categories = await _CategoryService.GetAllCategoriesAsync();
        
        return Ok(categories);
    }
    [Authorize(Roles = "Vendor")]
    [HttpPut]
    public async Task<IActionResult> EditAsync(CategoryDTO dto)
    {
        var success = await _CategoryService.EditCategoryAsync(dto);
        if (!success)
        {
            return NotFound("Category not found or could not be updated.");
        }
        
        return Ok("Category Updated");
    }
    
    [Authorize(Roles = "Vendor")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        var success = await _CategoryService.DeleteCategoryAsync(id);
        
        if (!success)
        {
            return BadRequest("Unable to delete. Category may not exist or contains active products.");
        }
        
        return Ok("Category Deleted");
    }
}
