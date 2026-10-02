const defaultNames = [
  "Nguyễn Văn An",
  "Trần Văn Bình",
  "Lê Minh Châu",
  "Phạm Đức Duy",
  "Hoàng Gia Huy",
  "Nguyễn Thị Lan",
  "Vũ Minh Long",
  "Đỗ Quang Nam",
  "Trần Thông"
];

const key = "llcttt1_attendance_v5";

let data = JSON.parse(localStorage.getItem(key) || "null");

if (!data || !Array.isArray(data.members)) {
  data = {
    members: [...defaultNames],
    sessions: [],
    current: -1,
    competition: {}
  };

  save();
}

if (!Array.isArray(data.sessions)) {
  data.sessions = [];
}

if (typeof data.current !== "number") {
  data.current = -1;
}

if (!data.competition || typeof data.competition !== "object") {
  data.competition = {};
}

let now = new Date();

let competitionMonth =
  now.getFullYear() +
  "-" +
  String(now.getMonth() + 1).padStart(2, "0");


/* =========================
   LƯU DỮ LIỆU
========================= */

function save() {
  localStorage.setItem(key, JSON.stringify(data));
}


/* =========================
   CHỐNG HTML LỖI
========================= */

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m];
  });
}


/* =========================
   BUỔI HỌC HIỆN TẠI
========================= */

function getCurrentSession() {

  if (
    data.current < 0 ||
    !data.sessions[data.current]
  ) {
    return null;
  }

  return data.sessions[data.current];
}


/* =========================
   HIỂN THỊ CHÍNH
========================= */

function render() {

  const s = getCurrentSession();

  const createBtn =
    document.querySelector("#attendance .top .btn");

  if (createBtn) {
    createBtn.textContent = "＋ Tạo buổi học";
    createBtn.onclick = createSession;
  }


  /* CHƯA CÓ BUỔI HỌC */

  if (!s) {

    document.getElementById("sessionTitle").textContent =
      "Chưa có buổi học";

    document.getElementById("sessionDate").textContent =
      "Hãy bấm “＋ Tạo buổi học” để bắt đầu.";

    document.getElementById("list").innerHTML = `

      <div style="text-align:center;padding:25px 10px">

        <div style="font-size:42px">📅</div>

        <h3>Chưa có buổi học nào</h3>

        <p class="small">
          Website sẽ không tự tạo buổi học.
        </p>

        <button
          class="btn"
          onclick="createSession()"
        >
          ＋ Tạo buổi học
        </button>

      </div>

    `;

    document.getElementById("total").textContent =
      data.members.length;

    document.getElementById("present").textContent = "0";

    document.getElementById("absent").textContent =
      data.members.length;

    renderSessions();
    renderMembers();
    renderCompetition();

    return;
  }


  /* CÓ BUỔI HỌC */

  document.getElementById("sessionTitle").textContent =
    s.label;

  document.getElementById("sessionDate").textContent =
    new Date(s.date).toLocaleDateString("vi-VN");


  const searchInput =
    document.getElementById("search");

  const q =
    searchInput ?
    searchInput.value.toLowerCase() :
    "";


  const shown = data.members
    .map((name, index) => ({
      name: name,
      index: index
    }))
    .filter(function (item) {
      return item.name.toLowerCase().includes(q);
    });


  document.getElementById("list").innerHTML =
    shown.length

      ? shown.map(function (item) {

          return `

            <div class="row">

              <span class="member-name">
                ${item.index + 1}.
                ${escapeHtml(item.name)}
              </span>

              <button
                class="badge ${
                  s.attendance[item.index]
                    ? "present"
                    : "absent"
                }"
                onclick="toggle(${item.index})"
              >

                ${
                  s.attendance[item.index]
                    ? "✓ Có mặt"
                    : "✕ Vắng"
                }

              </button>

            </div>

          `;

        }).join("")

      : "<p>Không tìm thấy thành viên.</p>";


  const present =
    s.attendance.filter(Boolean).length;


  document.getElementById("total").textContent =
    data.members.length;

  document.getElementById("present").textContent =
    present;

  document.getElementById("absent").textContent =
    data.members.length - present;


  renderSessions();
  renderMembers();
  renderCompetition();
}


