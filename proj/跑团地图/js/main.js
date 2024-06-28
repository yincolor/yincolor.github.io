
const img_input = document.getElementById('img_input'); 

const add_character_btn = document.getElementById('add_character'); 
const add_character_dialog_ok_btn = document.getElementById('add_character_dialog_ok_btn'); 
const add_character_dialog_cancel_btn = document.getElementById('add_character_dialog_cancel_btn'); 

const remove_character_btn = document.getElementById('remove_character'); 
const remove_character_dialog_ok_btn = document.getElementById('remove_character_dialog_ok_btn'); 
const remove_character_dialog_cancel_btn = document.getElementById('remove_character_dialog_cancel_btn') ; 

const map_container = document.getElementsByClassName('map-container')[0]; 
const map_box = document.getElementsByClassName('map-box')[0];

const canvas = document.getElementById('map'); 


img_input.addEventListener('change', (ev)=>{
    const f = img_input.files[0]; 
    scene.loadMapImage(f); 
},false);

const scene = new Scene(canvas);
scene.setEventHandle(); 

add_character_btn.onclick = () =>{
    document.getElementById('add_character_dialog').showModal(); 
}
add_character_dialog_cancel_btn.onclick = () =>{
    document.getElementById('add_character_img').value = ""; 
    document.getElementById('add_character_dialog').close(); 
}
add_character_dialog_ok_btn.onclick = () =>{
    const name = document.getElementById('add_character_name').value; 
    const img_file = document.getElementById('add_character_img').files[0];  
    if(name && img_file){
        console.log("创建角色：",name, '头像：', img_file); 
        
        utils.readImageFile(img_file).then((face_img)=>{
            if(face_img){
                const character = new Character(name, face_img, scene); 
                scene.addCharacter(character); 
            }else {
                alert('加载头像失败'); 
            } 
        }); 
    }else {
        console.log('缺少输入数据无法创建角色');
    }
}

remove_character_btn.onclick = () => { 
    const remove_character_name_selecter = document.getElementById('remove_character_name_selecter'); 
    remove_character_name_selecter.options.length = 0; 
    const name_list = Object.keys( scene.characters ); 
    for(const name of name_list){
        // const op = document.createElement('option');
        // op.value = name; 
        // op.innerText = name;
        remove_character_name_selecter.options.add(new Option(name, name));  
    }
    document.getElementById('remove_character_dialog').showModal(); 
}
remove_character_dialog_cancel_btn.onclick = () =>{
    document.getElementById('remove_character_dialog').close(); 
}
remove_character_dialog_ok_btn.onclick = () => {
    const name = document.getElementById('remove_character_name_selecter').value; 
    if(name){
        scene.removeCharacter(name); 
        document.getElementById('remove_character_dialog').close(); 
    }else {
        alert("请选择要删除的角色"); 
    }
}


window.addEventListener('resize', () =>{
    resizeCanvasAndDraw(); 
}, false);  

function resizeCanvasAndDraw(){
    const r = map_container.getBoundingClientRect();
    const offset_len = 64;
    const map_box_height = r.height - offset_len;
    const map_box_width = r.width - offset_len;
    map_box.style.height = map_box_height + 'px'; 
    map_box.style.width = map_box_width + 'px'; 
    canvas.style.height = map_box_height + 'px'; 
    canvas.style.width = map_box_width + 'px'; 
    canvas.height = map_box_height;
    canvas.width = map_box_width; 
    scene.draw(); 
}

(function main(){
    resizeCanvasAndDraw();
    setInterval(() => {
        utils.logMinGanCi(); 
    }, 1000);
})();