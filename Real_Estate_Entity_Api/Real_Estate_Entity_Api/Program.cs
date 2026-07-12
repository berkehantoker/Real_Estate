using Business;
using Business.Abstract;
using Business.Concrete;
using DataAccess;
using DataAccess.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Real_Estate_Entity_Api.Hubs;
using Real_Estate_Entity_Api.Middlewares;
using Repositories;
using Repositories.Abstract;
using Repositories.Concrete;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddSignalR(); 
builder.Services.AddScoped<IStatisticsService, StatisticsManager>();
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
    {
        builder.WithOrigins("http://localhost:3000") 
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials(); 
    });
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();


builder.Services.AddSwaggerGen(opt =>
{
    opt.SwaggerDoc("v1", new OpenApiInfo { Title = "Real Estate EF Core API", Version = "v1" });

    // Swagger'a JWT Bearer şemasını tanıtıyoruz
    opt.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Lütfen kutuya sadece token değerinizi yapıştırın.",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });

    // Tüm endpoint'ler (uçlar) için bu kilidi zorunlu kılıyoruz
    opt.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[]{}
        }
    });
});

builder.Services.AddDbContext<RealEstateContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


builder.Services.AddIdentity<AppUser, AppRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 4;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
.AddEntityFrameworkStores<RealEstateContext>()
.AddRoles<AppRole>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };

        // SignalR için: Query string'den access_token'ı yakala
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/signalrhub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });



builder.Services.AddAutoMapper(typeof(MappingProfile));


builder.Services.AddScoped<IAuthService, AuthManager>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<ICategoryService, CategoryManager>();
builder.Services.AddScoped<IProductService, ProductManager>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IServiceService, ServiceManager>();
builder.Services.AddScoped<IWhoWeAreDetailService, WhoWeAreDetailManager>();
builder.Services.AddScoped<ITestimonialService, TestimonialManager>();
builder.Services.AddScoped<IBottomGridService, BottomGridManager>();
builder.Services.AddScoped<IProductAmenityRepository, ProductAmenityRepository>();
builder.Services.AddScoped<IProductAmenityService, ProductAmenityManager>();
builder.Services.AddScoped<IFavoriteProductRepository, FavoriteProductRepository>();
builder.Services.AddScoped<IContactService, ContactManager>();
builder.Services.AddScoped<ISubscriberService, SubscriberManager>();
builder.Services.AddScoped<IFavoriteProductService, FavoriteProductManager>();
builder.Services.AddScoped<IAgentDetailRepository, AgentDetailRepository>();
builder.Services.AddScoped<IAgentDetailService, AgentDetailManager>();
builder.Services.AddScoped<IUserProfileService, UserProfileManager>();
builder.Services.AddScoped<IFileUploadService, FileUploadManager>();
builder.Services.AddScoped<IAppUserService, AppUserManager>();


var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseStaticFiles(); 

app.UseHttpsRedirection();

app.UseCors("CorsPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapHub<SignalRHub>("/signalrhub");
app.MapControllers();



app.Run();
