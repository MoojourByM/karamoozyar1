# معرفی فنی Backend سامانه کارآموزیار

این سند برای ارائهٔ فنی کوتاه دربارهٔ backend پروژه آماده شده است. backend با
Django 5.2 و Django REST Framework ساخته شده و داده‌ها را از طریق APIهای JSON
در اختیار frontend قرار می‌دهد.

## ۱. معماری کلی

```text
Client (Next.js)
       |
       | HTTP + JSON + Bearer JWT
       v
Config / URL Router
       |
       +--> accounts: کاربران، نقش‌ها و پروفایل‌ها
       |
       +--> internships: فرصت‌ها، درخواست‌ها و معرفی‌نامه‌ها
       |
       v
 Django ORM --> SQLite در توسعه / PostgreSQL در استقرار
```

فایل `backend/manage.py` نقطهٔ ورود فرمان‌های Django است و تنظیمات اصلی در
`backend/config/settings.py` قرار دارد. مسیرهای عمومی پروژه در
`backend/config/urls.py` به دو اپلیکیشن اصلی متصل شده‌اند.

## ۲. تنظیمات اصلی Django

در `settings.py` موارد زیر کنترل می‌شوند:

- `INSTALLED_APPS`: فعال‌سازی Django، REST Framework، JWT، CORS و اپ‌های محلی.
- `MIDDLEWARE`: امنیت، session، CORS، CSRF و WhiteNoise برای فایل‌های static.
- `AUTH_USER_MODEL = "accounts.User"`: استفاده از مدل کاربر سفارشی.
- `DATABASES`: انتخاب PostgreSQL با متغیرهای محیطی و fallback به SQLite.
- `REST_FRAMEWORK`: احراز هویت JWT، session authentication و pagination.
- `STATIC_ROOT` و `MEDIA_ROOT`: تفکیک فایل‌های قابل‌انتشار از فایل‌های آپلودی.

در محیط production مقدارهای secret، دامنه‌ها و originها باید از environment
خوانده شوند و نباید در کد ثابت قرار بگیرند.

## ۳. مدل‌های داده

### اپ accounts

`User` از `AbstractUser` ارث می‌برد و ورود با email را فعال می‌کند. فیلد `role`
سه نقش اصلی را مشخص می‌کند: دانشجو، شرکت و مدیر سیستم.

`Student` و `Company` رابطهٔ یک‌به‌یک با کاربر دارند. این انتخاب باعث می‌شود
اطلاعات عمومی حساب از اطلاعات تخصصی پروفایل جدا بماند. وضعیت شرکت (`pending`,
`approved`, `rejected`) نیز قبل از نمایش عمومی یا ثبت فرصت بررسی می‌شود.

### اپ internships

- `Internship`: فرصت کارآموزی متعلق به یک شرکت.
- `Application`: درخواست یک دانشجو برای یک فرصت؛ ترکیب فرصت و دانشجو یکتا است.
- `Letter`: معرفی‌نامهٔ صادرشده برای یک درخواست پذیرفته‌شده.

Propertyهای `accepted_count` و `remaining_capacity` ظرفیت باقی‌مانده را از روی
درخواست‌های پذیرفته‌شده محاسبه می‌کنند و در serializer به پاسخ API اضافه می‌شوند.

## ۴. Serializerها؛ مرز دادهٔ API

Serializerها مسئول تبدیل مدل Django به JSON و اعتبارسنجی ورودی هستند:

- `RegisterSerializer` رمز عبور را validate و hash می‌کند و پروفایل اولیه را
  خودکار می‌سازد.
- `StudentUpdateSerializer` و `CompanyUpdateSerializer` فقط فیلدهای قابل‌ویرایش
  را می‌پذیرند.
- `ApplicationCreateSerializer` از ثبت درخواست تکراری جلوگیری می‌کند.
- `ApplicationReviewSerializer` تغییر وضعیت را به دو مقدار معتبر محدود می‌کند.
- serializerهای خواندنی، اطلاعات شرکت و دانشجو را به شکل nested برمی‌گردانند.

این جداسازی از آن جلوگیری می‌کند که کاربر مستقیماً فیلدهایی مانند مالک فرصت،
نقش حساب یا وضعیت تأیید شرکت را تغییر دهد.

## ۵. Viewها و کنترل دسترسی

Viewهای accounts ثبت‌نام، اطلاعات کاربر فعلی، پروفایل‌ها و بررسی شرکت‌ها را
ارائه می‌کنند. Viewهای internships نیز CRUD فرصت‌ها، ارسال و لغو درخواست،
بررسی درخواست‌ها و صدور معرفی‌نامه را مدیریت می‌کنند.

کلاس‌های permission محلی مسیرها را بر اساس نقش محدود می‌کنند:

- `IsStudent`: عملیات مربوط به دانشجو.
- `IsCompany`: مدیریت فرصت و بررسی درخواست‌های شرکت.
- `IsAdmin`: مدیریت شرکت‌ها، جایابی‌ها و معرفی‌نامه‌ها.

علاوه بر permission، querysetها نیز به کاربر فعلی محدود می‌شوند؛ برای نمونه یک
شرکت فقط فرصت‌های متعلق به خودش را می‌بیند. این لایهٔ دوم از افشای داده با
تغییر شناسهٔ URL جلوگیری می‌کند.

## ۶. مسیرهای مهم API

| قابلیت | مسیر | روش |
| --- | --- | --- |
| سلامت API | `/api/` | `GET` |
| ثبت‌نام | `/api/auth/register/` | `POST` |
| کاربر جاری | `/api/auth/me/` | `GET` |
| فهرست فرصت‌ها | `/api/internships/` | `GET` |
| جزئیات فرصت | `/api/internships/<id>/` | `GET` |
| پروفایل دانشجو | `/api/accounts/student/profile/` | `GET`, `PATCH` |
| پروفایل شرکت | `/api/accounts/company/profile/` | `GET`, `PATCH` |
| درخواست کارآموزی | `/api/internships/student/apply/<id>/` | `POST` |
| بررسی شرکت‌ها | `/api/admin/companies/` | `GET`, `POST` |

احراز هویت مسیرهای محافظت‌شده با header زیر انجام می‌شود:

```http
Authorization: Bearer <access-token>
```

## ۷. جریان نمونهٔ کسب‌وکار

۱. کاربر با نقش دانشجو یا شرکت ثبت‌نام می‌کند و backend پروفایل اولیه را
می‌سازد.

۲. مدیر شرکت را تأیید می‌کند.

۳. شرکت تأییدشده فرصت کارآموزی ایجاد می‌کند.

۴. دانشجو فرصت فعال را می‌بیند و درخواست ارسال می‌کند؛ constraint دیتابیس از
درخواست تکراری جلوگیری می‌کند.

۵. شرکت درخواست را می‌پذیرد یا رد می‌کند.

۶. مدیر برای درخواست پذیرفته‌شده معرفی‌نامه صادر می‌کند.

## ۸. اجرای محلی و کنترل کیفیت

```bash
cd backend
python manage.py migrate
python manage.py check
python manage.py test
python manage.py runserver
```

برای frontend:

```bash
npm run lint
npm run typecheck
npm run build
```

در توسعه، SQLite انتخاب می‌شود؛ برای محیط production باید PostgreSQL و مقادیر
محیطی امن استفاده شوند. endpoint سلامت `/api/` برای بررسی سریع در دسترس بودن
backend مناسب است.