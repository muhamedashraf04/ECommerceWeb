using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ECommerceWeb.Application.DTOs.AuthDTOs;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Domain.Models;
using ECommerceWeb.Domain.Models.BaseModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace ECommerceWeb.Controllers.Auth
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IConfiguration configuration, IUnitOfWork uow, IBlobService blobService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult> Register([FromForm] UserRegisterDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.Role))
            {
                return BadRequest("Email, Password, and Role are required.");
            }

            var excustomer = await uow.CustomerRepository.GetAsync(u => u.Email == request.Email);
            var exvendor = await uow.VendorRepository.GetAsync(u => u.Email == request.Email);

            if (excustomer != null || exvendor != null)
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
                customer.PasswordHash = passwordHasher.HashPassword(customer, request.Password);
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
                vendor.PasswordHash = passwordHasher.HashPassword(vendor, request.Password);

                await uow.VendorRepository.CreateAsync(vendor);
                newUser = vendor;
            }
            else
            {
                return BadRequest("Invalid role. Role must be 'Customer' or 'Vendor'.");
            }

            await uow.SaveChangesAsync();
            return Ok(newUser);
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(UserLoginDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Email and Password are required.");
            }

            BaseUser? user = await uow.CustomerRepository.GetAsync(u => u.Email == request.Email);
            if (user == null)
            {
                user = await uow.VendorRepository.GetAsync(u => u.Email == request.Email);
            }

            if (user == null)
            {
                return BadRequest("Invalid credentials.");
            }

            var passwordHasher = new PasswordHasher<BaseUser>();
            var verificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash ?? string.Empty, request.Password);

            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return BadRequest("Invalid credentials.");
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
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.Name, user.Name ?? string.Empty),
                new Claim(ClaimTypes.Role, role)
            };

            var secretKey = configuration.GetValue<string>("AppSettings:Token");
            if (string.IsNullOrWhiteSpace(secretKey) || secretKey.Length < 64)
            {
                secretKey = "ThisIsMySuperDuperSecureAppSettingsTokenSecureAndRandomKeyForSWE_MustBeAtLeast64BytesLongForHS512AlgorithmSecurity";
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var cred = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: configuration.GetValue<string>("AppSettings:Issuer") ?? "MyAwesomeApp",
                audience: configuration.GetValue<string>("AppSettings:Audience") ?? "MyAwesomeAudience",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: cred
            );
            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }

        [HttpGet("profile-basic")]
        [Authorize]
        public async Task<ActionResult<UserBasicProfileDTO>> GetBasicProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var roleClaim = User.FindFirst(ClaimTypes.Role);

            if (userIdClaim == null || roleClaim == null || !int.TryParse(userIdClaim.Value, out var userId)) 
                return Unauthorized("Invalid token session.");

            string role = roleClaim.Value;

            if (role.Equals("Customer", StringComparison.OrdinalIgnoreCase))
            {
                var user = await uow.CustomerRepository.GetAsync(u => u.Id == userId);
                if (user == null) return NotFound();

                return Ok(new UserBasicProfileDTO {
                    Name = user.Name,
                    Email = user.Email,
                    Phone = user.Phone,
                    Address = user.Address
                });
            }
            else 
            {
                var user = await uow.VendorRepository.GetAsync(u => u.Id == userId);
                if (user == null) return NotFound();

                return Ok(new UserBasicProfileDTO {
                    Name = user.Name,
                    Email = user.Email,
                    Phone = user.Phone,
                    Address = user.Address
                });
            }
        }
    }
}
