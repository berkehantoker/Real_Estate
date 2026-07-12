using AutoMapper;
using Business.Abstract;
using DataAccess.DTOs.AmenityDTOs;
using DataAccess.DTOs.ProductDTOs;
using DataAccess.Entities;
using DataAccess.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories;
using Repositories.Abstract;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Business.Concrete
{
    public class ProductManager : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;
        private readonly IGenericRepository<ProductDetail> _detailRepository; 
        private readonly IGenericRepository<ProductImage> _imageRepository;
        private readonly IGenericRepository<ProductAmenity> _amenityRepository;
        private readonly IGenericRepository<FavoriteProduct> _favoriteRepository;


        public ProductManager(
            IProductRepository productRepository,
            IMapper mapper,
            IGenericRepository<ProductDetail> detailRepository,
            IGenericRepository<ProductImage> imageRepository,
            IGenericRepository<ProductAmenity> amenityRepository,
            IGenericRepository<FavoriteProduct> favoriteRepository)
        {
            _productRepository = productRepository;
            _detailRepository = detailRepository;
            _imageRepository = imageRepository;
            _mapper = mapper;
            _amenityRepository = amenityRepository;
            _favoriteRepository = favoriteRepository;
        }

        public async Task<List<ResultProductDto>> GetAllAsync()
        {
            var values = await _productRepository.GetAllAsync();
            return _mapper.Map<List<ResultProductDto>>(values);
        }

        public async Task<ResultProductDto> GetByIdAsync(int id)
        {
            var value = await _productRepository.GetByIdAsync(id);
            return _mapper.Map<ResultProductDto>(value);
        }




        public async Task UpdateAsync(UpdateProductDto updateProductDto)
        {
            var existProduct = await _productRepository.GetByIdAsync(updateProductDto.ProductId);

            if (existProduct == null)
                throw new Exception("Güncellenmek istenen ilan bulunamadı!");

           
            var oldUserId = existProduct.AppUserId;
            var oldIsActive = existProduct.IsActive;

            
            _mapper.Map(updateProductDto, existProduct);

            
            existProduct.AppUserId = oldUserId;
            existProduct.IsActive = oldIsActive;

            await _productRepository.UpdateAsync(existProduct);
        }

        public async Task DeleteAsync(int id)
        {
            var value = await _productRepository.GetByIdAsync(id);

            if (value == null)
                throw new Exception("Silinmek istenen ilan bulunamadı!");

            // 1. Favori kayıtlarını sil
            var favorites = await _favoriteRepository.GetByFilterAsync(f => f.ProductId == id);
            foreach (var fav in favorites)
                await _favoriteRepository.DeleteAsync(fav);

            // 2. Amenity bağlantılarını sil
            var amenities = await _amenityRepository.GetByFilterAsync(a => a.ProductId == id);
            foreach (var amenity in amenities)
                await _amenityRepository.DeleteAsync(amenity);

            // 3. Resimleri sil
            var images = await _imageRepository.GetByFilterAsync(i => i.ProductId == id);
            foreach (var img in images)
                await _imageRepository.DeleteAsync(img);

            // 4. Detay bilgisini sil
            var details = await _detailRepository.GetByFilterAsync(d => d.ProductId == id);
            foreach (var detail in details)
                await _detailRepository.DeleteAsync(detail);

            // 5. Son olarak ürünü sil
            await _productRepository.DeleteAsync(value);
        }

        public async Task<ProductWithDetailsDto> GetProductWithDetailsAsync(int id)
        {
            var product = await _productRepository.GetProductWithDetailsAsync(id);

            if (product == null) return null;

           
            var dto = new ProductWithDetailsDto
            {
                ProductId = product.ProductId,
                Title = product.Title,
                Price = product.Price,
                
                City = product.City,
                District = product.District,
                Neighborhood = product.Neighborhood,
                Address = product.Address,
                Latitude = product.Latitude,
                Longitude = product.Longitude,
                Description = product.Description,
                CoverImage = product.CoverImage,

                Type = product.Type,
                CategoryName = product.Category?.CategoryName,
               
                Size = product.ProductDetail?.Size ?? 0,
                BedroomCount = product.ProductDetail?.BedroomCount ?? 0,
                BathCount = product.ProductDetail?.BathCount ?? 0,
                RoomCount = product.ProductDetail?.RoomCount ?? 0,
                VideoUrl = product.ProductDetail?.VideoUrl,
               
                Amenities = product.ProductAmenities?.Where(x => x.Status).Select(x => x.Amenity.Title).ToList() ?? new List<string>(),
                AmenityIds = product.ProductAmenities?.Where(x => x.Status).Select(x => x.AmenityId).ToList() ?? new List<int>(),

                AppUserId = product.AppUserId,
               
                AppUserName = product.AppUser != null ? product.AppUser.Name + " " + product.AppUser.Surname : "Bilinmeyen Danışman",
                IsActive = product.IsActive,

                
                ImageUrls = product.ProductImages?.Select(x => x.ImageUrl).ToList() ?? new List<string>(),
                ImageIds = product.ProductImages?.Select(x => x.ProductImageId).ToList() ?? new List<int>()
            };

            return dto;
        }

        public async Task<int> CreateProductDraftAsync(CreateProductDraftDto dto)
        {
            var product = _mapper.Map<Product>(dto);

            product.IsActive = false;

            product.CoverImage = "default-draft.png";

            await _productRepository.InsertAsync(product);

            
            return product.ProductId;
        }
        public async Task AddProductDetailAsync(CreateProductDetailDto dto)
        {
            var detail = _mapper.Map<ProductDetail>(dto);
            await _detailRepository.InsertAsync(detail);
        }

        public async Task AddProductImagesAsync(CreateProductImagesDto dto)
        {
            if (dto.ImageUrls != null)
            {
                foreach (var url in dto.ImageUrls)
                {
                    var image = new ProductImage
                    {
                        ProductId = dto.ProductId,
                        ImageUrl = url
                    };
                    await _imageRepository.InsertAsync(image);
                }
            }
        }

        public async Task PublishProductAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product != null)
            {
                product.IsActive = true;
                await _productRepository.UpdateAsync(product);
            }
        }

        public async Task<List<ResultProductDto>> GetActiveProductsAsync()
        {
            var values = await _productRepository.GetActiveProductAsync();
            return _mapper.Map<List<ResultProductDto>>(values);
        }

        public async Task<PagedResult<ResultProductDto>> GetProductsWithPaginationAndFilterAsync(ProductFilter filter)
        {
           
            var pagedData = await _productRepository.GetProductsWithPaginationAndFilterAsync(filter);

            
            var mappedItems = _mapper.Map<List<ResultProductDto>>(pagedData.Items);

          
            return new PagedResult<ResultProductDto>
            {
                Items = mappedItems,
                MetaData = pagedData.MetaData
            };
        }

        public async Task AddProductAmenitiesAsync(CreateProductAmenityDto dto)
        {
            
            var allAmenities = await _amenityRepository.GetAllAsync();
            var oldAmenities = allAmenities.Where(x => x.ProductId == dto.ProductId).ToList();

            foreach (var item in oldAmenities)
            {
                await _amenityRepository.DeleteAsync(item);
            }

            
            if (dto.AmenityIds != null && dto.AmenityIds.Count > 0)
            {
                foreach (var amenityId in dto.AmenityIds)
                {
                    var productAmenity = new ProductAmenity
                    {
                        ProductId = dto.ProductId,
                        AmenityId = amenityId,
                        Status = true
                    };

                    await _amenityRepository.InsertAsync(productAmenity);
                }
            }
        }
    }
}