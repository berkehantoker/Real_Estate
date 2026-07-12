using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Entities
{
    
        public class Category
        {
            public int CategoryId { get; set; }
            public string CategoryName { get; set; }
            public bool CategoryStatus { get; set; }

          
            public ICollection<Product> Products { get; set; }
        }
    
}
