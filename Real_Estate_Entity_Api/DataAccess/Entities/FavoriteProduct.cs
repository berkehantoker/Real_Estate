namespace DataAccess.Entities
{
    public class FavoriteProduct
    {
        public int FavoriteProductId { get; set; }

        
        public int AppUserId { get; set; }
        public AppUser AppUser { get; set; }

       
        public int ProductId { get; set; }
        public Product Product { get; set; }
    }
}