const _POINT_R = 8; /* 圆球的半径 */
const _BEZIER_LINE_COLOR = '#0000FF'; /* 贝塞尔曲线的颜色 */
const _CANVAS_INFO = {
    _HEIGHT: 540,
    _WIDTH: 960
}
const PointState = {
    nomal: 0, hover: 1, press: 2,
    ctl_nomal: 3, ctl_hover: 4, ctl_press: 5
}
const StateStyle = {
    nomal: { color: "#ff3434" }, hover: { color: "#00BFFF" }, press: { color: "#4682B4" },
    ctl_nomal: { color: "#FF8C00" }, ctl_hover: { color: "#DA70D6" }, ctl_press: { color: "#9932CC" }
}

function drawBezierPath(ctx, startP, ctlP, endP) {
    // ctx.strokeStyle = '#00CD66';
    // ctx.lineWidth = 2; //设置线宽
    // ctx.beginPath(); //开始画线
    // ctx.moveTo(startP.x, startP.y); //画笔移动到起点
    let prev_x = startP.x, prev_y = startP.y;
    for (let t = 0; t <= 1; t += 0.01) {
        //获取每个时间点的坐标
        const x = quadraticBezier(startP.x, ctlP.x, endP.x, t);
        const y = quadraticBezier(startP.y, ctlP.y, endP.y, t);
        // ctx.lineTo(x, y); //画出上个时间点到当前时间点的直线
        manager.drawLine(ctx, {x:prev_x, y:prev_y}, {x, y}, 2, _BEZIER_LINE_COLOR);
        prev_x = x, prev_y = y;
    }
    ctx.stroke(); //描边
}

function quadraticBezier(p0, p1, p2, t) {
    const k = 1 - t;
    return k * k * p0 + 2 * k * t * p1 + t * t * p2;

}


class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = 'point';
        this.state = PointState.nomal;
        this.stateStyle = { color: "#ff3434" };
    }
    changeState(state) {
        switch (state) {
            case 'nomal': this.state = PointState.nomal; break;
            case 'hover': this.state = PointState.hover; break;
            case 'press': this.state = PointState.press; break;
        }
    }
    getStyleState() {
        return Point.StateStyleList[this.state];
    }
    draw(ctx) {
        ctx.moveTo(this.x, this.y);
        ctx.beginPath();
        ctx.arc(this.x, this.y, _POINT_R, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = this.getStyleState().color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = '#343434';
        ctx.fill();
    }
}

Point.StateStyleList = [{ color: "#ff3434" }, { color: "#00BFFF" }, { color: "#4682B4" }];

class CtlPoint extends Point {
    constructor(x, y, prev_p, next_p) {
        super(x, y);
        this.type = 'ctl_point'
        this.stateStyle = { color: "#FF8C00" };
        this.ctlPoint_Prev = prev_p; // 前一个控制的点
        this.ctlPoint_Next = next_p; // 后一个控制的点

    }
    getStyleState() {
        return CtlPoint.StateStyleList[this.state];
    }
    draw(ctx) {
        // super.draw(ctx);
        manager.drawRect(ctx, this);
        /** 绘制线段 */
        const [prev_p_x, prev_p_y, next_p_x, next_p_y] = [this.ctlPoint_Prev.x, this.ctlPoint_Prev.y, this.ctlPoint_Next.x, this.ctlPoint_Next.y];
        // ctx.strokeStyle = '#343434';
        // ctx.beginPath();
        // ctx.moveTo(this.x, this.y);
        // ctx.lineTo(prev_p_x, prev_p_y);
        // ctx.stroke();
        manager.drawLine(ctx, this, this.ctlPoint_Prev, 1, '#343434');
        manager.drawLine(ctx, this, this.ctlPoint_Next, 1, '#343434');
        // ctx.beginPath();
        // ctx.moveTo(this.x, this.y);
        // ctx.lineTo(next_p_x, next_p_y);
        // ctx.stroke();
        drawBezierPath(ctx, this.ctlPoint_Prev, this, this.ctlPoint_Next);
    }
}

CtlPoint.StateStyleList = [{ color: "#FF8C00" }, { color: "#DA70D6" }, { color: "#9932CC" }];


/** 初始化全局绘图控制器 */
var manager = {};

manager.points = [];
manager.ctlPoints = [];
manager.main_canvas = document.getElementById('main_canvas');
manager.resultArea = document.getElementById('result_output_textarea');

manager.main_canvas.style.width = _CANVAS_INFO._WIDTH;
manager.main_canvas.style.height = _CANVAS_INFO._HEIGHT;
manager.main_canvas.width = _CANVAS_INFO._WIDTH;
manager.main_canvas.height = _CANVAS_INFO._HEIGHT;

manager.hoverPoint = null;
manager.mouse = { x: null, y: null, ispress: false, isPressHover: false };

