using ECommerceWeb.Application.DTOs.ProductDTOs;
using ECommerceWeb.Application.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Http;

namespace ECommerceWeb.Application.Validators.ProductValidators
{
    public class ProductValidator : AbstractValidator<CreateProductDTO>
    {
        private readonly IUnitOfWork _uow;

        public ProductValidator(IUnitOfWork uow)
        {
            _uow = uow;

            RuleFor(p => p.Name)
                .NotEmpty().WithMessage("Product name is required.")
                .MaximumLength(100).WithMessage("Name must be less than 100 characters.");

            RuleFor(p => p.Description)
                .NotEmpty().WithMessage("Description is required.")
                .MaximumLength(500).WithMessage("Description must be less than 500 characters.");

            RuleFor(p => p.Price)
                .GreaterThan(0).WithMessage("Price must be greater than 0.");

            RuleFor(p => p.Quantity)
                .GreaterThanOrEqualTo(0).WithMessage("Quantity cannot be negative.");

            RuleFor(p => p.CategoryId)
                .MustAsync(async (categoryId, _) => await CategoryExists(categoryId))
                .WithMessage("Invalid category.");

            // 1- Updated Check: Validate the Photo File
            // ... inside constructor
            RuleForEach(p => p.Images)
                .Must(BeAValidImage).WithMessage("One or more images have an invalid format (Only JPG/PNG).")
                .Must(BeAValidSize).WithMessage("One or more images exceed the 5MB limit.");

            bool BeAValidImage(IFormFile? file) =>
                file != null && new[] { "image/jpg", "image/jpeg", "image/png" }.Contains(file.ContentType);

            bool BeAValidSize(IFormFile? file) =>
                file != null && file.Length <= 5 * 1024 * 1024;

            async Task<bool> CategoryExists(int categoryId)
            {
                var category = await _uow.CategoryRepository.GetAsync(c => c.Id == categoryId);
                return category != null;
            }
        }
    }
}