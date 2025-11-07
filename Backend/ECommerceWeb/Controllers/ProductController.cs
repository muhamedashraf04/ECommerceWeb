using System.Security.Claims;
using ECommerceWeb.DataAccess.Repositories.Interfaces;
using ECommerceWeb.Models.DTOs.ProductDTOs;
using ECommerceWeb.Utilities.Service.ProductService;
using ECommerceWeb.Utilities.Validators.ProductValidators;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceWeb.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    private readonly IValidator<CreateProductDTO> _validator;
    private readonly ProductService _ProductService;

    public ProductController(IUnitOfWork uow, IValidator<CreateProductDTO> validator, ProductService productService)
    {
        _uow = uow;
        _validator = validator;
        _ProductService = productService;
    }

    [Authorize(Roles = "Vendor")]
    [HttpPost("create")]
    public async Task<IActionResult> CreateAsync(CreateProductDTO dto)
    {
        var validationResult = await _validator.ValidateAsync(dto);

        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
        }
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null)
        {
            return Unauthorized();
        }
        int vendorId = int.Parse(userIdClaim);
        var product = await _ProductService.CreateProductAsync(dto, vendorId);

        if (product == null)
        {
            return BadRequest("Could not create product.");
        }
        return Ok(product);
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