/** 创建一个点 */
manager.createPoint = function (x, y) {
    const p = new Point(x, y);
    if (manager.points.length >= 1) {
        const prevp = manager.points[manager.points.length - 1];
        const [cp_x, cp_y] = [(prevp.x + x) / 2, (prevp.y + y) / 2];
        const cp = new CtlPoint(cp_x, cp_y, prevp, p);
        manager.points.push(cp);
        // console.log('创建控制点：', cp);
    }
    manager.points.push(p);

}

/** 清空屏幕 */
manager.clearAll = function (ctx) {
    ctx.moveTo(0, 0);
    ctx.clearRect(0, 0, 10000, 10000);
}

/** 绘制一个点 */
manager.drawPoint = function (ctx, point) {
    let x = point.x, y = point.y;
    ctx.moveTo(x, y);
    ctx.beginPath();
    ctx.arc(x, y, _POINT_R, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = point.getStyleState().color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = '#343434';
    ctx.fill();
}

manager.drawRect = function (ctx, rectCenterPoint) {
    const [x, y] = [rectCenterPoint.x, rectCenterPoint.y];
    const sideLen = _POINT_R * 2
    ctx.moveTo(x, y);
    ctx.beginPath();
    ctx.fillStyle = rectCenterPoint.getStyleState().color;
    ctx.strokeStyle = rectCenterPoint.getStyleState().color;
    ctx.fillRect(x - sideLen / 2, y - sideLen / 2, sideLen, sideLen);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = '#343434';
    ctx.fill();
}

manager.drawLine = function (ctx, startP, nextP, lineWidth, lineColor) {
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(startP.x, startP.y);
    ctx.lineTo(nextP.x, nextP.y);
    ctx.stroke();
}


/** 全局绘图方法 */
manager.draw = function () {
    const ctx = manager.main_canvas.getContext('2d');
    manager.clearAll(ctx);
    /** 绘制点 */
    manager.points.map((point) => {
        // manager.drawPoint(ctx, point);
        point.draw(ctx);
    });
}

/** 坐标转换，将dom的坐标转换成canvas内部的坐标 */
manager.coordinateTranslation = function (x, y) {
    const canvas = manager.main_canvas;
    const rect = canvas.getBoundingClientRect();
    return [x - rect.left * (canvas.width / rect.width), y - rect.top * (canvas.height / rect.height)]
}

/** 获取距离mos_x, mos_y最近的点对象, */
manager.isHoverPoint = function (mos_x, mos_y) {
    let plist = manager.points.filter((point) => {
        point.changeState('nomal'); //.state = PointState.nomal;
        let [x, y] = [point.x, point.y];
        return ((x - mos_x) * (x - mos_x) + (y - mos_y) * (y - mos_y)) < (_POINT_R * _POINT_R);
    }).sort((p1, p2) => {
        let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y];
        return ((x1 - mos_x) * (x1 - mos_x) + (y1 - mos_y) * (y1 - mos_y)) - ((x2 - mos_x) * (x2 - mos_x) + (y2 - mos_y) * (y2 - mos_y));
    });
    return plist.length > 0 ? plist[0] : null;
}



/** 每一帧的更新方法 */
manager.update = function () {
    /** 点拖拽 */
    if ((manager.mouse.ispress && manager.hoverPoint) || manager.mouse.isPressHover) {
        manager.mouse.isPressHover = true;
        let p = manager.hoverPoint;
        p.x = manager.mouse.x, p.y = manager.mouse.y, p.changeState('press');  //p.state = PointState.press ; 
    }
    /** 绘制canvas */
    manager.draw();
    /** 输出结果 */
    let res = [];
    for (let i = 0; i < manager.points.length; i++) {
        let p = manager.points[i];
        res.push({
            x: p.x, y: p.y, type: p.type
        });
    }
    // console.log(res);
    manager.resultArea.value = JSON.stringify(res);
}


/** 事件的响应和处理 */
document.getElementById('btn_add_point').addEventListener('click', (ev) => {
    let len = manager.points.length;
    let [x, y] = ((len == 0) ? [0, 0] : [manager.points[len - 1].x + 50, manager.points[len - 1].y + 50]);
    manager.createPoint(x, y);
    //manager.draw();
});

manager.main_canvas.onmousemove = function (ev) {
    let [mos_x, mos_y] = manager.coordinateTranslation(ev.x, ev.y);
    // console.log(mos_x, mos_y);
    let hoverP = manager.isHoverPoint(mos_x, mos_y);
    if (hoverP) {
        hoverP.changeState('hover'); //.state = PointState.hover;
        manager.hoverPoint = hoverP;
    } else {
        if (manager.mouse.isPressHover != true) {
            manager.hoverPoint = null;
        }
    }
    manager.mouse.x = mos_x, manager.mouse.y = mos_y;
}


manager.main_canvas.onmousedown = function (ev) {
    manager.mouse.ispress = true;
}
manager.main_canvas.onmouseup = function (ev) {
    manager.mouse.ispress = false;
    manager.mouse.isPressHover = false;
}






/** 程序每帧执行的任务 */
setInterval(function () {
    manager.update();
}, 16);