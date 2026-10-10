// =========================================================================
// محرك لوحة الترتيب - يُستخدم في leaderboard.html و ranking.html
// =========================================================================

function lbGetParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function lbTitle(subjectId, chapterId, type) {
  const subject = getSubject(subjectId);
  if (type === "final") return "الترتيب الشامل - " + (subject ? subject.title : "");
  const chapter = getChapter(subjectId, chapterId);
  if (!chapter) return "الترتيب";
  return (type === "lesson" ? "ترتيب امتحان الدرس: " : "ترتيب امتحان الباب: ") + chapter.title;
}

// الدالة الأساسية: بتجيب النتائج وتعرضها جوه أي عنصر تحدده (targetId)
function lbRender(subjectId, chapterId, type, targetId) {
  const listEl = document.getElementById(targetId);
  listEl.innerHTML = "<p>بنجيب النتايج...</p>";

  let query = db.collection("attempts")
    .where("subjectId", "==", subjectId)
    .where("type", "==", type);

  if (type !== "final") {
    query = query.where("chapterId", "==", Number(chapterId));
  }

  query = query.orderBy("score", "desc").limit(100);

  query.get().then(function (snapshot) {
    let rows = [];
    snapshot.forEach(function (doc) {
      rows.push(doc.data());
    });

    rows.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.durationSeconds - b.durationSeconds;
    });

    rows = rows.slice(0, 20);

    if (rows.length === 0) {
      listEl.innerHTML = "<p>لسه محدش عمل الامتحان ده. يلا كن أول واحد!</p>";
      return;
    }

    let html = `<table class="lb-table"><thead><tr>
      <th>#</th><th>الطالب</th><th>النتيجة</th><th>الوقت</th>
    </tr></thead><tbody>`;

    rows.forEach(function (r, i) {
      const name = r.displayName || (r.email ? r.email.split("@")[0] : "طالب");
      const avatar = r.avatar || "🧑‍🎓";
      html += `<tr${i < 3 ? ' class="lb-top"' : ''}>
        <td>${i + 1}</td>
        <td><span class="lb-who"><span class="lb-avatar">${avatar}</span> ${name}</span></td>
        <td>${r.score}/${r.total}</td>
        <td>${r.durationSeconds} ث</td>
      </tr>`;
    });

    html += "</tbody></table>";
    listEl.innerHTML = html;
  }).catch(function (err) {
    console.error(err);
    listEl.innerHTML = "<p>حصل خطأ في تحميل الترتيب. لو ده أول مرة، ممكن Firestore يحتاج إنشاء index — افتح الـ console (F12) هتلاقي رابط لإنشائه تلقائيًا.</p>";
  });
}

// يُستخدم في leaderboard.html - بيقرأ الباراميترز من رابط الصفحة
function lbLoad() {
  const subjectId = lbGetParam("subject");
  const chapterId = lbGetParam("chapter");
  const type = lbGetParam("type");
  document.getElementById("lb-title").textContent = lbTitle(subjectId, chapterId, type);
  lbRender(subjectId, chapterId, type, "lb-list");
}
