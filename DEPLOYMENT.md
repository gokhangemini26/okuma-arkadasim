# Projeyi Yayınlama Rehberi (Deployment Guide)

Bu projeyi internette yayınlamak ve herkesle paylaşmak için en kolay ve hızlı yöntem **Vercel** kullanmaktır. Vercel, Next.js'in yaratıcıları tarafından geliştirilmiştir ve bu proje için en uygun platformdur.

## 1. Hazırlık

Öncelikle projenizin çalışması için gerekli olan API anahtarını ayarlamamız gerekiyor.

### Güvenlik Uyarısı
Proje kodlarında API anahtarını sildik ve güvenli bir yöntem olan "Environment Variable" (Ortam Değişkeni) sistemine geçtik. Bu sayede anahtarınız kodlarınızın içinde görünmez ve çalınmaz.

## 2. Vercel ile Yayınlama (Adım Adım)

### Adım 1: GitHub'a Yükleme
Eğer projeniz henüz GitHub'a yüklü değilse:
1. GitHub'da yeni bir "Repository" oluşturun.
2. Kodlarınızı bu repository'ye gönderin.

### Adım 2: Vercel Hesabı
1. [vercel.com](https://vercel.com) adresine gidin.
2. "Sign Up" diyerek GitHub hesabınızla giriş yapın.

### Adım 3: Projeyi İçe Aktarma (Import)
1. Vercel panosunda "Add New..." -> "Project" butonuna tıklayın.
2. GitHub listenizden `okuma-arkadasim` projesini seçin ve "Import" butonuna basın.

### Adım 4: Ayarlar ve API Anahtarı
Bu adım **ÇOK ÖNEMLİDİR**. 

1. "Configure Project" ekranında **Environment Variables** bölümünü açın.
2. Aşağıdaki bilgileri girin:
   - **Key**: `NEXT_PUBLIC_GEMINI_API_KEY`
   - **Value**: `AIzaSyBM-Y35wMvSoDIczDPh5LDjtdm3cWb9ZW4` (Buraya kendi anahtarınızı yazın)
3. "Add" butonuna basın.

### Adım 5: Deploy
1. "Deploy" butonuna basın.
2. Vercel, projenizi otomatik olarak derleyecek ve yayınlayacaktır.
3. İşlem bittiğinde size `.vercel.app` uzantılı bir link verecektir. Bu linki herkesle paylaşabilirsiniz! 🚀

## 3. Yerel Çalışma (Local Development)

Kendi bilgisayarınızda çalışmaya devam etmek için:
1. Proje ana dizininde `.env.local` adında bir dosya oluşturun.
2. İçine şunu yazın:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyBM-Y35wMvSoDIczDPh5LDjtdm3cWb9ZW4
   ```
3. Dosyayı kaydedin. Artık `npm run dev` komutuyla sorunsuz çalışabilirsiniz.
