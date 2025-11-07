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
    }
}
