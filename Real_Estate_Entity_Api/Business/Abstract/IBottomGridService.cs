using DataAccess.DTOs;
using DataAccess.DTOs.BottomGridDTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IBottomGridService
    {
        Task<List<ResultBottomGridDto>> GetAllBottomGridsAsync();
        Task<ResultBottomGridDto> GetBottomGridByIdAsync(int id);
        Task CreateBottomGridAsync(CreateBottomGridDto dto);
        Task UpdateBottomGridAsync(UpdateBottomGridDto dto);
        Task DeleteBottomGridAsync(int id);
    }
}