function TRPGDB() {
    return new Error('这是一个静态对象');
}
TRPGDB.store_name_list = [];

(function init() {
    const db_req = window.indexedDB.open('trpg_scene');
    db_req.onupgradeneeded = (ev) => {
        /** @type {IDBDatabase} */
        const db = ev.target.result;
        const character_store = db.createObjectStore('t_character_img_hist', { keyPath: 'name' });
        character_store.createIndex('character_img', 'character_img');
        const map_img_store = db.createObjectStore('t_map_img_hist', { keyPath: 'name' });
        map_img_store.createIndex('map_img', 'map_img');
    }
    db_req.onsuccess = (ev) => {
        /** @type {IDBDatabase} */
        const db = ev.target.result;
        TRPGDB.store_name_list = Array.from(db.objectStoreNames)
    }
})();


/**
 * 添加历史地图
 * @param {String} map_name 
 * @param {HTMLImageElement} map_img 
 * @returns 
 */
TRPGDB.addHistMap = async (map_name, map_img) => {
    return await TRPGDB.upsert('t_map_img_hist', map_name, { name: map_name, map_img: { src: map_img.src, width: map_img.width, height: map_img.height } });
}
/**
 * 添加历史角色
 * @param {String} c_name 
 * @param {HTMLImageElement} c_img 
 * @returns 
 */
TRPGDB.addHistCharacter = async (c_name, c_img) => {
    return await TRPGDB.upsert('t_character_img_hist', c_name, { name: c_name, character_img: { src: c_img.src, width: c_img.width, height: c_img.height } });
}
/**
 * 根据地图名称读取历史地图
 * @param {String} map_name 
 * @returns 
 */
TRPGDB.readHistMapByName = async (map_name) => {
    return await TRPGDB.readItem('t_map_img_hist', map_name);
}
/**
 * 根据角色名称读取历史角色
 * @param {String} c_name 
 * @returns 
 */
TRPGDB.readHistCharacterByName = async (c_name) => {
    return await TRPGDB.readItem('t_character_img_hist', c_name);
}

/**
 * 获取所有历史的地图名称
 * @returns {Promise<String[]>} 地图名称列表
 */
TRPGDB.getAllHistMapName = async () => {
    return new Promise((resolve, reject) => {
        TRPGDB.readAll('t_map_img_hist').then((maps) => {
            if (maps.length > 0) {
                let names = [];
                for (const map of maps) {
                    names.push(map.name);
                }
                resolve(names);
            } else {
                resolve([]);
            }
        });
    });
}
/**
 * 获取所有历史的角色名称
 * @returns {Promise<String[]>} 角色名称列表
 */
TRPGDB.getAllHistCharacterName = async () => {
    return new Promise((resolve, reject) => {
        TRPGDB.readAll('t_character_img_hist').then((characters) => {
            if (characters.length > 0) {
                let names = [];
                for (const c of characters) {
                    names.push(c.name);
                }
                resolve(names);
            } else {
                resolve([]);
            }
        });
    });
}

/**
 * 更新、新增数据
 * @param {String} _store_name 数据表名称 
 * @param {String} upsert_key 更新的主键名称
 * @param {{}} upsert_date 更新、插入的数据
 * @returns {Promise<boolean>}
 */
TRPGDB.upsert = async (_store_name, upsert_key, upsert_date) => {
    return new Promise((resolve, reject) => {
        if (TRPGDB.store_name_list.includes(_store_name) == false) {
            console.log('没有查到该表', _store_name);
            resolve(false);
        } else {
            const db_req = window.indexedDB.open('trpg_scene');
            db_req.onsuccess = (ev) => {
                /** @type {IDBDatabase} */
                const db = ev.target.result;
                const objectStore = db.transaction(_store_name, 'readwrite').objectStore(_store_name);
                const all_keys_req = objectStore.getAllKeys();
                all_keys_req.onsuccess = (ev) => {
                    /** @type {string[]} */
                    const all_keys = ev.target.result;
                    console.log('所有主键：', ev.target.result);
                    if (all_keys.includes(upsert_key)) {
                        /** 已经包含该主键，因此只需要更新 */
                        const put_req = objectStore.put(upsert_date);
                        put_req.onsuccess = (ev) => {
                            console.log('更新数据成功');
                            resolve(true);
                        }
                        put_req.onerror = (ev) => {
                            console.log('更新数据失败');
                            console.log(ev);
                            resolve(false);
                        }
                    } else {
                        /** 这是新的数据，新增 */
                        const add_req = objectStore.add(upsert_date);
                        add_req.onsuccess = (ev) => {
                            console.log('增加数据成功');
                            resolve(true);
                        }
                        add_req.onerror = (ev) => {
                            console.log('增加数据失败');
                            console.log(ev);
                            resolve(false);
                        }
                    }
                }
                all_keys_req.onerror = (ev) => {
                    console.log('查询表主键失败');
                    console.log(ev);
                    resolve(false);
                }
            }
            db_req.onerror = (ev) => {
                console.log('打开数据库失败');
                console.log(ev);
                resolve(false);
            }
        }
    });
}

