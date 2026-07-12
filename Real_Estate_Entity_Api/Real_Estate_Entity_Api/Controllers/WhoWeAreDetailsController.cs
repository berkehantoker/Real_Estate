using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.WhoWeAreDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WhoWeAreDetailsController : ControllerBase
    {
        private readonly IWhoWeAreDetailService _service;

        public WhoWeAreDetailsController(IWhoWeAreDetailService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetWhoWeAreDetails()
        {
            var values = await _service.GetAllWhoWeAreDetailsAsync();
            return Ok(values);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetWhoWeAreDetail(int id)
        {
            var value = await _service.GetWhoWeAreDetailByIdAsync(id);
            return Ok(value);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateWhoWeAreDetail([FromBody] CreateWhoWeAreDetailDto dto)
        {
            await _service.CreateWhoWeAreDetailAsync(dto);
            return Ok("Hakkımızda kısmı başarıyla eklendi.");
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateWhoWeAreDetail([FromBody] UpdateWhoWeAreDetailDto dto)
        {
            await _service.UpdateWhoWeAreDetailAsync(dto);
            return Ok("Hakkımızda kısmı başarıyla güncellendi.");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteWhoWeAreDetail(int id)
        {
            await _service.DeleteWhoWeAreDetailAsync(id);
            return Ok("Hakkımızda kısmı başarıyla silindi.");
        }
    }
}