// =========================================================================
// محرك الامتحانات - يُستخدم في quiz.html
// بيقرأ subject/chapter/type من رابط الصفحة، يعرض الأسئلة، يحسب النتيجة
// والوقت، ويحفظهم في Firestore عشان يظهروا في صفحة الترتيب (leaderboard)
// =========================================================================

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

const QZ_subjectId = getParam("subject");
const QZ_chapterId = getParam("chapter"); // ممكن تكون null في حالة type=final
const QZ_type = getParam("type"); // "lesson" | "chapter" | "final"

let QZ_questions = [];
let QZ_startTime = null;

function qzLoadQuestions() {
  const subject = getSubject(QZ_subjectId);
  if (!subject) return [];

  if (QZ_type === "final") {
    return buildFinalExam(QZ_subjectId);
  }
  if (QZ_type === "part1" || QZ_type === "part2") {
    const chs = QZ_type === "part1" ? subject.chapters.slice(0, 5) : subject.chapters.slice(5);
    let qs = [];
    chs.forEach(function (ch) {
      qs = qs.concat(ch.chapterQuiz.slice(0, 4));
    });
    return qs;
  }
  const chapter = getChapter(QZ_subjectId, QZ_chapterId);
  if (!chapter) return [];
  return QZ_type === "lesson" ? chapter.lessonQuiz : chapter.chapterQuiz;
}

function qzTitle() {
  const subject = getSubject(QZ_subjectId);
  if (QZ_type === "final") return "الامتحان الشامل - " + (subject ? subject.title : "");
  if (QZ_type === "part1") return "امتحان الأبواب 1 إلى 5";
  if (QZ_type === "part2") return "امتحان الأبواب 6 إلى 10";
  const chapter = getChapter(QZ_subjectId, QZ_chapterId);
  if (!chapter) return "امتحان";
  return (QZ_type === "lesson" ? "امتحان الدرس: " : "امتحان الباب: ") + chapter.title;
}

function qzRenderIntro() {
  document.getElementById("quiz-title").textContent = qzTitle();
  document.getElementById("quiz-count").textContent = QZ_questions.length;
}

function qzRenderQuestions() {
  const container = document.getElementById("quiz-questions");
  container.innerHTML = "";
  QZ_questions.forEach(function (q, idx) {
    const block = document.createElement("div");
    block.className = "qz-question";
    let optionsHtml = "";
    q.options.forEach(function (opt, oi) {
      optionsHtml += `
        <label class="qz-option">
          <input type="radio" name="q${idx}" value="${oi}" required>
          <span>${opt}</span>
        </label>`;
    });
    block.innerHTML = `<p class="qz-q-text">${idx + 1}. ${q.q}</p>${optionsHtml}`;
    container.appendChild(block);
  });
}

function qzStart() {
  QZ_questions = qzLoadQuestions();
  if (QZ_questions.length === 0) {
    document.getElementById("quiz-area").innerHTML = "<p>مفيش أسئلة متاحة لهذا الامتحان.</p>";
    return;
  }
  qzRenderIntro();
  qzRenderQuestions();
  QZ_startTime = Date.now();
}

function qzSubmit(e) {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  let correctCount = 0;
  QZ_questions.forEach(function (q, idx) {
    const picked = document.querySelector(`input[name="q${idx}"]:checked`);
    if (picked && Number(picked.value) === q.correct) correctCount++;
  });

  const durationSeconds = Math.round((Date.now() - QZ_startTime) / 1000);
  const total = QZ_questions.length;
  const score = correctCount;

  const resultBox = document.getElementById("quiz-result");
  document.getElementById("quiz-form").style.display = "none";
  resultBox.style.display = "block";
  resultBox.innerHTML = `
    <h2>نتيجتك</h2>
    <p class="qz-score">${score} / ${total}</p>
    <p>الوقت المستغرق: ${durationSeconds} ثانية</p>
    <a class="switch-link-btn" href="leaderboard.html?subject=${QZ_subjectId}&chapter=${QZ_chapterId || ""}&type=${QZ_type}">شوف ترتيب المتسابقين ←</a>
  `;

  db.collection("students").doc(user.uid).get().then(function (doc) {
    const profile = doc.exists ? doc.data() : {};
    return db.collection("attempts").add({
      uid: user.uid,
      email: user.email,
      displayName: profile.displayName || user.email.split("@")[0],
      avatar: profile.avatar || DEFAULT_AVATAR,
      subjectId: QZ_subjectId,
      chapterId: (QZ_type === "lesson" || QZ_type === "chapter") ? Number(QZ_chapterId) : null,
      type: QZ_type,
      score: score,
      total: total,
      durationSeconds: durationSeconds,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }).catch(function (err) {
    console.error("تعذر حفظ النتيجة:", err);
  });
}
