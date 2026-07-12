using Microsoft.AspNetCore.Identity;

namespace DataAccess.Entities
{
    public class AppUser : IdentityUser<int> 
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string UserImage { get; set; }

        
        public ICollection<FavoriteProduct> FavoriteProducts { get; set; }

        
        public AgentDetail AgentDetail { get; set; }

    }
}