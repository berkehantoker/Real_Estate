using System.Text.Json.Serialization;

namespace DataAccess.DTOs.ProductDTOs
{
    public class CreateProductDto
    {
        public string Title { get; set; }
        public decimal Price { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string Description { get; set; }
        public string Type { get; set; } 
        public string CoverImage { get; set; }
        public int CategoryId { get; set; }

        [JsonIgnore]
        public int AppUserId { get; set; }

    }
}