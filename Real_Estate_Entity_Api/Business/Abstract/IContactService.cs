using DataAccess.DTOs;
using DataAccess.DTOs.ContactDTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IContactService
    {
        Task<List<ResultContactDto>> GetAllMessagesAsync();
        Task CreateMessageAsync(CreateContactDto dto);
        Task DeleteMessageAsync(int id);
    }
}