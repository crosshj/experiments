var D3Node = require('d3-node');
var d3n = new D3Node();

var data = []
for(var i = 1; i <= Math.E; i += 0.01) {
  data.push({x: i, y: Math.log(i)});
}

data = [{"x":0,"y":100},{"x":1,"y":500},{"x":2,"y":900},{"x":3,"y":1300},{"x":4,"y":1600},{"x":5,"y":1900},{"x":6,"y":2200},{"x":7,"y":2500},{"x":8,"y":2800},{"x":9,"y":3200},{"x":10,"y":3500},{"x":11,"y":3800},{"x":12,"y":4100},{"x":13,"y":4450},{"x":14,"y":4750},{"x":15,"y":5050},{"x":16,"y":5400},{"x":17,"y":5700},{"x":18,"y":6000},{"x":19,"y":6350},{"x":20,"y":6650},{"x":21,"y":6950},{"x":22,"y":7250},{"x":23,"y":7600},{"x":24,"y":7900},{"x":25,"y":8200},{"x":26,"y":8550},{"x":27,"y":8850},{"x":28,"y":9150},{"x":29,"y":9500},{"x":30,"y":9800},{"x":31,"y":10100},{"x":32,"y":10400},{"x":33,"y":10750},{"x":34,"y":11050},{"x":35,"y":11350},{"x":36,"y":11700},{"x":37,"y":8000},{"x":38,"y":8200},{"x":39,"y":8433.333333333334},{"x":40,"y":8633.333333333334},{"x":41,"y":8833.333333333334},{"x":42,"y":9033.333333333334},{"x":43,"y":9266.666666666666},{"x":44,"y":9466.666666666666},{"x":45,"y":9666.666666666666},{"x":46,"y":9900},{"x":47,"y":10100},{"x":48,"y":10300},{"x":49,"y":15800},{"x":50,"y":16100},{"x":51,"y":16400},{"x":52,"y":16733.333333333332},{"x":53,"y":17033.333333333332},{"x":54,"y":17366.666666666668},{"x":55,"y":17666.666666666668},{"x":56,"y":18000},{"x":57,"y":18300},{"x":58,"y":18633.333333333332},{"x":59,"y":18933.333333333332},{"x":60,"y":19266.666666666668},{"x":61,"y":14675},{"x":62,"y":14900},{"x":63,"y":15150},{"x":64,"y":15375},{"x":65,"y":15625},{"x":66,"y":15850},{"x":67,"y":16100},{"x":68,"y":16325},{"x":69,"y":16575},{"x":70,"y":16800},{"x":71,"y":17025},{"x":72,"y":17275},{"x":73,"y":17500},{"x":74,"y":17750},{"x":75,"y":17975},{"x":76,"y":18225},{"x":77,"y":18450},{"x":78,"y":18700},{"x":79,"y":18925},{"x":80,"y":19175},{"x":81,"y":19400},{"x":82,"y":19625},{"x":83,"y":19875},{"x":84,"y":20100},{"x":85,"y":21700},{"x":86,"y":21960},{"x":87,"y":22200},{"x":88,"y":22460},{"x":89,"y":22720},{"x":90,"y":22960},{"x":91,"y":23220},{"x":92,"y":23460},{"x":93,"y":23720},{"x":94,"y":23980},{"x":95,"y":24220},{"x":96,"y":24480},{"x":97,"y":24720},{"x":98,"y":24980},{"x":99,"y":25240},{"x":100,"y":25480},{"x":101,"y":25740},{"x":102,"y":25980},{"x":103,"y":26240},{"x":104,"y":26500},{"x":105,"y":26740},{"x":106,"y":27000},{"x":107,"y":27240},{"x":108,"y":27500},{"x":109,"y":23133.333333333332},{"x":110,"y":23333.333333333332},{"x":111,"y":23550},{"x":112,"y":23750},{"x":113,"y":23966.666666666668},{"x":114,"y":24183.333333333332},{"x":115,"y":24383.333333333332},{"x":116,"y":24600},{"x":117,"y":24800},{"x":118,"y":25016.666666666668},{"x":119,"y":25233.333333333332},{"x":120,"y":25433.333333333332},{"x":121,"y":32066.666666666668},{"x":122,"y":32316.666666666668},{"x":123,"y":32583.333333333332},{"x":124,"y":32850},{"x":125,"y":33116.666666666664},{"x":126,"y":33366.666666666664},{"x":127,"y":33633.333333333336},{"x":128,"y":33900},{"x":129,"y":34166.666666666664},{"x":130,"y":34416.666666666664},{"x":131,"y":34683.333333333336},{"x":132,"y":34950},{"x":133,"y":30185.714285714286},{"x":134,"y":30400},{"x":135,"y":30628.571428571428},{"x":136,"y":30857.14285714286},{"x":137,"y":31085.714285714286},{"x":138,"y":31300},{"x":139,"y":31528.571428571428},{"x":140,"y":31757.14285714286},{"x":141,"y":31985.714285714286},{"x":142,"y":32200},{"x":143,"y":32428.571428571428},{"x":144,"y":32657.14285714286},{"x":145,"y":32885.71428571428},{"x":146,"y":33100},{"x":147,"y":33328.57142857143},{"x":148,"y":33557.142857142855},{"x":149,"y":33785.71428571428},{"x":150,"y":34000},{"x":151,"y":34228.57142857143},{"x":152,"y":34457.142857142855},{"x":153,"y":34685.71428571428},{"x":154,"y":34900},{"x":155,"y":35128.57142857143},{"x":156,"y":35357.142857142855},{"x":157,"y":37362.5},{"x":158,"y":37600},{"x":159,"y":37837.5},{"x":160,"y":38075},{"x":161,"y":38300},{"x":162,"y":38537.5},{"x":163,"y":38775},{"x":164,"y":39012.5},{"x":165,"y":39250},{"x":166,"y":39487.5},{"x":167,"y":39725},{"x":168,"y":39962.5},{"x":169,"y":40200},{"x":170,"y":40437.5},{"x":171,"y":40662.5},{"x":172,"y":40900},{"x":173,"y":41137.5},{"x":174,"y":41375},{"x":175,"y":41612.5},{"x":176,"y":41850},{"x":177,"y":42087.5},{"x":178,"y":42325},{"x":179,"y":42562.5},{"x":180,"y":42800},{"x":181,"y":38244.444444444445},{"x":182,"y":38455.555555555555},{"x":183,"y":38666.666666666664},{"x":184,"y":38877.77777777778},{"x":185,"y":39088.88888888889},{"x":186,"y":39300},{"x":187,"y":39511.11111111111},{"x":188,"y":39722.22222222222},{"x":189,"y":39933.333333333336},{"x":190,"y":40144.444444444445},{"x":191,"y":40344.444444444445},{"x":192,"y":40555.555555555555},{"x":193,"y":47566.666666666664},{"x":194,"y":47811.11111111111},{"x":195,"y":48055.555555555555},{"x":196,"y":48300},{"x":197,"y":48544.444444444445},{"x":198,"y":48788.88888888889},{"x":199,"y":49033.333333333336},{"x":200,"y":49277.77777777778},{"x":201,"y":49522.22222222222},{"x":202,"y":49766.666666666664},{"x":203,"y":50011.11111111111},{"x":204,"y":50255.555555555555},{"x":205,"y":45450},{"x":206,"y":45680},{"x":207,"y":45900},{"x":208,"y":46120},{"x":209,"y":46340},{"x":210,"y":46560},{"x":211,"y":46780},{"x":212,"y":47000},{"x":213,"y":47220},{"x":214,"y":47440},{"x":215,"y":47660},{"x":216,"y":47880},{"x":217,"y":48100},{"x":218,"y":48320},{"x":219,"y":48540},{"x":220,"y":48760},{"x":221,"y":48980},{"x":222,"y":49200},{"x":223,"y":49420},{"x":224,"y":49640},{"x":225,"y":49860},{"x":226,"y":50090},{"x":227,"y":50310},{"x":228,"y":50530},{"x":229,"y":52727.27272727273},{"x":230,"y":52954.545454545456},{"x":231,"y":53181.818181818184},{"x":232,"y":53409.09090909091},{"x":233,"y":53645.454545454544},{"x":234,"y":53872.72727272727},{"x":235,"y":54100},{"x":236,"y":54327.27272727273},{"x":237,"y":54554.545454545456},{"x":238,"y":54790.90909090909},{"x":239,"y":55018.181818181816},{"x":240,"y":55245.454545454544},{"x":241,"y":55472.72727272727},{"x":242,"y":55700},{"x":243,"y":55936.36363636364},{"x":244,"y":56163.63636363636},{"x":245,"y":56390.90909090909},{"x":246,"y":56618.181818181816},{"x":247,"y":56845.454545454544},{"x":248,"y":57081.818181818184},{"x":249,"y":57309.09090909091},{"x":250,"y":57536.36363636364},{"x":251,"y":57763.63636363636},{"x":252,"y":57990.90909090909},{"x":253,"y":53375},{"x":254,"y":53583.333333333336},{"x":255,"y":53791.666666666664},{"x":256,"y":54000},{"x":257,"y":54208.333333333336},{"x":258,"y":54425},{"x":259,"y":54633.333333333336},{"x":260,"y":54841.666666666664},{"x":261,"y":55050},{"x":262,"y":55258.333333333336},{"x":263,"y":55475},{"x":264,"y":55683.333333333336},{"x":265,"y":62875},{"x":266,"y":63116.666666666664},{"x":267,"y":63350},{"x":268,"y":63583.333333333336},{"x":269,"y":63825},{"x":270,"y":64058.333333333336},{"x":271,"y":64291.666666666664},{"x":272,"y":64533.333333333336},{"x":273,"y":64766.666666666664},{"x":274,"y":65000},{"x":275,"y":65241.666666666664},{"x":276,"y":65475},{"x":277,"y":60661.53846153846},{"x":278,"y":60876.92307692308},{"x":279,"y":61092.307692307695},{"x":280,"y":61315.38461538462},{"x":281,"y":61530.769230769234},{"x":282,"y":61746.153846153844},{"x":283,"y":61969.230769230766},{"x":284,"y":62184.61538461538},{"x":285,"y":62400},{"x":286,"y":62623.07692307692},{"x":287,"y":62838.46153846154},{"x":288,"y":63053.846153846156},{"x":289,"y":63276.92307692308},{"x":290,"y":63492.307692307695},{"x":291,"y":63707.692307692305},{"x":292,"y":63930.769230769234},{"x":293,"y":64146.153846153844},{"x":294,"y":64361.53846153846},{"x":295,"y":64584.61538461538},{"x":296,"y":64800},{"x":297,"y":65023.07692307692},{"x":298,"y":65238.46153846154},{"x":299,"y":65453.846153846156},{"x":300,"y":65676.92307692308},{"x":301,"y":67985.71428571429},{"x":302,"y":68207.14285714286},{"x":303,"y":68435.71428571429},{"x":304,"y":68657.14285714286},{"x":305,"y":68885.71428571429},{"x":306,"y":69107.14285714286},{"x":307,"y":69335.71428571429},{"x":308,"y":69557.14285714286},{"x":309,"y":69785.71428571429},{"x":310,"y":70007.14285714286},{"x":311,"y":70235.71428571429},{"x":312,"y":70457.14285714286},{"x":313,"y":70685.71428571429},{"x":314,"y":70907.14285714286},{"x":315,"y":71135.71428571429},{"x":316,"y":71357.14285714286},{"x":317,"y":71585.71428571429},{"x":318,"y":71807.14285714286},{"x":319,"y":72035.71428571429},{"x":320,"y":72257.14285714286},{"x":321,"y":72485.71428571429},{"x":322,"y":72707.14285714286},{"x":323,"y":72935.71428571429},{"x":324,"y":73157.14285714286},{"x":325,"y":68493.33333333333},{"x":326,"y":68700},{"x":327,"y":68913.33333333333},{"x":328,"y":69120},{"x":329,"y":69333.33333333333},{"x":330,"y":69540},{"x":331,"y":69753.33333333333},{"x":332,"y":69960},{"x":333,"y":70173.33333333333},{"x":334,"y":70380},{"x":335,"y":70593.33333333333},{"x":336,"y":70800},{"x":337,"y":78113.33333333333},{"x":338,"y":78346.66666666667},{"x":339,"y":78573.33333333333},{"x":340,"y":78806.66666666667},{"x":341,"y":79040},{"x":342,"y":79266.66666666667},{"x":343,"y":79500},{"x":344,"y":79733.33333333333},{"x":345,"y":79960},{"x":346,"y":80193.33333333333},{"x":347,"y":80420},{"x":348,"y":80653.33333333333},{"x":349,"y":75831.25},{"x":350,"y":76043.75},{"x":351,"y":76262.5},{"x":352,"y":76481.25},{"x":353,"y":76693.75},{"x":354,"y":76912.5},{"x":355,"y":77131.25},{"x":356,"y":77343.75},{"x":357,"y":77562.5},{"x":358,"y":77781.25},{"x":359,"y":77993.75},{"x":360,"y":78212.5},{"x":361,"y":78431.25},{"x":362,"y":78643.75},{"x":363,"y":78862.5},{"x":364,"y":79081.25},{"x":365,"y":79293.75},{"x":366,"y":79512.5},{"x":367,"y":79725},{"x":368,"y":79943.75},{"x":369,"y":80162.5},{"x":370,"y":80375},{"x":371,"y":80593.75},{"x":372,"y":80812.5},{"x":373,"y":83194.11764705883},{"x":374,"y":83417.64705882352},{"x":375,"y":83641.17647058824},{"x":376,"y":83858.82352941176},{"x":377,"y":84082.35294117648},{"x":378,"y":84305.88235294117},{"x":379,"y":84529.41176470589},{"x":380,"y":84752.94117647059},{"x":381,"y":84970.58823529411},{"x":382,"y":85194.11764705883},{"x":383,"y":85417.64705882352},{"x":384,"y":85641.17647058824},{"x":385,"y":85864.70588235294},{"x":386,"y":86082.35294117648},{"x":387,"y":86305.88235294117},{"x":388,"y":86529.41176470589},{"x":389,"y":86752.94117647059},{"x":390,"y":86976.4705882353},{"x":391,"y":87194.11764705883},{"x":392,"y":87417.64705882352},{"x":393,"y":87641.17647058824},{"x":394,"y":87864.70588235294},{"x":395,"y":88088.23529411765},{"x":396,"y":88305.88235294117},{"x":397,"y":0},{"x":398,"y":270000}];

var data = [{
  key: '',
  values: data
}];

function chart(data, foo){
	console.log(JSON.stringify(data, null, '\t'))
}

d3n.createSVG()
  .datum(data)
  .call(chart);


var string = d3n.svgString();

console.log(string)

//NOTE:  this does not presently work, much left to do and understand
