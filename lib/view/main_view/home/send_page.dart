import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/main_view/home/send_confirm_page.dart';
import 'package:wallet_app/view/main_view/wallet_address_book.dart';
import 'package:wallet_app/view/widgets/custom_expansion_tile.dart';
import 'package:wallet_app/view/widgets/custom_raise_button_widget.dart';
import 'package:wallet_app/view_model/state_lib.dart';

/**
 * 钱包转账
 */
class WalletSend extends StatefulWidget {
  static String tag = 'WalletSend';
  @override
  _WalletSendState createState() => _WalletSendState();
}
class _WalletSendState extends State<WalletSend> {

  TextEditingController addressController ;

  MainStateModel stateModel = null;
  WalletInfo walletInfo;
  AccountInfo accountInfo;
  UsualAddressInfo _usualAddressInfo;
  final key = new GlobalKey<ScaffoldState>();

  GlobalKey<FormState> _formKey = new GlobalKey<FormState>();
  String _toAddress;
  num _amount;
  num _fee;
  String _note;

  @override
  void initState() {
    super.initState();
    addressController = TextEditingController();
  }

  @override
  Widget build(BuildContext context) {
    if(stateModel==null){
      stateModel = MainStateModel().of(context);
      walletInfo = stateModel.currWalletInfo;
      accountInfo = stateModel.currAccountInfo;
      stateModel.currSelectedUsualAddressIndex  = -1;
    }

    _usualAddressInfo = stateModel.currSelectedUsualAddress;

    return ScopedModelDescendant<MainStateModel>(
        builder: (context, child, model) {
          return Scaffold(
              key: this.key,
              backgroundColor: Theme.of(context).canvasColor,
              appBar: AppBar(title: Text(accountInfo.name +' '+ WalletLocalizations.of(context).wallet_detail_content_send),),
              body: this.body()
          );
    });
  }

