const axios = require('axios');
const ws = require("ws");
const moment = require('moment');
const mongoose = require('mongoose');
const Candle =require('./candle');
let items = [];


const fetchList = async () => {
    try {
        let time = moment().subtract(1, 'days').unix() * 1000;
        let listOfCandle = [];
        let res;
        res = await axios.get(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&startTime=${time}&limit=1000`);
        listOfCandle = [...res.data];
        time = res.data[res.data.length - 1][6];
        res = await axios.get(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&startTime=${time}&limit=1000`)
        listOfCandle = [...listOfCandle, ...res.data];
        await saveListToDataBase(listOfCandle);
    }catch (e) {
        console.log(e);
    }

};


const saveListToDataBase = async (list) => {
    try {
        for (const item of list) {
            const date = moment(item[6]).format();
            const price = item[4];
            const candle = await new Candle({
                date:date,
                price:price
            });
            await candle.save();
        }

        console.log('saved !!!')

    }catch (e) {
        console.log(e)
    }

};

const live =async ()=>{
    try {
        //connect to binance socket server
        const socket = await new ws("wss://stream.binance.com:9443/ws/btcusdt@kline_1m");
        socket.on('message',(event)=>{
            try {
                const data = JSON.parse(event).k;
                if(data.x){ // when candle is close save price to list
                    const date = data.T;
                    const price = data.c;
                    const C = [{},{},{},{},price,{},date];
                    items.push(C);
                    if(items.length === 10){ //when candle list size is 10 save to excel file
                        console.log('saving ...');
                        const temp = [...items];
                        items = [];
                        saveListToDataBase(temp);
                    }
                    console.log(C);
                }
            }catch (e) {
                console.log(e)
            }
        });
    }catch (e) {
        console.log(e)
    }
};
const uri = "mongodb+srv://dehghanpour10:173946285@chat.gvmvi.mongodb.net/candles?retryWrites=true&w=majority";

mongoose
    .connect(
        uri
        ,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(result => {
        fetchList().then(r =>{
            console.log('previous date fetch');
            live().then(r=>{
                console.log('start app ...')
            });
        });
    }).catch(err => console.log(err));
