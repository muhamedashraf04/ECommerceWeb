
using ECommerceWeb.Models.DTOs;
using ECommerceWeb.Models.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ECommerceWeb.Controllers.Auth
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IConfiguration configuration) : ControllerBase
    {

        public static Customer cust = new();

        [HttpPost("register")]
        public ActionResult<Customer> RegisterCustomer(UserDTO request)
        {
            var hashedPassword = new PasswordHasher<Customer>()
                .HashPassword(cust, request.Password);

            cust.Name = request.Name;
            cust.PasswordHash = hashedPassword;
            return Ok(cust);
        }
        [HttpPost("login")]
        public ActionResult<string> Login(UserDTO reqquest)
        {
            if (cust.Name != reqquest.Name)
            {
                return BadRequest("User not found.");
            }
            if (new PasswordHasher<Customer>()
                .VerifyHashedPassword(cust, cust.PasswordHash, reqquest.Password)
                == PasswordVerificationResult.Failed)
            {
                return BadRequest("Wrong password.");
            }
            string token = CreateToken(cust);
            return Ok(token);
        }
        private string CreateToken(Customer cust)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, cust.Name)
            };
            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8
                .GetBytes(configuration.GetValue<string>("AppSettings:Token")));
            var cred = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);
            var tokenDescriptor = new JwtSecurityToken(
                issuer: configuration.GetValue<string>("AppSettings:Issuer"),
                audience: configuration.GetValue<string>("AppSettings:Audience"),
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: cred
            );
            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }
    }
}
