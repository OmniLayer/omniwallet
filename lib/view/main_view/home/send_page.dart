import 'package:flutter/material.dart';
import 'package:wallet_app/model/wallet_info.dart';
import 'package:wallet_app/view/main_view/home/send_confirm_page.dart';
import 'package:wallet_app/view_model/main_model.dart';

/**
 * 钱包转账
 */
class WalletSend extends StatefulWidget {
  @override
  _WalletSendState createState() => _WalletSendState();
}
class _WalletSendState extends State<WalletSend> {

  MainStateModel stateModel = null;
  WalletInfo walletInfo;
  AccountInfo accountInfo;
  final key = new GlobalKey<ScaffoldState>();


  GlobalKey<FormState> _formKey = new GlobalKey<FormState>();
  String _toAddress;
  num _amount;
  num _fee;
  String _note;


  var minerFee = 0.0001;
  var _feeGroup = 0;
  void _setvalue2(int value) => setState(() {
      if(value==0){
        this.minerFee = 0.0001 ;
      }
      if(value==1){
        this.minerFee = 0.0002 ;
      }
      if(value==2){
        this.minerFee = 0.0003 ;
      }
      if(value==-1){
        this.minerFee = 0.0004 ;
      }

      _feeGroup = value;
  });

  @override
  Widget build(BuildContext context) {

    stateModel = MainStateModel().of(context);
    walletInfo = stateModel.currWalletInfo;
    accountInfo = stateModel.currAccountInfo;
    return Scaffold(
        key: this.key,
        appBar: AppBar(title: Text(accountInfo.name+"转账"),),
        body: this.body()
    );
  }

  Widget makeRadioTiles() {
    List<Widget> list = new List<Widget>();

    //-------------
    // TODO: Miner fees will be modified based on 
    // calculate dynamically in future development.
    list.add(RadioListTile<int>(value: 0,title: Text('Slow    0.00001 btc'), groupValue: _feeGroup, onChanged: _setvalue2));
    list.add(RadioListTile<int>(value: 1,title: Text('Middle  0.00002 btc'), groupValue: _feeGroup, onChanged: _setvalue2));
    list.add(RadioListTile<int>(value: 2,title: Text('Fast    0.00003 btc'), groupValue: _feeGroup, onChanged: _setvalue2));
    //-------------

    var row = Row(children: <Widget>[
        Padding(
          padding: const EdgeInsets.only(left: 20),
          child: Text('自定义'),
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only (left: 20,right: 20),
            child: TextField(
              keyboardType: TextInputType.number,
              onChanged: (value){
                if(value.length>0){
                  setState(() {
                    _feeGroup = -1;
                    this.minerFee = double.parse(value);
                  });
                }
                if(value.length==0){
                  setState(() {
                    _feeGroup = 0;
                    this.minerFee = double.parse('0.0001');
                  });
                }
              },
              decoration: InputDecoration(
                  contentPadding: EdgeInsets.only(left: 8, top: 10, bottom: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(6.0),
                  ),
                  hintText: '选填',
                  hintStyle: TextStyle(fontSize: 14)
              ),
            ),
          ),
        ),
      ],
    );
    list.add(Container(child: row));
    return Container(
        margin: EdgeInsets.only(left: MediaQuery.of(context).size.width*0.42),
        child: Column(
          children: list,
        )
    );
  }


  Widget body(){
    var line1 = Padding(
      padding: EdgeInsets.only(left: 30,top: 30,right: 30),
      child: Column(
        children: <Widget>[
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            mainAxisSize: MainAxisSize.max,
            children: <Widget>[
              Text('转账地址',style: TextStyle(color: Colors.black,fontWeight: FontWeight.w500),),
              Expanded(child: Container()),
              InkWell(child: Text('常用地址'),onTap: (){

              },)
            ],
          ),
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: TextFormField(
              validator: (val){
                if(val==null||val.length==0){
                  return "wrong address";
                }
              },
              onSaved: (val){
                this._toAddress = val;
              },
              scrollPadding: EdgeInsets.only(top: 10),
                decoration: InputDecoration(
                    contentPadding: EdgeInsets.only(left: 8,top: 20,bottom:10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(6.0),
                    ),
                    labelText:'请输入地址',
                    labelStyle: TextStyle(fontSize: 14)
                ),
            ),
          ),
        ],
      )
    );

    var line2 = Padding(
        padding: EdgeInsets.only(left: 30,top: 30,right: 30),
        child: Column(
          children: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              mainAxisSize: MainAxisSize.max,
              children: <Widget>[
                Text('转账数量',style: TextStyle(color: Colors.black,fontWeight: FontWeight.w500),),
                Expanded(child: Container()),
                Text('余额：${accountInfo.amount.toStringAsFixed(8)}')
              ],
            ),
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: TextFormField(
                validator: (val){
                    if(val==null||val.length==0){
                      return "wrong amount";
                    }
                    if(num.tryParse(val) is num){

                    }else{
                      return "wrong input";
                    }
                },
                onSaved: (val){
                  print(val);
                  this._amount = num.parse(val);
                },
                keyboardType:TextInputType.number ,
                scrollPadding: EdgeInsets.only(top: 0),
                decoration: InputDecoration(
                    contentPadding: EdgeInsets.only(left: 8,top: 20,bottom:10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(6.0),
                    ),
                    labelText:'请输入数量',
                    labelStyle: TextStyle(fontSize: 14)
                ),
              ),
            ),
          ],
        )
    );

    var line3 = Padding(
        padding: EdgeInsets.only(left: 30,top: 30,right: 30),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.start,

          children: <Widget>[
            Text('备注',style: TextStyle(color: Colors.black,fontWeight: FontWeight.w500),),
            Expanded(
              child: Padding(
                padding: EdgeInsets.only(left: 20),
                child: TextFormField(
                  onSaved: (val){
                    this._note = val;
                  },
                  decoration: InputDecoration(
                      contentPadding: EdgeInsets.only(left: 8,top: 20,bottom:10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(6.0),
                      ),
                      labelText:'备注（选填）',
                      labelStyle: TextStyle(fontSize: 14)
                  ),
                ),
              ),
            )
          ],
        )
    );


    var line4 = ExpansionTile(
            title: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: <Widget>[
                Text('矿工费用'),
                Expanded(child: Container()),
                Text(this.minerFee.toStringAsFixed(8))
            ],),

            children: <Widget>[
              makeRadioTiles()
            ],
          );

    return SingleChildScrollView(
      child: Form(
        key: _formKey,
        child: Column(
          children: <Widget>[
            line1,
            line2,
            line3,
            line4,
            Padding(
              padding: const EdgeInsets.only(top: 20,bottom: 50),
              child: RaisedButton(
                  onPressed: (){
                    var _form = _formKey.currentState;
                    if (_form.validate()) {
                      _form.save();
                      stateModel.sendInfo = SendInfo(toAddress: this._toAddress,amount: this._amount,note: this._note,minerFee: this.minerFee);
                      Navigator.of(context).pushNamed(SendConfirm.tag);
                    }
                  },
                child: Text('下一步'),
              ),
            )
          ],
        ),
      ),
    );
  }
}
