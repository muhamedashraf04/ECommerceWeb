using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ECommerceWeb.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ECommerceWeb.Application.Service
{
    public class BlobService : IBlobService
    {
        private readonly BlobServiceClient _blobServiceClient;

        public BlobService(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("BlobStorage");
            _blobServiceClient = new BlobServiceClient(connectionString);
        }

        public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, string containerName)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

            // SECURITY LOGIC: 
            // If it's the "products" container, make it Public.
            // For "vendor-ids" or anything else, keep it Private (None).
            if (containerName.Equals("products", StringComparison.OrdinalIgnoreCase))
            {
                await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);
            }
            else
            {
                await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var blobClient = containerClient.GetBlobClient(uniqueFileName);

            var blobUploadOptions = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders { ContentType = contentType }
            };

            await blobClient.UploadAsync(fileStream, blobUploadOptions);

            return blobClient.Uri.ToString();
        }

        public async Task DeleteAsync(string fileUrl, string containerName)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            
            if (Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri))
            {
                var fileName = Path.GetFileName(uri.LocalPath);
                var blobClient = containerClient.GetBlobClient(fileName);
                await blobClient.DeleteIfExistsAsync();
            }
        }
    }
}