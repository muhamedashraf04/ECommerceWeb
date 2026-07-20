using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ECommerceWeb.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ECommerceWeb.Application.Service
{
    public class BlobService : IBlobService
    {
        private readonly BlobServiceClient? _blobServiceClient;

        public BlobService(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("BlobStorage");
            if (!string.IsNullOrWhiteSpace(connectionString) && 
                !connectionString.Contains("ACC_KEY") && 
                !connectionString.Contains("YOUR_"))
            {
                try
                {
                    _blobServiceClient = new BlobServiceClient(connectionString);
                }
                catch
                {
                    _blobServiceClient = null;
                }
            }
        }

        public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, string containerName)
        {
            if (_blobServiceClient == null)
            {
                return $"https://fakeblobstorage.local/{containerName}/{Guid.NewGuid()}_{fileName}";
            }

            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

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
            if (_blobServiceClient == null) return;

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