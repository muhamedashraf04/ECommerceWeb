using System.ComponentModel.DataAnnotations;

namespace ECommerceWeb.Application.DTOs.CategoryDTOs;

public class CategoryDTO
{
    public int Id { get; set; }
    [Required]
    public string Name { get; set; }
}