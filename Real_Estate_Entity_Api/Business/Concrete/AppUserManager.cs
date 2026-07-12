using Business.Abstract;
using DataAccess.DTOs.AppUserDTOs;
using DataAccess.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class AppUserManager : IAppUserService
    {
        private readonly UserManager<AppUser> _userManager;

        public AppUserManager(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<List<ResultAppUserDto>> GetAllUsersAsync()
        {
            var users = await _userManager.Users.ToListAsync();
            var userList = new List<ResultAppUserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new ResultAppUserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Surname = user.Surname,
                    Username = user.UserName,
                    Email = user.Email,
                    // Eğer kullanıcının rolü yoksa varsayılan olarak "User" gösteriyoruz
                    Role = roles.FirstOrDefault() ?? "User"
                });
            }
            return userList;
        }

        public async Task<bool> AssignRoleAsync(AssignRoleDto dto)
        {
            var user = await _userManager.FindByIdAsync(dto.UserId.ToString());
            if (user == null) return false;

            // Adamın üzerinde olan tüm eski rolleri siliyoruz (Çakışma olmasın diye)
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);

            // Yeni seçtiğimiz rolü atıyoruz
            var result = await _userManager.AddToRoleAsync(user, dto.RoleName);
            return result.Succeeded;
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) return false;

            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded;
        }
    }
}