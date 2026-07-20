using System.IO;
using System.Text;
using ECommerceWeb.Application.DTOs.ProductDTOs;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Application.Interfaces.IService;
using ECommerceWeb.Application.Service;
using ECommerceWeb.Application.Service.OrderService;
using ECommerceWeb.Application.Service.ProductService;
using ECommerceWeb.Application.Validators.ProductValidators;
using ECommerceWeb.Infrastructure.Data;
using ECommerceWeb.Infrastructure.Repositories;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

// Auto-load backend.env if present in root or working directory
LoadEnvFile("backend.env");
LoadEnvFile(".env");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Configure DbContext based on environment
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (!options.IsConfigured)
    {
        var connectionString = builder.Environment.IsEnvironment("Testing")
            ? builder.Configuration.GetConnectionString("TestDbConnection")
            : builder.Configuration.GetConnectionString("DefaultConnection");

        if (!string.IsNullOrEmpty(connectionString))
        {
            if (connectionString.Contains("TrustServerCertificate=False", StringComparison.OrdinalIgnoreCase))
            {
                connectionString = connectionString.Replace("TrustServerCertificate=False", "TrustServerCertificate=True", StringComparison.OrdinalIgnoreCase);
            }
            else if (!connectionString.Contains("TrustServerCertificate=", StringComparison.OrdinalIgnoreCase))
            {
                connectionString += ";TrustServerCertificate=True;";
            }
        }

        options.UseSqlServer(connectionString, sqlServerOptions =>
            sqlServerOptions.EnableRetryOnFailure());
    }
});

// Unit Of Work and Dependency Injection Registrations
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<CartService>();
builder.Services.AddScoped<ICartService>(sp => sp.GetRequiredService<CartService>());
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<IBlobService, BlobService>();
builder.Services.AddScoped<IValidator<CreateProductDTO>, ProductValidator>();

var jwtTokenKey = builder.Configuration.GetValue<string>("AppSettings:Token") ?? "***REMOVED***_MustBeAtLeast64BytesLongForHS512AlgorithmSecurity";

var authBuilder = builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
});

if (!builder.Environment.IsEnvironment("Testing"))
{
    authBuilder.AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration.GetValue<string>("AppSettings:Issuer") ?? "MyAwesomeApp",
            ValidateAudience = true,
            ValidAudience = builder.Configuration.GetValue<string>("AppSettings:Audience") ?? "MyAwesomeAudience",
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtTokenKey)),
        };
    });
}

builder.Services.AddAuthorization();

builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");

app.UseRouting();

app.UseAuthentication();

app.UseAuthorization();

app.MapOpenApi();
app.MapScalarApiReference();

app.MapControllers();

app.Run();

void LoadEnvFile(string fileName)
{
    var currentDir = new DirectoryInfo(Directory.GetCurrentDirectory());
    while (currentDir != null)
    {
        var filePath = Path.Combine(currentDir.FullName, fileName);
        if (File.Exists(filePath))
        {
            foreach (var line in File.ReadAllLines(filePath))
            {
                var trimmed = line.Trim();
                if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith("#")) continue;

                var parts = trimmed.Split('=', 2);
                if (parts.Length == 2)
                {
                    var key = parts[0].Trim();
                    var value = parts[1].Trim();
                    if (!string.IsNullOrEmpty(key) && !string.IsNullOrEmpty(value))
                    {
                        Environment.SetEnvironmentVariable(key, value);
                        Environment.SetEnvironmentVariable(key.Replace(":", "__"), value);
                    }
                }
            }
            break;
        }
        currentDir = currentDir.Parent;
    }
}

public partial class Program { }
