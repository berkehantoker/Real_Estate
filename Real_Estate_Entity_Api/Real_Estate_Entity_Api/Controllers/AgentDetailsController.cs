using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.AgentDetailDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AgentDetailsController : ControllerBase
    {
        private readonly IAgentDetailService _service;

        public AgentDetailsController(IAgentDetailService service)
        {
            _service = service;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetAgentDetail(int userId)
        {
            var value = await _service.GetAgentDetailByUserIdAsync(userId);
            if (value == null) return NotFound("Bu emlakçıya ait profil detayı bulunamadı.");
            return Ok(value);
        }

        [HttpPost]
        [Authorize(Roles = "EstateAgent,Admin")]
        public async Task<IActionResult> CreateAgentDetail([FromBody] CreateAgentDetailDto dto)
        {
            // Güvenlik: Kim giriş yaptıysa onun profili oluşsun
            dto.AppUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            await _service.CreateAgentDetailAsync(dto);
            return Ok("Profil detayları başarıyla oluşturuldu.");
        }

        [HttpPut]
        [Authorize(Roles = "EstateAgent,Admin")]
        public async Task<IActionResult> UpdateAgentDetail([FromBody] UpdateAgentDetailDto dto)
        {
            dto.AppUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            await _service.UpdateAgentDetailAsync(dto);
            return Ok("Profil detayları başarıyla güncellendi.");
        }
    }
}