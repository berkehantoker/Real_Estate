using Microsoft.AspNetCore.Http;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace Real_Estate_Entity_Api.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public GlobalExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                
                httpContext.Response.ContentType = "application/json";
                httpContext.Response.StatusCode = 500; 

                var response = new
                {
                    StatusCode = 500,
                    Message = "Sunucu tarafında beklenmeyen bir hata oluştu.",
                    Detail = ex.Message 
                };

                var json = JsonSerializer.Serialize(response);
                await httpContext.Response.WriteAsync(json);
            }
        }
    }
}