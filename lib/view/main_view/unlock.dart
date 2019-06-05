import 'dart:async';

/// Unlock app.
/// [author] Kevin Zhang
/// [time] 2019-5-8

import 'package:flutter/material.dart';
import 'package:keyboard_actions/keyboard_actions.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/Tools.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class Unlock extends StatefulWidget {
  static String tag = "Unlock";

  /// 1:Splash 2:Background 11:Backup 12:Send
  final int parentID;

  // for unlock to back up page from my page.
  final Function callback;
  Unlock({Key key, this.callback, this.parentID = null}) : super(key: key);

  @override
  _UnlockState createState() => _UnlockState();
}

class _UnlockState extends State<Unlock> {
  /// form define
  GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  TextEditingController _pinCodeController = TextEditingController();
  FocusNode _nodePin = FocusNode();
  bool _hasClearIcon = false;
  bool _hasSixNumber = false;

  @override
  void initState() {
    GlobalInfo.isUnlockSuccessfully = false;
    GlobalInfo.fromParent = widget.parentID;
    // Tools.showToast('isUnlockSuccessfully = ${GlobalInfo.isUnlockSuccessfully}');
    _nodePin.addListener(_listener);
    super.initState();
  }

  /// textfield listener
  void _listener() {
    if (_nodePin.hasFocus) { // get focus
      if (_pinCodeController.text.trim().length == 0) {
        _hasClearIcon = false;
      } else {
        _hasClearIcon = true;
      }
    } else {
      _hasClearIcon = false;
    }
    setState(() {});
  }

  @override
  void dispose() {
    // GlobalInfo.isUnlockSuccessfully = true;
    // print("==> dispose -> isUnlockSuccessfully = ${GlobalInfo.isUnlockSuccessfully}");
    _pinCodeController.dispose();
    _nodePin.removeListener(_listener);
    super.dispose();
  }



  
  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: widget.parentID > 10 ? () {
        FocusScope.of(context).requestFocus(new FocusNode());
        GlobalInfo.isUnlockSuccessfully = true;
        return Future.value(true);
      } : () => Future.value(false),

      child: Scaffold(
        appBar: AppBar(
          // leading: FlatButton(
          //   child: Text('Cancel'),
          //   onPressed: () {
          //     Navigator.of(context).pop();
          //   },
          // ),
          automaticallyImplyLeading: widget.parentID > 10 ? true : false,
          title: Text(WalletLocalizations.of(context).unlockPageAppBarTitle),
        ),

        body: FormKeyboardActions(
          actions: _actions(),
          child: SafeArea(
            child: SingleChildScrollView(
              child: Column(
                children: <Widget>[
                  _inputPIN(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  ///
  List<KeyboardAction> _actions() {
    List<KeyboardAction> _actions = <KeyboardAction> [
      KeyboardAction(
        focusNode: _nodePin,
        closeWidget: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Icon(Icons.close),
        )
      )
    ];

    return _actions;
  }

  ///
  Widget _inputPIN() {
    return Form(
      key: _formKey,
      // autovalidate: true,
      onChanged: () {
        if (_pinCodeController.text.trim().length == 0) {
          _hasClearIcon = false;
        } else {
          _hasClearIcon = true;
          if (_pinCodeController.text.trim().length == 6) {
            if (_hasSixNumber == false) {
              _hasSixNumber = true;
              _unlockApp();
            }
          }
        }
        setState(() {});
      },
      
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 70),
        child: TextFormField(
          enableInteractiveSelection: false,  // disable copy / paste text .
          controller:  _pinCodeController,
          focusNode:   _nodePin,
          autofocus: true,
          obscureText: true,
          maxLength: 6,
          validator: (val) => _validatePIN(val),
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            labelText: WalletLocalizations.of(context).createAccountPageTooltip_2,
            // hintStyle: TextStyle(fontSize: 14), 
            suffixIcon: _hasClearIcon ? 
              IconButton(
                splashColor: Colors.transparent,
                highlightColor: Colors.transparent,
                icon: Icon(Icons.highlight_off, color: Colors.grey),
                onPressed: () { _pinCodeController.clear(); },
              ) : null,
          ),
        ),
      ),
    );
  }
  
  /// validate pin
  _validatePIN(String val) {
    if (Tools.convertMD5Str(val) != GlobalInfo.userInfo.pinCode) {
      return WalletLocalizations.of(context).unlockPageAppTips;
    }
    return null;
  }

  /// Unlock app.
  void _unlockApp() {
    // print('==> Unlock PAGE -> Where From = ${GlobalInfo.fromWhere}');
    final form = _formKey.currentState;

    if (form.validate()) { // Unlocked successfully.
      FocusScope.of(context).requestFocus(new FocusNode());
      _pinCodeController.clear();

      GlobalInfo.isUnlockSuccessfully = true;  // Not be locked. (Unlock successfully)

      if (widget.callback != null) { // from send or my page.
        widget.callback();
      } else { // from background
        Navigator.of(context).pop();
      }

      print("==> _unlockApp -> isUnlockSuccessfully = ${GlobalInfo.isUnlockSuccessfully}");

    } else {
      _hasSixNumber = false;
    }
  }
}