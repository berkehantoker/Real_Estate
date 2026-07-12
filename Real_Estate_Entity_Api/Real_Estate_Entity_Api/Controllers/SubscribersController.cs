using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.SubscriberDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubscribersController : ControllerBase
    {
        private readonly ISubscriberService _service;

        public SubscribersController(ISubscriberService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> GetSubscribers()
        {
            var values = await _service.GetAllSubscribersAsync();
            return Ok(values);
        }

        [HttpPost]
        
        public async Task<IActionResult> Subscribe([FromBody] CreateSubscriberDto dto)
        {
            await _service.CreateSubscriberAsync(dto);
            return Ok("Bültene başarıyla kaydoldunuz.");
        }
    }
}