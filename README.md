# أكاديمية أبو كامل — دليل التشغيل

## الملفات
- `index.html` — الصفحة الرئيسية (بتعرض كل المواد من content-data.js تلقائيًا)
- `login.html` — تسجيل الدخول / إنشاء حساب
- `subject.html` — أبواب المادة (مثلاً فيجوال بيسك 6)
- `lesson.html` — محتوى الدرس + رابط فيديو يوتيوب + روابط الامتحانات
- `quiz.html` — صفحة امتحان عامة (شغالة لامتحان الدرس/الباب/الشامل حسب الرابط)
- `leaderboard.html` — ترتيب المتسابقين (شغالة لنفس الأنواع الثلاثة)
- `content-data.js` — **كل منهج فيجوال بيسك 6** (الأبواب، الشرح، أسئلة الامتحانات) — هنا بتضيف مواد جديدة
- `quiz-engine.js` / `leaderboard.js` — المنطق البرمجي للامتحانات والترتيب
- `style.css` — التصميم
- `firebase-config.js` — إعدادات ربط الموقع بـ Firebase (لازم تعدّلها قبل ما تشتغل)

## إزاي تضيف مادة جديدة (غير فيجوال بيزك)
افتح `content-data.js` وانسخ كتلة الـ subject بتاعة `vb6` بالكامل، وحط بعدها فاصلة `,` وغيّر فيها:
- `id`: اسم مختصر بالإنجليزي للمادة (مثلاً `"c-plus"`)
- `title`, `description`
- `chapters`: أبواب المادة الجديدة، كل باب فيه `content` (الشرح) و`lessonQuiz` و`chapterQuiz`

مش محتاج تلمس أي صفحة HTML تانية — كل الصفحات بتتولد تلقائيًا من البيانات دي.

## الخطوات بالترتيب

### ١. جهّز حساب Firebase (مجاني)
1. روح على https://console.firebase.google.com وسجّل دخول بحساب Gmail
2. دوس **Add project** واديله اسم زي `abukamel-academy`
3. من القائمة الجانبية: **Build > Authentication** → **Get started** → فعّل **Email/Password**
4. من القائمة الجانبية: **Build > Firestore Database** → **Create database** → اختار **Start in test mode** (نظبط الصلاحيات بعدين)
5. ارجع لإعدادات المشروع (الترس بجانب Project Overview) → **Project settings** → نزّل لتحت لحد **Your apps** → دوس أيقونة **</>** (Web) → سمّي التطبيق وسجّله
6. هيديك كود فيه `firebaseConfig` — انسخ القيم دي

### ٢. حط بيانات Firebase في الموقع
افتح `firebase-config.js` واستبدل القيم في `firebaseConfig` بالقيم اللي نسختها من Firebase.

### ٣. جرب الموقع محليًا (اختياري)
افتح `index.html` بالمتصفح مباشرة، أو استخدم إضافة Live Server لو بتستخدم VS Code.

### ٤. ارفع المشروع على GitHub
```
git init
git add .
git commit -m "أول رفعة للموقع"
git branch -M main
git remote add origin رابط-الريبو-بتاعك
git push -u origin main
```

### ٥. استضف الموقع مجانًا
روح لـ **Settings > Pages** في الريبو، اختار الـ branch `main`، واحفظ. هتاخد رابط شكله:
`https://username.github.io/اسم-الريبو`

### ٦. مهم: اربط النطاق بـ Firebase
في Firebase Console → Authentication → Settings → **Authorized domains** → ضيف رابط GitHub Pages بتاعك، وإلا تسجيل الدخول مش هيشتغل من بره.

### ٧. سجّل الموقع في جوجل
افتح https://search.google.com/search-console وسجّل رابط موقعك، وابعت الـ sitemap.

## ملاحظات أمان
- بيانات تسجيل الدخول (كلمات المرور) بتتخزن ومتشفرة عند Firebase نفسه، مش عندك — ده الأضمن وملوش علاقة بيك تطوّره بنفسك.
- بعد ما تخلص تجربة، غيّر قواعد Firestore من "test mode" لقواعد حقيقية.

## قواعد Firestore المقترحة (Rules)
من Firebase Console → Firestore Database → تبويب **Rules**، حط القواعد دي بدل الافتراضية:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /students/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /attempts/{attemptId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

القواعد دي بتسمح لأي طالب مسجّل دخول إنه يشوف الترتيب (read)، لكن يقدر يحفظ نتيجته هو بس (create بشرط uid بتاعه)، ومحدش يقدر يعدّل أو يمسح نتيجة بعد ما تتسجل.

## ملاحظة عن لوحة الترتيب (Leaderboard)
أول مرة تفتح فيها صفحة `leaderboard.html`، ممكن تلاقي في الـ Console (F12) رسالة من Firebase فيها رابط لإنشاء **index** للاستعلام. افتح الرابط ده واضغط Create — ده إجراء تلقائي من Firebase وهياخد دقيقة أو اتنين بس.

## محتوى الفيديوهات
روابط اليوتيوب في الموقع بتوديك لصفحة **نتائج بحث** عن موضوع كل درس (مش فيديو محدد)، عشان تختار إنت الفيديو اللي يناسب أسلوبك، أو تقدر تستبدلها بروابط فيديوهاتك الخاصة من `content-data.js` (الحقل `videoSearch` لكل باب).
