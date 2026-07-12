using DataAccess.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repositories.Abstract
{
    public interface IFavoriteProductRepository : IGenericRepository<FavoriteProduct>
    {
       
        Task<List<FavoriteProduct>> GetFavoritesByUserIdAsync(int userId);
    }
}