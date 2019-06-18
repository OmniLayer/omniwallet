import 'dart:async';

import 'package:bitcoin_flutter/bitcoin_flutter.dart';
import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/main_view/home/main_page_content.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {

  List<WalletInfo> walletInfoes;
  MainStateModel stateModel = null;

  @override void initState() {
    super.initState();
  }
  @override
  Widget build(BuildContext context) {
    stateModel = MainStateModel().of(context);
    return Scaffold(
      backgroundColor:AppCustomColor.themeBackgroudColor,
      appBar: AppBar(
        centerTitle: true,
        title: Text(WalletLocalizations.of(context).main_page_title),
        actions: <Widget>[
          IconButton(
              onPressed: (){
                buildShowDialog(context);
              },
              icon: Icon(
                Icons.add,
                size: 30,
                color: AppCustomColor.themeFrontColor,
              ))
        ],
      ),
      body: new BodyContentWidget(),
    );
  }

  GlobalKey<FormState> _formKey = new GlobalKey<FormState>();

  buildShowDialog(BuildContext context) {
    canTouchAdd =true;
    /// 地址名称 用于接收用户输入
    String _addressName;

    /// 地址名称输入框
    var inputAddressNameField = Padding(
      padding: const EdgeInsets.symmetric (vertical: 8),
      child: Container(
        width: MediaQuery.of(context).size.width,
        child: TextFormField(
          maxLines: 1,
          maxLength: 10,
          validator: (val){
            if(val==null||val.length==0){
              return WalletLocalizations.of(context).createNewAddress_WrongAddress;
            }
          },
          onSaved: (val){
            _addressName = val;
          },
          style: TextStyle(fontSize: 12),
          decoration: InputDecoration(
              border: InputBorder.none,
              hintText: WalletLocalizations.of(context).createNewAddress_hint1
          ),
        ),
      ),
    );

    /**
     * 按钮组
      */
    var btnGroup = Padding(
      padding: const EdgeInsets.only(top: 6,bottom: 6),
      child: Row(
        children: <Widget>[
          Expanded(
            child: RaisedButton(
              elevation: 0,
              highlightElevation: 0,
              onPressed:  () {
                Navigator.of(context).pop();
              },
              child: Text(
                  WalletLocalizations.of(context).createNewAddress_Cancel,
                  maxLines: 1,
                  style: TextStyle(
                    fontSize: 12,
                    color:Colors.blue,
                  )
              ),
              color: AppCustomColor.btnCancel,
            ),
          ),
          SizedBox(width: 20,),
          Expanded(
            child: RaisedButton(
              elevation: 0,
              highlightElevation: 0,
              onPressed:  () {
                var _form = _formKey.currentState;
                if (_form.validate()) {
                  _form.save();
                  this.onClickAddButton(_addressName);
                  Navigator.of(context).pop();
                }
              },
              child: Text(
                  WalletLocalizations.of(context).createNewAddress_Add,
                  maxLines: 1,
                  style: TextStyle(
                    fontSize: 12,
                    color:Colors.white,
                  )
              ),
              color: AppCustomColor.btnConfirm,
            ),
          ),
        ],
      ),
    );


    return showDialog(
      context: context,
      builder:(BuildContext context){

        return Form(
          key: _formKey,
          child: SimpleDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8.0),
            ),
            titlePadding: EdgeInsets.only(top: 12,bottom: 12),
            contentPadding: EdgeInsets.symmetric(horizontal: 20),
            title: Container(
              child: Column(
                  children: <Widget>[
                    Text(WalletLocalizations.of(context).createNewAddress_title,style: TextStyle(fontSize: 20),),
                  ],
                  mainAxisAlignment: MainAxisAlignment.start
              ),
            ),
            children: <Widget>[
              inputAddressNameField,
              btnGroup,
            ],
          ),
        );
      },
    );
  }

  bool canTouchAdd =true;
  onClickAddButton(String addressName){
    if(canTouchAdd==false) return null;

    canTouchAdd =false;
    Future future = NetConfig.get(context,NetConfig.getNewestAddressIndex);
    future.then((data){
      if(NetConfig.checkData(data)){
        int addressIndex = data;
        this.createAddressAgain(addressName, ++addressIndex);
      }
    });
  }

  createAddressAgain(String addressName ,int addressIndex){
    HDWallet wallet = MnemonicPhrase.getInstance().createAddress(GlobalInfo.userInfo.mnemonic,index: addressIndex);
    WalletInfo info = WalletInfo(name: addressName,visible: true,address: wallet.address,addressIndex: addressIndex, totalLegalTender: 0,note: '',accountInfoes: []);
    Future result = NetConfig.post(
        context,
        NetConfig.createAddress,
        {'address':wallet.address,'addressName':addressName,'addressIndex':addressIndex.toString()},
        errorCallback: (msg){
          if(msg.toString().contains('address is exist')){
            this.createAddressAgain(addressName, ++addressIndex);
          }
          canTouchAdd = true;
        });

    result.then((data){
      if(NetConfig.checkData(data)){
        stateModel.addWalletInfo(info);
      }
    });
  }

  showSnackBar(String content){
    Scaffold.of(context).showSnackBar(SnackBar(content: Text(content)));
  }
}

