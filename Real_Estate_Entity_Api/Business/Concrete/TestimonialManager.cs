using AutoMapper;
using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.TestimonialDTOs;
using DataAccess.Entities;
using Repositories.Abstract;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class TestimonialManager : ITestimonialService
    {
        private readonly IGenericRepository<Testimonial> _repository;
        private readonly IMapper _mapper;

        public TestimonialManager(IGenericRepository<Testimonial> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<ResultTestimonialDto>> GetAllTestimonialsAsync()
        {
            var values = await _repository.GetAllAsync();
            return _mapper.Map<List<ResultTestimonialDto>>(values);
        }

        public async Task<ResultTestimonialDto> GetTestimonialByIdAsync(int id)
        {
            var value = await _repository.GetByIdAsync(id);
            if (value == null) throw new Exception("Yorum bulunamadı");

            return _mapper.Map<ResultTestimonialDto>(value);
        }

        public async Task CreateTestimonialAsync(CreateTestimonialDto dto)
        {
            var entity = _mapper.Map<Testimonial>(dto);
            await _repository.InsertAsync(entity);
        }

        public async Task UpdateTestimonialAsync(UpdateTestimonialDto dto)
        {
            var existValue = await _repository.GetByIdAsync(dto.TestimonialId);
            if (existValue == null) throw new Exception("Güncellenecek yorum bulunamadı.");

            _mapper.Map(dto, existValue);
            await _repository.UpdateAsync(existValue);
        }

        public async Task DeleteTestimonialAsync(int id)
        {
            var existValue = await _repository.GetByIdAsync(id);
            if (existValue == null) throw new Exception("Silinecek yorum bulunamadı.");

            await _repository.DeleteAsync(existValue);
        }
    }
}