using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.FavoriteProductDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class FavoriteProductsController : ControllerBase
    {
        private readonly IFavoriteProductService _service;

        public FavoriteProductsController(IFavoriteProductService service)
        {
            _service = service;
        }

        [HttpGet("my-favorites")]
        public async Task<IActionResult> GetMyFavorites()
        {
            
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized("Kullanıcı kimliği bulunamadı.");

            int userId = int.Parse(userIdString);
            var values = await _service.GetUserFavoritesAsync(userId);

            return Ok(values);
        }

        [HttpGet("my-favorite-ids")]
        public async Task<IActionResult> GetMyFavoriteIds()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized("Kullanıcı kimliği bulunamadı.");

            int userId = int.Parse(userIdString);
            var values = await _service.GetUserFavoritesAsync(userId);

            var ids = values.Select(f => f.ProductId).ToList();
            return Ok(ids);
        }

        [HttpPost("toggle")]
        public async Task<IActionResult> ToggleFavorite([FromBody] CreateFavoriteProductDto dto)
        {
            
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized("Kullanıcı kimliği bulunamadı.");

            dto.AppUserId = int.Parse(userIdString);

            await _service.ToggleFavoriteAsync(dto);
            return Ok("Favori işlemi başarıyla gerçekleştirildi.");
        }
    }
}