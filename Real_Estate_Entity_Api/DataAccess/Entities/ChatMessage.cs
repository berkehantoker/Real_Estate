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

        public bool IsDeletedForAll { get; set; } = false;    // Herkes için silindi mi? (Tekil mesaj silme)
        public bool IsDeletedBySender { get; set; } = false;  // Gönderen kendi ekranýndan sildi mi?
        public bool IsDeletedByReceiver { get; set; } = false; // Alan kendi ekranýndan sildi mi?
    }
}