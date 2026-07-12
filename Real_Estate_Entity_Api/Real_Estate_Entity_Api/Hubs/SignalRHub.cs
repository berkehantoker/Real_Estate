using Business.Abstract;
using Microsoft.AspNetCore.SignalR;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Hubs
{
    public class SignalRHub : Hub
    {
        private readonly IStatisticsService _statisticsService;

        public SignalRHub(IStatisticsService statisticsService)
        {
            _statisticsService = statisticsService;
        }

        private int? GetUserIdFromToken()
        {
            var httpContext = Context.GetHttpContext();
            var accessToken = httpContext?.Request.Query["access_token"].ToString();
            if (string.IsNullOrEmpty(accessToken)) return null;

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(accessToken);
                var userIdClaim = jwtToken.Claims.FirstOrDefault(c =>
                    c.Type == ClaimTypes.NameIdentifier ||
                    c.Type == "nameid" ||
                    c.Type == "sub")?.Value;

                if (int.TryParse(userIdClaim, out int userId))
                    return userId;
            }
            catch
            {
                // ignore
            }
            return null;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = GetUserIdFromToken();
            if (userId.HasValue)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId.Value}");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetUserIdFromToken();
            if (userId.HasValue)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId.Value}");
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendStatistics()
        {
            await Clients.All.SendAsync("ReceiveProductCount", await _statisticsService.ProductCountAsync());
            await Clients.All.SendAsync("ReceiveCategoryCount", await _statisticsService.CategoryCountAsync());
            await Clients.All.SendAsync("ReceiveMostExpensiveProduct", await _statisticsService.MostExpensiveProductAsync());
            await Clients.All.SendAsync("ReceiveActiveProductCount", await _statisticsService.ActiveProductCountAsync());
            await Clients.All.SendAsync("ReceiveTotalMessageCount", await _statisticsService.TotalMessageCountAsync());
            await Clients.All.SendAsync("ReceiveTotalUserCount", await _statisticsService.TotalUserCountAsync());
        }

        public async Task JoinProductChat(int productId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"product_{productId}");
        }

        public async Task LeaveProductChat(int productId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"product_{productId}");
        }

        public async Task SendChatMessage(int productId, int receiverId, int senderId, string senderName, string message)
        {
            var msgData = new
            {
                ProductId = productId,
                SenderId = senderId,
                ReceiverId = receiverId,
                SenderName = senderName,
                Message = message,
                SentAt = DateTime.Now
            };

            await Clients.Group($"product_{productId}").SendAsync("ReceiveChatMessage", msgData);
            await Clients.Group($"user_{receiverId}").SendAsync("NewMessageNotification", msgData);
        }
    }
}