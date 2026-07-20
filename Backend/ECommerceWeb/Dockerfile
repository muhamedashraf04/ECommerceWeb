# --- Stage 1: Build ---
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY Backend/ECommerceWeb.sln .
COPY Backend/ECommerceWeb/ECommerceWeb.csproj ECommerceWeb/
COPY Backend/ECommerceWeb.Application/ECommerceWeb.Application.csproj ECommerceWeb.Application/
COPY Backend/ECommerceWeb.Domain/ECommerceWeb.Domain.csproj ECommerceWeb.Domain/
COPY Backend/ECommerceWeb.Infrastructure/ECommerceWeb.Infrastructure.csproj ECommerceWeb.Infrastructure/
COPY Backend/ECommerceWeb.Application.Test/ECommerceWeb.Application.Test.csproj ECommerceWeb.Application.Test/

RUN dotnet restore ECommerceWeb.sln

# Copy rest of the backend source code
COPY Backend/ .

RUN dotnet publish ECommerceWeb/ECommerceWeb.csproj -c Release -o /app/publish /p:UseAppHost=false

# --- Stage 2: Runtime Final ---
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "ECommerceWeb.dll"]