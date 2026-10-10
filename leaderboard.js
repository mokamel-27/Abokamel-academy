// محرك لوحة الترتيب - الدرجة الأعلى أولًا ثم الوقت الأقل (أفضل محاولة لكل طالب)
function lbGetParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function lbTitle(subjectId, chapterId, type) {
  const subject = getSubject(subjectId);
  if (type === "final") return "ترتيب الامتحان الشامل - " + (subject ? subject.title : "");
  if (type === "part1") return "ترتيب امتحان الأبواب 1 إلى 5";
  if (type === "part2") return "ترتيب امتحان الأبواب 6 إلى 10";
  const chapter = getChapter(subjectId, chapterId);
  if (!chapter) return "الترتيب";
  return (type === "lesson" ? "ترتيب امتحان الدرس: " : "ترتيب امتحان الباب: ") + chapter.title;
}

function lbRender(subjectId, chapterId, type, targetId) {
  const listEl = document.getElementById(targetId);
  listEl.innerHTML = "<p>بنجيب النتايج...</p>";

  let query = db.collection("attempts").where("subjectId", "==", subjectId).where("type", "==", type);
  if (type === "lesson" || type === "chapter") {
    query = query.where("chapterId", "==", Number(chapterId));
  }
  query = query.orderBy("score", "desc").limit(300);

  query.get().then(function (snapshot) {
    const best = {};
    snapshot.forEach(function (doc) {
      const r = doc.data();
      const old = best[r.uid];
      if (!old || r.score > old.score || (r.score === old.score && r.durationSeconds < old.durationSeconds)) best[r.uid] = r;
    });
    let rows = Object.keys(best).map(function (k) { return best[k]; });
    rows.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.durationSeconds - b.durationSeconds;
    });
    rows = rows.slice(0, 20);

    if (rows.length === 0) {
      listEl.innerHTML = "<p>لسه محدش عمل الامتحان ده. يلا كن أول واحد! 🏆</p>";
      return;
    }
    const medals = ["🥇", "🥈", "🥉"];
    let html = '<table class="lb-table"><thead><tr><th>#</th><th>الطالب</th><th>الدرجة</th><th>الوقت</th></tr></thead><tbody>';
    rows.forEach(function (r, i) {
      const name = r.displayName || (r.email ? r.email.split("@")[0] : "طالب");
      const m = Math.floor(r.durationSeconds / 60), s = r.durationSeconds % 60;
      html += '<tr' + (i < 3 ? ' class="lb-top"' : '') + '><td>' + (medals[i] || i + 1) + '</td>' +
        '<td><span class="lb-who"><span class="lb-avatar">' + avatarHtml(r.avatar) + '</span>' + name + '</span></td>' +
        '<td>' + r.score + '/' + r.total + '</td><td>' + (m ? m + ' د ' : '') + s + ' ث</td></tr>';
    });
    listEl.innerHTML = html + "</tbody></table>";
  }).catch(function (err) {
    console.error(err);
    listEl.innerHTML = "<p>حصل خطأ في تحميل الترتيب. لو ده أول مرة، افتح الـ console (F12) هتلاقي رابط لإنشاء index تلقائيًا، اضغط عليه وانتظر دقيقتين.</p>";
  });
}

function lbLoad() {
  const subjectId = lbGetParam("subject"), chapterId = lbGetParam("chapter"), type = lbGetParam("type");
  document.getElementById("lb-title").textContent = lbTitle(subjectId, chapterId, type);
  lbRender(subjectId, chapterId, type, "lb-list");
}
