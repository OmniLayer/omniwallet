import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/view/backupwallet/backup_wallet_word_order.dart';


class WordInfo{
  String content;
  bool visible;
  WordInfo({@required this.content,this.visible=false});
}


class BackupWalletWords extends StatefulWidget {
  @override
  _BackupWalletWordsState createState() => _BackupWalletWordsState();
}

class _BackupWalletWordsState extends State<BackupWalletWords> {

  List<WordInfo> words=[
    WordInfo(content: 'word' ),WordInfo(content: 'word' ),WordInfo(content: 'word' ),WordInfo(content: 'word' ),
    WordInfo(content: 'word' ),WordInfo(content: 'word' ),WordInfo(content: 'word' ),WordInfo(content: 'word' ),
    WordInfo(content: 'word' ),WordInfo(content: 'word' ),WordInfo(content: 'word' ),WordInfo(content: 'word' ),
    WordInfo(content: 'word' ),WordInfo(content: 'word' ),WordInfo(content: 'word' ),WordInfo(content: 'word' )
  ];

  Widget wordBulid(BuildContext context){
    return GridView.builder(
      physics: new NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.only(left:20,right: 20,top: 24),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 8,
        mainAxisSpacing: 12.0,
        crossAxisSpacing: 4.0,
        childAspectRatio: 2
      ),
      itemCount: 16,
      itemBuilder: (BuildContext context, int index) {
        return Text(words[index].content);
      },
    );
  }


  Widget pageCentent(BuildContext context){
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Expanded(child: Container(),flex: 3,),
          Text(WalletLocalizations.of(context).backup_words_content),
          Expanded(child: Container(),flex: 1),
          Container(
            decoration: BoxDecoration(
              color: Color(0xECE0E0FF),
              borderRadius: BorderRadius.circular(5)
            ),
            width: MediaQuery.of(context).size.width*0.9,
            height: 90,
            child:wordBulid(context),
          ),
          Expanded(child: Container(),flex: 2,),
          RaisedButton(
            onPressed: (){
              Navigator.push(context, MaterialPageRoute(builder: (BuildContext context) => BackupWalletWordsOrder()));
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40,vertical: 10),
              child: Text(WalletLocalizations.of(context).backup_words_next,style: TextStyle(fontSize: 16),),
            ),
          ),
          Expanded(child: Container(),flex: 3,),
        ],
      ),
    );
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(WalletLocalizations.of(context).backup_words_title),
//        leading: Icon(Icons.arrow_back_ios),
      ),
      body: pageCentent(context),
    );
  }
}
