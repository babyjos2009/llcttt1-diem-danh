const members=[
"Nguyễn Văn An","Trần Văn Bình","Lê Minh Châu","Phạm Đức Duy",
"Hoàng Gia Huy","Nguyễn Thị Lan","Vũ Minh Long","Đỗ Quang Nam",
"Bùi Anh Tú","Trần Thông"
];

const key="llcttt1_"+new Date().toLocaleDateString("vi-VN");
let state=JSON.parse(localStorage.getItem(key)||"{}");
const list=document.getElementById("members"), search=document.getElementById("search");

function save(){localStorage.setItem(key,JSON.stringify(state))}
function render(){
 const q=search.value.toLowerCase().trim(); list.innerHTML="";
 members.forEach((name,i)=>{
   if(!name.toLowerCase().includes(q))return;
   const s=state[name]||"";
   const row=document.createElement("div");
   row.className="member "+(s==="present"?"present-row":s==="absent"?"absent-row":"");
   row.innerHTML=`<div class="number">${String(i+1).padStart(2,"0")}</div>
   <div class="name">${name}<div class="status">${s==="present"?"✓ Đã điểm danh • Có mặt":s==="absent"?"✕ Đã điểm danh • Vắng":"Chưa điểm danh"}</div></div>
   <div class="actions"><button class="presentBtn" onclick="mark(${i},'present')">Có mặt</button>
   <button class="absentBtn" onclick="mark(${i},'absent')">Vắng</button></div>`;
   list.appendChild(row);
 });
 updateStats();
}
function mark(i,v){state[members[i]]=v;save();render()}
function updateStats(){
 const a=Object.values(state);
 total.textContent=members.length;
 present.textContent=a.filter(x=>x==="present").length;
 absent.textContent=a.filter(x=>x==="absent").length;
}
reset.onclick=()=>{if(confirm("Bạn có chắc muốn đặt lại điểm danh hôm nay?")){state={};save();render()}};
search.oninput=render;
function time(){
 const d=new Date();
 clock.textContent=d.toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
 date.textContent=d.toLocaleDateString("vi-VN",{weekday:"long",day:"2-digit",month:"2-digit",year:"numeric"});
}
time();setInterval(time,1000);render();