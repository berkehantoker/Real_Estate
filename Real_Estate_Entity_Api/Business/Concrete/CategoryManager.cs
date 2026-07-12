using AutoMapper;
using Business.Abstract;
using DataAccess.DTOs.CategoryDTOs;
using DataAccess.Entities;
using Repositories.Abstract;

namespace Business.Concrete
{
    public class CategoryManager : ICategoryService
    {
        private readonly IGenericRepository<Category> _categoryRepository;
        private readonly IMapper _mapper;

        public CategoryManager(IGenericRepository<Category> categoryRepository, IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        public async Task<List<ResultCategoryDto>> GetAllAsync()
        {
            var values = await _categoryRepository.GetAllAsync();
            return _mapper.Map<List<ResultCategoryDto>>(values);
        }

        public async Task<ResultCategoryDto> GetByIdAsync(int id)
        {
            var value = await _categoryRepository.GetByIdAsync(id);
            return _mapper.Map<ResultCategoryDto>(value);
        }

        public async Task InsertAsync(CreateCategoryDto createCategoryDto)
        {
            var category = _mapper.Map<Category>(createCategoryDto);
            await _categoryRepository.InsertAsync(category);
        }

        public async Task UpdateAsync(UpdateCategoryDto updateCategoryDto)
        {
            var existCategory = await _categoryRepository.GetByIdAsync(updateCategoryDto.CategoryId);

           
            if (existCategory == null)
                throw new Exception("Güncellenmek istenen kategori bulunamadı!");

            _mapper.Map(updateCategoryDto, existCategory);
            await _categoryRepository.UpdateAsync(existCategory);
        }

        public async Task DeleteAsync(int id)
        {
            var existCategory = await _categoryRepository.GetByIdAsync(id);

            
            if (existCategory == null)
                throw new Exception("Silinmek istenen kategori bulunamadı!");

           
            try
            {
                await _categoryRepository.DeleteAsync(existCategory);
            }
            catch (Exception)
            {
                throw new Exception("Bu kategori silinemez çünkü ona bağlı ilanlar var!");
            }
        }
    }
}