/**
 * 根据主键查询单一数据
 * @param {String} _store_name 
 * @param {String} search_key 
 * @returns {Promise<{}>}
 */
TRPGDB.readItem = async (_store_name, search_key) => {
    return new Promise((resolve, reject) => {
        if (TRPGDB.store_name_list.includes(_store_name) == false) {
            console.log("没有查到有这个表", _store_name);
            resolve(null);
        } else {
            const db_req = window.indexedDB.open('trpg_scene');
            db_req.onsuccess = (ev) => {
                /** @type {IDBDatabase} */
                const db = ev.target.result;
                const objectStore = db.transaction(_store_name).objectStore(_store_name);
                const search_req = objectStore.get(search_key);
                search_req.onsuccess = function (ev) {
                    const res = ev.target.result;
                    if (res) {
                        resolve(res);
                    } else {
                        console.log('没有查询到记录');
                        resolve(null);
                    }
                };
                search_req.onerror = (ev) => {
                    console.log("搜索主键失败");
                    console.log(ev);
                    resolve(null);
                }
            }
            db_req.onerror = (ev) => {
                console.log('打开数据库失败');
                console.log(ev);
                resolve(null);
            }
        }
    });
}

/**
 * 将数据表中的数据全部读取出来
 * @param {String} _store_name 数据表名称 
 * @returns  {Promise<Object[]>}
 */
TRPGDB.readAll = async (_store_name) => {
    return new Promise((resolve, reject) => {
        if (TRPGDB.store_name_list.includes(_store_name) == false) {
            console.log("没有查到有这个表", _store_name);
            resolve([]);
        } else {
            const db_req = window.indexedDB.open('trpg_scene');
            db_req.onsuccess = (ev) => {
                const res_list = [];
                /** @type {IDBDatabase} */
                const db = ev.target.result;
                const objectStore = db.transaction(_store_name).objectStore(_store_name);
                const open_cursor_req = objectStore.openCursor()
                open_cursor_req.onsuccess = function (ev) {
                    const cursor = ev.target.result;
                    if (cursor) {
                        // console.log('key: ', cursor.key);
                        // console.log('value: ', cursor.value);
                        res_list.push(cursor.value);
                        cursor.continue();
                    } else {
                        console.log('没有更多数据了！');
                        resolve(res_list);
                    }
                };
                open_cursor_req.onerror = (ev) => {
                    console.log("打开遍历指针失败");
                    console.log(ev);
                    resolve(res_list);
                }
            }
            db_req.onerror = (ev) => {
                console.log('打开数据库失败');
                console.log(ev);
                resolve([]);
            }
        }
    });
}

/**
 * 删除数据
 * @param {String} _store_name 数据表名称
 * @param {String} del_key 删除的主键名称
 * @returns {Promise<boolean>}
 */
TRPGDB.delete = async (_store_name, del_key) => {
    return new Promise((resolve, reject) => {
        if (TRPGDB.store_name_list.includes(_store_name) == false) {
            console.log("没有查到有这个表", _store_name);
            resolve(null);
        } else {
            const db_req = window.indexedDB.open('trpg_scene');
            db_req.onsuccess = (ev) => {
                /** @type {IDBDatabase} */
                const db = ev.target.result;
                const objectStore = db.transaction(_store_name).objectStore(_store_name);
                const del_req = objectStore.delete(del_key);
                del_req.onsuccess = function (ev) {
                    console.log('删除成功');
                    resolve(true);
                };
                del_req.onerror = (ev) => {
                    console.log("删除失败");
                    console.log(ev);
                    resolve(false);
                }
            }
            db_req.onerror = (ev) => {
                console.log('打开数据库失败');
                console.log(ev);
                resolve(false);
            }
        }
    });
}