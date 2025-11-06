using System.Security.Claims;
using ECommerceWeb.DataAccess.Repositories.Interfaces;
using ECommerceWeb.Models.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceWeb.Controllers;

public class ProductController : Controller
{
    private readonly IUnitOfWork _uow;
    public ProductController(IUnitOfWork uow)
    {
        _uow = uow;
    }
    [Authorize(Roles = "Vendor")]
    [HttpGet("create")]
    public async Task<IActionResult> CreateAsync(CreateProductDTO dto)
    {
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
        await _uow.ProductRepository.CreateAsync(product);
        var result = await _uow.SaveChangesAsync();
        if (result != 0)
        {
            return Ok(product);
        }
        else
        {
            return BadRequest("Could not create product.");
        }
    }
    [Authorize(Roles = "Vendor")]
    [HttpPut("get")]
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
        if (result > 0)
        {
            return Ok(product);
        }
        return BadRequest("Failed to update product.");
    }
    [Authorize(Roles = "Vendor")]
    [HttpPut("delete")]
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
        result = await _uow.SaveChangesAsync() == 0;
        if (result)
        {
            return Ok("Product deleted successfully.");
        }
        return BadRequest("Failed to delete product.");
    }
}
