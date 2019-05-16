import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/model/wallet_info.dart';
import 'package:wallet_app/tools/Tools.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/main_view/home/receive_page.dart';
import 'package:wallet_app/view/main_view/home/send_page.dart';
import 'package:wallet_app/view/main_view/home/trade_info_detail.dart';
import 'package:wallet_app/view/widgets/custom_raise_button_widget.dart';
import 'package:wallet_app/view_model/main_model.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class WalletDetailContent extends StatefulWidget {
  @override
  _WalletDetailContentState createState() => _WalletDetailContentState();
}

class _WalletDetailContentState extends State<WalletDetailContent> with SingleTickerProviderStateMixin{

  MainStateModel stateModel = null;
  WalletInfo walletInfo;
  AccountInfo accountInfo;
  List<TradeInfo> tradeInfoes ;
  List<TradeInfo> tradeInfoes1=[] ;
  List<TradeInfo> tradeInfoes2=[] ;
  List<TradeInfo> tradeInfoes3 =[];

  TabController mController;

  @override void initState() {
    super.initState();
    mController = TabController(
      length: 3,
      vsync: this,
    );
  }

  initData(){
    tradeInfoes1 = [];
    tradeInfoes2 = [];
    tradeInfoes3 = [];
    for(int i=0;i<this.tradeInfoes.length;i++){
      TradeInfo info = tradeInfoes[i];
      bool isSend = info.tradeType;
      if(isSend){
        tradeInfoes1.add(info);
      }else{
        tradeInfoes2.add(info);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    print("detail content");
    if(stateModel==null){
      stateModel = MainStateModel().of(context);
      walletInfo = stateModel.currWalletInfo;
      accountInfo = stateModel.currAccountInfo;
      stateModel.tradeInfoes = null;
    }
    return ScopedModelDescendant<MainStateModel>(
        builder: (context, child, model) {
          tradeInfoes = model.getTradeInfoes(context,walletInfo.address,propertyId: accountInfo.propertyId);

          print('$tradeInfoes');
          if(tradeInfoes==null){
            return Center(child:CircularProgressIndicator());
          }
          initData();
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              buildHeader(),
              Padding(
                padding: const EdgeInsets.only(top: 20,bottom: 10),
                child: TabBar(
                    controller: mController,
                    labelColor: Colors.blue,
                    labelPadding: EdgeInsets.only(bottom: 3),
                    indicatorSize: TabBarIndicatorSize.label,
                    unselectedLabelColor: Colors.grey,
                    tabs: [
                      Text('All'),
                      Text('Out'),
                      Text('In'),
//                      Text('Failed'),
                    ]),
              ),
              Expanded(
                child: TabBarView(
                  controller: mController,
                  children: <Widget>[
                    ListView.builder(
                        itemCount:tradeInfoes.length,
                        itemBuilder: (BuildContext context, int index){
                          return detailTile(context,index,tradeInfoes);
                        }),
                    ListView.builder(
                        itemCount:tradeInfoes1.length,
                        itemBuilder: (BuildContext context, int index){
                          print(tradeInfoes1);
                          return detailTile(context,index,tradeInfoes1);
                        }),
                    ListView.builder(
                        itemCount:tradeInfoes2.length,
                        itemBuilder: (BuildContext context, int index){
                          return detailTile(context,index,tradeInfoes2);
                        }),
//                    ListView.builder(
//                        itemCount:tradeInfoes3.length,
//                        itemBuilder: (BuildContext context, int index){
//                          return detailTile(context,index,tradeInfoes3);
//                        }),
                  ],
                ),
              ),
              buildFooter()
            ],
          );
        });
  }

