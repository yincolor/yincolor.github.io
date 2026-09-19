
/**地图 */
class Scene {
    constructor(canvas) {
        // console.log("查找canvas：", canvas);
        this.canvas = canvas; // document.getElementById(canvas_id);
        if (this.canvas == null) {
            alert("HTML代码异常：当前页面没有画布");
        }
        // console.log(this.canvas);
        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.canvas.getContext("2d");
        /** 地图图片对象 @type {Image|null} */
        this.map_img = null;
        this.map_pos = { x: 0, y: 0 }; /** 地图图片的左上角相对于canvas左上角的坐标位置 */
        this.img_scale = 1;

        /** 鼠标是否按下 @type {boolean} */
        this.is_mouse_down = false;
        /** 鼠标按下时的坐标 @type {null|{x:number,y:number}} */
        this.mouse_down_pos = null;
        /** 当按钮按下选中了角色头像，则为角色对象，否则为空 */
        this.press_character = null;
        this.press_character_offset = null;

        /** 角色数据  */
        this.characters = {};
    }

    /**
     * 向地图对象里添加角色
     * @param {Character} character 
     */
    addCharacter(character) {
        character.x = (this.canvas.width / 2 - this.map_pos.x) / this.img_scale;
        character.y = (this.canvas.height / 2 - this.map_pos.y) / this.img_scale;
        this.characters[character.name] = character;
        this.draw();
    }
    /** 移除角色 */
    removeCharacter(character_name) {
        this.characters[character_name] = null;
        delete this.characters[character_name];
        this.draw();
    }
    /**
     * 加载地图图片
     * @param {Image} _map_image 
     */
    async loadMapImage(_map_image) {
        this.map_img = _map_image;
        this.draw();
    }

    /** 设置事件响应 */
    setEventHandle() {
        this.setCanvasEventHandle();
    }

    /** 设置事件响应 */
    setCanvasEventHandle() {
        this.canvas.addEventListener('mousedown', (ev) => {
            this.is_mouse_down = true;
            this.mouse_down_pos = {
                x: ev.offsetX,
                y: ev.offsetY,
                img_pos_offset: {
                    x: ev.offsetX - this.map_pos.x,
                    y: ev.offsetY - this.map_pos.y
                }
            }
            const character = this.mouseHoverCharacter(ev.offsetX, ev.offsetY);
            if (character) {
                this.press_character = character;
                const face_pos = character.getFacePosition();
                this.press_character_offset = {
                    x: face_pos.x - ev.offsetX,
                    y: face_pos.y - ev.offsetY
                }
            } else {
                this.press_character = null;
                this.press_character_offset = null;
            }
            this.draw();
        });
        this.canvas.addEventListener('mouseup', () => { this.is_mouse_down = false; });
        this.canvas.addEventListener('mousemove', (ev) => {
            if (this.is_mouse_down) {
                if (this.press_character) {// 移动单个角色

                    this.press_character.x = (ev.offsetX + this.press_character_offset.x - this.map_pos.x) / this.img_scale + this.press_character.width / 2;
                    this.press_character.y = (ev.offsetY + this.press_character_offset.y - this.map_pos.y) / this.img_scale + this.press_character.height / 2;
                } else {// 移动整个地图，包括所有角色
                    this.map_pos.x = ev.offsetX - this.mouse_down_pos.img_pos_offset.x;
                    this.map_pos.y = ev.offsetY - this.mouse_down_pos.img_pos_offset.y;
                }
                this.draw();
            }
        });
        /** 鼠标滚轮事件 设置地图的缩放 */
        canvas.addEventListener('wheel', (ev) => {
            if (ev.deltaY < 0) { // 放大
                this.img_scale += (this.img_scale >= 8 ? 0 : 0.1);
            } else if (ev.deltaY > 0) { //缩小
                this.img_scale -= (this.img_scale >= 0.2 ? 0.1 : 0);
            }
            // console.log(ev.deltaX, ev.deltaY, ev.deltaZ, this.img_scale);
            this.draw();
        });
    }

