using System.Collections.Generic;

namespace DataAccess.RequestFeatures
{
    public class ProductFilter
    {
        // ARAMA 
        public string? SearchKeyword { get; set; }

        // TEMEL FİLTRELEME 
        public string? Type { get; set; } 
        public int? CategoryId { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? Neighborhood { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }

        //  DETAY FİLTRELEME
        public int? RoomCount { get; set; } 
        public int? BathCount { get; set; } 

        // ÖZELLİKLER 
        public List<int>? Amenities { get; set; } 

        // SIRALAMA 
        public string? SortBy { get; set; }

        // SAYFALAMA
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 9;
    }
}