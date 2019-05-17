import 'package:auto_size_text/auto_size_text.dart';
import 'package:fcharts/fcharts.dart';
/// Market detail info page.
/// [author] Kevin Zhang
/// [time] 2019-3-18

import 'package:flutter/material.dart';
import 'package:wallet_app/tools/Tools.dart';

class MarketDetail extends StatefulWidget {
  @override
  _MarketDetailState createState() => _MarketDetailState();
}

class _MarketDetailState extends State<MarketDetail> {

  // test data
  // X value -> Y value
  static const myData = [
    ["A", "✔"],
    ["B", "❓"],
    ["C", "✖"],
    ["D", "❓"],
    ["E", "✖"],
    ["F", "✖"],
    ["G", "✔"],
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: _appBarTitle(),
        actions: <Widget>[
          IconButton(
            icon: Icon(Icons.add),
            tooltip: 'Add Favorite',
            onPressed: () {
              print('Favorite asset is:  ');
             
              Navigator.pop(context);
            },
          ),
        ],
      ),

      body: SafeArea(
        child: ListView(
          children: <Widget>[
            _showQuotation(),
            _showVolume(),
            _showKLineChart(),
            _kLineControlButton(),
            _otherExchangesTitle(),
            _quotationList(),
          ],
        ),
      ),
    );
  }

  // _otherExchangesTitle
  Widget _otherExchangesTitle() {
    return Text(
      'Other exchanges',
      // textAlign: TextAlign.start,
      style: TextStyle(color: Colors.grey),
    );
  }

  // AppBar Title
  Widget _appBarTitle() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Icon(Icons.attach_money),
          SizedBox(width: 20),

          Column( // Trade pair and exchange
            // crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  Text( // Trade pair first part
                    'LX',
                    style: TextStyle(
                      fontFamily: 'Arial',
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  Text( // Trade pair second part
                    ' / USDT',
                    style: TextStyle(
                      fontFamily: 'Arial',
                      fontSize: 13,
                    ),
                  ),
                ],
              ),

              SizedBox(height: 5),

              Text( // exchange name
                'Binance',
                style: TextStyle(
                  color: Colors.grey[300],
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Quotation
  Widget _showQuotation() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 30, vertical: 30),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column( 
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                AutoSizeText( // Assets price
                  '0.12345678',
                  style: TextStyle(
                    fontFamily: 'Tahoma',
                    fontSize: 22,
                  ),
                  minFontSize: 10,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),

                SizedBox(height: 10),

                Text( // Assets value
                  Tools.getCurrMoneyFlag()+ '0.12',
                  style: TextStyle(
                    color: Colors.grey,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),

          Container( // Quote change
            padding: EdgeInsets.symmetric(horizontal: 5, vertical: 8),
            width: 70, height: 30,
            decoration: BoxDecoration(
              color: Colors.green,
              borderRadius: BorderRadius.all(Radius.circular(5)),
            ),
            
            child: AutoSizeText(
              '+8.12%',
              style: TextStyle(color: Colors.white),
              textAlign: TextAlign.center,
              minFontSize: 9,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  // Quotation
  Widget _showVolume() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 30, vertical: 0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[
          Text( // Assets Volume
            'Volume: 123',
            style: TextStyle(color: Colors.grey),
          ),

          Text( // Assets Low Volume
            'Low: 123',
            style: TextStyle(color: Colors.grey),
          ),

          Text( // Assets High Volume
            'High: 123',
            style: TextStyle(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  // K-line Chart
  Widget _showKLineChart() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 30, vertical: 10),
      // color: Colors.yellow,
      height: 200,
      child: LineChart(
        lines: [
          Line< List<String>, String, String >(
            data: myData,
            xFn: (datum) => datum[0],
            yFn: (datum) => datum[1],
          )
        ],

        chartPadding: EdgeInsets.fromLTRB(30.0, 10.0, 10.0, 30.0),
      ),
    );
  }

  // K-line Chart Control Button
  Widget _kLineControlButton() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 30, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: <Widget>[
          FlatButton(  // Hour button
            child: Text('Hour'),
            textColor: Colors.grey,
            onPressed: () {
              // TODO: show K-line chart in hour model.
            },
          ),

          FlatButton(  // Day button
            child: Text('Day'),
            textColor: Colors.grey,
            onPressed: () {
              // TODO: show K-line chart in Day model.
            },
          ),
        ],
      ),
    );
  }

  // 
  Widget _quotationList() {
    return ListView.builder(
      shrinkWrap: true,
      physics:NeverScrollableScrollPhysics(),
      itemCount: 5,
      itemBuilder: (context, index) {
        return _quotationItem();
      },
    );
  }

  // 
  Widget _quotationItem() {
    return InkWell(
      splashColor: Colors.blue[100],
      highlightColor: Colors.blue[100],
      
      onTap: () {
        // Show detail page.
        // Navigator.push(
        //   context, 
        //   MaterialPageRoute(
        //     builder: (context) => SelectLanguage(),
        //   ), 
        // );
      },
          
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 15),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(color: Theme.of(context).dividerColor)
          ),
        ),

        child: Row(
          children: <Widget>[
            Icon(Icons.attach_money),
            SizedBox(width: 20),

            Column( // Trade pair and exchange
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: <Widget>[
                    Text( // Trade pair first part
                      'LX',
                      style: TextStyle(
                        fontFamily: 'Arial',
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    Text( // Trade pair second part
                      ' / USDT',
                      style: TextStyle(
                        fontFamily: 'Arial',
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
                
                SizedBox(height: 10),

                Text( // exchange name
                  'Binance',
                  style: TextStyle(color: Colors.grey),
                ),
              ],
            ),

            SizedBox(width: 20),

            Expanded(
              child: Column( 
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  AutoSizeText( // Assets amount
                    '0.12345678',
                    style: TextStyle(
                      fontFamily: 'Tahoma',
                      fontSize: 16,
                    ),
                    minFontSize: 10,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 10),
                  Text( // Assets value
                    Tools.getCurrMoneyFlag() + '0.12',
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            ),

            SizedBox(width: 30),

            Container( // Quote change
              padding: EdgeInsets.symmetric(horizontal: 5, vertical: 8),
              width: 70, height: 30,
              decoration: BoxDecoration(
                color: Colors.green,
                borderRadius: BorderRadius.all(Radius.circular(5)),
              ),
              
              child: AutoSizeText(
                '+8.12%',
                style: TextStyle(color: Colors.white),
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
}
