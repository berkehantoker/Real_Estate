using System;

namespace DataAccess.DTOs.ContactDTOs
{
    public class CreateContactDto { 
        public string Name { get; set; } 
        public string Email { get; set; } 
        public string Subject { get; set; } 
        public string Message { get; set; } 
        public DateTime SendDate { get; set; } = DateTime.Now; 
        public bool IsRead { get; set; } = false; 
    }
}