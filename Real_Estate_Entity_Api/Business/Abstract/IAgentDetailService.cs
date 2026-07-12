using DataAccess.DTOs;
using DataAccess.DTOs.AgentDetailDTOs;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IAgentDetailService
    {
        Task<ResultAgentDetailDto> GetAgentDetailByUserIdAsync(int userId);
        Task CreateAgentDetailAsync(CreateAgentDetailDto dto);
        Task UpdateAgentDetailAsync(UpdateAgentDetailDto dto);
    }
}