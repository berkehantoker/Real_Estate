using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Entities
{
    public class Product
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
        
        
        public Category Category { get; set; }

        
        public ProductDetail ProductDetail { get; set; }

       
        public ICollection<ProductImage> ProductImages { get; set; }

       
        public int AppUserId { get; set; }

        
        public AppUser AppUser { get; set; }

        
        public bool IsActive { get; set; } = false;

        public ICollection<ProductAmenity> ProductAmenities { get; set; }

        
        public ICollection<FavoriteProduct> FavoriteProducts { get; set; }
    }
}
