using DataAccess.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

public class RealEstateContext : IdentityDbContext<AppUser, AppRole, int>
{
    public RealEstateContext(DbContextOptions<RealEstateContext> options) : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<ProductDetail> ProductDetails { get; set; }
    public DbSet<ProductImage> ProductImages { get; set; }

    public DbSet<WhoWeAreDetail> WhoWeAreDetails { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<Testimonial> Testimonials { get; set; }
    public DbSet<BottomGrid> BottomGrids { get; set; }

    public DbSet<Amenity> Amenities { get; set; }
    public DbSet<ProductAmenity> ProductAmenities { get; set; }

    public DbSet<Contact> Contacts { get; set; }
    public DbSet<Subscriber> Subscribers { get; set; }
    public DbSet<FavoriteProduct> FavoriteProducts { get; set; }

        public DbSet<AgentDetail> AgentDetails { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Fiyat Sütunu Tipi
        modelBuilder.Entity<Product>()
            .Property(x => x.Price)
            .HasColumnType("decimal(18,2)");

        // 2. KATEGORİ İLİŞKİSİ 
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // 3. FAVORİLER İLİŞKİSİ 
        modelBuilder.Entity<FavoriteProduct>()
            .HasOne(f => f.AppUser)
            .WithMany(u => u.FavoriteProducts)
            .HasForeignKey(f => f.AppUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<FavoriteProduct>()
            .HasOne(f => f.Product)
            .WithMany(p => p.FavoriteProducts)
            .HasForeignKey(f => f.ProductId)
            .OnDelete(DeleteBehavior.NoAction);

       

        // A) İlan Detayları Silinsin
        modelBuilder.Entity<ProductDetail>()
            .HasOne(x => x.Product)
            .WithOne(x => x.ProductDetail)
            .HasForeignKey<ProductDetail>(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // B) İlan Resimleri Silinsin
        modelBuilder.Entity<ProductImage>()
            .HasOne(x => x.Product)
            .WithMany(x => x.ProductImages)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // C) İlan Özellikleri (Amenities) Silinsin
        modelBuilder.Entity<ProductAmenity>()
            .HasOne(x => x.Product)
            .WithMany(x => x.ProductAmenities)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // D) Chat Mesajları Silinsin (Product silinince)
        modelBuilder.Entity<ChatMessage>()
            .HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ChatMessage>()
            .HasOne(x => x.Sender)
            .WithMany()
            .HasForeignKey(x => x.SenderId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ChatMessage>()
            .HasOne(x => x.Receiver)
            .WithMany()
            .HasForeignKey(x => x.ReceiverId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}