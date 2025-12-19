using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ECommerceWeb.Application.DTOs;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Domain.Models;
using ECommerceWeb.Domain.Models.BaseModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace ECommerceWeb.Controllers.Auth
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class AuthController(IConfiguration configuration, IUnitOfWork uow, IBlobService blobService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult> Register([FromForm] UserRegisterDTO request)
        {
            // ... (Existing checks for duplicate email) ...
            var Excustomer = await uow.CustomerRepository.GetAsync(u => u.Email == request.Email);
            var Exvendor = await uow.VendorRepository.GetAsync(u => u.Email == request.Email);

            if (Excustomer != null || Exvendor != null)
            {
                return BadRequest("An account with this email already exists.");
            }

            BaseUser newUser;
            var passwordHasher = new PasswordHasher<BaseUser>();

            if (request.Role.Equals("Customer", StringComparison.OrdinalIgnoreCase))
            {
               var customer = new Customer
                {
                    Name = request.Name,
                    Email = request.Email,
                    Phone = request.Phone,
                    Address = request.Address ?? string.Empty,
                };
                customer.PasswordHash = passwordHasher.HashPassword(customer, request.Password!);
                await uow.CustomerRepository.CreateAsync(customer);
                newUser = customer;
            }
            else if (request.Role.Equals("Vendor", StringComparison.OrdinalIgnoreCase))
            {
                string nationalIdUrl = "";
                if (request.NationalIdImage != null)
                {
                    using var stream = request.NationalIdImage.OpenReadStream();
                    nationalIdUrl = await blobService.UploadAsync(
                        stream, 
                        request.NationalIdImage.FileName, 
                        request.NationalIdImage.ContentType, 
                        "vendor-ids" 
                    );
                }

                var vendor = new Vendor
                {
                    Name = request.Name,
                    Email = request.Email,
                    Phone = request.Phone,
                    Address = request.Address ?? string.Empty,
                    CompanyName = request.CompanyName,
                    NationalIdImage = nationalIdUrl
                };
                vendor.PasswordHash = passwordHasher.HashPassword(vendor, request.Password!);

                await uow.VendorRepository.CreateAsync(vendor);
                newUser = vendor;
            }
            else
            {
                return BadRequest("Invalid role.");
            }

            await uow.SaveChangesAsync();
            return Ok(newUser);
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(UserLoginDTO request)
        {
            BaseUser? user = await uow.CustomerRepository.GetAsync(u => u.Email == request.Email);

            if (user == null)
            {
                user = await uow.VendorRepository.GetAsync(u => u.Email == request.Email);
            }

            if (user == null)
            {
                return BadRequest("User not found.");
            }

            var passwordHasher = new PasswordHasher<BaseUser>();
            var verificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash!, request.Password!);

            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return BadRequest("Wrong password.");
            }

            var token = CreateToken(user);
            return Ok(token);
        }

        private string CreateToken(BaseUser user)
        {
            var role = (user is Customer) ? "Customer" : "Vendor";
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Name, user.Name!),
                new Claim(ClaimTypes.Role, role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(configuration.GetValue<string>("AppSettings:Token")!));

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