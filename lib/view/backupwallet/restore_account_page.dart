import 'dart:async';

import 'package:auto_size_text/auto_size_text.dart';
import 'package:bip39/bip39.dart' as bip39;
import 'package:flutter/material.dart';
import 'package:keyboard_actions/keyboard_actions.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wallet_app/view/main_view/main_page.dart';
import 'package:wallet_app/view/widgets/custom_raise_button_widget.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class RestoreAccount extends StatefulWidget {
  static String tag = "Restore Account";
  @override
  _RestoreAccountState createState() => _RestoreAccountState();
}

class _RestoreAccountState extends State<RestoreAccount> {

  GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  FocusNode _nodeText1 = FocusNode();
  FocusNode _nodeText0 = FocusNode();
  FocusNode _nodeText2 = FocusNode();
  FocusNode _nodeText3 = FocusNode();
  TextEditingController controller;
  TextEditingController controller0;
  TextEditingController controller1;
  TextEditingController controller2;
  @override
  void initState() {
    super.initState();
    controller = TextEditingController();
    controller0 = TextEditingController();
    controller1 = TextEditingController();
    controller2 = TextEditingController();
  }


  @override
  void dispose() {
    controller.dispose();
    controller0.dispose();
    controller1.dispose();
    controller2.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    canToucn =true;
    return Scaffold(
      backgroundColor: AppCustomColor.themeBackgroudColor,
      appBar: AppBar(title: Text(WalletLocalizations.of(context).restore_account_title),),
      body: Builder(
        builder: (BuildContext context){
            return FormKeyboardActions(
                actions: _keyboardActions(),
                child: SingleChildScrollView(
                    padding: EdgeInsets.only(left: 20,right: 20,top: 10),
                    child:  Form(
                      key: _formKey,
                      child: this.buildBody(context)
                    )
                )
            );
        },
      ),
    );
  }
  List<KeyboardAction> _keyboardActions() {
    List<KeyboardAction> actions = <KeyboardAction> [
      KeyboardAction(
          focusNode: _nodeText1,
          closeWidget: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Icon(Icons.close),
          )
      ),

      KeyboardAction(
          focusNode: _nodeText0,
          closeWidget: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Icon(Icons.close),
          )
      ),
      KeyboardAction(
          focusNode: _nodeText2,
          closeWidget: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Icon(Icons.close),
          )
      ),

      KeyboardAction(
          focusNode: _nodeText3,
          closeWidget: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Icon(Icons.close),
          )
      ),
    ];
    return actions;
  }

  Widget buildBody(BuildContext context){
    /// tips Area
    var tips = Center(
          child: Padding(
            padding: const EdgeInsets.only(top: 6, bottom: 20),
            child: AutoSizeText(
              WalletLocalizations.of(context).restore_account_tips,
              style: TextStyle(color: Colors.red,height: 1.3),
              textAlign: TextAlign.center,
              minFontSize: 9,
            ),
          ),
        );
    /// phrase Area
    var inputArea = TextField( // content
          controller: controller,
          decoration: InputDecoration(
            labelText: WalletLocalizations.of(context).restore_account_phrase_title,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6)
            ),
            fillColor: AppCustomColor.themeBackgroudColor,
            filled: true,
          ),
          maxLines: null,
          focusNode: _nodeText1,
          onChanged: (val){
            setState(() {
              this.clickBtn(context);
            });
          },
        );
    ///input pin
    var inputOldPin = TextFormField( // content
          controller: controller0,
          decoration: InputDecoration(
            labelText: WalletLocalizations.of(context).restore_account_tip_OldPin,
            border: InputBorder.none,
            fillColor: AppCustomColor.themeBackgroudColor,
            filled: true,
          ),
          validator: (val){
            if(val.isEmpty||val.length!=6){
              return WalletLocalizations.of(context).common_tips_input+WalletLocalizations.of(context).restore_account_tip_OldPin;
            }
          },
          maxLines: 1,
          maxLength: 6,
          keyboardType: TextInputType.number,
          obscureText:true,
          focusNode: _nodeText0,
        );
    ///input pin
    var inputPin = TextFormField( // content
          controller: controller1,
          decoration: InputDecoration(
            labelText: WalletLocalizations.of(context).restore_account_tip_pin,
            border: InputBorder.none,
            fillColor: AppCustomColor.themeBackgroudColor,
            filled: true,
          ),
          validator: (val){
            if(val.isEmpty||val.length!=6){
              return WalletLocalizations.of(context).common_tips_input+WalletLocalizations.of(context).restore_account_tip_pin;
            }
          },
          maxLines: 1,
          obscureText:true,
          maxLength: 6,
          keyboardType: TextInputType.number,
          focusNode: _nodeText2,
        );
    /**
     * PIN confirm
     */
    var inputConfirmPin = TextFormField( // content
          controller: controller2,
          decoration: InputDecoration(
            labelText: WalletLocalizations.of(context).restore_account_tip_confirmPin,
            border: InputBorder.none,
            fillColor: AppCustomColor.themeBackgroudColor,
            filled: true,
          ),
          validator: (val){
            if(val.isEmpty||val.length!=6){
              return WalletLocalizations.of(context).common_tips_input+WalletLocalizations.of(context).restore_account_tip_confirmPin;
            }
          },
          maxLines: 1,
          obscureText:true,
          maxLength: 6,
          keyboardType: TextInputType.number,
          focusNode: _nodeText3,
        );
    var body = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        tips,
        inputArea,
        Padding(
          padding: const EdgeInsets.only(top: 30,bottom: 12),
          child: Text(WalletLocalizations.of(context).restore_account_resetPIN),
        ),
        inputOldPin,
        Divider(height: 0,),
        inputPin,
        Divider(height: 0,),
        inputConfirmPin,
        Divider(height: 0,),
        SizedBox(height: 20,),
        CustomRaiseButton( // Next button.
          context: context,
          hasRow: false,
          title: WalletLocalizations.of(context).restore_account_btn_restore,
          titleColor: Colors.white,
          color: AppCustomColor.btnConfirm,
          callback: clickBtn(context),
        ),
        SizedBox(height: 40,),
      ],
    );
    return body;
  }
  bool canToucn =true;
  Function clickBtn(BuildContext context) {
    if(canToucn ==false) return null;


    String text = this.controller.text;
    var split = text.split(' ');
    split.removeWhere((item) {
      return item == ' ' || item.length == 0;
    });

    if (split.length == 12) {
      return () {

        var _mnemonic= split.join(' ');
        if(bip39.validateMnemonic(_mnemonic)==false){
          Tools.showToast(WalletLocalizations.of(context).restore_account_tip_error1);
          return null;
        }

        final form = _formKey.currentState;
        if(form.validate()){

          FocusScope.of(context).requestFocus(new FocusNode());

          String pin0 = this.controller0.text;
          String pin = this.controller1.text;
          String pin2 = this.controller2.text;
          if(pin != pin2){
            Tools.showToast(WalletLocalizations.of(context).restore_account_tip_error3);
            return null;
          }

          String _pinCode_md5 = Tools.convertMD5Str(pin0);
          String _pinCode_new_md5 =  Tools.convertMD5Str(pin);

          var  userId = Tools.convertMD5Str(_mnemonic);
          canToucn =false;
          Tools.loadingAnimation(context);
          Future result = NetConfig.post(context,
              NetConfig.restoreUser,
              {
                'userId':userId,
                'password':_pinCode_md5,
                'newPsw':_pinCode_new_md5
              },
              errorCallback: (msg){
                canToucn = true;
              }
          );
          result.then((data){
            if(NetConfig.checkData(data)){
              GlobalInfo.userInfo.userId = userId;
              GlobalInfo.userInfo.faceUrl = data['faceUrl'];
              GlobalInfo.userInfo.nickname = data['nickname'];
              GlobalInfo.userInfo.loginToken = data['token'];
              Tools.saveStringKeyValue(KeyConfig.user_login_token, GlobalInfo.userInfo.loginToken);

              Tools.saveStringKeyValue(KeyConfig.user_pinCode_md5, _pinCode_new_md5);
              GlobalInfo.userInfo.pinCode = _pinCode_new_md5;


              Tools.saveStringKeyValue(KeyConfig.user_mnemonic, Tools.encryptAes(_mnemonic));
              GlobalInfo.userInfo.mnemonic = _mnemonic;

              Tools.saveStringKeyValue(KeyConfig.user_mnemonic_md5, userId);

              Future<SharedPreferences> prefs = SharedPreferences.getInstance();
              prefs.then((share){
                share.setBool(KeyConfig.is_backup, true);
              });

              GlobalInfo.bip39Seed = null;
              GlobalInfo.userInfo.init(context,(){
                Navigator.of(context).pop();
                Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (context) => MainPage()), (
                    route) => route == null
                );
              });
            }else{
              Navigator.of(context).pop();
            }
          });
        }
      };
    }
    return null;
  }

}