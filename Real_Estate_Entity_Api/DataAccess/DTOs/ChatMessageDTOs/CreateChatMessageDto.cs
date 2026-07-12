namespace DataAccess.DTOs.ChatMessageDTOs
{
    public class CreateChatMessageDto
    {
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public int ProductId { get; set; }
        public string Message { get; set; }
    }
}