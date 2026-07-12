namespace DataAccess.DTOs.ProductDTOs
{
    public class UpdateProductDto
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
        public string Type { get; set; }
        public string CoverImage { get; set; }
        public int CategoryId { get; set; }

        public int AppUserId { get; set; }
    }
}