using Business.Abstract;
using DataAccess.DTOs.AmenityDTOs;
using DataAccess.DTOs.ProductDTOs;
using DataAccess.RequestFeatures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly RealEstateContext _context;

        public ProductsController(IProductService productService, RealEstateContext context)
        {
            _productService = productService;
            _context = context;
        }

        

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var value = await _productService.GetByIdAsync(id);
            if (value == null)
                return NotFound("İlan bulunamadı.");
            return Ok(value);
        }

        [HttpGet("GetProductWithDetails/{id}")]
        public async Task<IActionResult> GetProductWithDetails(int id)
        {
            var value = await _productService.GetProductWithDetailsAsync(id);
            if (value == null || value.IsActive == false)
                return NotFound("İlan bulunamadı veya henüz yayına alınmadı.");
            return Ok(value);
        }

       
        [HttpGet]
        public async Task<IActionResult> GetProducts([FromQuery] ProductFilter filter)
        {
            var values = await _productService.GetProductsWithPaginationAndFilterAsync(filter);
            return Ok(values);
        }



        [HttpPost("create-draft")]
        [Authorize(Roles = "EstateAgent,Admin")] 
        public async Task<IActionResult> CreateDraft([FromBody] CreateProductDraftDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized("Oturum bulunamadı veya Token geçersiz!");

            dto.AppUserId = int.Parse(userIdString);
            int newProductId = await _productService.CreateProductDraftAsync(dto);

            return Ok(new { Message = "Taslak başarıyla oluşturuldu.", ProductId = newProductId });
        }

        [HttpPost("add-detail")]
        [Authorize(Roles = "EstateAgent,Admin")] 
        public async Task<IActionResult> AddDetail([FromBody] CreateProductDetailDto dto)
        {
            await _productService.AddProductDetailAsync(dto);
            return Ok("İlan detayları başarıyla eklendi.");
        }

        [HttpPost("add-images")]
        [Authorize(Roles = "EstateAgent,Admin")] 
        public async Task<IActionResult> AddImages([FromBody] CreateProductImagesDto dto)
        {
            await _productService.AddProductImagesAsync(dto);
            return Ok("İlan resimleri başarıyla eklendi.");
        }

        [HttpPut("publish/{id}")]
        [Authorize(Roles = "EstateAgent,Admin")] 
        public async Task<IActionResult> PublishProduct(int id)
        {
            await _productService.PublishProductAsync(id);
            return Ok("Harika! İlanınız başarıyla yayına alındı ve müşterilere açıldı.");
        }

        [HttpPut]
        [Authorize(Roles = "EstateAgent,Admin")] 
        public async Task<IActionResult> UpdateProduct([FromBody] UpdateProductDto dto)
        {
            await _productService.UpdateAsync(dto);
            return Ok("İlan başarıyla güncellendi.");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "EstateAgent,Admin")] 
        public async Task<IActionResult> DeleteProduct(int id)
        {
            await _productService.DeleteAsync(id);
            return Ok("İlan başarıyla silindi.");
        }

        [HttpPost("add-amenities")]
        [Authorize(Roles = "EstateAgent,Admin")]
        public async Task<IActionResult> AddAmenities([FromBody] CreateProductAmenityDto dto)
        {
            await _productService.AddProductAmenitiesAsync(dto);
            return Ok("İlan özellikleri başarıyla eklendi.");
        }


       //  Eski Test İlanlarını Tek Tıkla Temizle
        [HttpDelete("delete-dummy-products")]
        [Authorize(Roles = "EstateAgent,Admin")]
        public async Task<IActionResult> DeleteDummyProducts()
        {
            var allProducts = await _productService.GetAllAsync();
            var dummyProducts = allProducts.Where(p => p.Title.Contains(" - #")).ToList();

            foreach (var p in dummyProducts)
            {
                await _productService.DeleteAsync(p.ProductId);
            }

            return Ok($"Tertemiz! Toplam {dummyProducts.Count} adet test ilanı ve tüm ilişkili alt verileri (resimler, detaylar, özellikler) silindi.");
        }

       // 24 Eşsiz İlan + Gerçekçi Harita Koordinatları
        [HttpPost("seed-dummy-products")]
        [Authorize(Roles = "EstateAgent,Admin")]
        public async Task<IActionResult> SeedDummyProducts()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized("Test verisi eklemek için giriş yapmış olmalısınız.");

            var existingAmenityIds = await _context.Amenities.Select(a => a.AmenityId).ToListAsync();
            if (!existingAmenityIds.Any())
                return BadRequest("Lütfen önce veritabanına birkaç tane Amenity (Havuz, Otopark vb.) ekleyin.");

            var random = new Random();
            var titles = new[] { "Deniz Manzaralı Lüks Daire", "Merkezi Konumda Yatırımlık Stüdyo", "Müstakil Havuzlu Lüks Villa", "Site İçi 7/24 Güvenlikli Aile Evi", "Metroya 5 Dk Yürüme Mesafesinde 2+1", "Eşyalı Kiralık Lüks Rezidans", "Doğa ile İç İçe Müstakil Ev", "Üniversite Yakını Eşyalı Stüdyo" };
            var types = new[] { "Satılık", "Kiralık" };

            // 🚀 AKILLI LOKASYON HAVUZU: Gerçek Şehir, İlçe ve Tam Harita Koordinatları!
            var realLocations = new[] {
                new { City = "İstanbul", District = "Kadıköy", Neighborhood = "Moda Mah.", Lat = 40.9850, Lng = 29.0250 },
                new { City = "İstanbul", District = "Beşiktaş", Neighborhood = "Bebek Mah.", Lat = 41.0765, Lng = 29.0435 },
                new { City = "İstanbul", District = "Sarıyer", Neighborhood = "Maslak Mah.", Lat = 41.1085, Lng = 29.0225 },
                new { City = "Ankara", District = "Çankaya", Neighborhood = "Kızılay Mah.", Lat = 39.9208, Lng = 32.8541 },
                new { City = "Ankara", District = "Yenimahalle", Neighborhood = "Batıkent Mah.", Lat = 39.9675, Lng = 32.7500 },
                new { City = "İzmir", District = "Karşıyaka", Neighborhood = "Bostanlı Mah.", Lat = 38.4600, Lng = 27.0900 },
                new { City = "İzmir", District = "Bornova", Neighborhood = "Kazımdirik Mah.", Lat = 38.4630, Lng = 27.2150 },
                new { City = "Bursa", District = "Nilüfer", Neighborhood = "Özlüce Mah.", Lat = 40.2200, Lng = 28.9200 },
                new { City = "Bursa", District = "Mudanya", Neighborhood = "Güzelyalı Mah.", Lat = 40.3550, Lng = 28.8900 },
                new { City = "Antalya", District = "Muratpaşa", Neighborhood = "Lara Mah.", Lat = 36.8500, Lng = 30.7500 },
                new { City = "Antalya", District = "Konyaaltı", Neighborhood = "Liman Mah.", Lat = 36.8400, Lng = 30.6100 },
                new { City = "Muğla", District = "Bodrum", Neighborhood = "Gümbet Mah.", Lat = 37.0300, Lng = 27.4100 },
                new { City = "Muğla", District = "Fethiye", Neighborhood = "Ölüdeniz Mah.", Lat = 36.5500, Lng = 29.1200 },
                new { City = "Aydın", District = "Kuşadası", Neighborhood = "Kadınlar Denizi Mah.", Lat = 37.8500, Lng = 27.2400 }
            };

            var uniqueCoverImages = new[] {
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600573472589-003525b2f729?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1598228723793-52759bba239c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1592595896551-12b371d546d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1523217582562-09d0def993a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            };

            var interiorImages = new[] {
                "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1616137466211-f939a420be84?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            };

            for (int i = 0; i < uniqueCoverImages.Length; i++)
            {
                var type = types[random.Next(types.Length)];
                var price = type == "Kiralık" ? random.Next(18000, 75000) : random.Next(3000000, 16000000);
                var coverImg = uniqueCoverImages[i];
                
                // Sırayla (veya rastgele) gerçek bir lokasyon seçiyoruz
                var loc = realLocations[i % realLocations.Length];

                // 🚀 Tam üst üste binmesinler diye merkez koordinata çok küçük (300-500 metre) bir sokak sapması ekliyoruz:
                double latOffset = (random.NextDouble() * 0.008) - 0.004;
                double lngOffset = (random.NextDouble() * 0.008) - 0.004;

                var draftDto = new DataAccess.DTOs.ProductDTOs.CreateProductDraftDto
                {
                    Title = $"{titles[random.Next(titles.Length)]} - #{i + 1}",
                    Price = price,
                    City = loc.City,
                    District = loc.District,
                    Neighborhood = loc.Neighborhood,
                    Address = $"{loc.District} Meydanı Yakını, Örnek Sokak No: {random.Next(1, 150)}",
                    Latitude = loc.Lat + latOffset,   // 👈 Gerçek Şehir Koordinatı + Küçük Sapma
                    Longitude = loc.Lng + lngOffset,  // 👈 Gerçek Şehir Koordinatı + Küçük Sapma
                    Description = "Bu ilan, UI tasarımlarını ve filtreleme sistemlerini test etmek amacıyla oluşturulmuş, yüksek kaliteli bir test ilanıdır.",
                    Type = type,
                    CoverImage = coverImg,
                    CategoryId = random.Next(1, 4),
                    AppUserId = userId
                };

                int newProductId = await _productService.CreateProductDraftAsync(draftDto);

                var addedProduct = await _context.Products.FindAsync(newProductId);
                if (addedProduct != null)
                {
                    addedProduct.CoverImage = coverImg;
                    await _context.SaveChangesAsync();
                }

                var detailDto = new DataAccess.DTOs.ProductDTOs.CreateProductDetailDto
                {
                    ProductId = newProductId,
                    Size = random.Next(75, 280),
                    RoomCount = random.Next(1, 6),
                    BedroomCount = random.Next(1, 4),
                    BathCount = random.Next(1, 3),
                    VideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                };
                await _productService.AddProductDetailAsync(detailDto);

                var imagesDto = new DataAccess.DTOs.ProductDTOs.CreateProductImagesDto
                {
                    ProductId = newProductId,
                    ImageUrls = new List<string> { 
                        interiorImages[random.Next(interiorImages.Length)], 
                        interiorImages[random.Next(interiorImages.Length)], 
                        interiorImages[random.Next(interiorImages.Length)] 
                    }
                };
                await _productService.AddProductImagesAsync(imagesDto);

                var randomAmenityCount = random.Next(4, Math.Min(9, existingAmenityIds.Count + 1));
                var selectedAmenityIds = existingAmenityIds.OrderBy(x => random.Next()).Take(randomAmenityCount).ToList();

                var amenityDto = new DataAccess.DTOs.AmenityDTOs.CreateProductAmenityDto
                {
                    ProductId = newProductId,
                    AmenityIds = selectedAmenityIds
                };
                await _productService.AddProductAmenitiesAsync(amenityDto);

                await _productService.PublishProductAsync(newProductId);
            }

            return Ok(new { Message = "Harika! 24 adet ilan; İstanbul, Ankara, İzmir, Bursa, Antalya gibi gerçek lokasyon koordinatlarıyla oluşturuldu." });
        }
    }
}