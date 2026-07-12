using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IStatisticsService
    {
        Task<int> ProductCountAsync();        
        Task<int> CategoryCountAsync();        
        Task<string> MostExpensiveProductAsync();

        Task<int> ActiveProductCountAsync();
        Task<int> TotalMessageCountAsync();
        Task<int> TotalUserCountAsync();
    }
}