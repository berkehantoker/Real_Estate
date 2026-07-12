namespace DataAccess.DTOs.ProductDTOs
{
    public class CreateProductDetailDto
    {
        
        public int ProductId { get; set; }

        public int Size { get; set; }
        public int BedroomCount { get; set; }
        public int BathCount { get; set; }
        public int RoomCount { get; set; }
        public string VideoUrl { get; set; }
    }
}