using AutoMapper;
using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.AmenityDTOs;
using Repositories.Abstract;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class ProductAmenityManager : IProductAmenityService
    {
        private readonly IProductAmenityRepository _repository;
        private readonly IMapper _mapper;

        public ProductAmenityManager(IProductAmenityRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<ResultProductAmenityDto>> GetAmenitiesByProductIdAsync(int productId)
        {
            var values = await _repository.GetProductAmenitiesByProductIdAsync(productId);
            return _mapper.Map<List<ResultProductAmenityDto>>(values);
        }

        public async Task UpdateAmenityStatusAsync(UpdateProductAmenityStatusDto dto)
        {
            var existValue = await _repository.GetByIdAsync(dto.ProductAmenityId);
            if (existValue == null) throw new Exception("Özellik kaydı bulunamadı.");

           
            existValue.Status = dto.Status;
            await _repository.UpdateAsync(existValue);
        }
    }
}