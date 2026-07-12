using AutoMapper;
using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.ContactDTOs;
using DataAccess.Entities;
using Repositories.Abstract;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class ContactManager : IContactService
    {
        private readonly IGenericRepository<Contact> _repository;
        private readonly IMapper _mapper;

        public ContactManager(IGenericRepository<Contact> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<ResultContactDto>> GetAllMessagesAsync()
        {
            var values = await _repository.GetAllAsync();
            return _mapper.Map<List<ResultContactDto>>(values);
        }

        public async Task CreateMessageAsync(CreateContactDto dto)
        {
            var entity = _mapper.Map<Contact>(dto);
            await _repository.InsertAsync(entity);
        }

        public async Task DeleteMessageAsync(int id)
        {
            var existValue = await _repository.GetByIdAsync(id);
            if (existValue != null)
            {
                await _repository.DeleteAsync(existValue);
            }
        }
    }
}