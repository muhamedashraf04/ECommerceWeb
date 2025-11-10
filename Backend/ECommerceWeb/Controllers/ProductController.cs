using System.Security.Claims;
using ECommerceWeb.Application.DTOs.ProductDTOs;
using ECommerceWeb.Application.Service.ProductService;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceWeb.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductController : ControllerBase
{
    private readonly IValidator<CreateProductDTO> _validator;
    private readonly ProductService _ProductService;

    public ProductController(IValidator<CreateProductDTO> validator, ProductService productService)
    {
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

    [HttpGet("GetProductByID")]
    public async Task<IActionResult> GetByIdAsync(int productId)
    {
        var product = await _ProductService.GetProductByIdAsync(productId);
        if(product == null)
        {
            return NotFound("Product not found.");
        }
        return Ok(product);
    }
    [HttpGet("GetAllProducts")]
    public async Task<IActionResult> GetAllProductsAsync()
    {
        var products = await _ProductService.GetProductsAsync();
        if(products == null || !products.Any())
        {
            return NotFound("No products found.");
        }
        return Ok(products);
    }
    [HttpGet("GetProductByCategory")]
    public async Task<IActionResult> GetProductsByCategoryAsync(string category)
    {
        var products = await _ProductService.GetProductsByCategoryAsync(category);
        if(products == null || !products.Any())
        {
            return NotFound("No products found in this category.");
        }
        return Ok(products);
    }
    [HttpGet("GetProductByVendor")]
    public async Task<IActionResult> GetProductsByVendorAsync(int vendorId)
    {
        var products = await _ProductService.GetProductsByVendorAsync(vendorId);
        return Ok(products);
    }
    [Authorize(Roles = "Vendor")]
    [HttpPut("edit")]
    public async Task<IActionResult> EditAsync([FromBody] UpdateProductDTO dto)
    {

        var product = await _ProductService.GetProductByIdAsync(dto.Id);
        if (product == null)
        {
            return NotFound("Product not found.");
        }
        var vendorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (product.VendorId != vendorId)
        {
            return Forbid("You are not authorized to edit this product.");
        }
        var result = await _ProductService.EditProductAsync(dto);
        if (!result)
        {
            return BadRequest("Failed to update product.");
        }
        var updatedProduct = await _ProductService.GetProductByIdAsync(dto.Id);
        return Ok(updatedProduct);
    }
    [Authorize(Roles = "Vendor")]
    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        var product = await _ProductService.GetProductByIdAsync(id);
        if (product == null)
        {
            return NotFound("Product not found.");
        }
        var vendorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (product.VendorId != vendorId)
        {
            return Forbid("You are not authorized to delete this product.");
        }
        var result = await _ProductService.DeleteProductAsync(id);
        if (!result)
        {
            return BadRequest("Failed to delete product.");
        }
        return Ok("Product deleted successfully.");
    }

}
