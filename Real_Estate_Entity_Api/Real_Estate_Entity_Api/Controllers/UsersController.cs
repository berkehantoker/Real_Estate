using Business.Abstract;
using DataAccess.DTOs.AppUserDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly IAppUserService _appUserService;

        public UsersController(IAppUserService appUserService)
        {
            _appUserService = appUserService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var values = await _appUserService.GetAllUsersAsync();
            return Ok(values);
        }

        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignRole(AssignRoleDto dto)
        {
            var result = await _appUserService.AssignRoleAsync(dto);
            if (result) return Ok("Kullanıcı rolü başarıyla güncellendi.");
            return BadRequest("Rol güncellenirken bir hata oluştu.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await _appUserService.DeleteUserAsync(id);
            if (result) return Ok("Kullanıcı başarıyla silindi.");
            return BadRequest("Kullanıcı silinirken bir hata oluştu.");
        }
    }
}