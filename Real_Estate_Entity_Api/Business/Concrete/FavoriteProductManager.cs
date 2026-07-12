using AutoMapper;
using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.FavoriteProductDTOs;
using DataAccess.Entities;
using Repositories.Abstract;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class FavoriteProductManager : IFavoriteProductService
    {
       
        private readonly IFavoriteProductRepository _repository;
        private readonly IMapper _mapper;

        public FavoriteProductManager(IFavoriteProductRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<ResultFavoriteProductDto>> GetUserFavoritesAsync(int userId)
        {
            
            var values = await _repository.GetFavoritesByUserIdAsync(userId);
            return _mapper.Map<List<ResultFavoriteProductDto>>(values);
        }

        public async Task ToggleFavoriteAsync(CreateFavoriteProductDto dto)
        {
            var allFavorites = await _repository.GetAllAsync();

            
            var existingFavorite = allFavorites.FirstOrDefault(x => x.AppUserId == dto.AppUserId && x.ProductId == dto.ProductId);

            if (existingFavorite != null)
            {
                
                await _repository.DeleteAsync(existingFavorite);
            }
            else
            {
                
                var entity = _mapper.Map<FavoriteProduct>(dto);
                await _repository.InsertAsync(entity);
            }
        }
    }
}