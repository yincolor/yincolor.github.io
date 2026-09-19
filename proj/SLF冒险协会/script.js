"use strict";

function show(dom){ dom.classList.remove('hidden'); dom.classList.add('show'); }
function hidden(dom){ dom.classList.remove('show'); dom.classList.add('hidden'); }
function showDialogLayer(dialog_id){ show( document.getElementById(dialog_id) ); show(document.getElementById('dialog_layer')); }
function hideDialogLayer(){ hidden(document.getElementById('dialog_layer')); }
function addEquipByUI(){ const equips = document.getElementById('equip_cards'); }
function addPlusMinusSign(num){if(num<0){return ''+num;}else {return '+' + num;}}

/** 创建卡片的方法 */

/** 创建空白卡片 */
function createCardEmpty(){
  const card = document.createElement('div');
  const cardHeader = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardFooter = document.createElement('div');
  card.classList = ['card'], cardHeader.classList =['card-header'], cardBody.classList = ['card-body'], cardFooter.classList = ['card-footer'], card.append(cardHeader, cardBody, cardFooter);
  return card;
}
function createBtnGroup(...btnNames){
  const btnGroup = document.createElement('div'); btnGroup.style.float = 'right'; btnGroup.classList = ['btn-group']
  for(const bn of btnNames){
    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-outline-'+bn.type,'btn-sm'), btn.innerText = bn.name;
    btnGroup.appendChild(btn);
  }
  return btnGroup;
}
/** 创建装备卡片 */
function createCardEquip(name, place, weight, intro, type, other){
  const card = createCardEmpty();
  const btnGroup = createBtnGroup({name:'调整', type:'primary'}, {name:'删除', type:'danger'});
  const headSpan = document.createElement('span'); headSpan.innerText = name;
  card.getElementsByClassName('card-header')[0].append(headSpan, btnGroup);
  card.getElementsByClassName('card-body')[0].innerText = '类型：' + (type == 'armor'?'护甲':(type == 'weapon'?'武器':'快捷栏')) + '\n部位：' + place + '\n介绍：' + intro;
  let footerStr =  '重量：' + weight + ' ' + ( type == 'armor'?'物抗：'+other.wk+'  魔抗：'+other.mk:(type == 'weapon'?'伤害公式：'+other.sh:'效果：'+other.xg) ); 
  card.getElementsByClassName('card-footer')[0].innerText = footerStr; 
  card.setAttribute('data-charactor', JSON.stringify({name, place, weight:Number(weight), intro, equipType:type, other}));
  return card;
}

/** 创建背包物品卡片 */
function createCardPack(name, num, weight, intro){
  const card = createCardEmpty();
  const btnGroup = createBtnGroup({name:'调整', type:'primary'}, {name:'删除', type:'danger'});
  const headSpan = document.createElement('span'); headSpan.innerText = name;
  card.getElementsByClassName('card-header')[0].append(headSpan, btnGroup);
  card.getElementsByClassName('card-body')[0].innerText = '介绍：' + intro; 
  card.getElementsByClassName('card-footer')[0].innerText = '重量：' + weight + ' 数量：'+ num; 
  card.setAttribute('data-charactor', JSON.stringify({name, num:Number(num), weight:Number(weight), intro}));
  return card;
}

/** 创建熟练项卡片 */
function createCardProficiency(name, type, proficiency_progress){
  const card = createCardEmpty();
  card.removeChild(card.getElementsByClassName('card-footer')[0]);
  const btnGroup = createBtnGroup({name:'调整', type:'primary'}, {name:'删除', type:'danger'});
  const headSpan = document.createElement('span'); headSpan.innerText = name;
  card.getElementsByClassName('card-header')[0].append(headSpan, btnGroup);
  card.getElementsByClassName('card-body')[0].innerText = '类型' + (type == 'xs'?'学识':(type == 'xb'?'装备':'魔法')) + '\n进度：'+proficiency_progress; 
  card.setAttribute('data-charactor', JSON.stringify({name, type, progress:proficiency_progress}));
  return card;
}

/** 创建技能卡片 */
function createCardSkill(name, type, intro){
  const card = createCardEmpty();
  card.removeChild(card.getElementsByClassName('card-footer')[0]);
  const btnGroup = createBtnGroup({name:'调整', type:'primary'}, {name:'删除', type:'danger'});
  const headSpan = document.createElement('span'); headSpan.innerText = name;
  card.getElementsByClassName('card-header')[0].append(headSpan, btnGroup);
  card.getElementsByClassName('card-body')[0].innerText = '类型：' + (type == 'zj'?'战技':(type == 'mf'?'魔法':'神术')) + '\n介绍：'+intro; 
  card.setAttribute('data-charactor', JSON.stringify({name, type, intro}));
  return card;
}

