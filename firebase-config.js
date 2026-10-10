// =======================================================
// إعدادات Firebase - استبدل القيم دي ببيانات مشروعك
// هتلاقيها في: Firebase Console > Project Settings > عام
// =======================================================
const firebaseConfig = {
  apiKey: "AIzaSyBIDeO7K4746PlfXMNz4J3Eq1_Z8g-nZD8",
  authDomain: "abokamel-academy.firebaseapp.com",
  projectId: "abokamel-academy",
  storageBucket: "abokamel-academy.firebasestorage.app",
  messagingSenderId: "1086938925421",
  appId: "1:1086938925421:web:50864e2ee701be0e23b264"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// تتحقق من حالة تسجيل الدخول في أي صفحة وتحدّث شكل الـ nav
auth.onAuthStateChanged(function (user) {
  const loginLink = document.getElementById("nav-login");
  const logoutLink = document.getElementById("nav-logout");
  const userLabel = document.getElementById("nav-user");

  if (user) {
    if (loginLink) loginLink.style.display = "none";
    if (logoutLink) logoutLink.style.display = "inline";
    if (userLabel) {
      userLabel.style.display = "inline";
      userLabel.textContent = user.email;
    }
  } else {
    if (loginLink) loginLink.style.display = "inline";
    if (logoutLink) logoutLink.style.display = "none";
    if (userLabel) userLabel.style.display = "none";

    // لو الصفحة محتاجة تسجيل دخول إجباري، حط data-protected على body
    if (document.body.hasAttribute("data-protected")) {
      window.location.href = "login.html";
    }
  }
});

function logout() {
  auth.signOut().then(function () {
    window.location.href = "index.html";
  });
}
