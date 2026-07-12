namespace DataAccess.DTOs.SubscriberDTOs
{
    public class CreateSubscriberDto { 
        public string Email { get; set; } 
        public bool IsActive { get; set; } = true; 
    }
}