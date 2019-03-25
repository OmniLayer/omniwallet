import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:intl/intl.dart';
import 'package:wallet_app/model/wallet_info.dart';
import 'package:wallet_app/view/main_view/home/omni_website.dart';
import 'package:wallet_app/view_model/main_model.dart';

class TradeInfoDetail extends StatelessWidget {
  MainStateModel stateModel = null;
  TradeInfo tradeInfo = null;

  var textStyleTitle = TextStyle(
    color: Colors.grey,
  );
  var textStyleBody = TextStyle(
    color: Colors.black,
  );

  @override
  Widget build(BuildContext context) {
    stateModel = MainStateModel().of(context);
    tradeInfo = stateModel.currTradeInfo;
    return Scaffold(
      appBar: AppBar(
        title: Text('交易记录详情'),
      ),
      body:this.body(context)
    );
  }

  Widget body(BuildContext context){

    var line1 = Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Text(
                    DateFormat('yyyy-MM-dd kk:mm').format(tradeInfo.tradeDate),
                    style: textStyleTitle,
                  ),
                ),
                Text(
                  '转出 ${tradeInfo.amount.toStringAsFixed(8)}',
                  style: TextStyle(
                    fontSize: 20
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                      '到    ${tradeInfo.objAddress}',
                    style: TextStyle(
                      fontSize: 18
                    ),
                  ),
                ),
              ],
            );

    return SingleChildScrollView(
      child: Container(
        margin: EdgeInsets.only(top: 20,left: 20),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              line1,
              line("状态",tradeInfo.state==0?'交易中':'完成'),
              line("备注",tradeInfo.note),
              line("交易Id",tradeInfo.txId),
              line("确认Block",tradeInfo.blockId.toString()),
              line("确认数量",tradeInfo.confirmAmount.toString()),
              Center(
                child: RaisedButton(
                  onPressed: (){
                    Navigator.of(context).push(MaterialPageRoute(builder: (BuildContext context){
                      return WebViewPage();
                    }));
                  },
                  child: Text('浏览Omni网站'),
                ),
              )
          ],
        ),
      ),
    );
  }
  Widget line(String title,String content) {
    return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Padding(
                padding: const EdgeInsets.only(bottom: 8,top: 25),
                child: Text(
                  title,
                  style: textStyleTitle,
                ),
              ),
              Text(content,style: textStyleBody,)
            ],
          );
  }
}
