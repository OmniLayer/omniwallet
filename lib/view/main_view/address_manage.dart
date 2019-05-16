/// Addresses Management page.
/// [author] Kevin Zhang
/// [time] 2019-4-25

import 'dart:async';

import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:keyboard_actions/keyboard_actions.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class AddressManage extends StatefulWidget {
  static String tag = "AddressManage";

  /// Holds data of an address
  final WalletInfo data;

  // In the constructor, require a WalletInfo
  AddressManage({Key key, @required this.data}) : super(key: key);

  @override
  _AddressManageState createState() => _AddressManageState();
}

class _AddressManageState extends State<AddressManage> {

  bool _hasClearIcon = false;
  bool _isAddressDisplay;

  FocusNode _nodeText = FocusNode();
  TextEditingController _nameController = TextEditingController();
  GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    _nodeText.addListener(() {
      if (_nodeText.hasFocus) { // get focus
        if (_nameController.text.trim().length == 0) {
          _hasClearIcon = false;
        } else {
          _hasClearIcon = true;
        }
      } else {
        _hasClearIcon = false;
      }
      setState(() {});
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Text(WalletLocalizations.of(context).addressManagePageAppBarTitle),
      ),

      body: FormKeyboardActions(
        actions: _actions(),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: EdgeInsets.only(top: 10),
            child: ListView(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              children: _content(),
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
        focusNode: _nodeText,
        closeWidget: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Icon(Icons.close),
        )
      )
    ];

