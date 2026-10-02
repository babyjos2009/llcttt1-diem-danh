const defaultNames=["Nguyễn Văn An","Trần Văn Bình","Lê Minh Châu","Phạm Đức Duy","Hoàng Gia Huy","Nguyễn Thị Lan","Vũ Minh Long","Đỗ Quang Nam","Trần Thông"];
const key="llcttt1_attendance_v3";
let data=JSON.parse(localStorage.getItem(key)||"null");
let data=JSON.parse(localStorage.getItem(key)||"null");
if(!data || !Array.isArray(data.members) || data.members.length===0){
 data={members:[...defaultNames],sessions:[{date:new Date().toISOString(),label:"Buổi học 1",attendance:Array(defaultNames.length).fill(false)}],current:0};
 localStorage.setItem(key,JSON.stringify(data));
}
function save(){localStorage.setItem(key,JSON.stringify(data))}
function render(){
 const s=data.sessions[data.current];
 if(!s){data.current=0;save();return render()}
 document.getElementById("sessionTitle").textContent=s.label;
 document.getElementById("sessionDate").textContent=new Date(s.date).toLocaleString("vi-VN");
 const q=(document.getElementById("search")?.value||"").toLowerCase();
 const shown=data.members.map((n,i)=>({n,i})).filter(x=>x.n.toLowerCase().includes(q));
 document.getElementById("list").innerHTML=shown.length?shown.map(x=>`<div class="row"><span class="member-name">${x.i+1}. ${escapeHtml(x.n)}</span><button class="badge ${s.attendance[x.i]?"present":"absent"}" onclick="toggle(${x.i})">${s.attendance[x.i]?"✓ Có mặt":"✕ Vắng"}</button></div>`).join(""):"<p>Không tìm thấy thành viên.</p>";
 const p=s.attendance.filter(Boolean).length;
 document.getElementById("total").textContent=data.members.length;
 document.getElementById("present").textContent=p;
 document.getElementById("absent").textContent=data.members.length-p;
 renderSessions();renderMembers();
}
function escapeHtml(t){return t.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function toggle(i){data.sessions[data.current].attendance[i]=!data.sessions[data.current].attendance[i];save();render()}
function newSession(){
 const n=data.sessions.length+1;
 data.sessions.push({date:new Date().toISOString(),label:"Buổi học "+n,attendance:Array(data.members.length).fill(false)});
 data.current=data.sessions.length-1;save();render()
}
function renderSessions(){
 let total=0,count=0;
 document.getElementById("sessionList").innerHTML=data.sessions.map((s,i)=>{
 let p=s.attendance.filter(Boolean).length;total+=p;count+=s.attendance.length;
 let pct=s.attendance.length?Math.round(p/s.attendance.length*100):0;
 return `<div class="session"><b>${escapeHtml(s.label)}</b> — ${new Date(s.date).toLocaleDateString("vi-VN")}<div>${p}/${s.attendance.length} có mặt (${pct}%)</div><div class="bar"><div class="fill" style="width:${pct}%"></div></div><button class="btn" style="margin-top:9px" onclick="selectSession(${i})">Mở buổi này</button></div>`
 }).join("");
 document.getElementById("sessionCount").textContent=data.sessions.length;
 document.getElementById("memberCount").textContent=data.members.length;
 document.getElementById("average").textContent=count?Math.round(total/count*100)+"%":"0%"
}
function selectSession(i){data.current=i;save();showTab("attendance")}
function showTab(tab){
 document.querySelectorAll(".tabs button").forEach(x=>x.classList.toggle("active",x.dataset.tab===tab));
 ["attendance","sessions","members"].forEach(id=>document.getElementById(id).style.display=id===tab?"block":"none");
 render()
}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>showTab(b.dataset.tab));

function renderMembers(){
 document.getElementById("memberList").innerHTML=data.members.length?data.members.map((n,i)=>`
 <div class="row">
  <span class="member-name">${i+1}. ${escapeHtml(n)}</span>
  <div class="actions">
   <button class="btn gray" onclick="renameMember(${i})">✏️ Đổi tên</button>
   <button class="btn red" onclick="deleteMember(${i})">🗑️ Xóa</button>
  </div>
 </div>`).join(""):"<p>Chưa có thành viên.</p>"
}
function addMember(){
 const input=document.getElementById("newMember"),name=input.value.trim();
 if(!name)return alert("Bạn chưa nhập tên.");
 if(data.members.some(n=>n.toLowerCase()===name.toLowerCase()))return alert("Tên này đã có trong danh sách.");
 data.members.push(name);
 data.sessions.forEach(s=>s.attendance.push(false));
 input.value="";save();render()
}
function renameMember(i){
 const old=data.members[i],name=prompt("Đổi tên thành viên:",old);
 if(name===null)return;
 const clean=name.trim();
 if(!clean)return alert("Tên không được để trống.");
 if(data.members.some((n,j)=>j!==i&&n.toLowerCase()===clean.toLowerCase()))return alert("Tên này đã có trong danh sách.");
 data.members[i]=clean;save();render()
}
function deleteMember(i){
 if(!confirm(`Xóa "${data.members[i]}" khỏi danh sách?`))return;
 data.members.splice(i,1);
 data.sessions.forEach(s=>s.attendance.splice(i,1));
 if(data.members.length===0)alert("Danh sách hiện không còn thành viên. Bạn có thể thêm lại ở mục Thành viên.");
 save();render()
}
render();
