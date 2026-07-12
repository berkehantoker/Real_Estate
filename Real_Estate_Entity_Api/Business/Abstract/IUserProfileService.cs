using DataAccess.DTOs;
using DataAccess.DTOs.UserProfileDTOs;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IUserProfileService
    {
        
        Task<ResultUserProfileDto> GetUserProfileAsync(int userId);

        
        Task<bool> UpdateUserProfileAsync(int userId, UpdateUserProfileDto dto);
    }
}