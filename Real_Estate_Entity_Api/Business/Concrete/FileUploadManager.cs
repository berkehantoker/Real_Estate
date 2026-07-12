using Business.Abstract;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class FileUploadManager : IFileUploadService
    {
        // IWebHostEnvironment silindi! Business katmanında web'e dair bir şey olmamalı.

        public async Task<string> FileUploadAsync(IFormFile file, string webRootPath)
        {
            if (file == null || file.Length == 0)
                throw new Exception("Lütfen geçerli bir dosya seçin.");

            // 1. Controller'dan gelen webRootPath ile klasör yolunu birleştir
            var uploadPath = Path.Combine(webRootPath, "images");

            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            var fileExtension = Path.GetExtension(file.FileName);
            var uniqueFileName = Guid.NewGuid().ToString() + fileExtension;

            var fullFilePath = Path.Combine(uploadPath, uniqueFileName);

            using (var fileStream = new FileStream(fullFilePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            return $"/images/{uniqueFileName}";
        }
    }
}