/* =========================
   TẠO BUỔI HỌC
========================= */

function createSession() {

  const label = prompt(
    "Nhập tên buổi học:",
    `Buổi học ${data.sessions.length + 1}`
  );

  if (label === null) {
    return;
  }

  const cleanLabel = label.trim();

  if (!cleanLabel) {
    alert("Tên buổi học không được để trống.");
    return;
  }


  const today =
    new Date().toLocaleDateString("vi-VN");


  const dateInput = prompt(
    "Nhập ngày học theo dạng DD/MM/YYYY:",
    today
  );

  if (dateInput === null) {
    return;
  }


  const parts =
    dateInput.trim().split(/[\/\-.]/);


  if (parts.length !== 3) {

    alert(
      "Vui lòng nhập ngày theo dạng DD/MM/YYYY."
    );

    return;
  }


  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const y = parseInt(parts[2], 10);


  const date =
    new Date(y, m - 1, d);


  if (
    isNaN(date.getTime()) ||
    date.getDate() !== d ||
    date.getMonth() !== m - 1 ||
    date.getFullYear() !== y
  ) {

    alert("Ngày học không hợp lệ.");

    return;
  }


  data.sessions.push({

    date: date.toISOString(),

    label: cleanLabel,

    attendance:
      Array(data.members.length).fill(false)

  });


  data.current =
    data.sessions.length - 1;


  save();

  render();
}


/* =========================
   ĐIỂM DANH
========================= */

function toggle(index) {

  const s = getCurrentSession();

  if (!s) {

    alert(
      "Bạn hãy tạo buổi học trước."
    );

    return;
  }


  s.attendance[index] =
    !s.attendance[index];


  save();

  render();
}


/* =========================
   THỐNG KÊ BUỔI HỌC
========================= */

function renderSessions() {

  const box =
    document.getElementById("sessionList");


  if (!box) {
    return;
  }


  if (!data.sessions.length) {

    box.innerHTML =
      '<p class="small">Chưa có buổi học nào.</p>';

  } else {

    let totalPresent = 0;
    let totalCount = 0;


    box.innerHTML =
      data.sessions.map(function (s, i) {

        const present =
          s.attendance.filter(Boolean).length;


        totalPresent += present;
        totalCount += s.attendance.length;


        const pct =
          s.attendance.length
            ? Math.round(
                present /
                s.attendance.length *
                100
              )
            : 0;


        return `

          <div class="session">

            <b>
              ${escapeHtml(s.label)}
            </b>

            <div>
              ${new Date(s.date)
                .toLocaleDateString("vi-VN")}
            </div>

            <div>
              ${present}/${s.attendance.length}
              có mặt (${pct}%)
            </div>

            <div class="bar">

              <div
                class="fill"
                style="width:${pct}%"
              ></div>

            </div>


            <div
              class="actions"
              style="margin-top:9px"
            >

              <button
                class="btn"
                onclick="selectSession(${i})"
              >
                Mở buổi này
              </button>

              <button
                class="btn red"
                onclick="deleteSession(${i})"
              >
                🗑️ Xóa buổi
              </button>

            </div>

          </div>

        `;

      }).join("");


    document.getElementById("average").textContent =
      totalCount
        ? Math.round(
            totalPresent /
            totalCount *
            100
          ) + "%"
        : "0%";
  }


  document.getElementById("sessionCount").textContent =
    data.sessions.length;

  document.getElementById("memberCount").textContent =
    data.members.length;


  if (!data.sessions.length) {

    document.getElementById("average").textContent =
      "0%";
  }
}


/* =========================
   MỞ BUỔI HỌC
========================= */

function selectSession(index) {

  data.current = index;

  save();

  showTab("attendance");
}


/* =========================
   XÓA BUỔI HỌC
========================= */

function deleteSession(index) {

  const session =
    data.sessions[index];


  if (!session) {
    return;
  }


  const ok = confirm(

    `Bạn có chắc muốn xóa "${session.label}" không?\n\n` +
    `Dữ liệu điểm danh của buổi này cũng sẽ bị xóa.`

  );


  if (!ok) {
    return;
  }


  data.sessions.splice(index, 1);


  if (data.sessions.length === 0) {

    data.current = -1;

  } else if (data.current === index) {

    data.current =
      Math.min(
        index,
        data.sessions.length - 1
      );

  } else if (data.current > index) {

    data.current--;
  }


  save();

  render();
}


