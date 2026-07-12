using Business.Abstract;
using DataAccess.DTOs.CategoryDTOs;
using DataAccess.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Real_Estate_Entity_Api.Controllers
{
    
    [Route("api/[controller]")]
    [ApiController]
   
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        
        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        
        [HttpGet]
        public async Task<IActionResult> CategoryList()
        {
            var values = await _categoryService.GetAllAsync();
            return Ok(values);
        }

        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            var value = await _categoryService.GetByIdAsync(id);
            if (value == null)
            {
                return NotFound("Kategori bulunamadı.");
            }
            return Ok(value);
        }

      
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCategory(CreateCategoryDto dto)
        {
            await _categoryService.InsertAsync(dto);
            return Ok("Kategori başarıyla eklendi.");
        }

       
        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(UpdateCategoryDto dto)
        {
            
            await _categoryService.UpdateAsync(dto);
            return Ok("Kategori başarıyla güncellendi.");
        }

        
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            await _categoryService.DeleteAsync(id);
            return Ok("Kategori başarıyla silindi.");
        }
    }
}