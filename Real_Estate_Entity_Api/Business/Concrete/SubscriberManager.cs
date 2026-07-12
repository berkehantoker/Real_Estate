using AutoMapper;
using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.SubscriberDTOs;
using DataAccess.Entities;
using Repositories.Abstract;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class SubscriberManager : ISubscriberService
    {
        private readonly IGenericRepository<Subscriber> _repository;
        private readonly IMapper _mapper;

        public SubscriberManager(IGenericRepository<Subscriber> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<ResultSubscriberDto>> GetAllSubscribersAsync()
        {
            var values = await _repository.GetAllAsync();
            return _mapper.Map<List<ResultSubscriberDto>>(values);
        }

        public async Task CreateSubscriberAsync(CreateSubscriberDto dto)
        {
            var entity = _mapper.Map<Subscriber>(dto);
            await _repository.InsertAsync(entity);
        }
    }
}