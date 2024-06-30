
const load_map_btn = document.getElementById('load_map');
// const map_img_input = document.getElementById('map_img_input');

const load_hist_map_btn = document.getElementById('load_hist_map');
const load_hist_map_dialog_ok_btn = document.getElementById('load_hist_map_dialog_ok_btn');
const load_hist_map_dialog_cancel_btn = document.getElementById('load_hist_map_dialog_cancel_btn');

const add_character_btn = document.getElementById('add_character');
const add_character_dialog_ok_btn = document.getElementById('add_character_dialog_ok_btn');
const add_character_dialog_cancel_btn = document.getElementById('add_character_dialog_cancel_btn');

const add_hist_character_btn = document.getElementById('add_hist_character'); 
const add_hist_character_dialog_ok_btn = document.getElementById('add_hist_character_dialog_ok_btn');
const add_hist_character_dialog_cancel_btn = document.getElementById('add_hist_character_dialog_cancel_btn'); 

const remove_character_btn = document.getElementById('remove_character');
const remove_character_dialog_ok_btn = document.getElementById('remove_character_dialog_ok_btn');
const remove_character_dialog_cancel_btn = document.getElementById('remove_character_dialog_cancel_btn');

const show_help_btn = document.getElementById('show_help'); 

const map_container = document.getElementsByClassName('map-container')[0];
const map_box = document.getElementsByClassName('map-box')[0];

const canvas = document.getElementById('map');
const scene = new Scene(canvas);
scene.setEventHandle();

load_map_btn.onclick = () => {
    const f_input = document.createElement('input');
    f_input.type = 'file';
    f_input.addEventListener('change', (ev) => {
        /** @type {File} */
        const f = f_input.files[0];
        const name = f.name;
        document.title = name;
        utils.readImageFile(f).then((_map_image) =>{
            if (_map_image) {
                scene.loadMapImage(_map_image);
                TRPGDB.addHistMap(name, _map_image);  
            }else{
                alert('读取地图文件失败，请检查打开的文件类型等信息，确保必须为图片文件。'); 
            }
        }); 
    },false); 
    f_input.click();
}
// map_img_input.addEventListener('change', (ev) => {
//     /** @type {File} */
//     const f = map_img_input.files[0];
//     document.title = f.name;
//     scene.loadMapImage(f);
// }, false);

load_hist_map_btn.onclick = () =>{ 
    /** @type {HTMLSelectElement} */
    const selecter = document.getElementById('load_hist_map_name_selecter') ; 
    selecter.options.length = 0; 
    TRPGDB.getAllHistMapName().then((names)=>{
        for(const name of names){
            selecter.options.add(new Option(name, name)); 
        }
        document.getElementById('load_hist_map_dialog').showModal(); 
    });
}
load_hist_map_dialog_cancel_btn.onclick = () =>{ document.getElementById('load_hist_map_dialog').close(); }
load_hist_map_dialog_ok_btn.onclick = () =>{
    const name = document.getElementById('load_hist_map_name_selecter').value ; 
    console.log('加载历史的地图', name);
    TRPGDB.readHistMapByName(name).then((val)=>{
        const src = val.map_img.src;
        utils.readImageBase64Src(src).then((img) => {
            if(img){
                scene.loadMapImage(img); 
            }
        });
    });
    document.getElementById('load_hist_map_dialog').close();
}

add_character_btn.onclick = () => { 
    if(scene.map_img == null){
        alert('请先加载地图图片，再添加角色！');
        return; 
    }
    document.getElementById('add_character_dialog').showModal(); 
}
add_character_dialog_cancel_btn.onclick = () => {
    document.getElementById('add_character_img').value = "";
    document.getElementById('add_character_dialog').close();
}
add_character_dialog_ok_btn.onclick = () => {
    const name = document.getElementById('add_character_name').value;
    const img_file = document.getElementById('add_character_img').files[0];
    if (name && img_file) {
        console.log("创建角色：", name, '头像：', img_file);
        utils.readImageFile(img_file).then((face_img) => {
            if (face_img) {
                const character = new Character(name, face_img, scene);
                scene.addCharacter(character);
                TRPGDB.addHistCharacter(name, face_img); 
            } else {
                alert('加载头像失败');
            }
        });
    } else {
        console.log('缺少输入数据无法创建角色');
    }
}

add_hist_character_btn.onclick = () =>{ 
    if(scene.map_img == null){
        alert('请先加载地图图片，再添加角色！');
        return; 
    }
    /** @type {HTMLSelectElement} */
    const selecter = document.getElementById('add_hist_character_name_selecter') ; 
    selecter.options.length = 0; 
    TRPGDB.getAllHistCharacterName().then((names)=>{
        for(const name of names){
            selecter.options.add(new Option(name, name)); 
        }
        document.getElementById('add_hist_character_dialog').showModal(); 
    });
}
add_hist_character_dialog_cancel_btn.onclick = () =>{
    document.getElementById('add_hist_character_dialog').close();
}
add_hist_character_dialog_ok_btn.onclick = () =>{
    const name = document.getElementById('add_hist_character_name_selecter').value ; 
    console.log('添加历史角色', name);
    TRPGDB.readHistCharacterByName(name).then((val)=>{
        const src = val.character_img.src;
        utils.readImageBase64Src(src).then((img) => {
            if(img){
                const character = new Character(name, img, scene);
                scene.addCharacter(character);  
            }
        });
    });
    // document.getElementById('add_hist_character_dialog').close();
}

remove_character_btn.onclick = () => {
    if(scene.map_img == null){
        alert('当前地图图片为空，无需删除角色！');
        return; 
    }
    const remove_character_name_selecter = document.getElementById('remove_character_name_selecter');
    remove_character_name_selecter.options.length = 0;
    const name_list = Object.keys(scene.characters);
    for (const name of name_list) {
        // const op = document.createElement('option');
        // op.value = name; 
        // op.innerText = name;
        remove_character_name_selecter.options.add(new Option(name, name));
    }
    document.getElementById('remove_character_dialog').showModal();
}
remove_character_dialog_cancel_btn.onclick = () => {
    document.getElementById('remove_character_dialog').close();
}
remove_character_dialog_ok_btn.onclick = () => {
    const name = document.getElementById('remove_character_name_selecter').value;
    if (name) {
        scene.removeCharacter(name);
        document.getElementById('remove_character_dialog').close();
    } else {
        alert("请选择要删除的角色");
    }
}

show_help_btn.onclick = () =>{
    utils.showHelp(); 
}

window.addEventListener('resize', () => {
    resizeCanvasAndDraw();
}, false);

function resizeCanvasAndDraw() {
    const r = map_container.getBoundingClientRect();
    const offset_len = 16;
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

resizeCanvasAndDraw();