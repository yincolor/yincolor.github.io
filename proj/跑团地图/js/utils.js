const utils = {
    /**
 * 从input File对象中读取为图片
 * @param {File} file input获取的文件对象
 * @returns {Promise<Image|null>} 返回图片对象
 */
    readImageFile: async function (file) {
        return new Promise((resolve, reject) => {
            if (file.type.includes('image') == false) {
                resolve(null);
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = () => {
                // console.log("图片文件读取完毕", reader.result);
                const _img = new Image();
                _img.src = reader.result;
                _img.onload = () => {
                    // console.log('读取图片完毕'); 
                    resolve(_img);
                }
                _img.onerror = ()=>{
                    resolve(null); 
                }
            }
        });
    },
    /**
     * 从base64字符串地址读取为图片
     * @param {String} base64_src 图片 base64 地址字符串
     * @returns {Promise<Image|null>} 返回图片对象
     */
    readImageBase64Src: async (base64_src) => {
        return new Promise((resolve, reject) => {
            const _img = new Image();
            _img.src = base64_src;
            _img.onload = () => {
                resolve(_img);
            }
            _img.onerror = (ev)=>{
                resolve(null); 
            }
        });
    },
    randomRGBColor: () => {
        return 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
    },

    logMinGanCi() {
        const word = ['911撞双子大楼', '安拉胡阿克巴', 'اللّٰهُ أَكْبَر', 'Allāhu akbar', '五星红旗', '毛泽东', '林彪', '周恩来', '邓小平', '江泽民', '江青', '王洪文', '文化大革命', '共产党', '中国共产党', '中共', '64', '89', '1989', '天安门', '坦克车', '碾压', '学生'];
        console.log(word.join(', '));
    }
}