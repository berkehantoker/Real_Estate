using AutoMapper;
using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.ServiceDTOs;
using DataAccess.Entities;
using Repositories.Abstract;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class ServiceManager : IServiceService
    {
        private readonly IGenericRepository<Service> _repository;
        private readonly IMapper _mapper;

        public ServiceManager(IGenericRepository<Service> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<ResultServiceDto>> GetAllServicesAsync()
        {
            var values = await _repository.GetAllAsync();
            return _mapper.Map<List<ResultServiceDto>>(values);
        }

        public async Task<ResultServiceDto> GetServiceByIdAsync(int id)
        {
            var value = await _repository.GetByIdAsync(id);
            if (value == null) throw new Exception("Hizmet bulunamadı");

            return _mapper.Map<ResultServiceDto>(value);
        }

        public async Task CreateServiceAsync(CreateServiceDto dto)
        {
            var entity = _mapper.Map<Service>(dto);
            await _repository.InsertAsync(entity);
        }

        public async Task UpdateServiceAsync(UpdateServiceDto dto)
        {
            var existValue = await _repository.GetByIdAsync(dto.ServiceId);
            if (existValue == null) throw new Exception("Güncellenecek hizmet bulunamadı.");

            _mapper.Map(dto, existValue);
            await _repository.UpdateAsync(existValue);
        }

        public async Task DeleteServiceAsync(int id)
        {
            var existValue = await _repository.GetByIdAsync(id);
            if (existValue == null) throw new Exception("Silinecek hizmet bulunamadı.");

            await _repository.DeleteAsync(existValue);
        }
    }
}