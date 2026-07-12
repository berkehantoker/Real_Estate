namespace DataAccess.Entities
{
    public class ProductAmenity
    {
        public int ProductAmenityId { get; set; }

        
        public int ProductId { get; set; }
        public Product Product { get; set; }

        
        public int AmenityId { get; set; }
        public Amenity Amenity { get; set; }

      
        public bool Status { get; set; }
    }
}