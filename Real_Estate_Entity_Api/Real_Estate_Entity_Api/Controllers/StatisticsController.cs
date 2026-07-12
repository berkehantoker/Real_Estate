using Business.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] 
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticsService _service;

        public StatisticsController(IStatisticsService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardStatistics()
        {
          
            return Ok(new
            {
                TotalCategories = await _service.CategoryCountAsync(),
                TotalProducts = await _service.ProductCountAsync(),
                MostExpensiveProduct = await _service.MostExpensiveProductAsync(),
                ActiveProducts = await _service.ActiveProductCountAsync(),
                TotalMessages = await _service.TotalMessageCountAsync(),
                TotalUsers = await _service.TotalUserCountAsync()
            });
        }
    }
}