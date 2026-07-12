using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IFileUploadService
    {
        // Dosyayı alıp sunucuya kaydeder ve kaydedildiği yolu (string) geri döner
        Task<string> FileUploadAsync(IFormFile file, string webRootPath);
    }
}