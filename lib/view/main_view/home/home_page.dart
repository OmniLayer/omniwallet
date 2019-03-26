import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/view/main_view/home/main_page_content.dart';

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override void initState() {
    super.initState();
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        leading: null,
        title: Center(child: Text(WalletLocalizations.of(context).main_page_title)),
        actions: <Widget>[
          FlatButton(onPressed: (){
            this.showCreateWalletPage(context);
          }, child: Text('创建钱包'))
        ],
      ),
      body: new BodyContentWidget(),
    );
  }

  void showCreateWalletPage(BuildContext context) {
    final addressController = TextEditingController();
    final noteController = TextEditingController();
    showDialog(
        context: context,
        builder: (BuildContext context){
            return SimpleDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(10),
                    topRight: Radius.circular(10),
                  bottomLeft: Radius.circular(5),
                  bottomRight: Radius.circular(5)
                )
              ),
              children: <Widget>[
                Icon(
                    Icons.edit,
                  size: 60,
                ),

                Align(
                  child: Text('创建新的钱包地址',style: TextStyle(fontSize: 20,fontWeight: FontWeight.w600)),
                  alignment:  Alignment(0, 0)
                ),

                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16,horizontal: 20),
                  child: TextField(
                    controller:  addressController,
                    decoration: InputDecoration(
                      contentPadding: EdgeInsets.all(8),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      labelText: '地址名称',
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 0,horizontal: 20),
                  child: TextField(
                    controller:  noteController,
                    decoration: InputDecoration(
                      contentPadding: EdgeInsets.all(8),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      labelText: '备注',
                    ),
                  ),
                ),
                SizedBox(height: 20,),
                Row(
                  mainAxisSize: MainAxisSize.max,
                  children: <Widget>[
                    Expanded(child: Container()),
                    RaisedButton(
                      onPressed: (){
                        Navigator.of(context).pop();
                      },
                      child: Text('取消'),
                  ),
                    Expanded(child: Container()),
                    RaisedButton(
                      onPressed: (){
                        Navigator.of(context).pop();
                      },
                      child: Text('确认'),
                  ),
                    Expanded(child: Container()),
                ],)
              ],
            );
        }
    );
  }
}

