const mongoose = require('mongoose');
const Candle =require('./candle');
const xlsx = require('xlsx');

const uri = "mongodb+srv://dehghanpour10:173946285@chat.gvmvi.mongodb.net/candles?retryWrites=true&w=majority";
const saveListToFile = async (list) => {
    try {
        const wb = await xlsx.readFile('closePrice.xlsx');
        const ws = await wb.Sheets['price'];
        const data = await xlsx.utils.sheet_to_json(ws);
        for (const item of list) {
            const date = item.date;
            const price = item.price;
            data.push({Date:date,Price:price});
        }
        const newB = xlsx.utils.book_new();
        const newS = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(newB,newS,'price');
        console.log('saved !!!')

        await xlsx.writeFile(newB, 'closePrice.xlsx');
    }catch (e) {
        console.log(e)
    }

};

mongoose
    .connect(
        uri
        ,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(async result => {
        const candles =await Candle.find();
        await saveListToFile(candles)
        console.log('finish')
    }).catch(err => console.log(err));
