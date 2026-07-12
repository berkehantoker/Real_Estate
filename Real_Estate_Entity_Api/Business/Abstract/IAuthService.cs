using DataAccess.DTOs.AuthDTOs;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IAuthService
    {
        Task<string> LoginAsync(LoginDto loginDto);
        Task<bool> RegisterUserAsync(RegisterDto registerDto); 
        Task<bool> RegisterAgentAsync(RegisterDto registerDto); 
    }
}