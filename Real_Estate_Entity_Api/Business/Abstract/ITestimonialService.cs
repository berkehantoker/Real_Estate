using DataAccess.DTOs;
using DataAccess.DTOs.TestimonialDTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface ITestimonialService
    {
        Task<List<ResultTestimonialDto>> GetAllTestimonialsAsync();
        Task<ResultTestimonialDto> GetTestimonialByIdAsync(int id);
        Task CreateTestimonialAsync(CreateTestimonialDto dto);
        Task UpdateTestimonialAsync(UpdateTestimonialDto dto);
        Task DeleteTestimonialAsync(int id);
    }
}