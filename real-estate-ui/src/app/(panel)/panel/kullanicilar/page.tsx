"use client";

import { useEffect, useState } from 'react';
import { getAllUsersAPI, deleteUserAPI, assignRoleAPI } from '../../../../services/userService';
import { FiTrash2, FiShield, FiX, FiUserCheck } from 'react-icons/fi';

interface AppUser {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Rol Değiştirme Modalı State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [newRole, setNewRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsersAPI();
      setUsers(data);
    } catch (error) {
      console.error("Kullanıcılar yüklenemedi", error);
      alert("Kullanıcı listesi yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number, name: string, surname: string) => {
    if (window.confirm(`${name} ${surname} adlı kullanıcıyı tamamen silmek istediğinize emin misiniz?`)) {
      try {
        await deleteUserAPI(id);
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (error) {
        alert("Kullanıcı silinemedi. Lütfen tekrar deneyin.");
      }
    }
  };

  const openRoleModal = (user: AppUser) => {
    setSelectedUser(user);
    setNewRole(user.role || 'User'); // Varsayılan rolü seçili getir
    setIsModalOpen(true);
  };

  const closeRoleModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await assignRoleAPI({
        userId: selectedUser.id,
        roleName: newRole
      });
      // Başarılı olursa listeyi yenile
      await fetchUsers();
      closeRoleModal();
    } catch (error) {
      alert("Rol güncellenirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rol ismini Türkçeleştiren ve renk veren yardımcı fonksiyon
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-max gap-1"><FiShield/> Yönetici</span>;
      case 'EstateAgent':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-max gap-1"><FiUserCheck/> Emlak Danışmanı</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold flex items-center w-max gap-1">Müşteri (User)</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Kullanıcı Yönetimi</h2>
        <p className="text-gray-500 mt-1">Sisteme kayıtlı üyeleri görüntüleyin ve yetkilerini (Rollerini) ayarlayın.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Kullanıcılar yükleniyor...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">Sistemde henüz kullanıcı bulunmuyor.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-5 font-bold text-gray-700">Kullanıcı</th>
                  <th className="p-5 font-bold text-gray-700">Kullanıcı Adı</th>
                  <th className="p-5 font-bold text-gray-700">Mevcut Yetki (Rol)</th>
                  <th className="p-5 font-bold text-gray-700 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5">
                      <div className="font-bold text-gray-900">{user.name} {user.surname}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="p-5 font-medium text-gray-700">@{user.username}</td>
                    <td className="p-5">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-5 flex items-center justify-end gap-3">
                      <button 
                        onClick={() => openRoleModal(user)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                        title="Yetkisini Değiştir"
                      >
                        <FiShield /> Rol Ata
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id, user.name, user.surname)}
                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                        title="Kullanıcıyı Sil"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- ROL DEĞİŞTİRME MODALI --- */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900">Kullanıcı Yetkilendirme</h3>
              <button onClick={closeRoleModal} className="text-gray-400 hover:text-red-500 transition-colors text-2xl">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleRoleSubmit} className="p-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500">Seçili Kullanıcı:</p>
                <p className="font-bold text-gray-900">{selectedUser.name} {selectedUser.surname} (@{selectedUser.username})</p>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Yeni Rol (Yetki) Seçin</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="User">Müşteri (Sadece İlanlara Bakabilir)</option>
                  <option value="EstateAgent">Emlak Danışmanı (İlan Ekleyebilir)</option>
                  <option value="Admin">Sistem Yöneticisi (Tüm Yetkilere Sahiptir)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeRoleModal} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">
                  İptal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Kaydediliyor...' : 'Rolü Güncelle'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}} />
    </div>
  );
}