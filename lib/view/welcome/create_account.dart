///  Create a New Account.
/// [author] Kevin Zhang
/// [time] 2019-3-5

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:keyboard_actions/keyboard_actions.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/Tools.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/backupwallet/backup_wallet_index.dart';
import 'package:wallet_app/view/widgets/custom_raise_button_widget.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class CreateAccount extends StatefulWidget {
  static String tag = "CreateAccount";

  @override
  _CreateAccountState createState() => _CreateAccountState();
}

class _CreateAccountState extends State<CreateAccount> {

  /// form define
  GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  /// should save data.
  // String _strNickName, _strPinCode, _strRepeatPinCode;

  TextEditingController _nickNameController      = TextEditingController();
  TextEditingController _pinCodeController       = TextEditingController();
  TextEditingController _repeatPinCodeController = TextEditingController();

  //
  FocusNode _nodeNickName = FocusNode();
  FocusNode _nodePinCode = FocusNode();
  FocusNode _nodeRepeatPinCode = FocusNode();

  /// textFormField focus 
  bool _nickNameHasFocus      = false;
  bool _pinCodeHasFocus       = false;
  bool _repeatPinCodeHasFocus = false;

  //
  bool _autoValidate = false;

  /// add textfield listener
  @override
  void initState() {

    // Nick name
    _nodeNickName.addListener(() {
      if (_nodeNickName.hasFocus) { // get focus
        // _pinCodeHasFocus = false;
        // _repeatPinCodeHasFocus = false;
        if (_nickNameController.text.trim().length == 0) {
          _nickNameHasFocus = false;
        } else {
          _nickNameHasFocus = true;
        }
      } else {
        _nickNameHasFocus = false;
      }
      setState(() {});
    });

    // Pin code
    _nodePinCode.addListener(() {
      if (_nodePinCode.hasFocus) { // get focus
        // _nickNameHasFocus = false;
        // _repeatPinCodeHasFocus = false;
        if (_pinCodeController.text.trim().length == 0) {
          _pinCodeHasFocus = false;
        } else {
          _pinCodeHasFocus = true;
        }
      } else {
        _pinCodeHasFocus = false;
      }
      setState(() {});
    });

    // Repeat pin code
    _nodeRepeatPinCode.addListener(() {
      if (_nodeRepeatPinCode.hasFocus) { // get focus
        // _nickNameHasFocus = false;
        // _pinCodeHasFocus  = false;
        if (_repeatPinCodeController.text.trim().length == 0) {
          _repeatPinCodeHasFocus = false;
        } else {
          _repeatPinCodeHasFocus = true;
        }
      } else {
        _repeatPinCodeHasFocus = false;
      }
      setState(() {});
    });

    super.initState();
  }

