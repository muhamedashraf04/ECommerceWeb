using System.Security.Claims;
using ECommerceWeb.DataAccess.Repositories.Interfaces;
using ECommerceWeb.Models.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceWeb.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    public ProductController(IUnitOfWork uow)
    {
        _uow = uow;
    }
    [Authorize(Roles = "Vendor")]
    [HttpPost("create")]
    public async Task<IActionResult> CreateAsync(CreateProductDTO dto)
    {
        var Category = await _uow.CategoryRepository.GetAsync(c => c.Id == dto.CategoryId);
        if (Category == null)
        {
            return BadRequest("Invalid category.");
        }
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            CategoryId = dto.CategoryId,
            Quantity = dto.Quantity,
            ImageUrl = dto.ImageUrl,
            VendorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!)
        };
        bool result = await _uow.ProductRepository.CreateAsync(product);
        if (!result)
        {
            return BadRequest("Could not create product.");
        }
        result = await _uow.SaveChangesAsync();
        if (result)
        {
            return Ok(product);
        }
        else
        {
            return BadRequest("Could not save product.");
        }
    }
    [Authorize(Roles = "Vendor")]
    [HttpGet("get")]
    public async Task<IActionResult> GetByIdAsync(int id)
    {
        var product = await _uow.ProductRepository.GetAsync(p => p.Id == id);
        if (product == null)
        {
            return NotFound("Product not found.");
        }
        var vendorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (product.VendorId != vendorId)
        {
            return Forbid("You are not authorized to view this product.");
        }
        return Ok(product);
    }
    [Authorize(Roles = "Vendor")]
    [HttpPut("edit")]
    public async Task<IActionResult> EditAsync([FromBody] UpdateProductDTO dto)
    {
        var Category = await _uow.CategoryRepository.GetAsync(c => c.Id == dto.CategoryId);
        if (dto.CategoryId != null && Category == null)
        {
            return BadRequest("Invalid category.");
        }
        if (dto == null || dto.Id <= 0)
        {
            return BadRequest("Invalid product data.");
        }
        var product = await _uow.ProductRepository.GetAsync(p => p.Id == dto.Id);
        if (product == null)
        {
            return NotFound("Product not found.");
        }
        var vendorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (product.VendorId != vendorId)
        {
            return Forbid("You are not authorized to edit this product.");
        }
        product.Name = dto.Name ?? product.Name;
        product.Description = dto.Description ?? product.Description;
        product.Price = dto.Price ?? product.Price;
        product.CategoryId = dto.CategoryId ?? product.CategoryId;
        product.ImageUrl = dto.ImageUrl ?? product.ImageUrl;

        await _uow.ProductRepository.EditAsync(product);

        var result = await _uow.SaveChangesAsync();
        if (result)
        {
            return Ok(product);
        }
        return BadRequest("Failed to update product.");
    }
    [Authorize(Roles = "Vendor")]
    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        var product = await _uow.ProductRepository.GetAsync(p => p.Id == id);
        if (product == null)
        {
            return NotFound("Product not found.");
        }
        var vendorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (product.VendorId != vendorId)
        {
            return Forbid("You are not authorized to delete this product.");
        }
        var result = await _uow.ProductRepository.RemoveAsync(id);
        if (!result)
        {
            return BadRequest("Failed to delete product.");
        }
        if (await _uow.SaveChangesAsync())
        {
            return Ok("Product deleted successfully.");
        }
        return BadRequest("Failed to delete product.");
    }
}
