using DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Repositories.Abstract;
using Repositories.Concrete;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repositories
{
    public class FavoriteProductRepository : GenericRepository<FavoriteProduct>, IFavoriteProductRepository
    {
        private readonly RealEstateContext _context;

        public FavoriteProductRepository(RealEstateContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<FavoriteProduct>> GetFavoritesByUserIdAsync(int userId)
        {
            return await _context.FavoriteProducts
                .Include(x => x.Product)
                .Where(x => x.AppUserId == userId)
                .ToListAsync();
        }
    }
}