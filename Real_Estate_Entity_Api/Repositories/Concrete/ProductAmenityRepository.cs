using DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Repositories.Abstract;
using Repositories.Concrete;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repositories
{
    public class ProductAmenityRepository : GenericRepository<ProductAmenity>, IProductAmenityRepository
    {
        private readonly RealEstateContext _context;

        public ProductAmenityRepository(RealEstateContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<ProductAmenity>> GetProductAmenitiesByProductIdAsync(int productId)
        {
            
            return await _context.ProductAmenities
                .Include(x => x.Amenity)
                .Where(x => x.ProductId == productId)
                .ToListAsync();
        }
    }
}