    return _actions;
  }

  /// body content
  List<Widget> _content() {

    // list tile
    List<Widget> _list = List();

    _list.add(_bodyTitle());
    _list.add(_addressNameTitle());
    _list.add(_changeAddressName());
    _list.add(_addressDisplayTitle());
    _list.add(_switchAddressDisplay());
    _list.add(_assetListTitle());
    _list.add(
      Column(
        children: _assetList(),
      )
    );

    return _list;
  }

  ///
  Widget _bodyTitle() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: AutoSizeText(
        widget.data.address,
        overflow: TextOverflow.ellipsis,
        textAlign: TextAlign.center,
        minFontSize: 9,
        maxLines: 1,
        style: TextStyle(
          color: Colors.blue,
          fontSize: 16,
        ),
      ),
    );
  }

  ///
  Widget _addressNameTitle() {
    return Padding(
      padding: const EdgeInsets.only(left: 15, top: 20, bottom: 10),
      child: Text(
        WalletLocalizations.of(context).addressManagePageAddressNameTitle,
        style: TextStyle(color: Colors.grey),
      ),
    );
  }

  ///
  Widget _addressDisplayTitle() {
    return Padding(
      padding: const EdgeInsets.only(left: 15, top: 20, bottom: 10),
      child: Text(
        WalletLocalizations.of(context).addressManagePageAddressDisplayTitle,
        style: TextStyle(color: Colors.grey),
      ),
    );
  }
  
  ///
  Widget _changeAddressName() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      color: AppCustomColor.themeBackgroudColor,
      child: Row(
        children: <Widget>[
          _addressName(),
          SizedBox(width: 20),
          _btnEdit(),
        ],
      ),
    );
  }

  ///
  Widget _addressName() {
    return Expanded(
      child: Text(
        widget.data.name,
        style: TextStyle(fontSize: 16),
      )
    );
  }

  /// _btnEdit
  Widget _btnEdit() {
    return FlatButton(
      child: Text(
          WalletLocalizations.of(context).addressManagePageEditButton,
          style: TextStyle(color: Colors.blue[800]),
        ),

      onPressed: () {
        _dialogEditAddressName();
      },
    );
  }

  ///
  void _dialogEditAddressName() {
    _nameController.text = widget.data.name;
    showDialog(
      context: context,
      barrierDismissible: false,  // user must tap button to dismiss dialog.
      builder: (BuildContext context) {
        return SimpleDialog(
          title: Text(
            WalletLocalizations.of(context).addressManagePageAddressNameTitle,
            textAlign: TextAlign.center,
          ),

          children: <Widget>[
            _inputNewName(),  // TextFormField
            Row( // Two buttons.
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                _btnCancel(),
                _btnConfirm(),
              ],
            )
          ],
        );
      }
    );
  }

  /// 
  Widget _btnCancel() {
    return FlatButton(
      child: Text(
        WalletLocalizations.of(context).createNewAddress_Cancel,
        style: TextStyle(color: Colors.grey[600]),
      ),
      onPressed: () {
        Navigator.of(context).pop();
      },
    );
  }

  /// 
  Widget _btnConfirm() {
    return FlatButton(
      child: Text(
        WalletLocalizations.of(context).common_btn_confirm,
        style: TextStyle(color: Colors.blue),
      ),
      onPressed: () {
        _onSubmit();
      },
    );
  }

  /// update address name
  void _onSubmit() {
    final form = _formKey.currentState;
    if (form.validate()) {
      // Tools.loadingAnimation(context);

      // submit new name to server
      Future response = NetConfig.post(context,NetConfig.changeAddressName, {
        'address': widget.data.address,
        'addressName': _nameController.text.trim(),
      });

      response.then((val) {
        if (val != null) {
          setState(() {
            widget.data.name = _nameController.text.trim(); // change locally data.
            Navigator.of(context).pop(); // Pop loading
            Navigator.of(context).pop(); // Pop dialog
          });
        }
      });
    } 
  }

  ///
  Widget _inputNewName() {
    return StatefulBuilder(builder: (context, StateSetter setState) {
      return Form(
        key: _formKey,
        autovalidate: true,
        onChanged: () {
          // print('==> VAL --> ${_nameController.text}');
          if (_nameController.text.trim().length == 0) {
            _hasClearIcon = false;
          } else {
            _hasClearIcon = true;
          }
          setState(() { });
        },
        
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          child: TextFormField(
            controller:  _nameController,
            focusNode:   _nodeText,
            // autofocus: true,
            validator: (val) => _validate(val),
            decoration: InputDecoration(
              hintText: WalletLocalizations.of(context).addressManagePageEditTips,
              hintStyle: TextStyle(fontSize: 14),
              suffixIcon: _hasClearIcon ? 
                IconButton(
                  splashColor: Colors.transparent,
                  highlightColor: Colors.transparent,
                  icon: Icon(Icons.highlight_off, color: Colors.grey),
                  onPressed: () { _nameController.clear(); },
                ) : null,
            ),
          ),
        ),
      );
    });
  }

  /// validate new name
  String _validate(String val) {
    if (val == null || val.trim().length == 0) {
      return WalletLocalizations.of(context).createAccountPageErrMsgEmpty;
    } else {
      return null;
    }
  }

  ///
  Widget _switchAddressDisplay() {
    
    _isAddressDisplay = widget.data.visible;

    return Container(
      color: AppCustomColor.themeBackgroudColor,
      child: ListTile(
        title: Text(WalletLocalizations.of(context).addressManagePageAddressDisplay),
        trailing: Switch(
          value: _isAddressDisplay, 
          onChanged: (bool value) {
            _isAddressDisplay = !_isAddressDisplay;
            print('==> _isAddressDisplay = $_isAddressDisplay');

            Future response = NetConfig.post(context,NetConfig.setAddressVisible, {
              'address': widget.data.address, 
              'visible': _isAddressDisplay.toString(),
            });

            response.then((val) {
              if (val != null) {
                widget.data.visible = _isAddressDisplay;
                setState(() {});
              }
            });
          }
        ),
      ),
    );
  }

  // TODO: test loading
  Widget _testLoading() {
    return Stack(
      children: <Widget>[
        Opacity(
          opacity: 0.3,
          child: const ModalBarrier(dismissible: false, color: Colors.grey),
        ),

        Center(
          child: CircularProgressIndicator(),
        )
      ],
    );
  }

  ///
  Widget _assetListTitle() {
    return Padding(
      padding: const EdgeInsets.only(left: 15, top: 20, bottom: 10),
      child: Text(
        WalletLocalizations.of(context).addressManagePageAssetsDisplay,
        style: TextStyle(color: Colors.grey),
      ),
    );
  }

  /* COMMENT FOR NEW DESIGN.
  ///
  Widget _assetListTitle() {
    return Padding(
      padding: const EdgeInsets.only(left: 15, top: 20),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Text(
              WalletLocalizations.of(context).addressManagePageAssetsDisplay,
              style: TextStyle(color: Colors.grey),
            ),
          ),

          Padding( // (+) button for manage displayed assets.
            padding: const EdgeInsets.only(right: 12),
            child: IconButton(
              icon: Icon(Icons.add_circle),
              color: Colors.blue,
              disabledColor: Colors.grey[300],
              onPressed: !_isAddressDisplay ? null : 
                () {
                  // Navigator.of(context).pushNamed(DisplayedAssets.tag);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => DisplayedAssets(address_data: widget.data),
                    ),
                  );
                },
            ),
          )
        ],
      ),
    );
  }
  */ // COMMENT FOR NEW DESIGN.

  /// asset list
  List<Widget> _assetList() {
    int assetAmount = widget.data.accountInfoes.length;
    print('==> total asset amount = $assetAmount');

    // list tile
    List<Widget> _list = List();

    for (int i = 0; i < assetAmount; i++) {
      _list.add(_assetItem(widget.data.accountInfoes[i], i));
      _list.add(Divider(height: 0, indent: 15));

      // if (widget.data.accountInfoes[i].visible) {
      //   _list.add(_assetItem(widget.data.accountInfoes[i], i));
      //   _list.add(Divider(height: 0, indent: 15));
      // } else { // visible = false
      //   if (_hideAssetIndex == i) { // not pop.
      //     _list.add(_assetItem(widget.data.accountInfoes[i], i));
      //     _list.add(Divider(height: 0, indent: 15));
      //   }
      // }
    }

    return _list;
  }

  /// every asset
  Widget _assetItem(AccountInfo assetData, int index) {

    print('==> asset visible = ${assetData.visible}');

    return Container(
      color: AppCustomColor.themeBackgroudColor,
      child: ListTile(
        enabled: _isAddressDisplay ? true : false,
        // leading: Image.asset(assetData.iconUrl),
        title: Text(
          assetData.name,
          style: TextStyle(color: assetData.visible ? null : Colors.grey),
        ),
        trailing: Switch(
          value: assetData.visible,
          onChanged: !_isAddressDisplay ? null : (bool value) {
            bool flag  = !assetData.visible;

            // print('==> address = ${widget.data.address}');
            print('==> assetId = ${assetData.propertyId}');

            Future response = NetConfig.post(context,NetConfig.setAssetVisible, {
              'address': widget.data.address,
              'assetId': assetData.propertyId.toString(),
              'visible': flag.toString(),
            });

            response.then((val) {
              if (val != null) {
                assetData.visible = !assetData.visible;
                setState(() {});
              }
            });
          },
        ),
      ),
    );
  }
}