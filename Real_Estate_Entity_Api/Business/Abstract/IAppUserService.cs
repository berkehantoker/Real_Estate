using DataAccess.DTOs.AppUserDTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IAppUserService
    {
        Task<List<ResultAppUserDto>> GetAllUsersAsync();
        Task<bool> AssignRoleAsync(AssignRoleDto dto);
        Task<bool> DeleteUserAsync(int userId);
    }
}