/** 创建经历卡片 */
function createCardJL(name, type, intro, data){
  console.log(data);
  const card = createCardEmpty();
  card.removeChild(card.getElementsByClassName('card-footer')[0]);
  const btnGroup = createBtnGroup({name:'调整', type:'primary'}, {name:'删除', type:'danger'});
  const headSpan = document.createElement('span'); headSpan.innerText = name;
  card.getElementsByClassName('card-header')[0].append(headSpan, btnGroup);
  let bodyStr = '';
  switch(type){
    case 'exp': bodyStr = '经验调整：' + addPlusMinusSign(data.num) + '\n详情：'+intro; card.setAttribute('data-charactor', JSON.stringify({name, type, value:Number(data.num), intro})); break;
    case 'money': bodyStr='金额增减：' + addPlusMinusSign(data.num) + '\n详情：'+intro; card.setAttribute('data-charactor', JSON.stringify({name, type, value:Number(data.num), intro}));break;
    case 'attr':bodyStr = 
        [(data.ll?'力量：' + addPlusMinusSign(data.ll):'') 
      , (data.mj?'敏捷：' + addPlusMinusSign(data.mj):'') 
      , (data.tz?'体质：' + addPlusMinusSign(data.tz):'') 
      , (data.zl?'智力：' + addPlusMinusSign(data.zl):'') 
      , (data.yz?'意志：' + addPlusMinusSign(data.yz):'') 
      , (data.gz?'感知：' + addPlusMinusSign(data.gz):'') 
      , (data.ml?'魅力：' + addPlusMinusSign(data.ml):'')].filter(v=>{return v!='';}).join('，') + '\n详情：'+intro; 
      card.setAttribute('data-charactor', JSON.stringify({name, type, ll:Number(data.ll), mj:Number(data.mj), tz:Number(data.tz), zl:Number(data.zl), yz:Number(data.yz), gz:Number(data.gz), ml:Number(data.ml), intro}));
      break;
    case 'other': bodyStr = '详情：' + intro; card.setAttribute('data-charactor', JSON.stringify({name, type, intro})); break;
  }
  card.getElementsByClassName('card-body')[0].innerText = bodyStr; 
  
  return card;
}

/** 按钮事件方法列表 */

function onEquipAddBtnClicked(){
  showDialogLayer('equip_add_dialog');
  const equips = document.getElementById('equip_cards');
  const equipCards = equips.getElementsByClassName('card');
  console.log(equipCards);
}
/* 装备穿戴弹窗SELECT更改事件 */
function onEquipDialogSelectChanged(){
  const b = document.getElementById('ead_type').value;
  for(const e of document.getElementsByClassName('equip_other_input')){if(e.classList.contains(b)){show(e);}else{hidden(e);} }
}
/** 装备穿戴弹窗确认按钮点击事件 */
function onEquipAddDialogBtnClicked(){
  const equipAddDialog = document.getElementById('equip_add_dialog');
  const name = equipAddDialog.getElementsByClassName('name')[0].value;
  const place = equipAddDialog.getElementsByClassName('place')[0].value;
  const weight = equipAddDialog.getElementsByClassName('weight')[0].value;
  const intro = equipAddDialog.getElementsByClassName('intro')[0].value;
  const equipType = equipAddDialog.getElementsByClassName('equip_type')[0].value;
  const other = {};
  switch(equipType){
    case 'armor'    :{ other.wk = equipAddDialog.getElementsByClassName('wk')[0].value; other.mk = equipAddDialog.getElementsByClassName('mk')[0].value; break; }
    case 'weapon'   :{ other.sh = equipAddDialog.getElementsByClassName('sh')[0].value; break; }
    case 'shortcuts':{ other.xg = equipAddDialog.getElementsByClassName('xg')[0].value;break; }
  }
  const data = {name, place, weight, intro, equipType, other};
  console.log(data); 
  let ohterState = false;
  if(name && place && weight && intro && equipType && Object.keys(other).length > 0){
    console.log('正确的装备穿戴提交');
    const card = createCardEquip(name, place, weight, intro, equipType, other);
    const equipCardsDiv = document.getElementById('equip_cards');
    equipCardsDiv.append(card, document.createElement('br') );
    document.getElementById('close_equip_add_dialog_btn').click();
  }else {
    console.log('失败的装备穿戴提交');
    alert('失败的装备穿戴提交');
  }
}
/** 物品放入背包弹窗确认按钮点击事件 */
function onPackAddDialogBtnClicked(){
  const packAddDialog = document.getElementById('pack_add_dialog');
  const name = packAddDialog.getElementsByClassName('name')[0].value;
  const num = packAddDialog.getElementsByClassName('num')[0].value;
  const weight = packAddDialog.getElementsByClassName('weight')[0].value;
  const intro = packAddDialog.getElementsByClassName('intro')[0].value;
  if(name && num && weight && intro){
    console.log('正确的物品提交');
    const card = createCardPack(name, num, weight, intro);
    const packCardsDiv = document.getElementById('pack_cards');
    packCardsDiv.append(card, document.createElement('br') );
    document.getElementById('close_pack_add_dialog_btn').click();
  }else {
    console.log('失败的物品提交');
    alert('失败的物品提交，可能有没有写的输入栏');
  }
}
/** 熟练项弹窗确认按钮点击事件 */
function onProficiencyAddDialogBtnClicked(){
  const addDialog = document.getElementById('proficiency_add_dialog');
  const name = addDialog.getElementsByClassName('name')[0].value;
  const progress = addDialog.getElementsByClassName('proficiency-progress')[0].value;
  const type = addDialog.getElementsByClassName('type')[0].value;
  if(name && type && progress){
    console.log('正确的熟练项提交');
    const card = createCardProficiency(name, type, progress);
    const cardsDiv = document.getElementById('proficiency_cards');
    cardsDiv.append(card, document.createElement('br') );
    document.getElementById('close_proficiency_add_dialog_btn').click();
  }else {
    console.log('失败的熟练项提交');
    alert('失败的熟练项提交，可能有没有写的输入栏');
  }
}

