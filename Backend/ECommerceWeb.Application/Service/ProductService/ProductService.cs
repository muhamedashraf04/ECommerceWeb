using ECommerceWeb.Application.DTOs.ProductDTOs;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Domain.Models;

namespace ECommerceWeb.Application.Service.ProductService
{
    public class ProductService
    {
        private readonly IUnitOfWork _uow;
        private readonly IBlobService _blobService; // Inject BlobService

        public ProductService(IUnitOfWork uow, IBlobService blobService)
        {
            _uow = uow;
            _blobService = blobService;
        }

        public async Task<Product?> CreateProductAsync(CreateProductDTO dto, int vendorId)
        {
            var imageUrls = new List<string>();

            if (dto.Images != null && dto.Images.Any())
            {
                foreach (var file in dto.Images)
                {
                    using var stream = file.OpenReadStream();
                    var url = await _blobService.UploadAsync(stream, file.FileName, file.ContentType, "products");
                    imageUrls.Add(url);
                }
            }

            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                CategoryId = dto.CategoryId,
                Quantity = dto.Quantity,
                VendorId = vendorId,
                ImageUrl = string.Join(",", imageUrls)
            };

            await _uow.ProductRepository.CreateAsync(product);
            return await _uow.SaveChangesAsync() ? product : null;
        }

        public async Task<bool> EditProductAsync(UpdateProductDTO dto)
        {
            var product = await _uow.ProductRepository.GetAsync(p => p.Id == dto.Id);
            if (product == null) return false;

            if (dto.Images != null && dto.Images.Any())
            {
                if (!string.IsNullOrEmpty(product.ImageUrl))
                {
                    var oldUrls = product.ImageUrl.Split(',');
                    // Pass ContainerName for deletion
                    foreach (var oldUrl in oldUrls) await _blobService.DeleteAsync(oldUrl, "products");
                }

                var newUrls = new List<string>();
                foreach (var file in dto.Images)
                {
                    using var stream = file.OpenReadStream();
                    // Pass ContainerName for upload
                    var url = await _blobService.UploadAsync(stream, file.FileName, file.ContentType, "products");
                    newUrls.Add(url);
                }
                product.ImageUrl = string.Join(",", newUrls);
            }

            product.Name = dto.Name ?? product.Name;
            product.Description = dto.Description ?? product.Description;
            product.Price = dto.Price ?? product.Price;
            product.CategoryId = dto.CategoryId ?? product.CategoryId;
            product.Quantity = dto.Quantity ?? product.Quantity;

            await _uow.ProductRepository.EditAsync(product);
            return await _uow.SaveChangesAsync();
        }

        public async Task<bool> DeleteProductAsync(int productId)
        {
            var product = await _uow.ProductRepository.GetAsync(p => p.Id == productId);
            if (product == null) return false;

            if (!string.IsNullOrEmpty(product.ImageUrl))
            {
                var urls = product.ImageUrl.Split(',');
                foreach (var url in urls) await _blobService.DeleteAsync(url, "products");
            }

            await _uow.ProductRepository.RemoveAsync(product.Id);
            return await _uow.SaveChangesAsync();
        }
        public async Task<Product?> GetProductByIdAsync(int productId)
        {
            return await _uow.ProductRepository.GetAsync(p => p.Id == productId);
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