/* =========================
   CHUYỂN TAB
========================= */

function showTab(tab) {

  document
    .querySelectorAll(".tabs button")
    .forEach(function (button) {

      button.classList.toggle(
        "active",
        button.dataset.tab === tab
      );

    });


  [
    "attendance",
    "sessions",
    "members",
    "competition"
  ].forEach(function (id) {

    document.getElementById(id).style.display =
      id === tab
        ? "block"
        : "none";

  });


  render();
}


document
  .querySelectorAll(".tabs button")
  .forEach(function (button) {

    button.onclick = function () {
      showTab(button.dataset.tab);
    };

  });


/* =========================
   QUẢN LÝ THÀNH VIÊN
========================= */

function renderMembers() {

  const box =
    document.getElementById("memberList");


  if (!box) {
    return;
  }


  box.innerHTML =
    data.members.length

      ? data.members.map(function (name, index) {

          return `

            <div class="row">

              <span class="member-name">

                ${index + 1}.
                ${escapeHtml(name)}

              </span>


              <div class="actions">

                <button
                  class="btn gray"
                  onclick="renameMember(${index})"
                >
                  ✏️ Đổi tên
                </button>


                <button
                  class="btn red"
                  onclick="deleteMember(${index})"
                >
                  🗑️ Xóa
                </button>

              </div>

            </div>

          `;

        }).join("")

      : "<p>Chưa có thành viên.</p>";
}


/* =========================
   THÊM THÀNH VIÊN
========================= */

function addMember() {

  const input =
    document.getElementById("newMember");


  const name =
    input.value.trim();


  if (!name) {

    alert(
      "Bạn chưa nhập tên."
    );

    return;
  }


  if (
    data.members.some(function (n) {

      return n.toLowerCase() ===
        name.toLowerCase();

    })
  ) {

    alert(
      "Tên này đã có trong danh sách."
    );

    return;
  }


  data.members.push(name);


  data.sessions.forEach(function (session) {

    session.attendance.push(false);

  });


  input.value = "";

  save();

  render();
}


/* =========================
   ĐỔI TÊN
========================= */

function renameMember(index) {

  const oldName =
    data.members[index];


  const name =
    prompt(
      "Đổi tên thành viên:",
      oldName
    );


  if (name === null) {
    return;
  }


  const clean =
    name.trim();


  if (!clean) {

    alert(
      "Tên không được để trống."
    );

    return;
  }


  if (
    data.members.some(function (n, i) {

      return (
        i !== index &&
        n.toLowerCase() ===
        clean.toLowerCase()
      );

    })
  ) {

    alert(
      "Tên này đã có trong danh sách."
    );

    return;
  }


  data.members[index] =
    clean;


  save();

  render();
}


/* =========================
   XÓA THÀNH VIÊN
========================= */

function deleteMember(index) {

  const ok =
    confirm(
      `Xóa "${data.members[index]}" khỏi danh sách?`
    );


  if (!ok) {
    return;
  }


  data.members.splice(index, 1);


  data.sessions.forEach(function (session) {

    session.attendance.splice(index, 1);

  });


  save();

  render();
}


/* ==================================
   THANH THI ĐUA THEO THÁNG
================================== */


/* Lấy tháng từ ngày */

function monthKeyFromDate(date) {

  const d =
    new Date(date);


  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0")
  );
}


/* Hiển thị tháng */

function formatCompetitionMonth(key) {

  const parts =
    key.split("-").map(Number);


  const year = parts[0];
  const month = parts[1];


  return `THÁNG ${month}/${year}`;
}


/* Lấy điểm tháng */

function getScores(key) {

  if (!data.competition[key]) {

    data.competition[key] = {};

  }


  data.members.forEach(function (name) {

    if (
      typeof data.competition[key][name]
      !== "number"
    ) {

      data.competition[key][name] = 0;

    }

  });


  return data.competition[key];
}


/* Tháng trước / tháng sau */

