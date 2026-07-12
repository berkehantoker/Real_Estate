using System.Text.Json.Serialization;

namespace DataAccess.DTOs.ProductDTOs
{
    public class CreateProductDraftDto
    {
        public string Title { get; set; }
        public decimal Price { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string? Neighborhood { get; set; }
        public string? Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public int CategoryId { get; set; }

        [JsonIgnore]
        public int AppUserId { get; set; }
    }
}