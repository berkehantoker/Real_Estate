using System.Collections.Generic;

namespace DataAccess.DTOs.ProductDTOs
{
    public class ProductWithDetailsDto
    {
        
        public int ProductId { get; set; }
        public string Title { get; set; }
        public decimal Price { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string? Neighborhood { get; set; }
        public string? Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string Description { get; set; }
        public string CoverImage { get; set; }

        
        public int Size { get; set; }
        public int BedroomCount { get; set; }
        public int BathCount { get; set; }
        public int RoomCount { get; set; }
        public string VideoUrl { get; set; }

        
        public List<string> ImageUrls { get; set; }
        public List<int> ImageIds { get; set; }

        public bool IsActive { get; set; } 

        
        public List<string> Amenities { get; set; } 
        public List<int> AmenityIds { get; set; }   

        public string Type { get; set; }
        public string CategoryName { get; set; }

        public int AppUserId { get; set; }
        public string AppUserName { get; set; }

    }
}