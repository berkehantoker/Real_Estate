# Real Estate - Full-Stack Emlak Platformu

Geliştirdiğim Full-Stack Emlak Platformu (Real Estate) projesinde, backend tarafında ASP.NET Core Web API ve Entity Framework Core (Code-First) kullanarak N-Katmanlı mimari (N-Tier Architecture) ve Generic Repository Design Pattern ile ölçeklenebilir bir altyapı inşa ettim. Veritabanı yönetiminde Fluent API ile karmaşık ilişkileri (Bire Bir, Çoka Çok) ve Cascade silme kurallarını optimize ettim. Güvenlik katmanında ASP.NET Core Identity ve JWT kullanarak rol bazlı (Admin, Emlakçı, Müşteri) yetkilendirme (Role-Based Authorization) sistemini entegre ettim. Performans ve kod okunabilirliği için AutoMapper, IQueryable tabanlı dinamik filtreleme/sayfalama motoru ve gerçek zamanlı veri akışı için SignalR (WebSocket) teknolojilerini kullandım. 

Frontend tarafında Next.js (App Router) ve Tailwind CSS ile SEO uyumlu, Route Groups mimarisiyle ayrıştırılmış (Müşteri Vitrini ve Yönetim Paneli) modern bir kullanıcı arayüzü kurguladım. İstemci tarafında Zustand ile global state yönetimi, Axios Interceptor ile merkezi istek yönetimi ve Next.js Middleware ile Route Guard (güvenlik duvarı) yapılarını uyguladım. Sistemin en öne çıkan özellikleri arasında; IFormFile ile sunucuya fiziksel görsel yükleyebilen 4 aşamalı profesyonel ilan ekleme sihirbazı (Wizard), gelişmiş arama/filtreleme motoru ve kullanıcılar ile emlakçılar arasında izole çalışan mesajlaşma (Contact) modülü bulunmaktadır. Proje baştan sona Clean Code ve SOLID prensiplerine uygun, kurumsal (Enterprise) seviyede geliştirilmiştir.

##  Öne Çıkan Özellikler

* **4 Aşamalı İlan Sihirbazı (Wizard):** İlan ekleme süreci "Taslak (Draft) -> Detaylar -> Fotoğraf Galerisi -> Yayına Al" şeklinde 4 profesyonel adıma bölünmüştür. Veri kaybı riski ortadan kaldırılmıştır.
* **Rol Bazlı Yetkilendirme & Güvenlik:** Sistemde Admin, Emlakçı (EstateAgent) ve Müşteri (User) rolleri mevcuttur. JWT token entegrasyonu ve Next.js Route Guard (middleware) üzerinden yetkisiz erişimler güvenli bir şekilde engellenmiştir.
* **Gerçek Zamanlı İstatistikler:** Admin panelindeki gösterge paneli (dashboard) verileri SignalR (WebSocket) teknolojisi ile sayfa yenilenmesine gerek kalmadan anlık olarak güncellenmektedir.
* **Gelişmiş Filtreleme:** Müşteri vitrininde fiyat, şehir ve evin fiziksel özelliklerine (havuz, asansör vb.) göre IQueryable tabanlı dinamik bir arama motoru bulunmaktadır.
* **İletişim ve Mesajlaşma Modülü:** Ziyaretçiler ve ilan sahibi emlakçılar arasında izole çalışan, okundu/okunmadı durumlarını takip eden kurumsal bir iletişim sistemi mevcuttur.

##  Kullanılan Teknolojiler

**Backend (API)**
* ASP.NET Core Web API (.NET 8.0)
* Entity Framework Core (Code-First)
* ASP.NET Core Identity & JWT (JSON Web Token)
* SignalR (Gerçek Zamanlı İletişim)
* N-Tier Architecture & Generic Repository Pattern
* AutoMapper & Fluent API

**Frontend (Web UI)**
* Next.js (App Router)
* Tailwind CSS
* Zustand (Global State Yönetimi)
* Axios (Interceptor Entegrasyonu)

**Veritabanı**
* Microsoft SQL Server