  Widget detailTile(BuildContext context, int index,List<TradeInfo> tradeInfoes){
    TradeInfo tradeInfo = tradeInfoes[index];
    return InkWell(
      onTap: (){
        stateModel.currTradeInfo = tradeInfo;
        Navigator.of(context).push(MaterialPageRoute(builder: (BuildContext context){
          return TradeInfoDetail();
        }));
      },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 10,vertical: 16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(right: 12,left: 10),
              child: Image.asset(Tools.imagePath(tradeInfo.tradeType?'icon_out':'icon_in'),width: 25,height: 25,),
            ),
            Expanded(
              flex: 3,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      AutoSizeText(
                        '${accountInfo.name} '+('${tradeInfo.amount>0?'In':'Out'}'),
                        style: TextStyle(fontSize: 18,fontWeight: FontWeight.w400),
                        minFontSize: 12,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Container(
                          margin: EdgeInsets.only(left: 10),
                          decoration: BoxDecoration(
                            color: AppCustomColor.aboutPageBannerBGColor,
                            borderRadius: BorderRadius.circular(10)
                          ),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4,horizontal: 8),
                            child: AutoSizeText(
                              tradeInfo.state==0?
                                  WalletLocalizations.of(context).wallet_trade_info_detail_finish_state1
                                : WalletLocalizations.of(context).wallet_trade_info_detail_finish_state2,
                              style: TextStyle(color:AppCustomColor.themeFrontColor,fontSize: 12),
                              minFontSize: 9,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          )
                      )
                    ],
                    crossAxisAlignment: CrossAxisAlignment.end,
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: AutoSizeText(
                        '${tradeInfo.objAddress.replaceRange(6, tradeInfo.objAddress.length-6, '...')}',
                        style: TextStyle(color: Colors.grey,fontWeight: FontWeight.bold),
                        maxLines: 1,
                        minFontSize: 9,
                        overflow: TextOverflow.ellipsis,
                    ),
                  ),
              ],),
            ),
            SizedBox(width: 10,),
            Expanded(
              flex: 1,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>
                [
                  AutoSizeText(
                    tradeInfo.amount.toString(),
                    style: TextStyle( fontSize:16,color:tradeInfo.amount>0?Colors.green:Colors.red,fontWeight: FontWeight.bold),
                    minFontSize: 12,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: AutoSizeText(
                        DateFormat('yyyy.MM.dd').format(tradeInfo.tradeDate),
                        minFontSize: 9,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                    ),
                  )
              ],),
            ),
          ],
        ),
      ),
    );
  }

  //头部
  Container buildHeader() {
    return Container(
        height: 160,
        width: MediaQuery.of(context).size.width,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(top: 30),
              child: Text(
                  accountInfo.amount.toString(),
                  style: TextStyle(fontSize: 30,color: Colors.white,fontWeight: FontWeight.w600),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(
                  "≈"+ Tools.getCurrMoneyFlag() +accountInfo.legalTender.toStringAsFixed(2),
                  style: TextStyle(fontSize: 20,color: Colors.white54),
              ),
            ),
          ],
        ),
      );
  }
  Widget buildFooter() {
    return Container(
        margin: EdgeInsets.only(top: 10,bottom: 10,left: 30,right: 30),
        child:Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: <Widget>[
            CustomRaiseButton(
              context: context,
              callback: (){
                Navigator.of(context).push(MaterialPageRoute(builder: (BuildContext context){
                  return WalletSend();
                }));
              },
              title: WalletLocalizations.of(context).wallet_detail_content_send,
              titleColor: AppCustomColor.themeBackgroudColor,
              titleSize: 18.0,
//              leftIconName: 'icon_send',
              color: AppCustomColor.btnConfirm,
            ),
//            SizedBox(width: 30,),
//            CustomRaiseButton(
//              context: context,
//              callback: (){
//                Navigator.of(context).push(MaterialPageRoute(builder: (BuildContext context){
//                  return ReceivePage();
//                }));
//              },
//              title: WalletLocalizations.of(context).wallet_detail_content_receive,
//              titleColor: Colors.white,
//              leftIconName: 'icon_receive',
//              color: AppCustomColor.btnConfirm,
//            ),
          ],
        ),
      );
  }
}
