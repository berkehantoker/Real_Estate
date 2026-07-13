using DataAccess.DTOs.ChatMessageDTOs;
using DataAccess.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Real_Estate_Entity_Api.Hubs;
using Repositories;
using Repositories.Abstract;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace Real_Estate_Entity_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly RealEstateContext _context;
        private readonly IHubContext<SignalRHub> _hubContext;

        public ChatController(RealEstateContext context, IHubContext<SignalRHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // İlana ve kişiye ait mesaj geçmişini getir
        [HttpGet("{productId}/{otherUserId}")]
        public async Task<IActionResult> GetMessages(int productId, int otherUserId)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var messages = await _context.ChatMessages
                .Where(m => m.ProductId == productId && 
                            ((m.SenderId == userId && m.ReceiverId == otherUserId && !m.IsDeletedBySender) || 
                             (m.SenderId == otherUserId && m.ReceiverId == userId && !m.IsDeletedByReceiver)))
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    m.ChatMessageId,
                    m.SenderId,
                    m.ReceiverId,
                    m.ProductId,
                    Message = m.IsDeletedForAll ? "🚫 Bu mesaj silindi." : m.Message,
                    m.SentAt,
                    m.IsRead,
                    SenderName = m.Sender.Name,
                    IsDeletedForAll = m.IsDeletedForAll
                })
                .ToListAsync();

            return Ok(messages);
        }

        // Yeni mesaj gönder
        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] CreateChatMessageDto dto)
        {
            if (dto.SenderId == dto.ReceiverId)
            {
                return BadRequest("Kendi ilanınıza veya kendinize mesaj gönderemezsiniz.");
            }

            var message = new ChatMessage
            {
                SenderId = dto.SenderId,
                ReceiverId = dto.ReceiverId,
                ProductId = dto.ProductId,
                Message = dto.Message,
                SentAt = DateTime.Now,
                IsRead = false
            };

            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            var senderName = (await _context.Users.FindAsync(dto.SenderId))?.Name;

            // Bildirim datasına SenderId de ekliyoruz ki, mesajı atan kişi kendi ekranında kendi mesajını çift görmesin.
            var notificationData = new
            {
                ChatMessageId = message.ChatMessageId,
                ProductId = dto.ProductId,
                SenderId = dto.SenderId,
                ReceiverId = dto.ReceiverId,
                SenderName = senderName,
                Message = dto.Message,
                SentAt = message.SentAt,
                IsDeletedForAll = false
            };

            // İki kullanıcının ID'sini sıralayarak benzersiz bir oda adı oluşturuyoruz
            int minId = Math.Min(dto.SenderId, dto.ReceiverId);
            int maxId = Math.Max(dto.SenderId, dto.ReceiverId);
            string privateGroupName = $"chat_{dto.ProductId}_{minId}_{maxId}";

            // 1. SADECE bu özel odaya canlı mesaj at (Başka müşteriler görmesin)
            await _hubContext.Clients.Group(privateGroupName).SendAsync("ReceiveChatMessage", notificationData);

            // 2. Global bildirim aynen kalıyor (Zero Trust - Sadece alıcıya)
            await _hubContext.Clients.Group($"user_{dto.ReceiverId}").SendAsync("NewMessageNotification", notificationData);

            Console.WriteLine($"🔔 Bildirim gönderildi! ReceiverId: {dto.ReceiverId}, Message: {dto.Message}");

            return Ok(new
            {
                message.ChatMessageId,
                message.SenderId,
                message.ReceiverId,
                message.ProductId,
                message.Message,
                message.SentAt,
                message.IsRead,
                SenderName = senderName
            });
        }

        // Kullanıcının mesajlaştığı kişileri listele (kendisi hariç)
        [HttpGet("my-contacts")]
        public async Task<IActionResult> GetMyContacts()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var allMessages = await _context.ChatMessages
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .Where(m => !m.IsDeletedForAll)
                .Where(m => !(m.SenderId == userId && m.IsDeletedBySender) && !(m.ReceiverId == userId && m.IsDeletedByReceiver))
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Include(m => m.Product)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();

            var contacts = allMessages
                .Select(m => new
                {
                    m.ProductId,
                    ProductTitle = m.Product?.Title,
                    ContactUserId = m.SenderId == userId ? m.ReceiverId : m.SenderId,
                    ContactName = m.SenderId == userId ? m.Receiver?.Name : m.Sender?.Name,
                    LastMessage = m.IsDeletedForAll ? "🚫 Bu mesaj silindi." : m.Message,
                    m.SentAt,
                    m.IsRead,
                    LastMessageSenderId = m.SenderId
                })
                .Where(x => x.ContactUserId != userId && x.ContactName != null)
                .GroupBy(x => new { x.ProductId, x.ContactUserId })
                .Select(g => g.First())
                .Take(20)
                .ToList();

            return Ok(contacts);
        }

        // 1. Tekil Mesaj Silme (Herkes İçin Sil)
        [HttpDelete("message/{chatMessageId}")]
        public async Task<IActionResult> DeleteMessage(int chatMessageId)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var msg = await _context.ChatMessages.FindAsync(chatMessageId);
            if (msg == null) return NotFound("Mesaj bulunamadı.");
            if (msg.SenderId != userId) return BadRequest("Bu mesajı silme yetkiniz yok.");

            // Eğer zaten silindiyse tekrar hata fırlatma, başarılı dön
            if (msg.IsDeletedForAll) return Ok();

            msg.IsDeletedForAll = true;
            _context.ChatMessages.Update(msg);
            await _context.SaveChangesAsync();

            // Özel odaya (Müşteri ve Emlakçının ortak odasına) silindi sinyali gönder
            int minId = Math.Min(msg.SenderId, msg.ReceiverId);
            int maxId = Math.Max(msg.SenderId, msg.ReceiverId);
            string privateGroupName = $"chat_{msg.ProductId}_{minId}_{maxId}";

            await _hubContext.Clients.Group(privateGroupName).SendAsync("MessageDeleted", new { ChatMessageId = chatMessageId });

            return Ok();
        }

        // Bir sohbete girildiğinde karşı taraftan gelen okunmamış mesajları kalıcı olarak okundu yap!
        [HttpPost("mark-as-read/{productId}/{otherUserId}")]
        public async Task<IActionResult> MarkAsRead(int productId, int otherUserId)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var unreadMessages = await _context.ChatMessages
                .Where(m => m.ProductId == productId && 
                            m.SenderId == otherUserId && 
                            m.ReceiverId == userId && 
                            !m.IsRead)
                .ToListAsync();

            if (unreadMessages.Any())
            {
                foreach (var msg in unreadMessages)
                {
                    msg.IsRead = true;
                }
                await _context.SaveChangesAsync();
            }

            return Ok();
        }

        // 2. Komple Sohbeti Temizle (Sadece Benden Sil)
        [HttpDelete("conversation/{productId}/{otherUserId}")]
        public async Task<IActionResult> DeleteConversation(int productId, int otherUserId)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

            var messages = await _context.ChatMessages
                .Where(m => m.ProductId == productId && 
                            ((m.SenderId == userId && m.ReceiverId == otherUserId) || 
                             (m.SenderId == otherUserId && m.ReceiverId == userId)))
                .ToListAsync();

            foreach (var m in messages)
            {
                if (m.SenderId == userId) m.IsDeletedBySender = true;
                if (m.ReceiverId == userId) m.IsDeletedByReceiver = true;
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}