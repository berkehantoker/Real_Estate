namespace DataAccess.DTOs.AgentDetailDTOs
{
    public class ResultAgentDetailDto
    {
        public int AgentDetailId { get; set; }
        public int AppUserId { get; set; }

        
        public string AgentName { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public string PhoneNumber { get; set; }
        public string FacebookUrl { get; set; }
        public string TwitterUrl { get; set; }
        public string InstagramUrl { get; set; }
    }
}