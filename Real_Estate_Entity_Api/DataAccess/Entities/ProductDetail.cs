using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Entities
{
    public class ProductDetail
    {
        public int ProductDetailId { get; set; }
        public int Size { get; set; }
        public int BedroomCount { get; set; }
        public int BathCount { get; set; }
        public int RoomCount { get; set; }
        public string VideoUrl { get; set; }

        
        public int ProductId { get; set; }
        public Product Product { get; set; }
    }
}
