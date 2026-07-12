using DataAccess.DTOs;
using DataAccess.DTOs.FavoriteProductDTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IFavoriteProductService
    {
        Task<List<ResultFavoriteProductDto>> GetUserFavoritesAsync(int userId);
        Task ToggleFavoriteAsync(CreateFavoriteProductDto dto);
    }
}