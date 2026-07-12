using Business.Abstract;
using DataAccess.DTOs;
using DataAccess.DTOs.UserProfileDTOs;
using DataAccess.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class UserProfileManager : IUserProfileService
    {
        private readonly UserManager<AppUser> _userManager;

        public UserProfileManager(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<ResultUserProfileDto> GetUserProfileAsync(int userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) throw new Exception("Kullanıcı bulunamadı.");

            return new ResultUserProfileDto
            {
                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber
            };
        }

        public async Task<bool> UpdateUserProfileAsync(int userId, UpdateUserProfileDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) throw new Exception("Kullanıcı bulunamadı.");

            
            user.Email = dto.Email;
            user.PhoneNumber = dto.PhoneNumber;
            user.UserName = dto.UserName;

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded) return false;

           
            if (!string.IsNullOrEmpty(dto.CurrentPassword) && !string.IsNullOrEmpty(dto.NewPassword))
            {
                var passwordResult = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
                if (!passwordResult.Succeeded)
                {
                    throw new Exception("Mevcut şifrenizi hatalı girdiniz, diğer bilgiler güncellendi ancak şifreniz değiştirilemedi.");
                }
            }

            return true;
        }
    }
}