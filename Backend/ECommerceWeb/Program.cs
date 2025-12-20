using System.Text;
using ECommerceWeb.Application.DTOs.ProductDTOs;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Application.Service.ProductService;
using ECommerceWeb.Application.Validators.ProductValidators;
using ECommerceWeb.Infrastructure.Data;
using ECommerceWeb.Infrastructure.Repositories;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;
using ECommerceWeb.Application.Service;
using ECommerceWeb.Infrastructure.Data;
using ECommerceWeb.Application.Service.OrderService;
using ECommerceWeb.Application.Interfaces.IService;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
// Configure DbContext based on environment

// In Program.cs
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    // Only configure SQL Server if no other provider (like InMemory) is already configured
    if (!options.IsConfigured)
    {
        var connectionString = builder.Environment.IsEnvironment("Testing")
            ? builder.Configuration.GetConnectionString("TestDbConnection")
            : builder.Configuration.GetConnectionString("DefaultConnection");

        options.UseSqlServer(connectionString, sqlServerOptions =>
            sqlServerOptions.EnableRetryOnFailure());
    }
});
//Unit Of Work and Repository Registrations
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<CartService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<IBlobService, BlobService>();
builder.Services.AddScoped<IValidator<CreateProductDTO>, ProductValidator>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration.GetValue<string>("AppSettings:Issuer"),
            ValidateAudience = true,
            ValidAudience = builder.Configuration.GetValue<string>("AppSettings:Audience"),
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(builder.Configuration.GetValue<string>("AppSettings:Token"))),

        };

    });
builder.Services.AddAuthorization();
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
var app = builder.Build();

app.UseRouting();

app.UseCors("AllowAll");

app.MapOpenApi();
app.MapScalarApiReference();


app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
public partial class Program { }