  Widget body(){
    var line1 = Container(
      margin: EdgeInsets.only(top: 12),
      padding: EdgeInsets.symmetric(horizontal: 20,vertical: 16),
      width: double.infinity,
      color: AppCustomColor.themeBackgroudColor,
      child: Column(
        children: <Widget>[
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            mainAxisSize: MainAxisSize.max,
            children: <Widget>[
              Text(WalletLocalizations.of(context).wallet_send_page_to,style: TextStyle(color: AppCustomColor.themeFrontColor,fontWeight: FontWeight.w500),),
              Expanded(child: Container()),
              InkWell(
                  child: Icon(Icons.event_note,color: Colors.blue,),
                onTap: (){
                  Navigator.of(context).push(MaterialPageRoute(builder: (context){
                      return AddressBook(parentPageId: 1,);
                  }));
                },
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.only(top: 0),
            child: TextFormField(
              controller: addressController,
              validator: (val){
                if(_usualAddressInfo!=null){
                  if(addressController.text.length==0){
                    val =_usualAddressInfo.address;
                  }
                }
                val = addressController.text;
                if(val==null||val.length==0){
                  return WalletLocalizations.of(context).wallet_send_page_input_address_error;
                }
              },
              onSaved: (val){
                if(_usualAddressInfo!=null){
                  if(addressController.text.length==0){
                    addressController.text =_usualAddressInfo.address;
                  }
                }
                this._toAddress = addressController.text;
              },
              decoration: InputDecoration(
                  contentPadding: EdgeInsets.only(top: 6),
                  border: InputBorder.none,
                  hintText:WalletLocalizations.of(context).wallet_send_page_input_address_hint,
              ),
            ),
          ),
        ],
      ),
    ) ;

    var line2 = Container(
        margin: EdgeInsets.only(top: 12),
        padding: EdgeInsets.symmetric(horizontal: 20,vertical: 16),
        width: double.infinity,
        color: AppCustomColor.themeBackgroudColor,
        child: Column(
          children: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              mainAxisSize: MainAxisSize.max,
              children: <Widget>[
                Text(WalletLocalizations.of(context).wallet_send_page_title_amount,style: TextStyle(color: AppCustomColor.themeFrontColor,fontWeight: FontWeight.w500),),
                Expanded(child: Container()),
                Text(WalletLocalizations.of(context).wallet_send_page_title_balance+'：'+accountInfo.amount.toString(),style: TextStyle(color: Colors.blue),)
              ],
            ),
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: TextFormField(
                validator: (val){
                    if(val==null||val.length==0){
                      return WalletLocalizations.of(context).wallet_send_page_input_amount_error;
                    }
                    if(double.tryParse(val) is num){

                    }else{
                      return WalletLocalizations.of(context).wallet_send_page_input_amount_error;
                    }
                    if(double.parse(val)>=accountInfo.amount){
                      return WalletLocalizations.of(context).wallet_send_page_input_amount_error;
                    }
                },
                onSaved: (val){
                  this._amount = double.parse(val);
                },
                keyboardType:TextInputType.numberWithOptions(decimal: true) ,
                scrollPadding: EdgeInsets.only(top: 0),
                decoration: InputDecoration(
                    contentPadding: EdgeInsets.only(top: 6),
                    border: InputBorder.none,
                    hintText:WalletLocalizations.of(context).wallet_send_page_input_amount,
                ),
              ),
            ),
            Divider(height: 20,),
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: <Widget>[
                Text(WalletLocalizations.of(context).wallet_send_page_title_note,style: TextStyle(color: AppCustomColor.themeFrontColor,fontWeight: FontWeight.w500),),
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(left: 20),
                    child: TextFormField(
                      onSaved: (val){
                        this._note = val;
                      },
                      decoration: InputDecoration(
                        contentPadding: EdgeInsets.only(top: 0),
                        border: InputBorder.none,
                        hintText:WalletLocalizations.of(context).wallet_send_page_input_note,
                      ),
                    ),
                  ),
                )
              ],
            )
          ],
        )
    );
    var line4 = CustemExpansionTile(
            backgroundColor: AppCustomColor.themeBackgroudColor,
            title: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: <Widget>[
                Text(WalletLocalizations.of(context).wallet_send_page_title_minerFee),
                Expanded(child: Container()),
                Text(this.minerFee.toString())
            ],),
            children: <Widget>[
              makeRadioTiles()
            ],
          );

    if(_usualAddressInfo!=null){
      addressController.text =_usualAddressInfo.address;
    }

    return SingleChildScrollView(
      child: Form(
        key: _formKey,
        child: Column(
          children: <Widget>[
            line1,
            line2,
            Container(
              margin: EdgeInsets.only(top: 12),
              color: AppCustomColor.themeBackgroudColor,
                child: line4
            ),
            Container(
              margin: EdgeInsets.only(left: 20,right: 20,top: 30,bottom: 20),
              child: Row(
                children: <Widget>[
                  CustomRaiseButton(
                    context: context,
                    callback: (){
                      var _form = _formKey.currentState;
                      if (_form.validate()) {
                        _form.save();
                        stateModel.sendInfo = SendInfo(toAddress: this._toAddress,amount: this._amount,note: this._note,minerFee: this.minerFee);
                        Navigator.of(context).pushNamed(SendConfirm.tag);
                      }
                    },
                    title: WalletLocalizations.of(context).backup_words_next,
                    titleColor: Colors.white,
                    color: AppCustomColor.btnConfirm,
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  var minerFee = 0.00001;
  var _feeGroup = 0;
  void _setvalue2(int value) => setState(() {
    if(value==0){
      this.minerFee = 0.00001 ;
    }
    if(value==1){
      this.minerFee = 0.00002 ;
    }
    if(value==2){
      this.minerFee = 0.00003 ;
    }
    if(value==-1){
      this.minerFee = 0.00004 ;
    }

    _feeGroup = value;
  });

  Widget makeRadioTiles() {
    List<Widget> list = new List<Widget>();
    //-------------
    // TODO: Miner fees will be modified based on
    // calculate dynamically in future development.
    list.add(RadioListTile<int>(
        value: 0,
        title: Row(children: <Widget>[
          Expanded(child: Text('Slow',style: TextStyle(color: _feeGroup==0?Colors.blue:AppCustomColor.themeFrontColor),)),
          Text('0.00001 btc',style: TextStyle(color: _feeGroup==0?Colors.blue:AppCustomColor.themeFrontColor),)
        ],),
        groupValue: _feeGroup,
        onChanged: _setvalue2,
      )
    );
    list.add(RadioListTile<int>(
        value: 1,
        title: Row(children: <Widget>[
          Expanded(child: Text('Middle',style: TextStyle(color: _feeGroup==1?Colors.blue:AppCustomColor.themeFrontColor),)),
          Text('0.00002 btc',style: TextStyle(color: _feeGroup==1?Colors.blue:AppCustomColor.themeFrontColor),)
        ],),
        groupValue: _feeGroup,
        onChanged: _setvalue2,
      )
    );
    list.add(RadioListTile<int>(
        value: 2,
        title: Row(children: <Widget>[
          Expanded(child: Text('Fast',style: TextStyle(color: _feeGroup==2?Colors.blue:AppCustomColor.themeFrontColor),)),
          Text('0.00003 btc',style: TextStyle(color: _feeGroup==2?Colors.blue:AppCustomColor.themeFrontColor),)
        ],),
        groupValue: _feeGroup,
        onChanged: _setvalue2,
      )
    );

    var row = Row(children: <Widget>[
      Padding(
        padding: const EdgeInsets.only(left: 20),
        child: Text(WalletLocalizations.of(context).wallet_send_page_title_minerFee),
      ),
      Expanded(
        child: Padding(
          padding: const EdgeInsets.only (left: 20,right: 20),
          child: TextField(
            keyboardType: TextInputType.numberWithOptions(decimal: true),
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
              contentPadding: EdgeInsets.only(top: 0),
              border: InputBorder.none,
              hintText: WalletLocalizations.of(context).wallet_send_page_input_note,
            ),
          ),
        ),
      ),
    ],
    );
    list.add(Container(child: Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: row,
    )));
    return Container(
        margin: EdgeInsets.only(left: 20),
        child: Column(
          children: list,
        )
    );
  }
}