/** 技能弹窗确认按钮点击事件 */
function onSkillAddDialogBtnClicked(){
  const addDialog = document.getElementById('skill_add_dialog');
  const name = addDialog.getElementsByClassName('name')[0].value;
  const intro = addDialog.getElementsByClassName('intro')[0].value;
  const type = addDialog.getElementsByClassName('type')[0].value;
  if(name && type && intro){
    console.log('正确的技能提交');
    const card = createCardSkill(name, type, intro);
    const cardsDiv = document.getElementById('skill_cards');
    cardsDiv.append(card, document.createElement('br') );
    document.getElementById('close_skill_add_dialog_btn').click();
  }else {
    console.log('失败的技能提交');
    alert('失败的技能提交，可能有没有写的输入栏');
  }
}

/** 经历-经验弹窗确认按钮点击事件 */
function onExperienceEXPAddDialogBtnClicked(){
  const addDialog = document.getElementById('jl_exp_add_dialog');
  const name = addDialog.getElementsByClassName('name')[0].value;
  const intro = addDialog.getElementsByClassName('intro')[0].value;
  const value = addDialog.getElementsByClassName('value')[0].value;
  if(name && value && intro){
    console.log('正确的技能提交');
    const card = createCardJL(name, 'exp', intro, {num: value});
    const cardsDiv = document.getElementById('jl_cards');
    cardsDiv.append(card, document.createElement('br') );
    document.getElementById('close_jl_exp_add_dialog_btn').click();
  }else {
    console.log('失败的经历-经验提交');
    alert('失败的经历-经验提交，可能有没有写的输入栏');
  }
}
/** 经历-金钱弹窗确认按钮点击事件 */
function onExperienceMoneyAddDialogBtnClicked(){
  const addDialog = document.getElementById('jl_money_add_dialog');
  const name = addDialog.getElementsByClassName('name')[0].value;
  const intro = addDialog.getElementsByClassName('intro')[0].value;
  const value = addDialog.getElementsByClassName('value')[0].value;
  if(name && value && intro){
    console.log('正确的技能提交');
    const card = createCardJL(name, 'money', intro, {num: value});
    const cardsDiv = document.getElementById('jl_cards');
    cardsDiv.append(card, document.createElement('br') );
    document.getElementById('close_jl_money_add_dialog_btn').click();
  }else {
    console.log('失败的经历-经验提交');
    alert('失败的经历-经验提交，可能有没有写的输入栏');
  }
}
/** 经历-属性弹窗确认按钮点击事件 */
function onExperienceAttrAddDialogBtnClicked(){
  const addDialog = document.getElementById('jl_attr_add_dialog');
  const name = addDialog.getElementsByClassName('name')[0].value;
  const intro = addDialog.getElementsByClassName('intro')[0].value;
  const ll = addDialog.getElementsByClassName('ll')[0].value;
  const mj = addDialog.getElementsByClassName('mj')[0].value;
  const tz = addDialog.getElementsByClassName('tz')[0].value;
  const zl = addDialog.getElementsByClassName('zl')[0].value;
  const yz = addDialog.getElementsByClassName('yz')[0].value;
  const gz = addDialog.getElementsByClassName('gz')[0].value;
  const ml = addDialog.getElementsByClassName('ml')[0].value;
  if(name && (ll || mj || tz || zl || yz || gz || ml) && intro){
    console.log('正确的技能提交');
    const card = createCardJL(name, 'attr', intro, {ll, mj, tz, zl, yz, gz, ml});
    const cardsDiv = document.getElementById('jl_cards');
    cardsDiv.append(card, document.createElement('br') );
    document.getElementById('close_jl_attr_add_dialog_btn').click();
  }else {
    console.log('失败的经历-属性提交');
    alert('失败的经历-属性提交，可能有没有写的输入栏');
  }
}
/** 经历-其他弹窗确认按钮点击事件 */
function onExperienceOtherAddDialogBtnClicked(){
  const addDialog = document.getElementById('jl_other_add_dialog');
  const name = addDialog.getElementsByClassName('name')[0].value;
  const intro = addDialog.getElementsByClassName('intro')[0].value;
  if(name && intro){
    console.log('正确的技能提交');
    const card = createCardJL(name, 'other', intro, null);
    const cardsDiv = document.getElementById('jl_cards');
    cardsDiv.append(card, document.createElement('br') );
    document.getElementById('close_jl_other_add_dialog_btn').click();
  }else {
    console.log('失败的其他-经验提交');
    alert('失败的其他-经验提交，可能有没有写的输入栏');
  }
  
}

