using DataAccess.DTOs;
using DataAccess.DTOs.WhoWeAreDTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IWhoWeAreDetailService
    {
        Task<List<ResultWhoWeAreDetailDto>> GetAllWhoWeAreDetailsAsync();
        Task<ResultWhoWeAreDetailDto> GetWhoWeAreDetailByIdAsync(int id);
        Task CreateWhoWeAreDetailAsync(CreateWhoWeAreDetailDto dto);
        Task UpdateWhoWeAreDetailAsync(UpdateWhoWeAreDetailDto dto);
        Task DeleteWhoWeAreDetailAsync(int id);
    }
}