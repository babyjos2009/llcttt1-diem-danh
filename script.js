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

const key = "llcttt1_attendance_v4";

let data = JSON.parse(localStorage.getItem(key) || "null");

// Lần đầu mở web: chỉ tạo danh sách thành viên,
// KHÔNG tự tạo buổi học.
if (!data || !Array.isArray(data.members)) {
  data = {
    members: [...defaultNames],
    sessions: [],
    current: -1
  };
  save();
}

if (!Array.isArray(data.sessions)) {
  data.sessions = [];
}

if (typeof data.current !== "number") {
  data.current = -1;
}

function save() {
  localStorage.setItem(key, JSON.stringify(data));
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

function getCurrentSession() {
  if (data.current < 0 || !data.sessions[data.current]) {
    return null;
  }

  return data.sessions[data.current];
}

// =========================
// HIỂN THỊ ĐIỂM DANH
// =========================

function render() {
  const session = getCurrentSession();

  const createBtn = document.querySelector("#attendance .top .btn");

  if (createBtn) {
    createBtn.textContent = "＋ Tạo buổi học";
    createBtn.onclick = createSession;
  }

  // Chưa có buổi học
  if (!session) {
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
          Bạn hãy tự tạo khi cần điểm danh.
        </p>

        <button class="btn" onclick="createSession()">
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

    return;
  }

  // Có buổi học
  document.getElementById("sessionTitle").textContent =
    session.label;

  document.getElementById("sessionDate").textContent =
    new Date(session.date).toLocaleDateString("vi-VN");

  const search =
    (document.getElementById("search")?.value || "")
      .toLowerCase();

  const members = data.members
    .map((name, index) => ({
      name,
      index
    }))
    .filter(x =>
      x.name.toLowerCase().includes(search)
    );

  if (members.length) {

    document.getElementById("list").innerHTML =
      members.map(x => {

        const present =
          session.attendance[x.index];

        return `
          <div class="row">

            <span class="member-name">
              ${x.index + 1}.
              ${escapeHtml(x.name)}
            </span>

            <button
              class="badge ${present ? "present" : "absent"}"
              onclick="toggle(${x.index})"
            >
              ${present ? "✓ Có mặt" : "✕ Vắng"}
            </button>

          </div>
        `;

      }).join("");

  } else {

    document.getElementById("list").innerHTML =
      "<p>Không tìm thấy thành viên.</p>";
  }

  const presentCount =
    session.attendance.filter(Boolean).length;

  document.getElementById("total").textContent =
    data.members.length;

  document.getElementById("present").textContent =
    presentCount;

  document.getElementById("absent").textContent =
    data.members.length - presentCount;

  renderSessions();
  renderMembers();
}

// =========================
// TẠO BUỔI HỌC
// =========================

function createSession() {

  const defaultName =
    `Buổi học ${data.sessions.length + 1}`;

  const name = prompt(
    "Nhập tên buổi học:",
    defaultName
  );

  if (name === null) {
    return;
  }

  const cleanName = name.trim();

  if (!cleanName) {
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
      "Ngày không hợp lệ. Ví dụ: 02/10/2026"
    );

    return;
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  const date =
    new Date(year, month - 1, day);

  // Kiểm tra ngày thật sự hợp lệ
  if (
    isNaN(date.getTime()) ||
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year
  ) {

    alert("Ngày học không hợp lệ.");
    return;
  }

  const newSession = {
    label: cleanName,
    date: date.toISOString(),

    attendance:
      Array(data.members.length).fill(false)
  };

  data.sessions.push(newSession);

  data.current =
    data.sessions.length - 1;

  save();
  render();
}

// =========================
// ĐIỂM DANH
// =========================

function toggle(index) {

  const session =
    getCurrentSession();

  if (!session) {

    alert(
      "Bạn phải tạo buổi học trước."
    );

    return;
  }

  session.attendance[index] =
    !session.attendance[index];

  save();
  render();
}

// =========================
// THỐNG KÊ BUỔI HỌC
// =========================

function renderSessions() {

  const box =
    document.getElementById("sessionList");

  let totalPresent = 0;
  let totalAttendance = 0;

  if (!data.sessions.length) {

    box.innerHTML = `
      <div style="text-align:center;padding:20px">

        <div style="font-size:38px">
          📅
        </div>

        <p>
          Chưa có buổi học nào.
        </p>

        <button
          class="btn"
          onclick="showTab('attendance');createSession()"
        >
          ＋ Tạo buổi học
        </button>

      </div>
    `;

  } else {

    box.innerHTML =
      data.sessions.map((session, index) => {

        const present =
          session.attendance
            .filter(Boolean).length;

        totalPresent += present;

        totalAttendance +=
          session.attendance.length;

        const percent =
          session.attendance.length
            ? Math.round(
                present /
                session.attendance.length *
                100
              )
            : 0;

        return `

          <div class="session">

            <b>
              ${escapeHtml(session.label)}
            </b>

            <div class="small">
              📅
              ${new Date(session.date)
                .toLocaleDateString("vi-VN")}
            </div>

            <div style="margin:8px 0">

              ${present}/
              ${session.attendance.length}

              có mặt

              (${percent}%)

            </div>

            <div class="bar">

              <div
                class="fill"
                style="width:${percent}%"
              ></div>

            </div>

            <div
              class="actions"
              style="margin-top:10px"
            >

              <button
                class="btn"
                onclick="selectSession(${index})"
              >
                📝 Mở buổi này
              </button>

              <button
                class="btn red"
                onclick="deleteSession(${index})"
              >
                🗑️ Xóa buổi
              </button>

            </div>

          </div>

        `;

      }).join("");
  }

  document.getElementById("sessionCount")
    .textContent =
    data.sessions.length;

  document.getElementById("memberCount")
    .textContent =
    data.members.length;

  document.getElementById("average")
    .textContent =
    totalAttendance
      ? Math.round(
          totalPresent /
          totalAttendance *
          100
        ) + "%"
      : "0%";
}

// =========================
// MỞ BUỔI HỌC
// =========================

function selectSession(index) {

  data.current = index;

  save();

  showTab("attendance");
}

// =========================
// XÓA BUỔI HỌC
// =========================

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

  // Không còn buổi nào
  if (data.sessions.length === 0) {

    data.current = -1;

  }

  // Đang mở đúng buổi vừa xóa
  else if (data.current === index) {

    data.current =
      Math.min(
        index,
        data.sessions.length - 1
      );

  }

  // Xóa buổi nằm trước buổi đang mở
  else if (data.current > index) {

    data.current--;

  }

  save();
  render();
}

