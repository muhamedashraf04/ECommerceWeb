using System.IO;
using System.Threading.Tasks;

namespace ECommerceWeb.Application.Interfaces
{
    public interface IBlobService
    {
        // Added containerName parameter
        Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, string containerName);
        
        // Added containerName parameter
        Task DeleteAsync(string fileUrl, string containerName);
    }
}