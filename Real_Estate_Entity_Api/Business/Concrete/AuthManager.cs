using Business.Abstract;
using DataAccess.DTOs.AuthDTOs;
using DataAccess.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class AuthManager : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IConfiguration _configuration; 

        public AuthManager(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        public async Task<bool> RegisterUserAsync(RegisterDto registerDto)
        {
            var user = new AppUser
            {
                Name = registerDto.Name,
                Surname = registerDto.Surname,
                UserName = registerDto.Username,
                Email = registerDto.Email,
                UserImage = "default.png"
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "User");
                return true; 
            }

           
            var firstError = result.Errors.FirstOrDefault()?.Description ?? "Kayıt olurken bir hata oluştu.";
            throw new Exception(firstError);
        }

        public async Task<bool> RegisterAgentAsync(RegisterDto registerDto)
        {
            var user = new AppUser
            {
                Name = registerDto.Name,
                Surname = registerDto.Surname,
                UserName = registerDto.Username,
                Email = registerDto.Email,
                UserImage = "default.png" 
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (result.Succeeded)
            {
               
                await _userManager.AddToRoleAsync(user, "EstateAgent");
                return result.Succeeded;
            }

            var firstError = result.Errors.FirstOrDefault()?.Description ?? "Kayıt oluşturulurken hata oluştu.";
            throw new Exception(firstError);



        }

        public async Task<string> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByNameAsync(loginDto.Username);
            if (user == null) return null;

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
            if (!result.Succeeded) return null;

            

            
            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            
            var userRoles = await _userManager.GetRolesAsync(user);
            foreach (var role in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
            }

            
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(_configuration["Jwt:DurationInMinutes"])),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

           
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}