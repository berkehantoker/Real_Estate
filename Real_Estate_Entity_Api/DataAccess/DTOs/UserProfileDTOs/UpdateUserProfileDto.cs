namespace DataAccess.DTOs.UserProfileDTOs
{
    public class UpdateUserProfileDto
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }

        
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}