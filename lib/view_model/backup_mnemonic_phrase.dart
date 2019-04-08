import 'package:wallet_app/view_model/state_lib.dart';
import 'dart:math';

class BackupMnemonicPhrase extends Model{

  List<WordInfo> wordList=null;

  List<WordInfo> createNewWords(){
    if(this.wordList!=null){
      this.wordList.clear();
    }
    this.wordList = [
      WordInfo(content: 'word1' ,seqNum: 0),WordInfo(content: 'word2' ,seqNum: 1 ),
      WordInfo(content: 'word3' ,seqNum: 2),WordInfo(content: 'word4' ,seqNum: 3),
      WordInfo(content: 'word5' ,seqNum: 4 ),WordInfo(content: 'word6' ,seqNum: 5),
      WordInfo(content: 'word7' ,seqNum: 6 ),WordInfo(content: 'word8' ,seqNum: 7),
      WordInfo(content: 'word9' ,seqNum: 8 ),WordInfo(content: 'word10' ,seqNum: 9),
      WordInfo(content: 'word11' ,seqNum: 10 ),WordInfo(content: 'word12' ,seqNum: 11),
    ];
    return this.wordList;
  }

  List<WordInfo> get mnemonicPhrases{
    if(this.wordList==null){
      createNewWords();
    }
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
    if(this.wordList==null){
      createNewWords();
    }
    String result = '';
    for(int i=0;i<this.wordList.length;i++){
      result += '${i+1}:'+this.wordList[i].content+",";
    }
    result = result.substring(0,result.length-1);
    return result;
  }

}