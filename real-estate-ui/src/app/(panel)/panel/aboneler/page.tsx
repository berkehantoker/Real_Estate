"use client";

import { useEffect, useState } from 'react';
import { getAllSubscribersAPI } from '../../../../services/subscriberService';
import { FiMail, FiCalendar, FiUsers } from 'react-icons/fi';

interface Subscriber {
  subscriberId: number;
  email: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllSubscribersAPI();
      setSubscribers(data);
    } catch (error) {
      console.error("Aboneler yüklenemedi", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSubscribers(); }, []);

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <FiUsers className="text-blue-600" /> Bülten Aboneleri
        </h2>
        <p className="text-gray-500 mt-1">E-posta bültenine kaydolan kullanıcıların listesi.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Aboneler yükleniyor...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            <FiMail className="text-4xl mx-auto mb-3 text-gray-300" />
            Henüz hiç abone kaydolmamış.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-5 font-bold text-gray-700">ID</th>
                  <th className="p-5 font-bold text-gray-700">E-Posta Adresi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscribers.map((sub) => (
                  <tr key={sub.subscriberId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 text-gray-500 font-medium">#{sub.subscriberId}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-gray-400" />
                        <span className="font-medium text-gray-900">{sub.email}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}