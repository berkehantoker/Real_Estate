using Business.Abstract;
using Microsoft.EntityFrameworkCore;
using Repositories; 
using System.Linq;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class StatisticsManager : IStatisticsService
    {
        private readonly RealEstateContext _context;

        public StatisticsManager(RealEstateContext context)
        {
            _context = context;
        }

        public async Task<int> CategoryCountAsync()
        {
           
            return await _context.Categories.CountAsync();
        }

        public async Task<int> ProductCountAsync()
        {
           
            return await _context.Products.CountAsync();
        }

        public async Task<string> MostExpensiveProductAsync()
        {
           
            var expensiveProductTitle = await _context.Products
                .OrderByDescending(x => x.Price)
                .Select(x => x.Title) 
                .FirstOrDefaultAsync();

            return expensiveProductTitle ?? "İlan Yok";
        }

        public async Task<int> ActiveProductCountAsync()
        {
            
            return await _context.Products.Where(x => x.IsActive == true).CountAsync();
        }

        public async Task<int> TotalMessageCountAsync()
        {
            
            return await _context.Contacts.CountAsync();
        }

        public async Task<int> TotalUserCountAsync()
        {
           
            return await _context.Users.CountAsync();
        }
    }
}