    /** 重新进行地图绘制 */
    draw() {
        if (this.map_img == null) { return; }
        // console.log(this.map_img);
        this.clearAll();
        this.drawMap();
        this.drawCharacter();
        this.drawMouse();
    }

    clearAll() {
        // console.log("清空地图");
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    drawMap() {
        // console.log('绘制最底部的地图', this.map_pos.x, this.map_pos.y, this.map_img.width * this.img_scale, this.map_img.height * this.img_scale);
        this.ctx.drawImage(this.map_img, this.map_pos.x, this.map_pos.y, this.map_img.width * this.img_scale, this.map_img.height * this.img_scale);
    }
    drawCharacter() {
        // console.log('绘制地图上的角色');
        const names = Object.keys(this.characters);
        if (names.length <= 0) { return; }
        for (const name of names) {
            /** @type {Character} */
            const character = this.characters[name];
            character.draw();
        }
    }
    drawMouse() {
        // console.log('绘制鼠标光圈');
        if (this.mouse_down_pos == null) { return; }
        this.ctx.beginPath()
        this.ctx.arc(this.mouse_down_pos.x, this.mouse_down_pos.y, 10, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
    mouseHoverCharacter(mouse_x, mouse_y) {
        for (const name of Object.keys(this.characters)) {
            /** @type {Character} */
            const character = this.characters[name];
            const is_hover = character.isMouseHover(mouse_x, mouse_y);
            if (is_hover) {
                console.log("角色被按下", name);
                return character;
            }
        }
        return null;
    }

}

/** 角色，地图上可活动的对象 */
class Character {
    /**
     * 
     * @param {String} name 
     * @param {Image} face_img 
     * @param {Scene} scene_parent_obj 
     */
    constructor(name, face_img, scene_parent_obj) {
        this.name = name;
        this.face_img = face_img;
        this.scene = scene_parent_obj;
        this.x = 0; /*头像图片的中心点相对于地图图片的左上角的坐标*/
        this.y = 0; /*头像图片的中心点相对于地图图片的左上角的坐标*/
        this.height = 42;
        this.width = 42;
        this.font_size = 15;
    }
    isMouseHover(mouse_x, mouse_y) {
        const face_pos = this.getFacePosition();
        const face_x = face_pos.x;
        const face_y = face_pos.y;
        if (mouse_x >= face_x && mouse_x <= (face_x + this.width) && mouse_y >= face_y && mouse_y <= (face_y + this.height)) {
            return true;
        }
        return false;
    }
    draw() {
        const ctx = this.scene.ctx;
        const face_pos = this.getFacePosition();
        const name_x = face_pos.x + this.width / 2;
        const name_y = face_pos.y + this.height + this.font_size;
        ctx.drawImage(this.face_img, face_pos.x, face_pos.y, this.width, this.height);
        ctx.beginPath()
        ctx.font = `${this.font_size}px sans-serif`;
        ctx.textAlign = 'center';
        const font_width = ctx.measureText(this.name).width + 4;
        // console.log("文字宽度：", font_width); 
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(name_x - font_width / 2, name_y - this.font_size - 1, font_width, this.font_size + 4);
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillText(this.name, name_x, name_y);
        ctx.stroke();
    }

    /** 获取头像左上角在canvas的坐标 */
    getFacePosition() {
        const scale = this.scene.img_scale;
        const map_img_x = this.scene.map_pos.x;
        const map_img_y = this.scene.map_pos.y;
        const face_x = map_img_x + (this.x - this.width / 2) * scale;
        const face_y = map_img_y + (this.y - this.height / 2) * scale;
        return { x: face_x, y: face_y };
    }

    getNameWidth() {
        let width = 0;
        for (let i = 0; i < this.name.length; i++) {
            const char = this.name.charCodeAt(i);
            if (char > 127 || char == 94) {
                width += 2;
            } else {
                width += 1;
            }
        }
        return this.font_size * width;
    }
}
