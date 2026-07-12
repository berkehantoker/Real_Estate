using DataAccess.Entities;
using DataAccess.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Abstract;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repositories.Concrete
{
    public class ProductRepository : GenericRepository<Product>, IProductRepository
    {
        private readonly RealEstateContext _context;

        public ProductRepository(RealEstateContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<Product>> GetActiveProductAsync()
        {
            return await _context.Products.Where(x => x.IsActive == true).ToListAsync();
        }

        public async Task<Product?> GetProductWithDetailsAsync(int id)
        {
            return await _context.Products
                .Include(p => p.ProductDetail)
                .Include(p => p.ProductImages)
                .Include(p => p.ProductAmenities).ThenInclude(pa => pa.Amenity)
                .FirstOrDefaultAsync(p => p.ProductId == id);
        }

        public async Task<PagedResult<Product>> GetProductsWithPaginationAndFilterAsync(ProductFilter filter)
        {
            // 1. Sorguyu başlat
            var query = _context.Products
                .Include(x => x.ProductDetail) 
                .Include(x => x.ProductAmenities) 
                .Where(x => x.IsActive == true)
                .AsQueryable();

            // 2. TEMEL FİLTRELEME
            if (!string.IsNullOrEmpty(filter.Type))
                query = query.Where(x => x.Type == filter.Type);

            if (filter.CategoryId.HasValue)
                query = query.Where(x => x.CategoryId == filter.CategoryId.Value);

            if (!string.IsNullOrEmpty(filter.City))
                query = query.Where(x => x.City.ToLower() == filter.City.ToLower());

            if (!string.IsNullOrEmpty(filter.District)) 
                query = query.Where(x => x.District.ToLower() == filter.District.ToLower());

            if (!string.IsNullOrEmpty(filter.Neighborhood))
                query = query.Where(x => x.Neighborhood != null && x.Neighborhood.ToLower() == filter.Neighborhood.ToLower());

            if (filter.MinPrice.HasValue)
                query = query.Where(x => x.Price >= filter.MinPrice.Value);

            if (filter.MaxPrice.HasValue)
                query = query.Where(x => x.Price <= filter.MaxPrice.Value);

            // 3. KONUM ARAMA (Şehir, İlçe, Mahalle) - Case insensitive
            if (!string.IsNullOrEmpty(filter.SearchKeyword))
            {
                var keyword = filter.SearchKeyword.ToLower();
                query = query.Where(x =>
                    (x.City != null && x.City.ToLower().Contains(keyword)) ||
                    (x.District != null && x.District.ToLower().Contains(keyword)) ||
                    (x.Neighborhood != null && x.Neighborhood.ToLower().Contains(keyword))
                );
            }

            // 4. DETAY FİLTRELEME 
            if (filter.RoomCount.HasValue)
                query = query.Where(x => x.ProductDetail != null && x.ProductDetail.RoomCount >= filter.RoomCount.Value);

            if (filter.BathCount.HasValue)
                query = query.Where(x => x.ProductDetail != null && x.ProductDetail.BathCount >= filter.BathCount.Value);

            // 5. ÖZELLİKLER 
            
            if (filter.Amenities != null && filter.Amenities.Any())
            {
                foreach (var amenityId in filter.Amenities)
                {
                    query = query.Where(x => x.ProductAmenities.Any(pa => pa.AmenityId == amenityId && pa.Status == true));
                }
            }

            // 6. SIRALAMA
            query = filter.SortBy switch
            {
                "PriceAsc" => query.OrderBy(x => x.Price),
                "PriceDesc" => query.OrderByDescending(x => x.Price),
                "DateAsc" => query.OrderBy(x => x.ProductId),
                _ => query.OrderByDescending(x => x.ProductId)
            };

            // 7. SAYFALAMA VE ÇALIŞTIRMA
            var totalCount = await query.CountAsync();

            var items = await query
                .Include(x => x.Category) 
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize);

            return new PagedResult<Product>
            {
                Items = items,
                MetaData = new MetaData
                {
                    CurrentPage = filter.PageNumber,
                    PageSize = filter.PageSize,
                    TotalCount = totalCount,
                    TotalPages = totalPages
                }
            };
        }
    }
}