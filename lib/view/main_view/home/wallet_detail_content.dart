import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wallet_app/model/wallet_info.dart';
import 'package:wallet_app/view/main_view/home/send_page.dart';
import 'package:wallet_app/view/main_view/home/trade_info_detail.dart';
import 'package:wallet_app/view/main_view/home/receive_page.dart';
import 'package:wallet_app/view_model/main_model.dart';

class WalletDetailContent extends StatefulWidget {
  @override
  _WalletDetailContentState createState() => _WalletDetailContentState();
}

class _WalletDetailContentState extends State<WalletDetailContent> {

  MainStateModel stateModel = null;
  WalletInfo walletInfo;
  AccountInfo accountInfo;
  List<TradeInfo> tradeInfoes ;

  @override void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    stateModel = MainStateModel().of(context);
    tradeInfoes = stateModel.tradeInfoes;
    walletInfo = stateModel.currWalletInfo;
    accountInfo = stateModel.currAccountInfo;

    return Column(
      children: <Widget>[
        buildHeader(),
        buildBodyHeader(),
        Expanded(
          child: ListView.builder(
              itemCount:tradeInfoes.length,
              itemBuilder: (BuildContext context, int index){
                return detailTile(context,index);
              }),
        ),
        buildFooter()
      ],
    );
  }

  Widget buildBodyHeader() {
    return Container(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
              margin: EdgeInsets.only(left: 40,bottom: 8,top: 10),
              child: Text('交易记录')
          ),
          Container(
            margin: EdgeInsets.only(left: 40),
            height: 1,
            color: Colors.grey,
          ),
          Container(
            margin: EdgeInsets.only(top: 10,bottom: 15),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: <Widget>[
                CustomButtonForCategory(
                  name: '全部',
                  callback: (){
                    print("click1");
                  },
                ),
                CustomButtonForCategory(
                  name: '转出',
                  callback: (){
                    print("click2");
                  },
                ),
                CustomButtonForCategory(
                  name: '转入',
                  callback: (){
                    print("click3");
                  },
                ),
                CustomButtonForCategory(
                  name: '失败',
                  callback: (){
                    print("click4");
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget detailTile(BuildContext context, int index){
    TradeInfo tradeInfo = tradeInfoes[index];
    return InkWell(
      onTap: (){
        stateModel.currTradeInfo = tradeInfo;
        Navigator.of(context).push(MaterialPageRoute(builder: (BuildContext context){
          return TradeInfoDetail();
        }));
      },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 10,vertical: 6),
        decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: Theme.of(context).dividerColor))
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text('转出 ${tradeInfo.amount.toStringAsFixed(8)}'),
                  Text('到        ${tradeInfo.objAddress}'),
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text('完成${index}'),
                  )
              ],),
            ),
            Icon(Icons.arrow_upward),
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(DateFormat('yyyy-MM-dd kk:mm').format(tradeInfo.tradeDate)),
            )
          ],
        ),
      ),
    );
  }

  //头部 112
  Container buildHeader() {
    return Container(
        padding: EdgeInsets.only(top: 30,bottom: 20),
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(
                  accountInfo.amount.toStringAsFixed(8),
                  style: TextStyle(fontSize: 20,fontWeight: FontWeight.w600),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top:0),
              child: Text(
                  "=\$ "+accountInfo.legalTender.toStringAsFixed(2),
                  style: TextStyle(fontSize: 16),
              ),
            ),
          ],
        ),
      );
  }

  Widget buildFooter() {
    return Container(
        margin: EdgeInsets.only(top: 15,bottom: 20),
        child:Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: <Widget>[
            RaisedButton(
              onPressed: (){
                  Navigator.of(context).push(MaterialPageRoute(builder: (BuildContext context){
                    return ReceivePage();
                  }));
              },
              child: Text('收款'),
              padding: EdgeInsets.symmetric(horizontal: 60,vertical:6),
            ),
            RaisedButton(
              onPressed: (){
                Navigator.of(context).push(MaterialPageRoute(builder: (BuildContext context){
                  return WalletSend();
                }));
              },
              child: Text('转账'),
              padding: EdgeInsets.symmetric(horizontal: 60,vertical:6)
            ),
          ],
        ),
      );
  }
}
//交易记录的那四个按钮模板
class CustomButtonForCategory extends StatelessWidget {
  final String name;
  final Function callback;
  const CustomButtonForCategory({ Key key,@required this.name,this.callback}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: ()=>this.callback(),
      child: Container(
          padding: EdgeInsets.symmetric(vertical: 4,horizontal: 12),
          decoration: BoxDecoration(
            border:Border.all(color: Colors.black54),
            borderRadius: BorderRadius.all(Radius.circular(6))
          ),
          child: Text(this.name)
      ),
    );
  }
}
