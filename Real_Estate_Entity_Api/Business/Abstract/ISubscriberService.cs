using DataAccess.DTOs;
using DataAccess.DTOs.SubscriberDTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface ISubscriberService
    {
        Task<List<ResultSubscriberDto>> GetAllSubscribersAsync();
        Task CreateSubscriberAsync(CreateSubscriberDto dto);
    }
}