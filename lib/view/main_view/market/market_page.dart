import 'dart:convert';

import 'package:auto_size_text/auto_size_text.dart';
/// Market quotatio main page.
/// [author] Kevin Zhang
/// [time] 2019-3-13

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:wallet_app/l10n/WalletLocalizations.dart';

import 'package:wallet_app/view/main_view/market/market_detail.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class MarketPage extends StatefulWidget {
  @override
  _MarketPageState createState() => _MarketPageState();
}

class _MarketPageState extends State<MarketPage> with SingleTickerProviderStateMixin{

  List dataList = null;
  Map<int,Object> dataMap = Map();
  List<String> exchanges=[
    'Binance',
    'Bitfinex',
  ];
  RefreshController _refreshController;
  TabController _tabController;

  bool onTouchTab = false;


  @override
  void initState() {
    super.initState();
    _refreshController = RefreshController();
    _tabController = TabController(length: exchanges.length, vsync: this);
    _tabController.addListener((){
      if(this._tabController.offset==0&&onTouchTab==false){
        this._loadDataFromServer(this._tabController.index);
      }
    });
    this._loadDataFromServer(0);
  }

  List<Widget> createTabBarHeader(){
    List<Widget> list = [];
    for(var name in this.exchanges){
      list.add(Text(name.toString()));
    }
    return list;
  }

  _loadDataFromServer(int currTabIndex) async{
    print(this.dataMap.containsKey(currTabIndex));
    if(this.dataMap.containsKey(currTabIndex)){
       this.dataList = this.dataMap[currTabIndex];
    }else{
      if(this.dataList!=null){
        setState(() {
          this.dataList = null;
        });
      }
      String exchange = exchanges[currTabIndex].toLowerCase();
      String currMoneyFlag = GlobalInfo.currencyUnit==KeyConfig.usd?'usd':'cny';
      currMoneyFlag = 'unit='+currMoneyFlag;
      String url = 'http://market.jinse.com/api/v1/ticks/'+exchange+'?'+currMoneyFlag;
      print(url);
      try{
        http.Response response = await http.get(url).timeout(Duration(seconds: 5));
        this.dataList = json.decode(response.body);
        if(this.dataMap.containsKey(currTabIndex)==false){
          this.dataMap[currTabIndex] = this.dataList;
        }
      }on Exception{
        this.dataList =[];
      }
    }
    priceSortAsc = true;
    sortByPrice();
    onTouchTab = false;
  }

