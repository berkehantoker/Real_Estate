using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.ContactDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactsController : ControllerBase
    {
        private readonly IContactService _service;

        public ContactsController(IContactService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> GetMessages()
        {
            var values = await _service.GetAllMessagesAsync();
            return Ok(values);
        }

        [HttpPost]
        
        public async Task<IActionResult> CreateMessage([FromBody] CreateContactDto dto)
        {
            await _service.CreateMessageAsync(dto);
            return Ok("Mesajınız başarıyla iletildi.");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            await _service.DeleteMessageAsync(id);
            return Ok("Mesaj başarıyla silindi.");
        }
    }
}