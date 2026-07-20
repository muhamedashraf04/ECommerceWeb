using System.Security.Claims;
using ECommerceWeb.Application.DTOs.ProductDTOs;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Application.Service.ProductService;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceWeb.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductController : ControllerBase
{
    private readonly IValidator<CreateProductDTO> _validator;
    private readonly ProductService _productService;
    private readonly IBlobService _blobService;

    public ProductController(IValidator<CreateProductDTO> validator, ProductService productService, IBlobService blobService)
    {
        _validator = validator;
        _productService = productService;
        _blobService = blobService;
    }

    [Authorize(Roles = "Vendor")]
    [HttpPost("create")]
    public async Task<IActionResult> CreateAsync([FromForm] CreateProductDTO dto)
    {
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var vendorId))
        {
            return Unauthorized();
        }

        var product = await _productService.CreateProductAsync(dto, vendorId);
        if (product == null)
        {
            return BadRequest("Could not create product.");
        }

        return Ok(product);
    }

    [HttpGet("GetProductByID")]
    public async Task<IActionResult> GetByIdAsync(int productId)
    {
        var product = await _productService.GetProductByIdAsync(productId);
        if (product == null)
        {
            return NotFound("Product not found.");
        }

        return Ok(product);
    }

    [HttpGet("GetAllProducts")]
    public async Task<IActionResult> GetAllProductsAsync()
    {
        var products = await _productService.GetProductsAsync();
        return Ok(products ?? new List<Domain.Models.Product>());
    }

    [HttpGet("GetProductByCategory")]
    public async Task<IActionResult> GetProductsByCategoryAsync(string category)
    {
        var products = await _productService.GetProductsByCategoryAsync(category);
        return Ok(products ?? new List<Domain.Models.Product>());
    }

    [HttpGet("GetProductByVendor")]
    public async Task<IActionResult> GetProductsByVendorAsync(int vendorId)
    {
        var products = await _productService.GetProductsByVendorAsync(vendorId);
        return Ok(products ?? new List<Domain.Models.Product>());
    }

    [Authorize(Roles = "Vendor")]
    [HttpPut("edit")]
    public async Task<IActionResult> EditAsync([FromForm] UpdateProductDTO dto)
    {
        var vendorIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(vendorIdClaim) || !int.TryParse(vendorIdClaim, out var vendorId))
        {
            return Unauthorized();
        }

        var product = await _productService.GetProductByIdAsync(dto.Id);
        if (product == null)
        {
            return NotFound("Product not found.");
        }

        if (product.VendorId != vendorId)
        {
            return StatusCode(StatusCodes.Status403Forbidden, "You are not authorized to edit this product.");
        }

        var result = await _productService.EditProductAsync(dto);
        if (!result)
        {
            return BadRequest("Failed to update product.");
        }

        var updatedProduct = await _productService.GetProductByIdAsync(dto.Id);
        return Ok(updatedProduct ?? product);
    }

    [Authorize(Roles = "Vendor")]
    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        var vendorIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(vendorIdClaim) || !int.TryParse(vendorIdClaim, out var vendorId))
        {
            return Unauthorized();
        }

        var product = await _productService.GetProductByIdAsync(id);
        if (product == null)
        {
            return NotFound("Product not found.");
        }

        if (product.VendorId != vendorId)
        {
            return StatusCode(StatusCodes.Status403Forbidden, "You are not authorized to delete this product.");
        }

        var result = await _productService.DeleteProductAsync(id);
        if (!result)
        {
            return BadRequest("Failed to delete product.");
        }

        return Ok("Product deleted successfully.");
    }
}
