using DataAccess.Entities;
using System.Threading.Tasks;

namespace Repositories.Abstract
{
    public interface IAgentDetailRepository : IGenericRepository<AgentDetail>
    {
       
        Task<AgentDetail?> GetAgentDetailByUserIdAsync(int userId);
    }
}