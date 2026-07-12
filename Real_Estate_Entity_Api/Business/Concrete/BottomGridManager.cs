using AutoMapper;
using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.BottomGridDTOs;
using DataAccess.Entities;
using Repositories.Abstract;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class BottomGridManager : IBottomGridService
    {
        private readonly IGenericRepository<BottomGrid> _repository;
        private readonly IMapper _mapper;

        public BottomGridManager(IGenericRepository<BottomGrid> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<ResultBottomGridDto>> GetAllBottomGridsAsync()
        {
            var values = await _repository.GetAllAsync();
            return _mapper.Map<List<ResultBottomGridDto>>(values);
        }

        public async Task<ResultBottomGridDto> GetBottomGridByIdAsync(int id)
        {
            var value = await _repository.GetByIdAsync(id);
            if (value == null) throw new Exception("Kayıt bulunamadı");

            return _mapper.Map<ResultBottomGridDto>(value);
        }

        public async Task CreateBottomGridAsync(CreateBottomGridDto dto)
        {
            var entity = _mapper.Map<BottomGrid>(dto);
            await _repository.InsertAsync(entity);
        }

        public async Task UpdateBottomGridAsync(UpdateBottomGridDto dto)
        {
            var existValue = await _repository.GetByIdAsync(dto.BottomGridId);
            if (existValue == null) throw new Exception("Güncellenecek kayıt bulunamadı.");

            _mapper.Map(dto, existValue);
            await _repository.UpdateAsync(existValue);
        }

        public async Task DeleteBottomGridAsync(int id)
        {
            var existValue = await _repository.GetByIdAsync(id);
            if (existValue == null) throw new Exception("Silinecek kayıt bulunamadı.");

            await _repository.DeleteAsync(existValue);
        }
    }
}