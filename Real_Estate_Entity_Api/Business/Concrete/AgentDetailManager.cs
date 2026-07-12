using AutoMapper;
using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.AgentDetailDTOs;
using DataAccess.Entities;
using Repositories.Abstract;
using System;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class AgentDetailManager : IAgentDetailService
    {
        private readonly IAgentDetailRepository _repository;
        private readonly IMapper _mapper;

        public AgentDetailManager(IAgentDetailRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<ResultAgentDetailDto> GetAgentDetailByUserIdAsync(int userId)
        {
            var value = await _repository.GetAgentDetailByUserIdAsync(userId);
            if (value == null) return null; 

            return _mapper.Map<ResultAgentDetailDto>(value);
        }

        public async Task CreateAgentDetailAsync(CreateAgentDetailDto dto)
        {
            var entity = _mapper.Map<AgentDetail>(dto);
            await _repository.InsertAsync(entity);
        }

        public async Task UpdateAgentDetailAsync(UpdateAgentDetailDto dto)
        {
            var existValue = await _repository.GetByIdAsync(dto.AgentDetailId);
            if (existValue == null) throw new Exception("Güncellenecek profil bulunamadı.");

            _mapper.Map(dto, existValue);
            await _repository.UpdateAsync(existValue);
        }
    }
}