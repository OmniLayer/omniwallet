import 'package:flutter/material.dart';
import 'package:keyboard_actions/keyboard_actions.dart';
import 'package:wallet_app/view/widgets/custom_raise_button_widget.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class UpdatePIN extends StatefulWidget {
  static String tag = 'UpdatePIN';
  @override
  _UpdatePINState createState() => _UpdatePINState();
}

class _UpdatePINState extends State<UpdatePIN> {


  GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  FocusNode _nodeText0 = FocusNode();
  FocusNode _nodeText1 = FocusNode();
  FocusNode _nodeText2 = FocusNode();
  TextEditingController controller0;
  TextEditingController controller1;
  TextEditingController controller2;

  @override
  void initState() {
    super.initState();
    controller0 = TextEditingController();
    controller1 = TextEditingController();
    controller2 = TextEditingController();
  }
  @override
  void dispose() {
    controller0.dispose();
    controller1.dispose();
    controller2.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor:  AppCustomColor.themeBackgroudColor,
      appBar: AppBar(title: Text(WalletLocalizations.of(context).userInfoPageItem_3_Title),),
      body: this.buildBody(),
    );
  }
  Widget buildBody(){
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
      focusNode: _nodeText1,
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
      focusNode: _nodeText2,
    );

    return FormKeyboardActions(
      actions: _keyboardActions(),
      child: Padding(
        padding: const EdgeInsets.only(left: 20,right: 20),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              children: <Widget>[
                inputOldPin,
                Divider(height: 0,),
                inputPin,
                Divider(height: 0,),
                inputConfirmPin,
                Divider(height: 0,),
                SizedBox(height: 30,),
                CustomRaiseButton( // Next button.
                  context: context,
                  hasRow: false,
                  title: WalletLocalizations.of(context).userInfoPageItem_3_Title,
                  titleColor: Colors.white,
                  color: AppCustomColor.btnConfirm,
                  callback: (){
                    this.clickBtn();
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
  clickBtn() async {

    FocusScope.of(context).requestFocus(new FocusNode());

    final form = _formKey.currentState;
    if(form.validate()){
      String pin0 = this.controller0.text;
      String _pinCode_md5 =  Tools.convertMD5Str(pin0);
      if(_pinCode_md5 != GlobalInfo.userInfo.pinCode){
        Tools.showToast(WalletLocalizations.of(context).restore_account_tip_error2);
        return null;
      }

      String pin = this.controller1.text;
      String pin2 = this.controller2.text;
      if(pin.isEmpty||pin2.isEmpty||pin != pin2){
        Tools.showToast(WalletLocalizations.of(context).restore_account_tip_error3);
        return null;
      }
      String _pinCode_new_md5 =  Tools.convertMD5Str(pin);
      await NetConfig.post(context,NetConfig.updateUserPassword,
        {
          'oldPsw':_pinCode_md5,
          'newPsw':_pinCode_new_md5
        },
      );
      GlobalInfo.userInfo.pinCode = _pinCode_new_md5;

      Tools.saveStringKeyValue(KeyConfig.user_pinCode_md5, _pinCode_new_md5);
      //更新加密的助记词
      Tools.saveStringKeyValue(KeyConfig.user_mnemonic, Tools.encryptAes(GlobalInfo.userInfo.mnemonic));
      //更新加密的助记词种子
      Tools.saveStringKeyValue(KeyConfig.user_mnemonicSeed, Tools.encryptAes(GlobalInfo.bip39Seed.toString()));

      Navigator.of(context).pop();

    }
  }

  List<KeyboardAction> _keyboardActions() {
    List<KeyboardAction> actions = <KeyboardAction> [
      KeyboardAction(
          focusNode: _nodeText0,
          closeWidget: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Icon(Icons.close),
          )
      ),
      KeyboardAction(
          focusNode: _nodeText1,
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
    ];
    return actions;
  }
}
