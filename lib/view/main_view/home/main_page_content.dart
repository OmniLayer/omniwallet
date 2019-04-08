import 'package:flutter/material.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/main_view/home/wallet_detail.dart';
import 'package:wallet_app/view/widgets/custom_expansion_tile.dart';
import 'package:wallet_app/view_model/state_lib.dart';

/**
 * asset list view
 */
class BodyContentWidget extends StatefulWidget {
  BodyContentWidget({Key key, }) : super(key: key);
  @override
  _BodyContentWidgetState createState() => _BodyContentWidgetState();
}

class _BodyContentWidgetState extends State<BodyContentWidget> {

  List<WalletInfo> walletInfoes;
  MainStateModel stateModel = null;

  @override
  Widget build(BuildContext context) {
    stateModel = MainStateModel().of(context);
    walletInfoes = stateModel.walletInfoes;
    return ListView.builder(
      itemCount: walletInfoes.length,
      itemBuilder: (BuildContext context, int index){
        return Container(
          margin: EdgeInsets.only(top: 10),
          decoration: BoxDecoration(
            color: AppCustomColor.themeBackgroudColor,
          ),
          child: CustemExpansionTile(
            title: buildFirstLevelHeader(index),
            children: buildItemes(context,index),
          ),
        );
    });
  }

  Widget buildFirstLevelHeader(int index) {
    WalletInfo dataInfo = walletInfoes[index];
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.only(right: 10,bottom: 20,top: 20),
          child: CircleAvatar(
            radius: 24,
            backgroundColor: Colors.lightBlue[50],
            child: Icon(
              dataInfo.iconUrl??Icons.ac_unit,
              size: 30,
              color: Colors.blue,
            ),
          ),
        ),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Row(
                children: <Widget>[
                  Text(dataInfo.name),
                  Expanded(child: Container()),
                  Text(
                    '\$'+dataInfo.totalLegalTender.toStringAsFixed(2),
                    style: TextStyle(
                      fontSize: 24,
                    ),
                  )
              ],),
              SizedBox(height: 10,),
              Text(
                dataInfo.address,
                maxLines: 1,
                style: TextStyle(
                  color: Colors.grey
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
  List<Widget> buildItemes(BuildContext context, int index) {
    WalletInfo dataInfo = walletInfoes[index];
    List<Widget> list = List();
    list.add(Container(height: 1,color: Colors.grey[100],));
    for (int i = 0; i < dataInfo.accountInfoes.length; i++) {
      AccountInfo accountInfo = dataInfo.accountInfoes[i];
      list.add(
        Container(
          margin: EdgeInsets.only(left: 16,bottom: 12,top: 12),
          decoration: BoxDecoration(
            border: Border(bottom: BorderSide(color: Colors.grey[100]))
          ),
          child: InkWell(
            onTap: (){ this.onClickItem(index,i);},
            child: Container(
              margin: EdgeInsets.all(6),
              child: Row(
                children: <Widget>[
                  CircleAvatar(backgroundColor: Colors.lightBlue[50], child: Icon(accountInfo.iconUrl??Icons.add,size: 30,color: Colors.green,)),
                  Container(
                    margin: EdgeInsets.only(left: 16),
                      child: Text('${accountInfo.name}',style: TextStyle(fontSize: 18),)
                  ),
                  Expanded(child: Container(),),
                  Container(
                    margin: EdgeInsets.only(right: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: <Widget>[
                        Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Text(
                            '${accountInfo.amount.toStringAsFixed(8)}',
                            textAlign: TextAlign.right,
                            style: TextStyle(fontSize: 18),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Text(
                            '\$'+accountInfo.legalTender.toStringAsFixed(2),
                            textAlign: TextAlign.right,
                            style: TextStyle(fontSize: 18,color: Colors.grey),
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
        )
      );
    }
    list.add(SizedBox(height: 20,));
    return list;
  }
  //点击item
  void onClickItem(int mainIndex,int subIndex){
    print('clickItem '+mainIndex.toString()+" "+ subIndex.toString());
    stateModel.currWalletInfo = stateModel.walletInfoes[mainIndex];
    stateModel.currAccountInfo = stateModel.currWalletInfo.accountInfoes[subIndex];
    stateModel.currWalletIndex = mainIndex;
    stateModel.currAccountIndex = subIndex;
    Navigator.of(context).push(MaterialPageRoute(builder: (BuildContext context)=>WalletDetail()));
  }
}