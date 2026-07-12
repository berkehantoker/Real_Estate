using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.ServiceDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly IServiceService _serviceService;

        public ServicesController(IServiceService serviceService)
        {
            _serviceService = serviceService;
        }

        [HttpGet]
        public async Task<IActionResult> GetServices()
        {
            var values = await _serviceService.GetAllServicesAsync();
            return Ok(values);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetService(int id)
        {
            var value = await _serviceService.GetServiceByIdAsync(id);
            return Ok(value);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceDto dto)
        {
            await _serviceService.CreateServiceAsync(dto);
            return Ok("Hizmet başarıyla eklendi.");
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateService([FromBody] UpdateServiceDto dto)
        {
            await _serviceService.UpdateServiceAsync(dto);
            return Ok("Hizmet başarıyla güncellendi.");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteService(int id)
        {
            await _serviceService.DeleteServiceAsync(id);
            return Ok("Hizmet başarıyla silindi.");
        }
    }
}