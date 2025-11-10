using ECommerceWeb.DataAccess.Repositories.Interfaces;
using ECommerceWeb.Models.DTOs.ProductDTOs;
using ECommerceWeb.Models.Models;

namespace ECommerceWeb.Utilities.Service.ProductService
{
    public class ProductService
    {
        private readonly IUnitOfWork _uow;

        public ProductService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<Product?> CreateProductAsync(CreateProductDTO dto, int vendorId)
        {
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                CategoryId = dto.CategoryId,
                Quantity = dto.Quantity,
                ImageUrl = dto.ImageUrl,
                VendorId = vendorId
            };

            var created = await _uow.ProductRepository.CreateAsync(product);
            if (!created) return null;

            var saved = await _uow.SaveChangesAsync();
            return saved ? product : null;
        }
        public async Task<Product?> GetProductByIdAsync(int productId)
        {
            return await _uow.ProductRepository.GetAsync(p => p.Id == productId);
        }
        public async Task<bool> EditProductAsync(UpdateProductDTO dto)
        {
            var product = await _uow.ProductRepository.GetAsync(p => p.Id == dto.Id);

            product.Name = dto.Name ?? product.Name;
            product.Description = dto.Description ?? product.Description;
            product.Price = dto.Price ?? product.Price;
            product.CategoryId = dto.CategoryId ?? product.CategoryId;
            product.ImageUrl = dto.ImageUrl ?? product.ImageUrl;
            product.Quantity = dto.Quantity ?? product.Quantity;

            await _uow.ProductRepository.EditAsync(product);
            var saved = await _uow.SaveChangesAsync();
            return saved;
        }
        public async Task<bool> DeleteProductAsync(int productId)
        {
            var product = await _uow.ProductRepository.GetAsync(p => p.Id == productId);
            if (product == null)
            {
                return false;
            }
            await _uow.ProductRepository.RemoveAsync(product.Id);
            var saved = await _uow.SaveChangesAsync();
            return saved;
        }
        public async Task<IEnumerable<Product>> GetProductsAsync()
        {
            return await _uow.ProductRepository.GetAllAsync();
        }
        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(string category)
        {
            return await _uow.ProductRepository.GetAllAsync(p => p.Category != null && p.Category.Name == category);
        }
        public async Task<IEnumerable<Product>> GetProductsByVendorAsync(int vendorId)
        {
            return await _uow.ProductRepository.GetAllAsync(p => p.VendorId == vendorId);
        }
    }
}
