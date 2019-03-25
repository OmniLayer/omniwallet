
import 'package:flutter/material.dart';
import 'package:wallet_app/model/wallet_info.dart';
import 'package:wallet_app/view/main_view/home/wallet_detail.dart';
import 'package:wallet_app/view_model/main_model.dart';


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
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: ListView.builder(
        itemCount: walletInfoes.length,
        itemBuilder: (BuildContext context, int index){
          return Container(
            margin: EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300])
            ),
            child: ExpansionTile(
              title: buildFirstLevelHeader(index),
              children: buildItemes(context,index),
            ),
          );
      }),
    );
  }

  Widget buildFirstLevelHeader(int index) {
    WalletInfo dataInfo = walletInfoes[index];
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.only(right: 8,top: 8),
          child: Icon(
            dataInfo.iconUrl??Icons.ac_unit,
            size: 28,
            color: Colors.blue,
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
                  Text(dataInfo.note)
              ],),
              SizedBox(height: 10,),
              Text(
                dataInfo.address,
                maxLines: 1,
                style: TextStyle(

                ),
              ),
              SizedBox(height: 10,),
              Align(
                alignment: Alignment(1.3, 0),
                child: Text(
                   '\$'+dataInfo.totalLegalTender.toStringAsFixed(2),
                  style: TextStyle(
                    fontSize: 24,
                  ),
                ),
              ) ,
            ],
          ),
        ),
      ],
    );
  }
  List<Widget> buildItemes(BuildContext context, int index) {
    WalletInfo dataInfo = walletInfoes[index];

    List<Widget> list = List();
    list.add(Container(height: 1,color: Colors.red,));
    list.add(
        Align(
          alignment: Alignment(-1, 0),
          child: Padding(
            padding: const EdgeInsets.only(left: 60,top: 10,bottom: 10),
            child: Text(
              dataInfo.name+"-资产",
              style: TextStyle(fontSize: 16),
            ),
          ),
        )
    );
    for (int i = 0; i < dataInfo.accountInfoes.length; i++) {
      AccountInfo accountInfo = dataInfo.accountInfoes[i];
      list.add(
        Container(
          margin: EdgeInsets.only(left: 60,bottom: 8),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey)
          ),
          child: InkWell(
            onTap: (){ this.onClickItem(index,i);},
            child: Container(
              margin: EdgeInsets.all(6),
              child: Row(
                children: <Widget>[
                  Icon(accountInfo.iconUrl??Icons.add,size: 40,),
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
                          child: Text('${accountInfo.amount.toStringAsFixed(8)}',textAlign: TextAlign.right,style: TextStyle(fontSize: 18),),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Text('\$'+accountInfo.legalTender.toStringAsFixed(2),textAlign: TextAlign.right,),
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
    list.add(SizedBox(height: 30,));
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