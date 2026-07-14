using AutoMapper;
using DataAccess.DTOs.AgentDetailDTOs;
using DataAccess.DTOs.AmenityDTOs;
using DataAccess.DTOs.BottomGridDTOs;
using DataAccess.DTOs.CategoryDTOs;
using DataAccess.DTOs.ContactDTOs;
using DataAccess.DTOs.FavoriteProductDTOs;
using DataAccess.DTOs.ProductDTOs;
using DataAccess.DTOs.ServiceDTOs;
using DataAccess.DTOs.SubscriberDTOs;
using DataAccess.DTOs.TestimonialDTOs;
using DataAccess.DTOs.WhoWeAreDTOs;
using DataAccess.Entities;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Business
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            
            CreateMap<Category, CreateCategoryDto>().ReverseMap();
            CreateMap<Category, UpdateCategoryDto>().ReverseMap();

            CreateMap<Category, ResultCategoryDto>().ReverseMap();


            CreateMap<Product, CreateProductDraftDto>().ReverseMap();
            CreateMap<ProductDetail, CreateProductDetailDto>().ReverseMap();
           
            // Resimler için liste çevirisi biraz farklıdır, onu aşağıda manuel bırakmak daha sağlıklıdır.
            CreateMap<Product, UpdateProductDto>().ReverseMap();

            CreateMap<Product, ResultProductDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.CategoryName : null))
                .ForMember(dest => dest.AppUserName, opt => opt.MapFrom(src => src.AppUser != null ? src.AppUser.Name : null))
                .ForMember(dest => dest.AppUserSurname, opt => opt.MapFrom(src => src.AppUser != null ? src.AppUser.Surname : null))
                .ReverseMap();


            // WhoWeAreDetail
            CreateMap<WhoWeAreDetail, ResultWhoWeAreDetailDto>().ReverseMap();
            CreateMap<WhoWeAreDetail, CreateWhoWeAreDetailDto>().ReverseMap();
            CreateMap<WhoWeAreDetail, UpdateWhoWeAreDetailDto>().ReverseMap();

            // Service
            CreateMap<Service, ResultServiceDto>().ReverseMap();
            CreateMap<Service, CreateServiceDto>().ReverseMap();
            CreateMap<Service, UpdateServiceDto>().ReverseMap();

            // Testimonial
            CreateMap<Testimonial, ResultTestimonialDto>().ReverseMap();
            CreateMap<Testimonial, CreateTestimonialDto>().ReverseMap();
            CreateMap<Testimonial, UpdateTestimonialDto>().ReverseMap();

            // BottomGrid
            CreateMap<BottomGrid, ResultBottomGridDto>().ReverseMap();
            CreateMap<BottomGrid, CreateBottomGridDto>().ReverseMap();
            CreateMap<BottomGrid, UpdateBottomGridDto>().ReverseMap();

            // Amenity Mapping
            CreateMap<Amenity, ResultAmenityDto>().ReverseMap();
            CreateMap<ProductAmenity, ResultProductAmenityDto>().ReverseMap();

            CreateMap<Contact, ResultContactDto>().ReverseMap();
            CreateMap<Contact, CreateContactDto>().ReverseMap();

            CreateMap<Subscriber, ResultSubscriberDto>().ReverseMap();
            CreateMap<Subscriber, CreateSubscriberDto>().ReverseMap();

            //Favorileri çekerken AutoMapper içindeki Product nesnesinden başlık, fiyat ve görseli otomatik çekecek!
            CreateMap<FavoriteProduct, ResultFavoriteProductDto>()
                .ForMember(dest => dest.ProductTitle, opt => opt.MapFrom(src => src.Product.Title))
                .ForMember(dest => dest.ProductPrice, opt => opt.MapFrom(src => src.Product.Price))
                .ForMember(dest => dest.ProductCoverImage, opt => opt.MapFrom(src => src.Product.CoverImage))
                .ReverseMap();
            CreateMap<FavoriteProduct, CreateFavoriteProductDto>().ReverseMap();


            CreateMap<AgentDetail, ResultAgentDetailDto>()
    
    .ForMember(dest => dest.AgentName, opt => opt.MapFrom(src => src.AppUser.Name))
    .ReverseMap();

            CreateMap<AgentDetail, CreateAgentDetailDto>().ReverseMap();
            CreateMap<AgentDetail, UpdateAgentDetailDto>().ReverseMap();
        }
    }
}