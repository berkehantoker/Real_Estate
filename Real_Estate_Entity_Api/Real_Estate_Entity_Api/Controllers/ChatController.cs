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

        // İlana ait mesaj geçmişini getir
        [HttpGet("{productId}")]
        public async Task<IActionResult> GetMessages(int productId)
        {
            var messages = await _context.ChatMessages
                .Where(m => m.ProductId == productId)
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    m.ChatMessageId,
                    m.SenderId,
                    m.ReceiverId,
                    m.ProductId,
                    m.Message,
                    m.SentAt,
                    m.IsRead,
                    SenderName = m.Sender.Name
                })
                .ToListAsync();

            return Ok(messages);
        }

        // Yeni mesaj gönder
        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] CreateChatMessageDto dto)
        {
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
                ProductId = dto.ProductId,
                SenderId = dto.SenderId,
                ReceiverId = dto.ReceiverId,
                SenderName = senderName,
                Message = dto.Message,
                SentAt = message.SentAt
            };

            // 1. Odaya dahil olanlar için "Canlı Sohbet" bildirimi (Açık ekrana anlık düşür)
            await _hubContext.Clients.Group($"product_{dto.ProductId}").SendAsync("ReceiveChatMessage", notificationData);

            // 2. Mesajın asıl alıcısına (Sistemde online ise) özel global bildirim (Sol menüdeki sayaç için - Zero Trust!)
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
                    LastMessage = m.Message,
                    m.SentAt,
                    m.IsRead
                })
                .Where(x => x.ContactUserId != userId && x.ContactName != null)
                .GroupBy(x => new { x.ProductId, x.ContactUserId })
                .Select(g => g.First())
                .Take(20)
                .ToList();

            return Ok(contacts);
        }
    }
}