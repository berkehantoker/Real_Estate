using DataAccess.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repositories.Abstract
{
    public interface IProductAmenityRepository : IGenericRepository<ProductAmenity>
    {
        
        Task<List<ProductAmenity>> GetProductAmenitiesByProductIdAsync(int productId);
    }
}