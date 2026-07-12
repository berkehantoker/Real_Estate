using DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Repositories.Abstract;
using Repositories.Concrete;
using System.Threading.Tasks;

namespace Repositories
{
    public class AgentDetailRepository : GenericRepository<AgentDetail>, IAgentDetailRepository
    {
        private readonly RealEstateContext _context;

        public AgentDetailRepository(RealEstateContext context) : base(context)
        {
            _context = context;
        }

        public async Task<AgentDetail?> GetAgentDetailByUserIdAsync(int userId)
        {
            return await _context.AgentDetails
                .Include(x => x.AppUser)
                .FirstOrDefaultAsync(x => x.AppUserId == userId);
        }
    }
}