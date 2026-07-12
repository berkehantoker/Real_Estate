using Business.Abstract;
using DataAccess.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Repositories.Abstract;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly IFileUploadService _fileUploadService;
        private readonly IWebHostEnvironment _env;
        private readonly IGenericRepository<ProductImage> _imageRepository;

        public ImagesController(IFileUploadService fileUploadService, IWebHostEnvironment env, IGenericRepository<ProductImage> imageRepository)
        {
            _fileUploadService = fileUploadService;
            _env = env;
            _imageRepository = imageRepository;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            var imagePath = await _fileUploadService.FileUploadAsync(file, _env.WebRootPath);
            return Ok(new { url = imagePath });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteImage(int id)
        {
            var image = await _imageRepository.GetByIdAsync(id);
            if (image == null)
                return NotFound("Resim bulunamadı.");

            await _imageRepository.DeleteAsync(image);
            return Ok("Resim başarıyla silindi.");
        }
    }
}
