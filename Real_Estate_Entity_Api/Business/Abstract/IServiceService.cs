using DataAccess.DTOs;
using DataAccess.DTOs.ServiceDTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IServiceService
    {
        Task<List<ResultServiceDto>> GetAllServicesAsync();
        Task<ResultServiceDto> GetServiceByIdAsync(int id);
        Task CreateServiceAsync(CreateServiceDto dto);
        Task UpdateServiceAsync(UpdateServiceDto dto);
        Task DeleteServiceAsync(int id);
    }
}