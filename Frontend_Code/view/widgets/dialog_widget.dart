import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/widgets/custom_raise_button_widget.dart';

/**
 * 创建新的钱包地址 钱包页面的右上角的点击事件
 */
class CreateNewAddressDialog extends StatefulWidget {
  final Function callback;
  final Function showSnackBar;
  CreateNewAddressDialog({Key key, this.callback,this.showSnackBar}) : super(key: key);

  @override
  _CreateNewAddressDialogState createState() => _CreateNewAddressDialogState();
}

class _CreateNewAddressDialogState extends State<CreateNewAddressDialog> {
  GlobalKey<FormState> _formKey = new GlobalKey<FormState>();
  String _addressName;

  @override
  Widget build(BuildContext context) {
    var header = Container
      (
        height: 70,
        decoration: BoxDecoration(
            gradient: LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                colors: [
                  Color(0xFF78A9FA),
                  Color(0xFF6690F9),
                ]),
            borderRadius: BorderRadius.only(
                topLeft: Radius.circular(5),
                topRight: Radius.circular(5))),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Container(
                width: double.infinity,
                child: Center(
                  child: Text(
                    WalletLocalizations.of(context).createNewAddress_title,
                    style: TextStyle(
                      color: Colors.white70, fontSize: 20),
                  ),
                ))
          ],
        ),
      );
    var body = Container(
                            margin: EdgeInsets.only(left: 20, top: 20,right: 20),
                            child: TextFormField(
                              validator: (val){
                                if(val==null||val.trim().length==0){
                                  return WalletLocalizations.of(context).createNewAddress_WrongAddress;
                                }
                              },
                              onSaved: (val){
                                this._addressName = val;
                              },
                              style: TextStyle(fontSize: 20),
                              decoration: InputDecoration(
                                  border: AppCustomColor.themeBackgroudColor==Colors.black?OutlineInputBorder():InputBorder.none,
                                  contentPadding: EdgeInsets.only(left: 4,bottom: 2,top: 8),
                                  hintText: WalletLocalizations.of(context).createNewAddress_hint1,
                                  hintStyle: TextStyle(
                                      color: Colors.grey, fontSize: 14)),
                            ),
                          );
    var footer = Padding(
                            padding: const EdgeInsets.only(
                                left: 20, right: 20, top: 6,bottom: 14),
                            child: Row(
                              children: <Widget>[
                                CustomRaiseButton( // Next button.
                                  context: context,
                                  title: WalletLocalizations.of(context).createNewAddress_Cancel,
                                  titleColor: Colors.blue,
                                  color: AppCustomColor.btnCancel,
                                  callback: () {
                                    Navigator.of(context).pop();
                                  },
                                ),
                                SizedBox(width: 20,),
                                CustomRaiseButton( // Next button.
                                  context: context,
                                  title: WalletLocalizations.of(context).createNewAddress_Add,
                                  titleColor: Colors.white,
                                  color: AppCustomColor.btnConfirm,
                                  callback: () {
                                    var _form = _formKey.currentState;
                                    if(_form.validate()){
                                      _form.save();
                                      widget.callback(_addressName);
                                      Navigator.pop(context);
                                    }
                                  },
                                ),
                              ],
                            ),
                          );
    return GestureDetector(
        onTap: () {
          Navigator.pop(context);
        },
        child: Material(
            type: MaterialType.transparency,
            child: GestureDetector(
              onTap: () {

              },
              child: Align(
                alignment: Alignment(0, -0.5),
                child: SizedBox(
                  width: MediaQuery.of(context).size.width * 0.9,
                  height: MediaQuery.of(context).size.height * 0.33,
                  child: Container(
                    decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey),
                        color: AppCustomColor.themeBackgroudColor,
                        borderRadius: BorderRadius.circular(5)),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        children: <Widget>[
                          header,
                          Expanded(child: Container()),
                          body,
                          Padding(
                            padding: const EdgeInsets.only(
                                left: 20, right: 20, top: 8),
                            child: Divider(
                              height: 1,
                            ),
                          ),
                          Expanded(child: Container()),
                          footer
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            )
        )
    );
  }
}
