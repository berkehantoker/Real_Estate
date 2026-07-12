using System.Collections.Generic;

namespace DataAccess.DTOs.ProductDTOs
{
    public class CreateProductImagesDto
    {
        
        public int ProductId { get; set; }

        
        public List<string> ImageUrls { get; set; }
    }
}