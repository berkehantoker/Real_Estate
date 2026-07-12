namespace DataAccess.DTOs.AmenityDTOs
{
   
    public class ResultProductAmenityDto
    {
        public int ProductAmenityId { get; set; }
        public int ProductId { get; set; }
        public int AmenityId { get; set; }
      
        public string AmenityTitle { get; set; }
        public bool Status { get; set; }
    }
}