// =========================
// CHUYỂN TAB
// =========================

function showTab(tab) {

  document
    .querySelectorAll(".tabs button")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.tab === tab
      );

    });

  [
    "attendance",
    "sessions",
    "members"
  ].forEach(id => {

    document.getElementById(id)
      .style.display =
      id === tab
        ? "block"
        : "none";

  });

  render();
}

document
  .querySelectorAll(".tabs button")
  .forEach(button => {

    button.onclick = () =>
      showTab(button.dataset.tab);

  });

// =========================
// QUẢN LÝ THÀNH VIÊN
// =========================

function renderMembers() {

  const box =
    document.getElementById("memberList");

  if (!data.members.length) {

    box.innerHTML =
      "<p>Chưa có thành viên.</p>";

    return;
  }

  box.innerHTML =
    data.members.map((name, index) => `

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

    `).join("");
}

// =========================
// THÊM THÀNH VIÊN
// =========================

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

  const exists =
    data.members.some(
      member =>
        member.toLowerCase() ===
        name.toLowerCase()
    );

  if (exists) {

    alert(
      "Tên này đã có trong danh sách."
    );

    return;
  }

  data.members.push(name);

  // Thêm trạng thái vắng vào các buổi cũ
  data.sessions.forEach(session => {

    session.attendance.push(false);

  });

  input.value = "";

  save();
  render();
}

// =========================
// ĐỔI TÊN
// =========================

function renameMember(index) {

  const oldName =
    data.members[index];

  const newName =
    prompt(
      "Đổi tên thành viên:",
      oldName
    );

  if (newName === null) {
    return;
  }

  const clean =
    newName.trim();

  if (!clean) {

    alert(
      "Tên không được để trống."
    );

    return;
  }

  const exists =
    data.members.some(
      (member, i) =>
        i !== index &&
        member.toLowerCase() ===
        clean.toLowerCase()
    );

  if (exists) {

    alert(
      "Tên này đã có trong danh sách."
    );

    return;
  }

  data.members[index] = clean;

  save();
  render();
}

// =========================
// XÓA THÀNH VIÊN
// =========================

function deleteMember(index) {

  const name =
    data.members[index];

  const ok =
    confirm(
      `Bạn có chắc muốn xóa "${name}" không?`
    );

  if (!ok) {
    return;
  }

  data.members.splice(index, 1);

  // Xóa luôn vị trí điểm danh
  // của thành viên trong các buổi
  data.sessions.forEach(session => {

    session.attendance.splice(index, 1);

  });

  save();
  render();
}

// =========================
// KHỞI ĐỘNG WEB
// =========================

render();