function changeCompetitionMonth(delta) {

  const parts =
    competitionMonth
      .split("-")
      .map(Number);


  const year = parts[0];
  const month = parts[1];


  const d =
    new Date(
      year,
      month - 1 + delta,
      1
    );


  competitionMonth =
    d.getFullYear() +
    "-" +
    String(
      d.getMonth() + 1
    ).padStart(2, "0");


  renderCompetition();
}


/* Cộng / trừ điểm */

function adjustScore(name, amount) {

  const scores =
    getScores(competitionMonth);


  scores[name] =
    Math.max(
      0,
      (scores[name] || 0) + amount
    );


  save();

  renderCompetition();
}


/* Reset điểm tháng */

function resetCompetitionMonth() {

  const ok =
    confirm(
      `Đặt lại toàn bộ điểm của ${formatCompetitionMonth(competitionMonth)} về 0?`
    );


  if (!ok) {
    return;
  }


  const scores =
    getScores(competitionMonth);


  data.members.forEach(function (name) {

    scores[name] = 0;

  });


  save();

  renderCompetition();
}


/* Giải */

function getPrize(rank, total) {

  if (rank === 1) {
    return "🏆 Giải Nhất";
  }

  if (rank === 2) {
    return "🥈 Giải Nhì";
  }

  if (rank === 3) {
    return "🥉 Giải Ba";
  }

  if (
    total >= 4 &&
    rank <= Math.max(
      4,
      Math.ceil(total / 3)
    )
  ) {

    return "🏅 Khuyến khích";
  }


  return "";
}


/* =========================
   HIỂN THỊ THANH THI ĐUA
========================= */

function renderCompetition() {

  const title =
    document.getElementById(
      "competitionMonth"
    );


  const box =
    document.getElementById(
      "competitionList"
    );


  if (!title || !box) {
    return;
  }


  title.textContent =
    formatCompetitionMonth(
      competitionMonth
    );


  const scores =
    getScores(
      competitionMonth
    );


  const ranked =
    data.members
      .map(function (name) {

        return {
          name: name,
          score: scores[name] || 0
        };

      })
      .sort(function (a, b) {

        return (
          b.score - a.score ||
          a.name.localeCompare(
            b.name,
            "vi"
          )
        );

      });


  const maxScore =
    Math.max(
      10,
      ...ranked.map(
        function (item) {
          return item.score;
        }
      )
    );


  if (!ranked.length) {

    box.innerHTML =
      "<p>Chưa có thành viên.</p>";

    return;
  }


  box.innerHTML =
    ranked.map(function (item, index) {

      const rank =
        index + 1;


      const width =
        Math.min(
          100,
          Math.max(
            0,
            item.score /
            maxScore *
            100
          )
        );


      const prize =
        getPrize(
          rank,
          ranked.length
        );


      let medal;


      if (rank === 1) {
        medal = "🥇";
      } else if (rank === 2) {
        medal = "🥈";
      } else if (rank === 3) {
        medal = "🥉";
      } else {
        medal = `#${rank}`;
      }


      return `

        <div class="rank-card">

          <div class="rank-head">

            <div>

              <span class="rank-medal">
                ${medal}
              </span>

              <span class="rank-name">
                ${escapeHtml(item.name)}
              </span>

              ${
                prize
                  ? `
                    <div class="prize">
                      ${prize}
                    </div>
                  `
                  : ""
              }

            </div>


            <div class="rank-score">
              ${item.score} điểm
            </div>

          </div>


          <div class="rank-bar">

            <div
              class="rank-fill"
              style="width:${width}%"
            ></div>

          </div>


          <div class="score-actions">

            <button
              class="score-btn minus"
              onclick="adjustScore(${JSON.stringify(item.name)}, -10)"
            >
              −10
            </button>


            <button
              class="score-btn minus"
              onclick="adjustScore(${JSON.stringify(item.name)}, -5)"
            >
              −5
            </button>


            <button
              class="score-btn plus"
              onclick="adjustScore(${JSON.stringify(item.name)}, 5)"
            >
              +5
            </button>


            <button
              class="score-btn plus"
              onclick="adjustScore(${JSON.stringify(item.name)}, 10)"
            >
              +10
            </button>

          </div>

        </div>

      `;

    }).join("");
}


/* =========================
   KHỞI ĐỘNG
========================= */

render();
