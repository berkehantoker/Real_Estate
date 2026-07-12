using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.TestimonialDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestimonialsController : ControllerBase
    {
        private readonly ITestimonialService _service;

        public TestimonialsController(ITestimonialService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetTestimonials()
        {
            var values = await _service.GetAllTestimonialsAsync();
            return Ok(values);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTestimonial(int id)
        {
            var value = await _service.GetTestimonialByIdAsync(id);
            return Ok(value);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTestimonial([FromBody] CreateTestimonialDto dto)
        {
            await _service.CreateTestimonialAsync(dto);
            return Ok("Yorum başarıyla eklendi.");
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTestimonial([FromBody] UpdateTestimonialDto dto)
        {
            await _service.UpdateTestimonialAsync(dto);
            return Ok("Yorum başarıyla güncellendi.");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTestimonial(int id)
        {
            await _service.DeleteTestimonialAsync(id);
            return Ok("Yorum başarıyla silindi.");
        }
    }
}