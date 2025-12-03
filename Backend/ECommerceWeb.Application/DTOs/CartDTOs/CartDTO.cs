namespace ECommerceWeb.Application.DTOs.CartDTOs
{
    public class CartDTO
    {
        public int UserId { get; set; }
        public int NumOfItems { get; set; }
        public List<CartItemDTO> CartItems { get; set; } = new();
    }
}