  void _onRefresh(){
    this.dataMap.remove(this._tabController.index);
    this.dataList = null;
    this._loadDataFromServer(this._tabController.index);
    _refreshController.refreshCompleted();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _refreshController.dispose();
    this.dataList.clear();
    this.dataMap.clear();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor:AppCustomColor.themeBackgroudColor,
      appBar: AppBar(
        centerTitle: true,
        title: Text(WalletLocalizations.of(context).marketPageAppBarTitle),
      ),

      body: SafeArea(
        child: Column(
          children: <Widget>[
            _showExchange(),
            _showTitle(),
            dataList==null?Center(child:CircularProgressIndicator()):_quotationList(),
          ],
        ),
      ),
    );
  }

  // Exchanges
  Widget _showExchange() {
    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: TabBar(
          controller: _tabController,
          labelColor: Colors.blue,
          labelPadding: EdgeInsets.only(bottom: 3),
          indicatorSize: TabBarIndicatorSize.label,
          unselectedLabelColor: Colors.grey,
          tabs: this.createTabBarHeader()
      ),
    );
  }

  List<Widget> createTabView(){
    List<Widget> list = [];
    for(int i=0;i<exchanges.length;i++){
      list.add(SmartRefresher(
        enablePullDown: true,
        enablePullUp: false,
        header: WaterDropHeader(),
        controller: _refreshController,
        onRefresh: _onRefresh,
        child: ListView.builder(
          itemCount: this.dataList.length,
          itemBuilder: (context, index) {
            return _quotationItem(index);
          },
        ),
      ));
    }
    return list;
  }

  bool nameSortAsc = true;
  bool priceSortAsc = true;
  bool degreeSortAsc = true;
  // Quotation title.
  Widget _showTitle() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: <Widget>[
        FlatButton(  // All button
          child: Text(WalletLocalizations.of(context).marketPageAll),
          textColor: Colors.grey,
          onPressed: () {
            if(this.dataList!=null){
              nameSortAsc = !nameSortAsc;
              this.dataList.sort((node1,node2){
                String base1 = node1['base'];
                String base2 = node2['base'];
                if(base1.compareTo(base2)==0){
                  return 0;
                }
                if(base1.compareTo(base2)>0){
                  return nameSortAsc?1:-1;
                }
                if(base1.compareTo(base2)<0){
                  return nameSortAsc?-1:1;
                }
              });
              setState(() {

              });
            }
          },
        ),

        FlatButton( // Price button
          child: Text(WalletLocalizations.of(context).marketPagePrice),
          textColor: Colors.grey,
          onPressed: () {
            this.sortByPrice();
          },
        ),

        FlatButton( // Change button
          child: Text(WalletLocalizations.of(context).marketPageChange),
          textColor: Colors.grey,
          onPressed: () {
            if(this.dataList!=null){
              degreeSortAsc = !degreeSortAsc;
              this.dataList.sort((node1,node2){
                num base1 = node1['degree'];
                num base2 = node2['degree'];
                if(base1.compareTo(base2)==0){
                  return 0;
                }
                if(base1.compareTo(base2)>0){
                  return degreeSortAsc?1:-1;
                }
                if(base1.compareTo(base2)<0){
                  return degreeSortAsc?-1:1;
                }
              });
              setState(() {

              });
            }
          },
        ),
      ],
    );
  }

  // 
  Widget _quotationList() {
    return Expanded(
      child: TabBarView(
        controller: _tabController,
        children: this.createTabView(),
      ),
    );
  }

  // 
  Widget _quotationItem(int index) {
    var data = this.dataList[index];
    return InkWell(
      splashColor: Colors.blue[100],
      highlightColor: Colors.blue[100],

//      onTap: () {
//        // Show detail page.
//        Navigator.push(
//          context,
//          MaterialPageRoute(
//            builder: (context) => MarketDetail(),
//          ),
//        );
//      },

      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 15),
        decoration: BoxDecoration(
          border: Border(
              bottom: BorderSide(color: Theme.of(context).dividerColor)
          ),
        ),

        child: Row(
          children: <Widget>[
//            Image.asset(Tools.imagePath('icon_binance'),width: 25,height: 25,),
//            SizedBox(width: 20),

            Expanded(
              child: Column( // Trade pair and exchange
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: <Widget>[
                      AutoSizeText( // Trade pair first part
                        data['base'],
                        style: TextStyle(
                          fontFamily: 'Arial',
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                        minFontSize: 10,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),

                      Expanded(
                        child: AutoSizeText( // Trade pair second part
                          ' / '+data['currency'],
                          style: TextStyle(
                            fontFamily: 'Arial',
                            fontSize: 13,
                          ),
                          minFontSize: 10,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 10),

                  AutoSizeText( // exchange name
                    data['exchangeName'],
                    style: TextStyle(color: Colors.grey),
                    minFontSize: 10,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),

            SizedBox(width: 20),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  AutoSizeText( // Assets amount
                    Tools.getCurrMoneyFlag()+(data['close'] as num).toStringAsFixed(2),
                    style: TextStyle(
                      fontFamily: 'Tahoma',
                      fontSize: 16,
                    ),
                    minFontSize: 10,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
//                  SizedBox(height: 10),
//                  AutoSizeText( // Assets value
//                    Tools.getCurrMoneyFlag()+data['close'].toString(),
//                    style: TextStyle(color: Colors.grey),
//                    minFontSize: 10,
//                    maxLines: 1,
//                    overflow: TextOverflow.ellipsis,
//                  ),
                ],
              ),
            ),

            SizedBox(width: 20),

            Container( // Quote change
              padding: EdgeInsets.symmetric(horizontal: 5, vertical: 8),
              width: 70, height: 30,
              decoration: BoxDecoration(
                color: data['degree']>0?Colors.green:Colors.red ,
                borderRadius: BorderRadius.all(Radius.circular(5)),
              ),

              child: AutoSizeText(
                (data['degree']>0?'+':'')+ (data['degree'] as num).toStringAsFixed(2)+ '%',
                style: TextStyle(color:  Colors.white),
                textAlign: TextAlign.center,
                minFontSize: 9,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void sortByPrice() {
    if(this.dataList!=null){
      priceSortAsc = !priceSortAsc;
      this.dataList.sort((node1,node2){
        num base1 = node1['close'];
        num base2 = node2['close'];
        if(base1.compareTo(base2)==0){
          return 0;
        }
        if(base1.compareTo(base2)>0){
          return priceSortAsc?1:-1;
        }
        if(base1.compareTo(base2)<0){
          return priceSortAsc?-1:1;
        }
      });
      setState(() {

      });
    }
  }
}
