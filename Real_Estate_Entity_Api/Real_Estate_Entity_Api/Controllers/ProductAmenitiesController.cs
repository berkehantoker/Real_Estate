using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.AmenityDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductAmenitiesController : ControllerBase
    {
        private readonly IProductAmenityService _service;

        public ProductAmenitiesController(IProductAmenityService service)
        {
            _service = service;
        }

        
        [HttpGet("product/{id}")]
        public async Task<IActionResult> GetAmenitiesByProductId(int id)
        {
            var values = await _service.GetAmenitiesByProductIdAsync(id);
            return Ok(values);
        }

        
        [HttpPut]
        [Authorize(Roles = "EstateAgent,Admin")]
        public async Task<IActionResult> UpdateAmenityStatus([FromBody] UpdateProductAmenityStatusDto dto)
        {
            await _service.UpdateAmenityStatusAsync(dto);
            return Ok("Özellik durumu başarıyla güncellendi.");
        }
    }
}