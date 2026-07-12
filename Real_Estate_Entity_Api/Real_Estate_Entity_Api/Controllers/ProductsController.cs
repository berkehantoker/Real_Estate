using Business.Abstract;
using DataAccess.DTOs.AmenityDTOs;
using DataAccess.DTOs.ProductDTOs;
using DataAccess.RequestFeatures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var value = await _productService.GetByIdAsync(id);
            if (value == null)
                return NotFound("İlan bulunamadı.");
            return Ok(value);
        }

        [HttpGet("GetProductWithDetails/{id}")]
        public async Task<IActionResult> GetProductWithDetails(int id)
        {
            var value = await _productService.GetProductWithDetailsAsync(id);
            if (value == null || value.IsActive == false)
                return NotFound("İlan bulunamadı veya henüz yayına alınmadı.");
            return Ok(value);
        }

       
        [HttpGet]
        public async Task<IActionResult> GetProducts([FromQuery] ProductFilter filter)
        {
            var values = await _productService.GetProductsWithPaginationAndFilterAsync(filter);
            return Ok(values);
        }



        [HttpPost("create-draft")]
        [Authorize(Roles = "EstateAgent,Admin")] 
        public async Task<IActionResult> CreateDraft([FromBody] CreateProductDraftDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized("Oturum bulunamadı veya Token geçersiz!");

            dto.AppUserId = int.Parse(userIdString);
            int newProductId = await _productService.CreateProductDraftAsync(dto);

            return Ok(new { Message = "Taslak başarıyla oluşturuldu.", ProductId = newProductId });
        }

        [HttpPost("add-detail")]
        [Authorize(Roles = "EstateAgent,Admin")] 
        public async Task<IActionResult> AddDetail([FromBody] CreateProductDetailDto dto)
        {
            await _productService.AddProductDetailAsync(dto);
            return Ok("İlan detayları başarıyla eklendi.");
        }

        [HttpPost("add-images")]
        [Authorize(Roles = "EstateAgent,Admin")] 
        public async Task<IActionResult> AddImages([FromBody] CreateProductImagesDto dto)
        {
            await _productService.AddProductImagesAsync(dto);
            return Ok("İlan resimleri başarıyla eklendi.");
        }

        [HttpPut("publish/{id}")]
        [Authorize(Roles = "EstateAgent,Admin")] 
        public async Task<IActionResult> PublishProduct(int id)
        {
            await _productService.PublishProductAsync(id);
            return Ok("Harika! İlanınız başarıyla yayına alındı ve müşterilere açıldı.");
        }

        [HttpPut]
        [Authorize(Roles = "EstateAgent,Admin")] 
        public async Task<IActionResult> UpdateProduct([FromBody] UpdateProductDto dto)
        {
            await _productService.UpdateAsync(dto);
            return Ok("İlan başarıyla güncellendi.");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "EstateAgent,Admin")] 
        public async Task<IActionResult> DeleteProduct(int id)
        {
            await _productService.DeleteAsync(id);
            return Ok("İlan başarıyla silindi.");
        }

        [HttpPost("add-amenities")]
        [Authorize(Roles = "EstateAgent,Admin")]
        public async Task<IActionResult> AddAmenities([FromBody] CreateProductAmenityDto dto)
        {
            await _productService.AddProductAmenitiesAsync(dto);
            return Ok("İlan özellikleri başarıyla eklendi.");
        }
    }
}