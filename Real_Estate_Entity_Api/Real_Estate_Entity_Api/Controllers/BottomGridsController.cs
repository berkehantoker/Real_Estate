using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.BottomGridDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BottomGridsController : ControllerBase
    {
        private readonly IBottomGridService _service;

        public BottomGridsController(IBottomGridService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetBottomGrids()
        {
            var values = await _service.GetAllBottomGridsAsync();
            return Ok(values);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBottomGrid(int id)
        {
            var value = await _service.GetBottomGridByIdAsync(id);
            return Ok(value);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateBottomGrid([FromBody] CreateBottomGridDto dto)
        {
            await _service.CreateBottomGridAsync(dto);
            return Ok("Özellik başarıyla eklendi.");
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBottomGrid([FromBody] UpdateBottomGridDto dto)
        {
            await _service.UpdateBottomGridAsync(dto);
            return Ok("Özellik başarıyla güncellendi.");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBottomGrid(int id)
        {
            await _service.DeleteBottomGridAsync(id);
            return Ok("Özellik başarıyla silindi.");
        }
    }
}