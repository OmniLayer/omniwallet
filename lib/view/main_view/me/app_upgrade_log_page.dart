import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class AppVersionInfo{
  String name;
  String note;
  String noteEn;
  DateTime createTime;
}

class AppUpgradeLogPage extends StatefulWidget {
  static String tag = "AppUpgradeLogPage";

  @override
  _AppUpgradeLogPageState createState() => _AppUpgradeLogPageState();
}

class _AppUpgradeLogPageState extends State<AppUpgradeLogPage> {

  List<AppVersionInfo> infoes = [];
  bool isLoadingData = true;

  @override
  void initState() {
    super.initState();
    Future future = NetConfig.get(context, NetConfig.appVersionList);
    future.then((data){
      if(data!=null){
        this.infoes.clear();
        List list = data['data'];
        for(int i=0;i<list.length;i++){
          var dataNode = list[i];
          var info = AppVersionInfo();
          info.name = dataNode['name'];
          info.note = dataNode['note'];
          info.note = info.note==null?'':info.note;
          info.noteEn = dataNode['noteEn'];
          info.noteEn = info.noteEn==null?'':info.noteEn;
          info.createTime = DateTime.fromMillisecondsSinceEpoch(list[i]['createTime']);
          this.infoes.add(info);
        }
      }
      isLoadingData = false;
      setState(() {
      });
    }
    );
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor:AppCustomColor.themeBackgroudColor,
      appBar: AppBar(
        elevation:0,
        title: Text(WalletLocalizations.of(context).me_about_app_upgrade_log_title),
      ),
      body: this.body(),
    );
  }
  Widget body(){
    if(this.isLoadingData){
        return Center(child:CircularProgressIndicator());
    }else{
      return SingleChildScrollView(
        child: Column(
          children: itemes(),
        ),
      );
    }
  }

  List<Widget> itemes(){
    List<Widget> list = [];
    for(int i=0;i<this.infoes.length;i++){
      var info = this.infoes[i];
      var node = ExpansionTile(
        title: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Text(info.name),
        ),
        children: <Widget>[
          Align(
            alignment: Alignment(-1, 0),
            child: Padding(
              padding: const EdgeInsets.only(left: 20,right: 12,bottom: 12,top: 10),
              child: Text(
                GlobalInfo.currLanguage==KeyConfig.languageEn?info.noteEn:info.note,
              ),
            )
          ),
          Align(
            alignment: Alignment(1, 0),
            child: Padding(
              padding: const EdgeInsets.only(right: 12,bottom: 10),
              child: Text(DateFormat('yyyy-MM-dd').format(info.createTime)),
            )
          ),
        ],
      );
      list.add(node);
    }
    return list;
  }
}
