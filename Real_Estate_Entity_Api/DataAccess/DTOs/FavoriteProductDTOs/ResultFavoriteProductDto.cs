namespace DataAccess.DTOs.FavoriteProductDTOs
{
    public class ResultFavoriteProductDto
    {
        public int FavoriteProductId { get; set; }
        public int AppUserId { get; set; }
        public int ProductId { get; set; }
       
        public string ProductTitle { get; set; }
        public decimal ProductPrice { get; set; }
        public string ProductCoverImage { get; set; }
    }
}