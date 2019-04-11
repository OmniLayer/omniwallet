import 'package:flutter/material.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/main_view/home/send_page.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class AddressBook extends StatefulWidget {
  static String tag = "Address Book";
  int parentPageId;
  AddressBook({Key key,this.parentPageId=null}):super(key:key);
  @override
  _AddressBookState createState() => _AddressBookState();
}

class _AddressBookState extends State<AddressBook> {
  MainStateModel stateModel = null;
  GlobalKey<FormState> _formKey = new GlobalKey<FormState>();
  List<UsualAddressInfo> _usualAddressList;
  UsualAddressInfo _newAddressInfo = UsualAddressInfo();
  UsualAddressInfo _selectItem ;

  @override
  Widget build(BuildContext context) {
    stateModel = MainStateModel().of(context);
    _usualAddressList = stateModel.usualAddressList;
    _newAddressInfo = UsualAddressInfo();
    return ScopedModelDescendant<MainStateModel>(builder: (context, child, model)
    {
      return Scaffold(
        appBar: AppBar(
          title: Text(AddressBook.tag), elevation: 0,
          actions: <Widget>[
            IconButton(icon: Icon(Icons.add), onPressed: () {
              _selectItem = null;
              buildShowDialog(context);
            },),
          ],
        ),
        backgroundColor: AppCustomColor.themeBackgroudColor,
        body: this.body(),
      );
    });
  }

  buildShowDialog(BuildContext context) {
    return showDialog(
        context: context,
        builder:(BuildContext context){
           return Form(
             key: _formKey,
             child: SimpleDialog(
               shape: RoundedRectangleBorder(
                 borderRadius: BorderRadius.circular(8.0),
               ),
               contentPadding: EdgeInsets.symmetric(horizontal: 20),
              title: Column(
                children: <Widget>[
                  Text(WalletLocalizations.of(context).address_book_title),
                ],
                mainAxisAlignment: MainAxisAlignment.start
              ),
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.symmetric (vertical: 8),
                  child: TextFormField(
                    initialValue: _selectItem==null?'':_selectItem.name,
                    validator: (val){
                      if(val==null||val.length==0){
                        return "wrong name";
                      }
                    },
                    onSaved: (val){
                      _newAddressInfo.name = val;
                    },
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      hintText: WalletLocalizations.of(context).createNewAddress_hint1
                    ),
                  ),
                ),
                Divider(height: 1,),
                Padding(
                  padding: const EdgeInsets.symmetric (vertical: 8),
                  child: Container(
                    child: TextFormField(
                      initialValue: _selectItem==null?'':_selectItem.address,
                      validator: (val){
                        if(val==null||val.length==0){
                          return WalletLocalizations.of(context).wallet_send_page_input_address_error;
                        }
                      },
                      onSaved: (val){
                        _newAddressInfo.address = val;
                      },
                      decoration: InputDecoration(
                          border: InputBorder.none,
                        hintText: WalletLocalizations.of(context).wallet_send_page_input_address_hint
                      ),
                    ),
                    width: MediaQuery.of(context).size.width,
                  ),
                ),
                Divider(height: 1,),
                Padding(
                  padding: const EdgeInsets.symmetric (vertical: 8),
                  child: TextFormField(
                    initialValue: _selectItem==null?'':_selectItem.note,
                    onSaved: (val){
                      if(val==null) val='';
                      _newAddressInfo.note = val;
                    },
                    decoration: InputDecoration(
                        border: InputBorder.none,
                      hintText: WalletLocalizations.of(context).wallet_send_page_title_note
                    ),
                  ),
                ),
                Divider(height: 1,),
                Padding(
                  padding: const EdgeInsets.only(top: 20,bottom: 36),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: <Widget>[
                      RaisedButton(
                        onPressed: (){
                          Navigator.of(context).pop();
                        },
                        child: Text(WalletLocalizations.of(context).createNewAddress_Cancel,style: TextStyle(color: Colors.blue),),
                        color: Colors.lightBlue[50],
                        padding: EdgeInsets.symmetric(horizontal: 50)
                      ),
                      Expanded(child: Container()),
                      RaisedButton(
                        onPressed: (){
                          var _form = _formKey.currentState;
                          if (_form.validate()) {
                            _form.save();
                            if(_selectItem==null){
                              stateModel.addAddress(_newAddressInfo);
                            }else
                            {
                              _usualAddressList.remove(_selectItem);
                              stateModel.addAddress(_newAddressInfo);
                            }
                            Navigator.of(context).pop();
                          }
                        },
                        child: Text(WalletLocalizations.of(context).common_btn_save),
                        color: Colors.lightBlue,
                        padding: EdgeInsets.symmetric(horizontal: 50)
                      ),
                    ],
                  ),
                ),
              ],
          ),
           );
        },
      );
  }
  Widget body(){
    if(this._usualAddressList.length==0){
        return Center(child: Text('book is empty'),);
    }else
    {
      return ListView.builder(
          itemCount: _usualAddressList.length,
          itemBuilder: (BuildContext context, int index){
            return buildTile(index);
          }
      );
    }
  }


  Widget buildTile(int index) {
    var node = _usualAddressList[index];
    return InkWell(
      onTap:  widget.parentPageId!=null?(){
        stateModel.currSelectedUsualAddressIndex = index;
        Navigator.of(context).pop();
      }:null,
      child: Slidable(
        delegate: new SlidableDrawerDelegate(),
        actionExtentRatio: 0.25,
        secondaryActions: <Widget>[
          new IconSlideAction(
            caption: 'Delete',
            color: Colors.red,
            icon: Icons.delete,
            onTap: () => stateModel.delAddress(index),
          ),
        ],
        child: Container(
          margin: EdgeInsets.only(top: 10,left: 20),
          child: Row(
            children: <Widget>[
              Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Row(
                      children: <Widget>[
                        Text('${node.name}',style: TextStyle(fontSize: 20,fontWeight: FontWeight.w600),),
                        Padding(
                          padding: const EdgeInsets.only(left: 20),
                          child: Text('${node.note}',style: TextStyle(fontSize: 14,fontWeight: FontWeight.w100),),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Text('${node.address}',style: TextStyle(fontSize: 14,fontWeight: FontWeight.w300),),
                  ),
                  Divider(
                    color: Theme.of(context).dividerColor,
                    height: 1,
                  )
                ],
              ),
              Expanded(child: Container()),
              IconButton(icon: Icon(Icons.mode_edit),onPressed: (){
                _selectItem = node;
                buildShowDialog(context);
              },),
            ],
          ),
        ),
      ),
    );
  }
}
