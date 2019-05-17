import 'package:wallet_app/view_model/state_lib.dart';

class BackupMnemonicPhrase extends Model{

  List<WordInfo> wordList=null;

  List<WordInfo> createNewWords(String mnemonic){
    if(this.wordList!=null){
      this.wordList.clear();
    }else{
      this.wordList = [];
    }

    List<String> list = mnemonic.split(' ');
    for(int count=0;count<list.length;count++){
      this.wordList.add(WordInfo(content: list[count],seqNum: count));
    }
    return this.wordList;
  }

  List<WordInfo> get mnemonicPhrases{
    createNewWords(GlobalInfo.userInfo.mnemonic);
    return this.wordList;
  }

  List<WordInfo> get randomSortMnemonicPhrases{
    var temp = this.wordList.sublist(0);
    for(var item in temp){
      item.visible=true;
    }
    temp.shuffle();
    return temp;
  }

  String get mnemonicPhraseString{
    String result = '';
    if(this.wordList==null){
      return result;
    }
    for(int i=0;i<this.wordList.length;i++){
      result += this.wordList[i].content+' ';
    }
    result = result.substring(0,result.length-1);
    return result;
  }

}