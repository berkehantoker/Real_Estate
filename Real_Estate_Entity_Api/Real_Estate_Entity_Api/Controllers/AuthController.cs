using Business.Abstract;
using DataAccess.DTOs.AuthDTOs;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var token = await _authService.LoginAsync(dto);
            if (string.IsNullOrEmpty(token)) 
                return Unauthorized("Kullanıcı adı veya şifre hatalı.");
            return Ok(new { Token = token });
        }

        
        [HttpPost("Register")]
        public async Task<IActionResult> RegisterUser(RegisterDto dto)
        {
            var result = await _authService.RegisterUserAsync(dto);
            if (result) return Ok("Müşteri kaydı başarıyla tamamlandı.");
            return BadRequest("Kayıt esnasında bir hata oluştu.");
        }

       
        [HttpPost("RegisterAgent")]
        public async Task<IActionResult> RegisterAgent(RegisterDto dto)
        {
            var result = await _authService.RegisterAgentAsync(dto);
            if (result) return Ok("Emlakçı kaydı başarıyla tamamlandı.");
            return BadRequest("Kayıt esnasında bir hata oluştu.");
        }
    }
}