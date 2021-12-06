const axios = require('axios');
const list = [];
const currDate = new Date().valueOf();
const select = 20; // 筛选出数量
const limit = 12; // 每页拉取数量
const pageNum = 48; // 获取n页数据
const customerName = 'GitcoinMain' // 赛道 GitcoinMain Advocacy ClimateChange Longevity Polygon zkTech Synthetix Forefront Uniswap
const subRoundSlug = 'gr12-gitcoin-main' // gr12-gitcoin-main gr12-advocacy gr12-climate-change gr12-longevity gr12-polygon gr12-zktech gr12-synthetix gr12-forefront gr12-uniswap


console.log(`赛道: ${customerName}`);
const getUrl = (page, limit)=>{
  return `https://gitcoin.co/grants/cards_info?page=${page}&limit=${limit}&me=false&sort_option=-metadata__upcoming&collection_id=false&network=mainnet&state=active&profile=false&sub_round_slug=${subRoundSlug}&collections_page=1&grant_regions=&grant_types=&grant_tags=&tenants=&idle=false&featured=true&round_type=false&round_num=12&customer_name=${customerName}&tab=grants&keyword=`;
}

const dealData = (grants)=> {
  let unVali = 0;
  for ({
    title,
    positive_round_contributor_count,
    clr_prediction_curve,
    amount_received_in_round,
    last_update,
    last_update_natural
  } of Array.from(grants)) {
    if(!clr_prediction_curve[0] || !clr_prediction_curve[0][1]) {
      console.log(`${title}数据异常❌`);
      unVali += 1;
      continue;
    }
    if(clr_prediction_curve[0][1] <= 0 || clr_prediction_curve[0][1] < +amount_received_in_round) {
      console.log(`${title}捐赠溢出🈵️`);
      unVali += 1;
      continue;
    }

    const dateSort = new Date(last_update).valueOf() - currDate;
    const receivedProgressSort = amount_received_in_round / clr_prediction_curve[0][1] * 100;
    const costSort = clr_prediction_curve[0][1];
    const contributorSort = positive_round_contributor_count;

    list.push({
      '名字': title,
      '关注度': contributorSort,
      '最近更新日期': last_update_natural,
      '目标价': clr_prediction_curve[0][1],
      '当前获赠': +amount_received_in_round,
      '捐款进度': `${receivedProgressSort.toFixed(2)}%`,
      // sort: dateSort * 10 + receivedProgressSort * 1000 + costSort * 10000 + contributorSort * 1000
      sort: receivedProgressSort + contributorSort * 100
    });
    // console.log(list);
  }
  if(unVali) {
    console.log(`${unVali}条不可捐款, 已经丢弃`);
  }
  console.log('...完成✅')
}

const start = async ()=>{
  for(let i=0; i<pageNum; i++){
    console.log(`获取第${i+1}页数据`);
    const response = await axios.get(getUrl(i + 1, limit));
    const data = response.data;
    const { grants } = data;
    dealData(grants);
  }

  console.log('排序数据...');
  list.sort((a, b)=> b.sort - a.sort);
  console.log('数据总数：' + list.length);
  console.log(`${select}佳推荐`);
  console.log(list.splice(0, select));
}

start();
