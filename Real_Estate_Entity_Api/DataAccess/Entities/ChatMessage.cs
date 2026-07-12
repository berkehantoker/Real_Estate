using System;

namespace DataAccess.Entities
{
    public class ChatMessage
    {
        public int ChatMessageId { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public int ProductId { get; set; }
        public string Message { get; set; }
        public DateTime SentAt { get; set; } = DateTime.Now;
        public bool IsRead { get; set; } = false;

        public AppUser Sender { get; set; }
        public AppUser Receiver { get; set; }
        public Product Product { get; set; }
    }
}