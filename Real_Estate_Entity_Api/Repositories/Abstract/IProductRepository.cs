using DataAccess.Entities;
using DataAccess.RequestFeatures;
using System.Threading.Tasks;

namespace Repositories.Abstract
{
   
    public interface IProductRepository : IGenericRepository<Product>
    {
        
        Task<Product?> GetProductWithDetailsAsync(int id);

        Task<List<Product>> GetActiveProductAsync();

        Task<PagedResult<Product>> GetProductsWithPaginationAndFilterAsync(ProductFilter filter);
    }
}