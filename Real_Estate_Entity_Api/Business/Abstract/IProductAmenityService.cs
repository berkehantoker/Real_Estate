using DataAccess.DTOs;
using DataAccess.DTOs.AmenityDTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IProductAmenityService
    {
        Task<List<ResultProductAmenityDto>> GetAmenitiesByProductIdAsync(int productId);
        Task UpdateAmenityStatusAsync(UpdateProductAmenityStatusDto dto);
    }
}