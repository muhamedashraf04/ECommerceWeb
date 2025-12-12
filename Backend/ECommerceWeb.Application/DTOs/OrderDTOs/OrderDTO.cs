using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECommerceWeb.Application.DTOs.OrderDTOs
{
    public class OrderDto
    {
        public int OrderId { get; set; }
        public string OrderStatus { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }
}
