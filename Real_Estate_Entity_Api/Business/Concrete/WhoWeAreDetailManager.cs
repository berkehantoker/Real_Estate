using AutoMapper;
using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.WhoWeAreDTOs;
using DataAccess.Entities;
using Repositories.Abstract;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class WhoWeAreDetailManager : IWhoWeAreDetailService
    {
        private readonly IGenericRepository<WhoWeAreDetail> _repository;
        private readonly IMapper _mapper;

        public WhoWeAreDetailManager(IGenericRepository<WhoWeAreDetail> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<ResultWhoWeAreDetailDto>> GetAllWhoWeAreDetailsAsync()
        {
            var values = await _repository.GetAllAsync();
            return _mapper.Map<List<ResultWhoWeAreDetailDto>>(values);
        }

        public async Task<ResultWhoWeAreDetailDto> GetWhoWeAreDetailByIdAsync(int id)
        {
            var value = await _repository.GetByIdAsync(id);
            if (value == null) throw new Exception("Kayıt bulunamadı");

            return _mapper.Map<ResultWhoWeAreDetailDto>(value);
        }

        public async Task CreateWhoWeAreDetailAsync(CreateWhoWeAreDetailDto dto)
        {
            var entity = _mapper.Map<WhoWeAreDetail>(dto);
            await _repository.InsertAsync(entity);
        }

        public async Task UpdateWhoWeAreDetailAsync(UpdateWhoWeAreDetailDto dto)
        {
            var existValue = await _repository.GetByIdAsync(dto.WhoWeAreDetailId);
            if (existValue == null) throw new Exception("Güncellenecek kayıt bulunamadı.");

            _mapper.Map(dto, existValue);
            await _repository.UpdateAsync(existValue);
        }

        public async Task DeleteWhoWeAreDetailAsync(int id)
        {
            var existValue = await _repository.GetByIdAsync(id);
            if (existValue == null) throw new Exception("Silinecek kayıt bulunamadı.");

            await _repository.DeleteAsync(existValue);
        }
    }
}