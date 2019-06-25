import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:intl/intl.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/model/wallet_info.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view_model/main_model.dart';

class TradeInfoDetail extends StatelessWidget {
  MainStateModel stateModel = null;
  TradeInfo tradeInfo = null;
  AccountInfo accountInfo;

  var textStyleTitle = TextStyle(
    color: Colors.grey,
  );
  var textStyleBody = TextStyle(
    color: AppCustomColor.themeFrontColor,
  );

  @override
  Widget build(BuildContext context) {
    if(stateModel==null)
      stateModel = MainStateModel().of(context);

    tradeInfo = stateModel.currTradeInfo;
    accountInfo = stateModel.currAccountInfo;
    return Scaffold(
        backgroundColor: AppCustomColor.themeBackgroudColor,
      appBar: AppBar(
        title: Text(WalletLocalizations.of(context).wallet_trade_info_detail_title),
      ),
      body:this.body(context)
    );
  }

  Widget body(BuildContext context){
    var line1 = Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisSize: MainAxisSize.max,
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Text(WalletLocalizations.of(context).wallet_trade_info_detail_title2+ ' ${accountInfo.name}',
                    style: TextStyle(
                        fontSize: 18,
                        color: AppCustomColor.themeFrontColor
                    ),
                  ),
                ),
                Text(
                  '${tradeInfo.amount.toString()}',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 15),
                  child: Text(
                    tradeInfo.state==0?
                        WalletLocalizations.of(context).wallet_trade_info_detail_finish_state1
                        :WalletLocalizations.of(context).wallet_trade_info_detail_finish_state2,
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.grey
                    ),
                  ),
                ),
              ],
            );

    return SingleChildScrollView(
      child: Container(
        margin: EdgeInsets.only(top: 20,left: 20,right: 20),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Container(
                  margin: EdgeInsets.only(bottom: 40),
                  width: double.infinity, child: line1
              ),
              line(tradeInfo.tradeType?
                  WalletLocalizations.of(context).wallet_trade_info_detail_item_To:
                  WalletLocalizations.of(context).wallet_trade_info_detail_item_From
                  ,
                  tradeInfo.objAddress),
              line(WalletLocalizations.of(context).wallet_trade_info_detail_item_Memo,tradeInfo.note),
              line(WalletLocalizations.of(context).wallet_trade_info_detail_item_Date,tradeInfo.tradeDate==null?'':DateFormat('yyyy.MM.dd HH:mm').format(tradeInfo.tradeDate)),
              Padding(
                padding: const EdgeInsets.only(bottom: 18),
                child: Divider(height: 1,),
              ),
              line(WalletLocalizations.of(context).wallet_trade_info_detail_item_txid,tradeInfo.txId),
              line(WalletLocalizations.of(context).wallet_trade_info_detail_item_confirmIndex,tradeInfo.blockId!=null?tradeInfo.blockId.toString():''),
              line(WalletLocalizations.of(context).wallet_trade_info_detail_item_confirmCount,tradeInfo.confirmAmount.toString()),
//              Center(
//                child: Padding(
//                  padding: const EdgeInsets.symmetric(vertical: 20),
//                  child: RaisedButton(
//                    onPressed: (){
//                      Navigator.of(context).push(MaterialPageRoute(builder: (BuildContext context){
//                        return WebViewPage();
//                      }));
//                    },
//                    child: Text('浏览Omni网站'),
//                  ),
//                ),
//              )
          ],
        ),
      ),
    );
  }
  Widget line(String title,String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Row(
              children: <Widget>[
                AutoSizeText(
                  title,
                  style: textStyleTitle,
                  minFontSize: 9,
                  maxLines: 1,
                  overflow: TextOverflow.fade,
                ),

                SizedBox(width: 20),

                Expanded(
                  child: AutoSizeText(
                    content,
                    style: textStyleBody,
                    textAlign: TextAlign.right,
                    minFontSize: 9,
                    maxLines: 1,
                    overflow: TextOverflow.fade,
                  )
                )
              ],
            ),
    );
  }
}