  @override
  Widget build(BuildContext context) {

    canCreate = true;

    return Scaffold(
      backgroundColor: AppCustomColor.themeBackgroudColor,

      appBar: AppBar(
        elevation: 0,
        title: Text(WalletLocalizations.of(context).createAccountPageAppBarTitle),
      ),

      body: FormKeyboardActions(
        actions: _actions(),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Form(
              key: _formKey,
              autovalidate: _autoValidate,
              onChanged: () {
                _processTextInput();
              },
              child: Column(
                children: _content(),
              ),
            ),
          ),
        ),
      ),
    );
  }
 
  /// Process text input about length, clear button.
  _processTextInput() {
    // Nick name
    if (_nodeNickName.hasFocus) { 
      if (_nickNameController.text.trim().length == 0) {
        _nickNameHasFocus = false;
      } else {
        _nickNameHasFocus = true;
        if (_nickNameController.text.trim().length > 12) {
          _nickNameController.text = _nickNameController.text.substring(0, 12);
        }
      }
    }

    // Pin code
    if (_nodePinCode.hasFocus) { 
      if (_pinCodeController.text.trim().length == 0) {
        _pinCodeHasFocus = false;
      } else {
        _pinCodeHasFocus = true;
        if (_pinCodeController.text.trim().length > 6) {
          _pinCodeController.text = _pinCodeController.text.substring(0, 6);
        }
      }
    }

    // Repeat Pin code
    if (_nodeRepeatPinCode.hasFocus) {
      if (_repeatPinCodeController.text.trim().length == 0) {
        _repeatPinCodeHasFocus = false;
      } else {
        _repeatPinCodeHasFocus = true;
        if (_repeatPinCodeController.text.trim().length > 6) {
          _repeatPinCodeController.text = _repeatPinCodeController.text.substring(0, 6);
        }
      }
    }

    setState(() {});
  }

  /// Keyboard Actions
  List<KeyboardAction> _actions() {
    List<KeyboardAction> _actions = List();
    List<FocusNode> _nodes = <FocusNode> [
      _nodeNickName, _nodePinCode, _nodeRepeatPinCode
    ];

    for (int i = 0; i < _nodes.length; i++) {
      _actions.add(_keyboardAction(_nodes[i]));
    }

    return _actions;
  }
  
  ///
  KeyboardAction _keyboardAction(FocusNode _node) {
    return KeyboardAction(
      focusNode: _node,
      closeWidget: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Icon(Icons.close),
      )
    );
  }

  /// build children list 
  List<Widget> _content() {

    List<Widget> _list = List();

    List<TextEditingController> _controllers = <TextEditingController> [
      _nickNameController, _pinCodeController, _repeatPinCodeController
    ];

    List<FocusNode> _nodes = <FocusNode> [
      _nodeNickName, _nodePinCode, _nodeRepeatPinCode
    ];

    // List<String> _saveData = <String> [
    //   _strNickName, _strPinCode, _strRepeatPinCode
    // ];

    List<String> _icons = <String> [
      'icon_name', 'icon_password', 'icon_confirm'
    ];
    
    List<String> _hintText = <String> [
      WalletLocalizations.of(context).createAccountPageTooltip_1, 
      WalletLocalizations.of(context).createAccountPageTooltip_2, 
      WalletLocalizations.of(context).createAccountPageTooltip_3
    ];
    
    List<bool> _hasFocus = <bool> [
      _nickNameHasFocus, _pinCodeHasFocus, _repeatPinCodeHasFocus
    ];

    List<String> _helperText = <String> [
      null, 
      WalletLocalizations.of(context).createAccountPageTooltip_4, 
      WalletLocalizations.of(context).createAccountPageTooltip_4
    ];

    List<int> _textFields = <int> [
      1, 2, 3
    ];

    _list.add(_titleImage());

    for (int i = 0; i < _nodes.length; i++) {
      _list.add( _textFormField(
        _controllers[i], _nodes[i], _icons[i], 
        _hintText[i], _hasFocus[i], _helperText[i], _textFields[i]) );

      _list.add(Divider(height: 0, indent: 25));
    }

    // _list.add(Expanded(child: Container()));
    _list.add(_btnCreate());

    return _list;
  }

  // 
  Widget _titleImage() {
    return Padding(
      padding: EdgeInsets.only(top: 30, bottom: 40),
      child: Image.asset(Tools.imagePath('image_account'), width: 68, height: 62)
    );
  }

  // 
  Widget _textFormField(TextEditingController _controller, FocusNode _node, 
        String _iconName, String _hintText, 
        bool _hasFocus, String _helperText, int _textField) {

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 25, vertical: 10),
      child: TextFormField(
        controller:  _controller,
        focusNode:   _node,
        obscureText: _textField == 1 ? false : true,
        keyboardType: _textField == 1 ? null : TextInputType.number,
        // maxLength: _textField == 1 ? 18 : 6,
        decoration: _inputDecoration(_iconName, _hintText, 
          _hasFocus, _helperText, _controller),
        validator: (val) => _validate(val, _textField),
      ),
    );
  }

  //
  InputDecoration _inputDecoration(String _iconName, String _hintText, 
          bool _hasFocus, String _helperText, TextEditingController _controller) {

    return InputDecoration(
      icon: Image.asset(Tools.imagePath(_iconName), width: 16, height: 18),
      border: InputBorder.none,
      filled: true, 
      fillColor: AppCustomColor.themeBackgroudColor,
      // hintText: _hintText,
      labelText: _hintText,
      helperText: _hasFocus ? _helperText : null,
      suffixIcon: _hasFocus ? 
        IconButton(
          splashColor: Colors.transparent,
          highlightColor: Colors.transparent,
          icon: Icon(Icons.highlight_off, color: Colors.grey),
          onPressed: () { _controller.clear(); },
        ) : null,
    );
  }

  /// validate all input data
  String _validate(String val, int _textField) {
    switch (_textField) {
      case 1:
        return _validateNickName(val);
      case 2:
        return _validatePinCode(val);
      case 3:
        return _validateRepeatPinCode(val);
      default:
        return null;
    }
  }

  ///
  String _validateNickName(String val) {
    if (val == null || val.trim().length == 0) {
      return WalletLocalizations.of(context).createAccountPageErrMsgEmpty;
    } else if (val.trim().length < 3) {
      return WalletLocalizations.of(context).createAccountPageErrMsgLength;
    } else {
      return null;
    }
  }
  
  ///
  String _validatePinCode(String val) {
    if (val == null || val.trim().length == 0) {
      return WalletLocalizations.of(context).createAccountPageErrMsgEmpty;
    } else if (val.trim().length < 6) {
      return WalletLocalizations.of(context).createAccountPageErrMsgLength;
    } else {
      return null;
    }
  }

  ///
  String _validateRepeatPinCode(String val) {
    if (val == null || val.trim().length == 0) {
      return WalletLocalizations.of(context).createAccountPageErrMsgEmpty;
    } else if (val.trim().length < 6) {
      return WalletLocalizations.of(context).createAccountPageErrMsgLength;
    } else if (val != _pinCodeController.text) {  // 2 pin codes are inconsistent 
      return WalletLocalizations.of(context).createAccountPageErrMsgInconsistent;
    } else {
      return null;
    }
  }

  /// Create button
  Widget _btnCreate() {
    return Padding(
      padding: EdgeInsets.all(30),
      child: CustomRaiseButton(
        context: context,
        hasRow: false,
        title: WalletLocalizations.of(context).createAccountPageButton,
        titleColor: Colors.white,
        color: AppCustomColor.btnConfirm,
        callback: () { _onSubmit(); },
      ),
    );
  }

  bool canCreate = true;
  /// form submit
  void _onSubmit() {
    if(this.canCreate==false) return ;
    final form = _formKey.currentState;
    if (form.validate()) {
      // form.save();
      this.canCreate =false;
      /// 1) create [Mnemonic Phrase] and save it to locally (Clear text)
      String _mnemonic =  MnemonicPhrase.getInstance().createPhrases();
      print('==> [Mnemonic Phrase] ==> $_mnemonic');

      /// 2) Encrypt the [Mnemonic Phrase] with the MD5 algorithm and
      /// save it locally and remotely as User ID. 
      /// (User ID is used to associate user data)
      String _mnemonic_md5 =  Tools.convertMD5Str(_mnemonic);

      /// 3) Encrypt the [PIN code] with the MD5 algorithm and save it locally
      String _pinCode_md5 = Tools.convertMD5Str(_pinCodeController.text);

      Tools.loadingAnimation(context);
      /// 4) [Nick name] (Clear text) and [Mnemonic Phrase] (MD5) save to remote.
      Future data = NetConfig.post(context,
        NetConfig.createUser,
        {
          'userId':_mnemonic_md5,
          'nickname':_nickNameController.text,
          'password':_pinCode_md5
        },
        errorCallback: (){
          Navigator.of(context).pop();
          canCreate = true;
        }
      );

      data.then((data) {
        if(NetConfig.checkData(data)) {
          GlobalInfo.userInfo.userId   = _mnemonic_md5;
          GlobalInfo.userInfo.mnemonic = _mnemonic;
          GlobalInfo.userInfo.pinCode  = _pinCode_md5;
          GlobalInfo.userInfo.nickname = _nickNameController.text;
          GlobalInfo.userInfo.loginToken = data['token'];
          Tools.saveStringKeyValue(KeyConfig.user_login_token, GlobalInfo.userInfo.loginToken);

          Tools.saveStringKeyValue(KeyConfig.user_mnemonic, Tools.encryptAes(_mnemonic));
          Tools.saveStringKeyValue(KeyConfig.user_mnemonic_md5, _mnemonic_md5);
          Tools.saveStringKeyValue(KeyConfig.user_pinCode_md5, _pinCode_md5);

          GlobalInfo.userInfo.mnemonicSeed = null;

          GlobalInfo.userInfo.init(context,(){
            Navigator.of(context).pop();
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(
                  builder: (BuildContext context) {
                    return BackupWalletIndex(param: null,);
                  }
              ),
                  (route) => route == null,
            );
          });
        }
      });
      
    } else {
      setState(() {
        _autoValidate = true;
      });
    }
  }
}