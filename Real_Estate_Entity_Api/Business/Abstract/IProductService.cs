using DataAccess.DTOs.AmenityDTOs;
using DataAccess.DTOs.ProductDTOs;
using DataAccess.Entities;
using DataAccess.RequestFeatures;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IProductService
    {
        Task<List<ResultProductDto>> GetAllAsync();
        Task<ResultProductDto> GetByIdAsync(int id);

        Task<List<ResultProductDto>> GetActiveProductsAsync();

        Task UpdateAsync(UpdateProductDto updateProductDto);
        Task DeleteAsync(int id);

        Task<ProductWithDetailsDto> GetProductWithDetailsAsync(int id);

        Task<int> CreateProductDraftAsync(CreateProductDraftDto dto); 
        Task AddProductDetailAsync(CreateProductDetailDto dto);
        Task AddProductImagesAsync(CreateProductImagesDto dto);
        Task PublishProductAsync(int id);

        Task<PagedResult<ResultProductDto>> GetProductsWithPaginationAndFilterAsync(ProductFilter filter);

        Task AddProductAmenitiesAsync(CreateProductAmenityDto dto);
    }
}