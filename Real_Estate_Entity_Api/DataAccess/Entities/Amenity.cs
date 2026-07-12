using System.Collections.Generic;

namespace DataAccess.Entities
{
    public class Amenity
    {
        public int AmenityId { get; set; }
        public string Title { get; set; }

        
        public ICollection<ProductAmenity> ProductAmenities { get; set; }
    }
}