# --- Stage 1: Build (Uses full SDK image) ---
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
# Set the Working Directory to the root of the source files
WORKDIR /src 

# 1. Copy Solution and Main Project (copied to /src root)
# Main project path is resolved, so keep these here.
COPY Backend/ECommerceWeb/ECommerceWeb.sln .
COPY Backend/ECommerceWeb/ECommerceWeb.csproj .

# 2. **WORKAROUND:** Create and copy library projects to the CONTAINER ROOT (/) 
#    to satisfy the absolute paths defined in your local .sln file.

# Create project directories at the container root /
RUN mkdir -p /ECommerceWeb.Application \
           /ECommerceWeb.Domain \
           /ECommerceWeb.Infrastructure \
           /ECommerceWeb.Application.Test

# Copy the .csproj files directly into those absolute root directories
COPY Backend/ECommerceWeb.Application/ECommerceWeb.Application.csproj /ECommerceWeb.Application/
COPY Backend/ECommerceWeb.Domain/ECommerceWeb.Domain.csproj /ECommerceWeb.Domain/
COPY Backend/ECommerceWeb.Infrastructure/ECommerceWeb.Infrastructure.csproj /ECommerceWeb.Infrastructure/
COPY Backend/ECommerceWeb.Application.Test/ECommerceWeb.Application.Test.csproj /ECommerceWeb.Application.Test/

# 3. Restore dependencies
# This should now find the projects at the root (/) and the main project at /src.
RUN dotnet restore ECommerceWeb.sln

# 4. Copy the rest of the source code for building
COPY . .

# 5. Publish the main Web API project
RUN dotnet publish Backend/ECommerceWeb/ECommerceWeb.csproj -c Release -o /app/publish /p:UseAppHost=false

# --- Stage 2: Final (Uses smaller Runtime image) ---
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copy published output from the build stage
COPY --from=build /app/publish .

EXPOSE 8080 

ENTRYPOINT ["dotnet", "ECommerceWeb.dll"]