/** 导出数据 */
function outCharacterCard(){
  const name = document.getElementById('character_name').value;
  const sex = document.getElementById('character_sex').value;
  const race = document.getElementById('character_race').value;
  const age = document.getElementById('character_age').value;
  const money = Number(document.getElementById('character_money').value);
  const exp = Number(document.getElementById('character_exp').value);
  const other_intro = document.getElementById('character_other_intro').value;
  const bg_intro = document.getElementById('character_bg_intro').value;
  const pack_weight = Number(document.getElementById('pack_weight').value);

  const proficiency_cards = document.getElementById('proficiency_cards');
  const proficiency_cards_data = [];
  for(const c of proficiency_cards.getElementsByClassName('card')){ proficiency_cards_data.push(JSON.parse(c.getAttribute('data-charactor'))); }
  const pack_cards = document.getElementById('pack_cards');
  const pack_cards_data = [];
  for(const c of pack_cards.getElementsByClassName('card')){ pack_cards_data.push(JSON.parse(c.getAttribute('data-charactor'))); }
  const skill_cards = document.getElementById('skill_cards');
  const skill_cards_data = [];
  for(const c of skill_cards.getElementsByClassName('card')){ skill_cards_data.push(JSON.parse(c.getAttribute('data-charactor'))); }
  const jl_cards = document.getElementById('jl_cards');
  const jl_cards_data = [];
  for(const c of jl_cards.getElementsByClassName('card')){jl_cards_data.push(JSON.parse(c.getAttribute('data-charactor'))); }

  return {name, sex, race, age, money, exp, other_intro, bg_intro, pack_weight, proficiency_cards_data, pack_cards_data, skill_cards_data, jl_cards_data};
}

function onOutBtnClicked(){
  const data = outCharacterCard();
  console.log('导出数据:', data);
  document.getElementById('data_show_textarea').value = JSON.stringify(data);
}

function onDataShowOKDialogBtnClicked(){
  const data = JSON.parse(document.getElementById('data_show_textarea').value);
  document.getElementById('character_name').value = data.name;
  document.getElementById('character_sex').value = data.sex;
  document.getElementById('character_race').value = data.race;
  document.getElementById('character_age').value = data.age;
  document.getElementById('character_money').value = data.money;
  document.getElementById('character_exp').value = data.exp;
  document.getElementById('character_other_intro').value = data.other_intro;
  document.getElementById('character_bg_intro').value = data.bg_intro;
  document.getElementById('pack_weight').value = data.pack_weight;
  
  
  const proficiency_cards = document.getElementById('proficiency_cards');
  proficiency_cards.innerHTML = '';
  const proficiency_cards_data = data.proficiency_cards_data;
  for(const c of proficiency_cards_data){ 
    proficiency_cards.append(createCardProficiency(c.name, c.type, c.progress), document.createElement('br'));
  }
  const pack_cards = document.getElementById('pack_cards');
  pack_cards.innerHTML = '';
  const pack_cards_data = data.pack_cards_data;
  for(const c of pack_cards_data){ 
    pack_cards.append( createCardPack(c.name, c.num, c.weight, c.intro), document.createElement('br') );
    pack_cards_data.push(JSON.parse(c.getAttribute('data-charactor'))); 
  }
  const skill_cards = document.getElementById('skill_cards');
  const skill_cards_data = data.skill_cards_data;
  for(const c of skill_cards_data){ 
    skill_cards_data.push(JSON.parse(c.getAttribute('data-charactor'))); 
  }
  const jl_cards = document.getElementById('jl_cards');
  const jl_cards_data = data.jl_cards_data;
  for(const c of jl_cards_data){
    jl_cards_data.push(JSON.parse(c.getAttribute('data-charactor'))); 
  }
}